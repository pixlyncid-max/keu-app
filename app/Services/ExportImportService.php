<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ExportImportService
{
    public function __construct(
        protected TransactionService $transactionService
    ) {}

    /**
     * Ekspor data transaksi ke format CSV sesuai filter.
     */
    public function exportTransactionsCsv(User $user, array $filters): string
    {
        // Non-paginated query untuk ekspor lengkap
        $query = Transaction::where('user_id', $user->id)
            ->with(['wallet', 'category']);

        if (!empty($filters['tipe'])) {
            $query->where('tipe', $filters['tipe']);
        }
        if (!empty($filters['wallet_id'])) {
            $query->where('wallet_id', $filters['wallet_id']);
        }
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (!empty($filters['bulan'])) {
            $query->where('tanggal', 'LIKE', $filters['bulan'] . '%');
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('catatan', 'LIKE', "%{$search}%")
                  ->orWhere('merchant', 'LIKE', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('tanggal', 'desc')->get();

        $output = fopen('php://temp', 'r+');

        // Output UTF-8 BOM + Excel separator directive
        fputs($output, "\xEF\xBB\xBF");
        fputs($output, "sep=;\n");

        // Header CSV / Excel Spreadsheet
        fputcsv($output, [
            'No',
            'Tanggal',
            'Tipe Transaksi',
            'Dompet',
            'Kategori',
            'Nominal (IDR)',
            'Catatan',
            'Merchant',
        ], ';');

        $no = 1;
        foreach ($transactions as $t) {
            fputcsv($output, [
                $no++,
                $t->tanggal ? $t->tanggal->format('d/m/Y') : '-',
                ucfirst(strtolower($t->tipe)),
                $t->wallet->nama ?? '-',
                $t->category->nama ?? '-',
                (int) $t->nominal,
                $t->catatan ?: '-',
                $t->merchant ?: '-',
            ], ';');
        }

        rewind($output);
        $csvString = stream_get_contents($output);
        fclose($output);

        return $csvString;
    }

    /**
     * Ekspor seluruh data user ke format JSON (Backup lengkap).
     */
    public function exportUserDataJson(User $user): array
    {
        return [
            'app'          => 'keuangan-pribadi',
            'version'      => '1.0.0',
            'exported_at'  => now()->toIso8601String(),
            'user'         => [
                'nama'     => $user->nama,
                'email'    => $user->email,
                'timezone' => $user->timezone,
            ],
            'wallets'      => Wallet::where('user_id', $user->id)->get()->toArray(),
            'categories'   => Category::where('user_id', $user->id)->get()->toArray(),
            'budgets'      => Budget::where('user_id', $user->id)->get()->toArray(),
            'recurring'    => RecurringTransaction::where('user_id', $user->id)->get()->toArray(),
            'savings_goals'=> SavingsGoal::where('user_id', $user->id)->get()->toArray(),
            'savings_contributions' => SavingsContribution::where('user_id', $user->id)->get()->toArray(),
            'transfers'    => Transfer::where('user_id', $user->id)->get()->toArray(),
            'transactions' => Transaction::where('user_id', $user->id)->get()->toArray(),
        ];
    }

    /**
     * Impor data user dari file JSON secara atomic (rollback jika ada kesalahan).
     */
    public function importUserDataJson(User $user, array $backupData, bool $modeOverwrite = false): array
    {
        // Validasi struktur header JSON
        if (empty($backupData['app']) || $backupData['app'] !== 'keuangan-pribadi') {
            throw ValidationException::withMessages([
                'file' => 'Format file backup JSON tidak valid atau bukan dari aplikasi Keuangan Pribadi',
            ]);
        }

        return DB::transaction(function () use ($user, $backupData, $modeOverwrite) {
            $stats = [
                'wallets_imported'      => 0,
                'categories_imported'   => 0,
                'transactions_imported' => 0,
                'transfers_imported'    => 0,
                'budgets_imported'      => 0,
                'recurring_imported'    => 0,
                'savings_imported'      => 0,
            ];

            // Map ID lama ke ID baru di database
            $walletMap   = [];
            $categoryMap = [];
            $goalMap     = [];

            if ($modeOverwrite) {
                // Hapus data lama jika overwrite
                Transaction::where('user_id', $user->id)->delete();
                Transfer::where('user_id', $user->id)->delete();
                SavingsContribution::where('user_id', $user->id)->delete();
                SavingsGoal::where('user_id', $user->id)->delete();
                RecurringTransaction::where('user_id', $user->id)->delete();
                Budget::where('user_id', $user->id)->delete();
                Category::where('user_id', $user->id)->where('is_default', false)->delete();
                Wallet::where('user_id', $user->id)->delete();
            }

            // 1. Impor Dompet (Wallets)
            foreach ($backupData['wallets'] ?? [] as $w) {
                $newWallet = Wallet::create([
                    'user_id'    => $user->id,
                    'nama'       => $w['nama'],
                    'tipe'       => $w['tipe'],
                    'saldo_awal' => $w['saldo_awal'] ?? 0,
                    'warna'      => $w['warna'] ?? '#3b82f6',
                    'ikon'       => $w['ikon'] ?? 'wallet',
                    'is_archived'=> $w['is_archived'] ?? false,
                ]);
                $walletMap[$w['id']] = $newWallet->id;
                $stats['wallets_imported']++;
            }

            // 2. Impor Kategori (Categories)
            foreach ($backupData['categories'] ?? [] as $c) {
                // Cek jika kategori default sudah ada untuk user
                $existing = Category::where('user_id', $user->id)
                    ->where('nama', $c['nama'])
                    ->where('tipe', $c['tipe'])
                    ->first();

                if ($existing) {
                    $categoryMap[$c['id']] = $existing->id;
                } else {
                    $newCategory = Category::create([
                        'user_id'    => $user->id,
                        'nama'       => $c['nama'],
                        'tipe'       => $c['tipe'],
                        'warna'      => $c['warna'] ?? '#10b981',
                        'ikon'       => $c['ikon'] ?? 'tag',
                        'is_default' => false,
                    ]);
                    $categoryMap[$c['id']] = $newCategory->id;
                    $stats['categories_imported']++;
                }
            }

            // Fallback wallet & category ID default jika tidak ada di map
            $defaultWalletId   = Wallet::where('user_id', $user->id)->value('id');
            $defaultCategoryId = Category::where('user_id', $user->id)->value('id');

            // 3. Impor Budgets
            foreach ($backupData['budgets'] ?? [] as $b) {
                $catId = $categoryMap[$b['category_id']] ?? $defaultCategoryId;
                if ($catId) {
                    Budget::updateOrCreate(
                        [
                            'user_id'     => $user->id,
                            'category_id' => $catId,
                            'bulan'       => $b['bulan'],
                        ],
                        [
                            'batas_nominal' => $b['batas_nominal'],
                        ]
                    );
                    $stats['budgets_imported']++;
                }
            }

            // 4. Impor Transaksi Berulang
            foreach ($backupData['recurring'] ?? [] as $r) {
                $wId = $walletMap[$r['wallet_id']] ?? $defaultWalletId;
                $cId = $categoryMap[$r['category_id']] ?? $defaultCategoryId;

                if ($wId && $cId) {
                    RecurringTransaction::create([
                        'user_id'         => $user->id,
                        'wallet_id'       => $wId,
                        'category_id'     => $cId,
                        'tipe'            => $r['tipe'],
                        'nominal'         => $r['nominal'],
                        'catatan'         => $r['catatan'] ?? null,
                        'frekuensi'       => $r['frekuensi'],
                        'interval'        => $r['interval'] ?? 1,
                        'tanggal_mulai'   => $r['tanggal_mulai'],
                        'tanggal_selesai' => $r['tanggal_selesai'] ?? null,
                        'next_run_date'   => $r['next_run_date'] ?? $r['tanggal_mulai'],
                        'is_active'       => $r['is_active'] ?? true,
                    ]);
                    $stats['recurring_imported']++;
                }
            }

            // 5. Impor Savings Goals
            foreach ($backupData['savings_goals'] ?? [] as $sg) {
                $wId = !empty($sg['wallet_id']) ? ($walletMap[$sg['wallet_id']] ?? null) : null;
                $newGoal = SavingsGoal::create([
                    'user_id'        => $user->id,
                    'wallet_id'      => $wId,
                    'nama'           => $sg['nama'],
                    'target_nominal' => $sg['target_nominal'],
                    'tanggal_target' => $sg['tanggal_target'] ?? null,
                    'ikon'           => $sg['ikon'] ?? 'piggy-bank',
                    'warna'          => $sg['warna'] ?? '#10b981',
                    'status'         => $sg['status'] ?? 'aktif',
                    'catatan'        => $sg['catatan'] ?? null,
                ]);
                $goalMap[$sg['id']] = $newGoal->id;
                $stats['savings_imported']++;
            }

            // 6. Impor Savings Contributions
            foreach ($backupData['savings_contributions'] ?? [] as $sc) {
                $gId = $goalMap[$sc['goal_id']] ?? null;
                $wId = !empty($sc['wallet_id']) ? ($walletMap[$sc['wallet_id']] ?? null) : null;

                if ($gId) {
                    SavingsContribution::create([
                        'goal_id'   => $gId,
                        'user_id'   => $user->id,
                        'wallet_id' => $wId,
                        'nominal'   => $sc['nominal'],
                        'tanggal'   => $sc['tanggal'],
                        'catatan'   => $sc['catatan'] ?? null,
                    ]);
                }
            }

            // 7. Impor Transfers
            foreach ($backupData['transfers'] ?? [] as $tr) {
                $dariId = $walletMap[$tr['dari_wallet_id']] ?? null;
                $keId   = $walletMap[$tr['ke_wallet_id']] ?? null;

                if ($dariId && $keId && $dariId !== $keId) {
                    Transfer::create([
                        'user_id'        => $user->id,
                        'dari_wallet_id' => $dariId,
                        'ke_wallet_id'   => $keId,
                        'jumlah'         => $tr['jumlah'],
                        'tanggal'        => $tr['tanggal'],
                        'biaya_admin'    => $tr['biaya_admin'] ?? 0,
                        'catatan'        => $tr['catatan'] ?? null,
                    ]);
                    $stats['transfers_imported']++;
                }
            }

            // 8. Impor Transactions
            foreach ($backupData['transactions'] ?? [] as $t) {
                $wId = $walletMap[$t['wallet_id']] ?? $defaultWalletId;
                $cId = $categoryMap[$t['category_id']] ?? $defaultCategoryId;

                if ($wId && $cId) {
                    Transaction::create([
                        'user_id'     => $user->id,
                        'wallet_id'   => $wId,
                        'category_id' => $cId,
                        'tipe'        => $t['tipe'],
                        'nominal'     => $t['nominal'] ?? $t['jumlah'] ?? 0,
                        'tanggal'     => $t['tanggal'],
                        'catatan'     => $t['catatan'] ?? null,
                        'merchant'    => $t['merchant'] ?? null,
                    ]);
                    $stats['transactions_imported']++;
                }
            }

            return $stats;
        });
    }
}
