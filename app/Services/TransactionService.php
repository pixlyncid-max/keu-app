<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Transfer;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * TransactionService — Business logic untuk transaksi & transfer.
 *
 * - getFiltered(): Daftar transaksi dengan filter, pencarian, dan pagination
 * - getSummary(): Ringkasan pemasukan/pengeluaran/saldo untuk periode tertentu
 */
class TransactionService
{
    /**
     * Ambil transaksi dengan filter lengkap.
     *
     * Parameter filter (semua opsional):
     * - tipe         : 'pemasukan' | 'pengeluaran'
     * - category_id  : int
     * - wallet_id    : int
     * - bulan        : 'YYYY-MM' (override dari/sampai)
     * - dari_tanggal : 'YYYY-MM-DD'
     * - sampai_tanggal: 'YYYY-MM-DD'
     * - cari         : string (search dalam catatan)
     * - urutkan      : 'tanggal' | 'nominal' | 'created_at' (default: tanggal)
     * - arah         : 'desc' | 'asc' (default: desc)
     * - per_halaman  : int (default: 15, max: 100)
     */
    public function getFiltered(int $userId, array $filters = []): LengthAwarePaginator
    {
        $query = Transaction::with(['wallet:id,nama,ikon,warna', 'category:id,nama,ikon,warna'])
            ->where('transactions.user_id', $userId);

        // Filter: tipe
        if (! empty($filters['tipe']) && in_array($filters['tipe'], ['pemasukan', 'pengeluaran'])) {
            $query->where('tipe', $filters['tipe']);
        }

        // Filter: kategori
        if (! empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        // Filter: dompet
        if (! empty($filters['wallet_id'])) {
            $query->where('wallet_id', (int) $filters['wallet_id']);
        }

        // Filter: periode — bulan (format YYYY-MM) mengoverride dari/sampai
        if (! empty($filters['bulan']) && preg_match('/^\d{4}-\d{2}$/', $filters['bulan'])) {
            $query->whereRaw("DATE_FORMAT(tanggal, '%Y-%m') = ?", [$filters['bulan']]);
        } elseif (! empty($filters['dari_tanggal']) || ! empty($filters['sampai_tanggal'])) {
            if (! empty($filters['dari_tanggal'])) {
                $query->where('tanggal', '>=', $filters['dari_tanggal']);
            }
            if (! empty($filters['sampai_tanggal'])) {
                $query->where('tanggal', '<=', $filters['sampai_tanggal']);
            }
        }

        // Filter: pencarian dalam catatan
        if (! empty($filters['cari'])) {
            $cari = '%' . mb_strtolower(trim($filters['cari'])) . '%';
            $query->whereRaw('LOWER(catatan) LIKE ?', [$cari]);
        }

        // Pengurutan
        $kolomUrut = in_array($filters['urutkan'] ?? '', ['tanggal', 'nominal', 'created_at'])
            ? $filters['urutkan']
            : 'tanggal';
        $arah = ($filters['arah'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        // Urutan sekunder: untuk tanggal yang sama, urutkan by created_at desc
        $query->orderBy($kolomUrut, $arah);
        if ($kolomUrut === 'tanggal') {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perHalaman = min((int) ($filters['per_halaman'] ?? 15), 100);
        if ($perHalaman < 1) $perHalaman = 15;

        return $query->paginate($perHalaman);
    }

    /**
     * Hitung ringkasan keuangan untuk user dalam periode tertentu.
     * Mengembalikan: total_pemasukan, total_pengeluaran, saldo_periode.
     */
    public function getSummary(int $userId, ?string $dariTanggal = null, ?string $sampaiTanggal = null): array
    {
        $query = Transaction::where('user_id', $userId);

        if ($dariTanggal) {
            $query->where('tanggal', '>=', $dariTanggal);
        }
        if ($sampaiTanggal) {
            $query->where('tanggal', '<=', $sampaiTanggal);
        }

        $totals = $query->selectRaw("
            SUM(CASE WHEN tipe = 'pemasukan'   THEN nominal ELSE 0 END) as total_pemasukan,
            SUM(CASE WHEN tipe = 'pengeluaran' THEN nominal ELSE 0 END) as total_pengeluaran
        ")->first();

        $pemasukan   = (float) ($totals->total_pemasukan   ?? 0);
        $pengeluaran = (float) ($totals->total_pengeluaran ?? 0);

        return [
            'total_pemasukan'   => $pemasukan,
            'total_pengeluaran' => $pengeluaran,
            'saldo_periode'     => $pemasukan - $pengeluaran,
        ];
    }

    /**
     * Hitung pengeluaran per kategori untuk periode tertentu.
     * Berguna untuk grafik donat di dashboard.
     */
    public function getPengeluaranPerKategori(int $userId, ?string $dariTanggal = null, ?string $sampaiTanggal = null): array
    {
        $query = Transaction::with('category:id,nama,ikon,warna')
            ->where('user_id', $userId)
            ->where('tipe', 'pengeluaran')
            ->groupBy('category_id');

        if ($dariTanggal)   $query->where('tanggal', '>=', $dariTanggal);
        if ($sampaiTanggal) $query->where('tanggal', '<=', $sampaiTanggal);

        return $query->selectRaw('category_id, SUM(nominal) as total')
            ->orderByRaw('total DESC')
            ->get()
            ->map(fn ($item) => [
                'category'   => $item->category,
                'total'      => (float) $item->total,
            ])
            ->toArray();
    }

    /**
     * Hitung pemasukan & pengeluaran per bulan untuk grafik batang.
     * Mengambil N bulan terakhir.
     */
    public function getMonthlyTrend(int $userId, int $nBulan = 6): array
    {
        return Transaction::where('user_id', $userId)
            ->where('tanggal', '>=', now()->subMonths($nBulan - 1)->startOfMonth())
            ->groupByRaw("DATE_FORMAT(tanggal, '%Y-%m')")
            ->selectRaw("
                DATE_FORMAT(tanggal, '%Y-%m') as bulan,
                SUM(CASE WHEN tipe = 'pemasukan'   THEN nominal ELSE 0 END) as pemasukan,
                SUM(CASE WHEN tipe = 'pengeluaran' THEN nominal ELSE 0 END) as pengeluaran
            ")
            ->orderBy('bulan', 'asc')
            ->get()
            ->toArray();
    }
}
