<?php

namespace App\Services;

use App\Models\Category;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SavingsService
{
    /**
     * Ambil semua target tabungan milik user beserta statistik progress.
     */
    public function getUserGoals(User $user): Collection
    {
        $goals = SavingsGoal::where('user_id', $user->id)
            ->with(['wallet', 'contributions'])
            ->withSum('contributions as total_terkumpul', 'nominal')
            ->orderByRaw("CASE WHEN status = 'aktif' THEN 1 WHEN status = 'tercapai' THEN 2 ELSE 3 END")
            ->orderBy('created_at', 'desc')
            ->get();

        return $goals->map(function ($goal) {
            return $this->formatGoalStats($goal);
        });
    }

    /**
     * Dapatkan detail satu target tabungan dengan statistik lengkap.
     */
    public function getGoalDetail(SavingsGoal $goal): SavingsGoal
    {
        $goal->load(['wallet', 'contributions' => function ($q) {
            $q->orderBy('tanggal', 'desc')->orderBy('created_at', 'desc');
        }]);
        $goal->total_terkumpul = $goal->contributions->sum('nominal');

        return $this->formatGoalStats($goal);
    }

    /**
     * Buat target tabungan baru.
     */
    public function createGoal(User $user, array $data): SavingsGoal
    {
        $data['user_id'] = $user->id;
        $data['status']  = $data['status'] ?? 'aktif';

        $goal = SavingsGoal::create($data);
        return $this->getGoalDetail($goal);
    }

    /**
     * Update target tabungan.
     */
    public function updateGoal(SavingsGoal $goal, array $data): SavingsGoal
    {
        $goal->update($data);

        // Cek ulang apakah status perlu diupdate berdasarkan total setoran terkini
        $totalTerkumpul = $goal->contributions()->sum('nominal');
        if ($totalTerkumpul >= $goal->target_nominal && $goal->status === 'aktif') {
            $goal->update(['status' => 'tercapai']);
        } elseif ($totalTerkumpul < $goal->target_nominal && $goal->status === 'tercapai') {
            $goal->update(['status' => 'aktif']);
        }

        return $this->getGoalDetail($goal);
    }

    /**
     * Hapus target tabungan beserta seluruh kontribusinya.
     */
    public function deleteGoal(SavingsGoal $goal): bool
    {
        return DB::transaction(function () use ($goal) {
            $goal->contributions()->delete();
            return $goal->delete();
        });
    }

    /**
     * Tambah setoran (contribution) ke target tabungan.
     * Jika wallet_id ditentukan, buat transaksi pengeluaran otomatis di wallet tersebut.
     */
    public function addContribution(SavingsGoal $goal, User $user, array $data): SavingsContribution
    {
        return DB::transaction(function () use ($goal, $user, $data) {
            $walletId = $data['wallet_id'] ?? $goal->wallet_id;
            $tanggal  = $data['tanggal'] ?? Carbon::today()->toDateString();
            $nominal  = $data['nominal'];
            $catatan  = $data['catatan'] ?? "Setoran tabungan: {$goal->nama}";

            // 1. Buat kontribusi tabungan
            $contribution = SavingsContribution::create([
                'goal_id'   => $goal->id,
                'user_id'   => $user->id,
                'wallet_id' => $walletId,
                'nominal'   => $nominal,
                'tanggal'   => $tanggal,
                'catatan'   => $catatan,
            ]);

            // 2. Jika memotong saldo wallet, catat sebagai transaksi pengeluaran
            if ($walletId) {
                // Cari atau gunakan kategori default 'Investasi' / 'Lain-lain'
                $category = Category::where('user_id', $user->id)
                    ->where('tipe', 'pengeluaran')
                    ->first();

                if (! $category) {
                    $category = Category::create([
                        'user_id' => $user->id,
                        'nama'    => 'Tabungan & Investasi',
                        'tipe'    => 'pengeluaran',
                        'ikon'    => 'PiggyBank',
                        'warna'   => '#6366F1',
                    ]);
                }

                Transaction::create([
                    'user_id'     => $user->id,
                    'wallet_id'   => $walletId,
                    'category_id' => $category->id,
                    'tipe'        => 'pengeluaran',
                    'nominal'     => $nominal,
                    'tanggal'     => $tanggal,
                    'catatan'     => "[Tabungan: {$goal->nama}] " . $catatan,
                ]);
            }

            // 3. Update status goal otomatis jika target terpenuhi
            $totalTerkumpul = $goal->contributions()->sum('nominal');
            if ($totalTerkumpul >= $goal->target_nominal && $goal->status === 'aktif') {
                $goal->update(['status' => 'tercapai']);
            }

            return $contribution;
        });
    }

    /**
     * Hapus setoran tabungan.
     */
    public function deleteContribution(SavingsGoal $goal, SavingsContribution $contribution): bool
    {
        if ($contribution->goal_id !== $goal->id) {
            throw ValidationException::withMessages(['contribution' => 'Setoran tidak ditemukan pada target tabungan ini']);
        }

        return DB::transaction(function () use ($goal, $contribution) {
            $contribution->delete();

            // Recalculate status goal
            $totalTerkumpul = $goal->contributions()->sum('nominal');
            if ($totalTerkumpul < $goal->target_nominal && $goal->status === 'tercapai') {
                $goal->update(['status' => 'aktif']);
            }

            return true;
        });
    }

    /**
     * Format statistik progress target tabungan.
     */
    private function formatGoalStats(SavingsGoal $goal): SavingsGoal
    {
        $totalTerkumpul = (float) ($goal->total_terkumpul ?? $goal->contributions->sum('nominal'));
        $targetNominal  = (float) $goal->target_nominal;
        $sisaKebutuhan  = max(0, $targetNominal - $totalTerkumpul);

        $persentase = $targetNominal > 0
            ? min(100, round(($totalTerkumpul / $targetNominal) * 100, 2))
            : 0;

        // Estimasi setoran per bulan jika ada tanggal_target
        $estimasiBulanan = null;
        if ($goal->tanggal_target && $sisaKebutuhan > 0) {
            $today = Carbon::today();
            $targetDate = Carbon::parse($goal->tanggal_target);

            if ($targetDate->gt($today)) {
                // Total bulan sisa (minimal 1)
                $sisaBulan = max(1, $today->diffInMonths($targetDate));
                $estimasiBulanan = round($sisaKebutuhan / $sisaBulan, 2);
            } else {
                $estimasiBulanan = $sisaKebutuhan; // Sudah lewat tenggat
            }
        }

        $goal->stats = [
            'total_terkumpul'            => $totalTerkumpul,
            'sisa_kebutuhan'             => $sisaKebutuhan,
            'persentase'                 => $persentase,
            'estimasi_setoran_per_bulan' => $estimasiBulanan,
            'is_tercapai'                => $totalTerkumpul >= $targetNominal,
        ];

        return $goal;
    }
}
