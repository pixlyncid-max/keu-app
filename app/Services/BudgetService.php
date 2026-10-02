<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BudgetService
{
    /**
     * Dapatkan semua anggaran user untuk bulan tertentu.
     */
    public function getBudgetsForMonth(User $user, ?string $bulan = null): Collection
    {
        $bulanTarget = $bulan ?? Carbon::today()->format('Y-m');

        return Budget::where('user_id', $user->id)
            ->where('bulan', $bulanTarget)
            ->with('category')
            ->get();
    }

    /**
     * Buat atau update (upsert) anggaran per kategori untuk bulan tertentu.
     */
    public function setBudget(User $user, array $data): Budget
    {
        $bulan = $data['bulan'] ?? Carbon::today()->format('Y-m');

        return Budget::updateOrCreate(
            [
                'user_id'     => $user->id,
                'category_id' => $data['category_id'],
                'bulan'       => $bulan,
            ],
            [
                'batas_nominal' => $data['batas_nominal'],
            ]
        )->fresh('category');
    }

    /**
     * Update anggaran tertentu.
     */
    public function updateBudget(Budget $budget, array $data): Budget
    {
        $budget->update($data);
        return $budget->fresh('category');
    }

    /**
     * Hapus anggaran.
     */
    public function deleteBudget(Budget $budget): bool
    {
        return $budget->delete();
    }

    /**
     * Hitung ringkasan anggaran bulanan beserta pemakaian riil dari transaksi.
     */
    public function getSummary(User $user, ?string $bulan = null): array
    {
        $bulanTarget = $bulan ?? Carbon::today()->format('Y-m');

        // 1. Ambil semua anggaran user di bulan tersebut
        $budgets = Budget::where('user_id', $user->id)
            ->where('bulan', $bulanTarget)
            ->with('category')
            ->get();

        if ($budgets->isEmpty()) {
            return [
                'bulan'          => $bulanTarget,
                'total_budget'   => 0,
                'total_terpakai' => 0,
                'total_sisa'     => 0,
                'overall_status' => 'aman',
                'items'          => [],
            ];
        }

        $categoryIds = $budgets->pluck('category_id')->toArray();

        // 2. Hitung total pengeluaran per kategori di bulan tersebut secara batch
        $startDate = "{$bulanTarget}-01";
        $endDate   = Carbon::parse($startDate)->endOfMonth()->toDateString();

        $expenses = Transaction::where('user_id', $user->id)
            ->whereIn('category_id', $categoryIds)
            ->where('tipe', 'pengeluaran')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->select('category_id', DB::raw('SUM(nominal) as total_pengeluaran'))
            ->groupBy('category_id')
            ->pluck('total_pengeluaran', 'category_id');

        $totalBudget   = 0;
        $totalTerpakai = 0;
        $items         = [];

        foreach ($budgets as $budget) {
            $batas = (float) $budget->batas_nominal;
            $terpakai = (float) ($expenses[$budget->category_id] ?? 0);
            $sisa = max(0, $batas - $terpakai);

            $persentase = $batas > 0 ? round(($terpakai / $batas) * 100, 2) : 0;

            // Kategori status: 'aman' (<80%), 'waspada' (80-99%), 'overbudget' (>=100%)
            $status = 'aman';
            if ($persentase >= 100) {
                $status = 'overbudget';
            } elseif ($persentase >= 80) {
                $status = 'waspada';
            }

            $totalBudget   += $batas;
            $totalTerpakai += $terpakai;

            $items[] = [
                'id'            => $budget->id,
                'category_id'   => $budget->category_id,
                'category_nama' => $budget->category->nama ?? 'N/A',
                'category_warna'=> $budget->category->warna ?? '#6B7280',
                'category_ikon' => $budget->category->ikon ?? 'tag',
                'bulan'         => $budget->bulan,
                'batas_nominal' => $batas,
                'terpakai'      => $terpakai,
                'sisa'          => $sisa,
                'persentase'    => $persentase,
                'status'        => $status,
            ];
        }

        $totalSisa = max(0, $totalBudget - $totalTerpakai);
        $overallPersentase = $totalBudget > 0 ? round(($totalTerpakai / $totalBudget) * 100, 2) : 0;

        $overallStatus = 'aman';
        if ($overallPersentase >= 100) {
            $overallStatus = 'overbudget';
        } elseif ($overallPersentase >= 80) {
            $overallStatus = 'waspada';
        }

        return [
            'bulan'             => $bulanTarget,
            'total_budget'      => $totalBudget,
            'total_terpakai'    => $totalTerpakai,
            'total_sisa'        => $totalSisa,
            'overall_persentase'=> $overallPersentase,
            'overall_status'    => $overallStatus,
            'items'             => $items,
        ];
    }
}
