<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\User;
use App\Models\Wallet;
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

    /**
     * Hasilkan data Rekening Koran / Mutasi Rekening bergaya perbankan resmi (BCA / Tahapan).
     */
    public function getBankStatement(User $user, ?int $walletId, int $month, int $year): array
    {
        $month = max(1, min(12, $month));
        $year = max(2000, min(2100, $year));

        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endOfMonth = (clone $startOfMonth)->endOfMonth()->endOfDay();
        $startDateStr = $startOfMonth->toDateString();
        $endDateStr = $endOfMonth->toDateString();

        $monthNamesIndo = [
            1 => 'JANUARI', 2 => 'FEBRUARI', 3 => 'MARET', 4 => 'APRIL',
            5 => 'MEI', 6 => 'JUNI', 7 => 'JULI', 8 => 'AGUSTUS',
            9 => 'SEPTEMBER', 10 => 'OKTOBER', 11 => 'NOVEMBER', 12 => 'DESEMBER'
        ];
        $namaBulan = ($monthNamesIndo[$month] ?? 'BULAN') . ' ' . $year;

        $wallet = null;
        if ($walletId) {
            $wallet = Wallet::where('user_id', $user->id)->findOrFail($walletId);
        }

        // 1. Hitung Saldo Awal sebelum tanggal 1 bulan ini
        if ($wallet) {
            $saldoAwal = (float) $wallet->saldo_awal;

            $txMasukBefore = (float) Transaction::where('wallet_id', $wallet->id)
                ->where('tipe', 'pemasukan')
                ->where('tanggal', '<', $startDateStr)
                ->sum('nominal');

            $txKeluarBefore = (float) Transaction::where('wallet_id', $wallet->id)
                ->where('tipe', 'pengeluaran')
                ->where('tanggal', '<', $startDateStr)
                ->sum('nominal');

            $tfMasukBefore = (float) Transfer::where('ke_wallet_id', $wallet->id)
                ->where('tanggal', '<', $startDateStr)
                ->sum('nominal');

            $tfKeluarBefore = (float) Transfer::where('dari_wallet_id', $wallet->id)
                ->where('tanggal', '<', $startDateStr)
                ->sum(DB::raw('nominal + biaya_admin'));

            $saldoAwal = round($saldoAwal + $txMasukBefore - $txKeluarBefore + $tfMasukBefore - $tfKeluarBefore, 2);
        } else {
            $wallets = Wallet::where('user_id', $user->id)->get();
            $saldoAwal = (float) $wallets->sum('saldo_awal');

            $txMasukBefore = (float) Transaction::where('user_id', $user->id)
                ->where('tipe', 'pemasukan')
                ->where('tanggal', '<', $startDateStr)
                ->sum('nominal');

            $txKeluarBefore = (float) Transaction::where('user_id', $user->id)
                ->where('tipe', 'pengeluaran')
                ->where('tanggal', '<', $startDateStr)
                ->sum('nominal');

            $tfAdminBefore = (float) Transfer::where('user_id', $user->id)
                ->where('tanggal', '<', $startDateStr)
                ->sum('biaya_admin');

            $saldoAwal = round($saldoAwal + $txMasukBefore - $txKeluarBefore - $tfAdminBefore, 2);
        }

        // 2. Kumpulkan mutasi selama bulan ini
        $rawMutasi = [];

        if ($wallet) {
            // Transaksi wallet ini
            $transactions = Transaction::where('wallet_id', $wallet->id)
                ->whereBetween('tanggal', [$startDateStr, $endDateStr])
                ->with('category')
                ->get();

            foreach ($transactions as $tx) {
                $isPemasukan = $tx->tipe === 'pemasukan';
                $catatan = trim($tx->catatan ?? '');
                $categoryName = $tx->category?->nama ? strtoupper($tx->category->nama) : '';

                if ($isPemasukan) {
                    $ket = $catatan ? strtoupper($catatan) : ($categoryName ?: 'SETORAN / PEMASUKAN');
                    if (!str_contains($ket, 'TRSF') && !str_contains($ket, 'SETORAN') && !str_contains($ket, 'GAJI')) {
                        $ket = 'SETORAN / ' . $ket;
                    }
                } else {
                    $ket = $catatan ? strtoupper($catatan) : ($categoryName ?: 'PENARIKAN / PENGELUARAN');
                    if (!str_contains($ket, 'SWITCHING') && !str_contains($ket, 'TRSF') && !str_contains($ket, 'QRIS') && !str_contains($ket, 'DEBET') && !str_contains($ket, 'BIAYA')) {
                        $ket = 'SWITCHING DB ' . $ket;
                    }
                }

                $rawMutasi[] = [
                    'sort_date'   => Carbon::parse($tx->tanggal)->format('Y-m-d') . ' ' . ($tx->created_at ? $tx->created_at->format('H:i:s') : '00:00:00'),
                    'id'          => $tx->id,
                    'tanggal'     => Carbon::parse($tx->tanggal)->format('d/m'),
                    'tanggal_full'=> Carbon::parse($tx->tanggal)->format('Y-m-d'),
                    'keterangan'  => $ket,
                    'cbg'         => sprintf('%03d', ($tx->category_id ?? 1) % 900 + 10),
                    'tipe'        => $isPemasukan ? 'CR' : 'DB',
                    'nominal'     => (float) $tx->nominal,
                ];
            }

            // Transfer Masuk
            $transfersMasuk = Transfer::where('ke_wallet_id', $wallet->id)
                ->whereBetween('tanggal', [$startDateStr, $endDateStr])
                ->with('dariWallet')
                ->get();

            foreach ($transfersMasuk as $tf) {
                $dari = $tf->dariWallet ? strtoupper($tf->dariWallet->nama) : 'REKENING LAIN';
                $catatan = $tf->catatan ? ' ' . strtoupper($tf->catatan) : '';
                $rawMutasi[] = [
                    'sort_date'   => Carbon::parse($tf->tanggal)->format('Y-m-d') . ' ' . ($tf->created_at ? $tf->created_at->format('H:i:s') : '00:00:00'),
                    'id'          => 1000000 + $tf->id,
                    'tanggal'     => Carbon::parse($tf->tanggal)->format('d/m'),
                    'tanggal_full'=> Carbon::parse($tf->tanggal)->format('Y-m-d'),
                    'keterangan'  => "TRSF E-BANKING CR DARI {$dari}{$catatan}",
                    'cbg'         => '016',
                    'tipe'        => 'CR',
                    'nominal'     => (float) $tf->nominal,
                ];
            }

            // Transfer Keluar
            $transfersKeluar = Transfer::where('dari_wallet_id', $wallet->id)
                ->whereBetween('tanggal', [$startDateStr, $endDateStr])
                ->with('keWallet')
                ->get();

            foreach ($transfersKeluar as $tf) {
                $ke = $tf->keWallet ? strtoupper($tf->keWallet->nama) : 'REKENING LAIN';
                $catatan = $tf->catatan ? ' ' . strtoupper($tf->catatan) : '';
                $rawMutasi[] = [
                    'sort_date'   => Carbon::parse($tf->tanggal)->format('Y-m-d') . ' ' . ($tf->created_at ? $tf->created_at->format('H:i:s') : '00:00:00'),
                    'id'          => 2000000 + $tf->id,
                    'tanggal'     => Carbon::parse($tf->tanggal)->format('d/m'),
                    'tanggal_full'=> Carbon::parse($tf->tanggal)->format('Y-m-d'),
                    'keterangan'  => "TRSF E-BANKING DB KE {$ke}{$catatan}",
                    'cbg'         => '016',
                    'tipe'        => 'DB',
                    'nominal'     => (float) $tf->nominal,
                ];

                if ((float) $tf->biaya_admin > 0) {
                    $rawMutasi[] = [
                        'sort_date'   => Carbon::parse($tf->tanggal)->format('Y-m-d') . ' ' . ($tf->created_at ? $tf->created_at->format('H:i:s') : '00:00:01'),
                        'id'          => 3000000 + $tf->id,
                        'tanggal'     => Carbon::parse($tf->tanggal)->format('d/m'),
                        'tanggal_full'=> Carbon::parse($tf->tanggal)->format('Y-m-d'),
                        'keterangan'  => "BIAYA TXN TRANSFER KE {$ke}",
                        'cbg'         => '008',
                        'tipe'        => 'DB',
                        'nominal'     => (float) $tf->biaya_admin,
                    ];
                }
            }
        } else {
            // Semua dompet
            $transactions = Transaction::where('user_id', $user->id)
                ->whereBetween('tanggal', [$startDateStr, $endDateStr])
                ->with(['category', 'wallet'])
                ->get();

            foreach ($transactions as $tx) {
                $isPemasukan = $tx->tipe === 'pemasukan';
                $catatan = trim($tx->catatan ?? '');
                $categoryName = $tx->category?->nama ? strtoupper($tx->category->nama) : '';
                $walletName = $tx->wallet?->nama ? '[' . strtoupper($tx->wallet->nama) . '] ' : '';

                if ($isPemasukan) {
                    $ket = $catatan ? strtoupper($catatan) : ($categoryName ?: 'SETORAN / PEMASUKAN');
                    if (!str_contains($ket, 'TRSF') && !str_contains($ket, 'SETORAN') && !str_contains($ket, 'GAJI')) {
                        $ket = 'SETORAN / ' . $ket;
                    }
                } else {
                    $ket = $catatan ? strtoupper($catatan) : ($categoryName ?: 'PENARIKAN / PENGELUARAN');
                    if (!str_contains($ket, 'SWITCHING') && !str_contains($ket, 'TRSF') && !str_contains($ket, 'QRIS') && !str_contains($ket, 'DEBET') && !str_contains($ket, 'BIAYA')) {
                        $ket = 'SWITCHING DB ' . $ket;
                    }
                }

                $rawMutasi[] = [
                    'sort_date'   => Carbon::parse($tx->tanggal)->format('Y-m-d') . ' ' . ($tx->created_at ? $tx->created_at->format('H:i:s') : '00:00:00'),
                    'id'          => $tx->id,
                    'tanggal'     => Carbon::parse($tx->tanggal)->format('d/m'),
                    'tanggal_full'=> Carbon::parse($tx->tanggal)->format('Y-m-d'),
                    'keterangan'  => $walletName . $ket,
                    'cbg'         => sprintf('%03d', ($tx->category_id ?? 1) % 900 + 10),
                    'tipe'        => $isPemasukan ? 'CR' : 'DB',
                    'nominal'     => (float) $tx->nominal,
                ];
            }

            // Transfer biaya admin antar dompet
            $transfers = Transfer::where('user_id', $user->id)
                ->whereBetween('tanggal', [$startDateStr, $endDateStr])
                ->where('biaya_admin', '>', 0)
                ->with(['dariWallet', 'keWallet'])
                ->get();

            foreach ($transfers as $tf) {
                $dari = $tf->dariWallet ? strtoupper($tf->dariWallet->nama) : 'DOMPET';
                $ke = $tf->keWallet ? strtoupper($tf->keWallet->nama) : 'DOMPET';
                $rawMutasi[] = [
                    'sort_date'   => Carbon::parse($tf->tanggal)->format('Y-m-d') . ' ' . ($tf->created_at ? $tf->created_at->format('H:i:s') : '00:00:01'),
                    'id'          => 3000000 + $tf->id,
                    'tanggal'     => Carbon::parse($tf->tanggal)->format('d/m'),
                    'tanggal_full'=> Carbon::parse($tf->tanggal)->format('Y-m-d'),
                    'keterangan'  => "BIAYA TXN TRANSFER {$dari} KE {$ke}",
                    'cbg'         => '008',
                    'tipe'        => 'DB',
                    'nominal'     => (float) $tf->biaya_admin,
                ];
            }
        }

        // 3. Urutkan berdasarkan tanggal & ID secara kronologis
        usort($rawMutasi, function ($a, $b) {
            $cmp = strcmp($a['sort_date'], $b['sort_date']);
            if ($cmp === 0) {
                return $a['id'] <=> $b['id'];
            }
            return $cmp;
        });

        // 4. Hitung Saldo Berjalan (Running Balance)
        $currentSaldo = $saldoAwal;
        $totalCr = 0;
        $totalDb = 0;
        $countCr = 0;
        $countDb = 0;

        $mutasiList = [];
        foreach ($rawMutasi as $m) {
            if ($m['tipe'] === 'CR') {
                $currentSaldo += $m['nominal'];
                $totalCr += $m['nominal'];
                $countCr++;
            } else {
                $currentSaldo -= $m['nominal'];
                $totalDb += $m['nominal'];
                $countDb++;
            }

            $mutasiList[] = [
                'tanggal'      => $m['tanggal'],
                'tanggal_full' => $m['tanggal_full'],
                'keterangan'   => $m['keterangan'],
                'cbg'          => $m['cbg'],
                'tipe'         => $m['tipe'],
                'nominal'      => round($m['nominal'], 2),
                'saldo'        => round($currentSaldo, 2),
            ];
        }

        $saldoAkhir = round($currentSaldo, 2);

        // Nomor Rekening
        $noRekening = $wallet
            ? ('109' . str_pad((string) ($wallet->id * 179 + 6433), 7, '0', STR_PAD_LEFT))
            : '000-SEMUA-REKENING';

        return [
            'bank_info' => [
                'nama_bank'     => $wallet ? strtoupper($wallet->nama) : 'SEMUA REKENING KEUANGAN',
                'jenis_laporan' => 'REKENING TAHAPAN',
                'cabang'        => 'KCP ' . strtoupper(strtok($user->nama, ' ')) . ' UTAMA',
            ],
            'nasabah' => [
                'nama'        => strtoupper($user->nama),
                'email'       => $user->email,
                'no_rekening' => $noRekening,
                'periode'     => $namaBulan,
                'bulan'       => $month,
                'tahun'       => $year,
                'mata_uang'   => 'IDR',
                'halaman'     => '1 / 1',
            ],
            'ringkasan' => [
                'saldo_awal'   => round($saldoAwal, 2),
                'total_cr'     => round($totalCr, 2),
                'count_cr'     => $countCr,
                'total_db'     => round($totalDb, 2),
                'count_db'     => $countDb,
                'saldo_akhir'  => $saldoAkhir,
            ],
            'mutasi' => $mutasiList,
        ];
    }
}
