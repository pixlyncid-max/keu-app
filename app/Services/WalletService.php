<?php

namespace App\Services;

use App\Models\SavingsContribution;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * WalletService — Business logic untuk dompet.
 *
 * Fitur utama:
 * - computeBalances(): Hitung saldo aktual semua dompet dalam 5 query (bukan N+1)
 * - computeSingleBalance(): Hitung saldo satu dompet
 * - canDelete(): Cek apakah dompet bisa dihapus permanen (tanpa transaksi)
 * - getTotalSaldo(): Total saldo semua dompet aktif user
 */
class WalletService
{
    /**
     * Tambahkan atribut saldo_aktual ke setiap dompet dalam koleksi.
     * Menggunakan 5 query agregasi total, bukan N+1.
     *
     * Formula:
     *   saldo = saldo_awal
     *         + SUM(transaksi pemasukan)
     *         - SUM(transaksi pengeluaran)
     *         + SUM(transfer masuk)
     *         - SUM(transfer keluar + biaya_admin)
     *         - SUM(setoran tabungan yg dipotong dari dompet ini)
     */
    public function computeBalances(Collection $wallets): Collection
    {
        if ($wallets->isEmpty()) {
            return $wallets;
        }

        $walletIds = $wallets->pluck('id')->toArray();

        // 1. Total pemasukan per dompet
        $pemasukan = Transaction::whereIn('wallet_id', $walletIds)
            ->where('tipe', 'pemasukan')
            ->groupBy('wallet_id')
            ->selectRaw('wallet_id, SUM(nominal) as total')
            ->pluck('total', 'wallet_id');

        // 2. Total pengeluaran per dompet (kecuali yang dicatat dari setoran tabungan untuk mencegah double count dengan $tabungan)
        $pengeluaran = Transaction::whereIn('wallet_id', $walletIds)
            ->where('tipe', 'pengeluaran')
            ->where(function ($q) {
                $q->whereNull('catatan')->orWhere('catatan', 'not like', '[Tabungan:%');
            })
            ->groupBy('wallet_id')
            ->selectRaw('wallet_id, SUM(nominal) as total')
            ->pluck('total', 'wallet_id');

        // 3. Transfer masuk per dompet (nominal yang diterima)
        $transferMasuk = Transfer::whereIn('ke_wallet_id', $walletIds)
            ->groupBy('ke_wallet_id')
            ->selectRaw('ke_wallet_id, SUM(nominal) as total')
            ->pluck('total', 'ke_wallet_id');

        // 4. Transfer keluar per dompet (nominal + biaya_admin yang dikeluarkan)
        $transferKeluar = Transfer::whereIn('dari_wallet_id', $walletIds)
            ->groupBy('dari_wallet_id')
            ->selectRaw('dari_wallet_id, SUM(nominal + biaya_admin) as total')
            ->pluck('total', 'dari_wallet_id');

        // 5. Setoran tabungan yang dipotong dari dompet ini
        $tabungan = SavingsContribution::whereIn('wallet_id', $walletIds)
            ->whereNotNull('wallet_id')
            ->groupBy('wallet_id')
            ->selectRaw('wallet_id, SUM(nominal) as total')
            ->pluck('total', 'wallet_id');

        return $wallets->map(function (Wallet $wallet) use ($pemasukan, $pengeluaran, $transferMasuk, $transferKeluar, $tabungan) {
            $wallet->saldo_aktual = round(
                (float) $wallet->saldo_awal
                + (float) ($pemasukan[$wallet->id]     ?? 0)
                - (float) ($pengeluaran[$wallet->id]   ?? 0)
                + (float) ($transferMasuk[$wallet->id] ?? 0)
                - (float) ($transferKeluar[$wallet->id]?? 0)
                - (float) ($tabungan[$wallet->id]      ?? 0),
                2
            );

            return $wallet;
        });
    }

    /**
     * Hitung saldo aktual satu dompet.
     * Berguna saat menampilkan detail satu dompet.
     */
    public function computeSingleBalance(Wallet $wallet): float
    {
        $pemasukan = (float) $wallet->transactions()->where('tipe', 'pemasukan')->sum('nominal');
        $pengeluaran = (float) $wallet->transactions()
            ->where('tipe', 'pengeluaran')
            ->where(function ($q) {
                $q->whereNull('catatan')->orWhere('catatan', 'not like', '[Tabungan:%');
            })
            ->sum('nominal');
        $transferMasuk = (float) $wallet->transfersMasuk()->sum('nominal');
        $transferKeluar = (float) $wallet->transfersKeluar()->sum('nominal');
        $biayaAdmin = (float) $wallet->transfersKeluar()->sum('biaya_admin');
        $tabungan = (float) $wallet->savingsContributions()->sum('nominal');

        return round(
            (float) $wallet->saldo_awal
            + $pemasukan
            - $pengeluaran
            + $transferMasuk
            - $transferKeluar
            - $biayaAdmin
            - $tabungan,
            2
        );
    }

    /**
     * Hitung total saldo semua dompet AKTIF (tidak diarsip) milik user.
     */
    public function getTotalSaldo(int $userId): float
    {
        $wallets = Wallet::where('user_id', $userId)
            ->where('is_archived', false)
            ->get();

        $this->computeBalances($wallets);

        return round($wallets->sum('saldo_aktual'), 2);
    }

    /**
     * Cek apakah dompet bisa dihapus permanen.
     * Dompet bisa dihapus jika: tidak punya transaksi, transfer, atau setoran tabungan.
     */
    public function canDelete(Wallet $wallet): bool
    {
        $hasTransactions = $wallet->transactions()->exists();
        $hasTransferOut  = $wallet->transfersKeluar()->exists();
        $hasTransferIn   = $wallet->transfersMasuk()->exists();
        $hasSavings      = $wallet->savingsContributions()->exists();

        return ! ($hasTransactions || $hasTransferOut || $hasTransferIn || $hasSavings);
    }

    /**
     * Hitung urutan berikutnya untuk dompet baru.
     */
    public function getNextUrutan(int $userId): int
    {
        return (Wallet::where('user_id', $userId)->max('urutan') ?? 0) + 1;
    }
}
