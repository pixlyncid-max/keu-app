<?php

namespace App\Services;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RecurringService
{
    /**
     * Dapatkan daftar aturan transaksi berulang milik user.
     */
    public function getUserRules(User $user): Collection
    {
        return RecurringTransaction::where('user_id', $user->id)
            ->with(['wallet', 'category'])
            ->orderBy('is_active', 'desc')
            ->orderBy('next_run_date', 'asc')
            ->get();
    }

    /**
     * Buat aturan transaksi berulang baru.
     */
    public function createRule(User $user, array $data): RecurringTransaction
    {
        $data['user_id'] = $user->id;
        
        // Jika next_run_date tidak ditentukan, gunakan tanggal_mulai
        if (empty($data['next_run_date'])) {
            $data['next_run_date'] = $data['tanggal_mulai'];
        }

        return RecurringTransaction::create($data);
    }

    /**
     * Update aturan transaksi berulang.
     */
    public function updateRule(RecurringTransaction $rule, array $data): RecurringTransaction
    {
        // Jika tanggal_mulai berubah dan next_run_date belum terlewati, perbarui next_run_date
        if (isset($data['tanggal_mulai']) && Carbon::parse($rule->next_run_date)->gt(Carbon::today())) {
            $data['next_run_date'] = $data['tanggal_mulai'];
        }

        $rule->update($data);
        return $rule->fresh(['wallet', 'category']);
    }

    /**
     * Hapus aturan transaksi berulang.
     */
    public function deleteRule(RecurringTransaction $rule): bool
    {
        return $rule->delete();
    }

    /**
     * Hitung tanggal berikutnya dengan penanganan tanggal 28/29/30/31 (clamping akhir bulan).
     */
    public function calculateNextRunDate(Carbon $currentDate, string $frekuensi, int $interval, ?string $tanggalMulai = null): Carbon
    {
        $next = $currentDate->copy();
        $originalDay = $tanggalMulai ? Carbon::parse($tanggalMulai)->day : $currentDate->day;

        switch ($frekuensi) {
            case 'harian':
                $next->addDays($interval);
                break;
            case 'mingguan':
                $next->addWeeks($interval);
                break;
            case 'bulanan':
                $next->addMonthsNoOverflow($interval);
                // Jika hari awal adalah 31 (atau 30), dan bulan baru mendukung, set ke hari tersebut
                $daysInNewMonth = $next->daysInMonth;
                $targetDay = min($originalDay, $daysInNewMonth);
                $next->day($targetDay);
                break;
            case 'tahunan':
                $next->addYearsNoOverflow($interval);
                $daysInNewMonth = $next->daysInMonth;
                $targetDay = min($originalDay, $daysInNewMonth);
                $next->day($targetDay);
                break;
        }

        return $next;
    }

    /**
     * Proses transaksi berulang yang jatuh tempo (Catch-up & Idempoten).
     * Dapat dijalankan via Cron Scheduler (Artisan Command) atau Manual Trigger via API.
     */
    public function processDueRecurring(?int $userId = null): array
    {
        $today = Carbon::today();
        $query = RecurringTransaction::query()
            ->where('is_active', true)
            ->where('next_run_date', '<=', $today->toDateString());

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $rules = $query->get();
        $createdTransactionsCount = 0;
        $processedRulesCount = 0;

        foreach ($rules as $rule) {
            DB::transaction(function () use ($rule, $today, &$createdTransactionsCount, &$processedRulesCount) {
                $nextRun = Carbon::parse($rule->next_run_date);
                $endDate = $rule->tanggal_selesai ? Carbon::parse($rule->tanggal_selesai) : null;
                $ruleCreatedCount = 0;

                // Loop catch-up: jika server mati beberapa hari, eksekusi semua yang terlewat sampai hari ini
                while ($nextRun->lte($today)) {
                    // Cek batas tanggal selesai
                    if ($endDate && $nextRun->gt($endDate)) {
                        $rule->is_active = false;
                        break;
                    }

                    // Buat transaksi riil di database
                    Transaction::create([
                        'user_id'      => $rule->user_id,
                        'wallet_id'    => $rule->wallet_id,
                        'category_id'  => $rule->category_id,
                        'tipe'         => $rule->tipe,
                        'nominal'      => $rule->nominal,
                        'tanggal'      => $nextRun->toDateString(),
                        'catatan'      => $rule->catatan ? "[Berulang] " . $rule->catatan : "[Berulang]",
                        'recurring_id' => $rule->id,
                    ]);

                    $ruleCreatedCount++;
                    $createdTransactionsCount++;

                    // Hitung tanggal jadwal berikutnya
                    $nextRun = $this->calculateNextRunDate(
                        $nextRun,
                        $rule->frekuensi,
                        $rule->interval,
                        $rule->tanggal_mulai ? $rule->tanggal_mulai->toDateString() : null
                    );
                }

                // Simpan tanggal jadwal berikutnya dan status aktif
                $rule->next_run_date = $nextRun->toDateString();
                if ($endDate && $nextRun->gt($endDate)) {
                    $rule->is_active = false;
                }
                $rule->save();

                if ($ruleCreatedCount > 0) {
                    $processedRulesCount++;
                }
            });
        }

        Log::info("Recurring process completed. Processed rules: {$processedRulesCount}, Created transactions: {$createdTransactionsCount}");

        return [
            'processed_rules'      => $processedRulesCount,
            'created_transactions' => $createdTransactionsCount,
        ];
    }

    /**
     * Dapatkan perkiraan tagihan / transaksi mendatang untuk N hari ke depan.
     */
    public function getUpcomingBills(User $user, int $days = 30): array
    {
        $today = Carbon::today();
        $targetDate = $today->copy()->addDays($days);

        $rules = RecurringTransaction::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('next_run_date', '<=', $targetDate->toDateString())
            ->with(['wallet', 'category'])
            ->get();

        $upcoming = [];

        foreach ($rules as $rule) {
            $nextRun = Carbon::parse($rule->next_run_date);
            $endDate = $rule->tanggal_selesai ? Carbon::parse($rule->tanggal_selesai) : null;

            while ($nextRun->lte($targetDate)) {
                if ($endDate && $nextRun->gt($endDate)) {
                    break;
                }

                $upcoming[] = [
                    'rule_id'     => $rule->id,
                    'catatan'     => $rule->catatan,
                    'tipe'        => $rule->tipe,
                    'nominal'     => (float) $rule->nominal,
                    'tanggal'     => $nextRun->toDateString(),
                    'frekuensi'   => $rule->frekuensi,
                    'wallet'      => $rule->wallet ? [
                        'id'   => $rule->wallet->id,
                        'nama' => $rule->wallet->nama,
                    ] : null,
                    'category'    => $rule->category ? [
                        'id'    => $rule->category->id,
                        'nama'  => $rule->category->nama,
                        'warna' => $rule->category->warna,
                        'ikon'  => $rule->category->ikon,
                    ] : null,
                ];

                $nextRun = $this->calculateNextRunDate(
                    $nextRun,
                    $rule->frekuensi,
                    $rule->interval,
                    $rule->tanggal_mulai ? $rule->tanggal_mulai->toDateString() : null
                );
            }
        }

        // Urutkan berdasarkan tanggal terdekat
        usort($upcoming, fn($a, $b) => strcmp($a['tanggal'], $b['tanggal']));

        return $upcoming;
    }
}
