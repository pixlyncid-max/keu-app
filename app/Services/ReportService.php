<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function __construct(
        protected WalletService $walletService
    ) {}

    /**
     * Dapatkan ringkasan keuangan per periode (Pemasukan, Pengeluaran, Net Cashflow, Total Saldo Dompet).
     */
    public function getSummary(User $user, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = Transaction::where('user_id', $user->id);

        if ($startDate && $endDate) {
            $query->whereBetween('tanggal', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where('tanggal', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('tanggal', '<=', $endDate);
        } else {
            // Default bulan ini
            $startDate = Carbon::today()->startOfMonth()->toDateString();
            $endDate   = Carbon::today()->endOfMonth()->toDateString();
            $query->whereBetween('tanggal', [$startDate, $endDate]);
        }

        $totals = $query->select('tipe', DB::raw('SUM(nominal) as total'))
            ->groupBy('tipe')
            ->pluck('total', 'tipe');

        $totalPemasukan   = (float) ($totals['pemasukan'] ?? 0);
        $totalPengeluaran = (float) ($totals['pengeluaran'] ?? 0);
        $netCashflow      = $totalPemasukan - $totalPengeluaran;

        // Total saldo terkini di seluruh dompet aktif user
        $totalSaldoDompet = $this->walletService->getTotalSaldo($user->id);


        return [
            'periode' => [
                'tanggal_mulai'   => $startDate,
                'tanggal_selesai' => $endDate,
            ],
            'total_pemasukan'    => $totalPemasukan,
            'total_pengeluaran'  => $totalPengeluaran,
            'net_cashflow'       => $netCashflow,
            'total_saldo_dompet' => $totalSaldoDompet,
        ];
    }

    /**
     * Dapatkan rincian pengeluaran per kategori untuk grafik donat.
     */
    public function getExpensesByCategory(User $user, ?string $startDate = null, ?string $endDate = null): array
    {
        if (!$startDate || !$endDate) {
            $startDate = Carbon::today()->startOfMonth()->toDateString();
            $endDate   = Carbon::today()->endOfMonth()->toDateString();
        }

        $items = Transaction::where('transactions.user_id', $user->id)
            ->where('transactions.tipe', 'pengeluaran')
            ->whereBetween('transactions.tanggal', [$startDate, $endDate])
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select(
                'categories.id as category_id',
                'categories.nama',
                'categories.warna',
                'categories.ikon',
                DB::raw('SUM(transactions.nominal) as total')
            )
            ->groupBy('categories.id', 'categories.nama', 'categories.warna', 'categories.ikon')
            ->orderByDesc('total')
            ->get();

        $grandTotal = $items->sum('total');

        $result = $items->map(function ($item) use ($grandTotal) {
            $total = (float) $item->total;
            $percentage = $grandTotal > 0 ? round(($total / $grandTotal) * 100, 2) : 0;

            return [
                'category_id' => $item->category_id,
                'nama'        => $item->nama,
                'warna'       => $item->warna,
                'ikon'        => $item->ikon,
                'total'       => $total,
                'persentase'  => $percentage,
            ];
        });

        return [
            'periode' => [
                'tanggal_mulai'   => $startDate,
                'tanggal_selesai' => $endDate,
            ],
            'grand_total' => (float) $grandTotal,
            'data'        => $result,
        ];
    }

    /**
     * Dapatkan tren bulanan (Pemasukan vs Pengeluaran) untuk N bulan terakhir (Grafik Batang).
     */
    public function getMonthlyTrend(User $user, int $months = 6): array
    {
        $months = max(1, min(24, $months));
        $startDate = Carbon::today()->subMonths($months - 1)->startOfMonth()->toDateString();
        $endDate   = Carbon::today()->endOfMonth()->toDateString();

        $rows = Transaction::where('user_id', $user->id)
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->select(
                DB::raw("DATE_FORMAT(tanggal, '%Y-%m') as bulan"),
                'tipe',
                DB::raw('SUM(nominal) as total')
            )
            ->groupBy('bulan', 'tipe')
            ->orderBy('bulan', 'asc')
            ->get();

        // Susun data per bulan
        $monthlyMap = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $b = Carbon::today()->subMonths($i)->format('Y-m');
            $monthlyMap[$b] = [
                'bulan'            => $b,
                'label'            => Carbon::parse("{$b}-01")->translatedFormat('M Y'),
                'total_pemasukan'  => 0,
                'total_pengeluaran'=> 0,
                'net'              => 0,
            ];
        }

        foreach ($rows as $row) {
            $b = $row->bulan;
            if (isset($monthlyMap[$b])) {
                if ($row->tipe === 'pemasukan') {
                    $monthlyMap[$b]['total_pemasukan'] = (float) $row->total;
                } else {
                    $monthlyMap[$b]['total_pengeluaran'] = (float) $row->total;
                }
                $monthlyMap[$b]['net'] = $monthlyMap[$b]['total_pemasukan'] - $monthlyMap[$b]['total_pengeluaran'];
            }
        }

        return array_values($monthlyMap);
    }
}
