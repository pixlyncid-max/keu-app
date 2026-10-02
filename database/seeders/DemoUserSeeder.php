<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Buat akun demo lengkap dengan data contoh:
     * - 1 user demo (demo@keuangan.app / password: demo123456)
     * - 3 dompet (Tunai, BCA Tabungan, GoPay)
     * - Kategori default
     * - Transaksi 3 bulan terakhir
     * - 2 aturan transaksi berulang (gaji, Netflix)
     * - 2 target tabungan
     * - Anggaran bulan ini
     * - 1 transfer antar dompet
     */
    public function run(): void
    {
        $this->command->info('🌱 Membuat akun demo...');

        // =====================================================
        // USER DEMO
        // =====================================================
        /** @var User $user */
        $user = User::updateOrCreate(
            ['email' => 'demo@keuangan.app'],
            [
                'nama'     => 'Budi Santoso',
                'password' => Hash::make('demo123456'),
                'timezone' => 'Asia/Makassar',
            ]
        );

        // Hapus data lama agar idempotent (bisa dijalankan ulang)
        Transaction::where('user_id', $user->id)->delete();
        Transfer::where('user_id', $user->id)->delete();
        SavingsContribution::where('user_id', $user->id)->delete();
        SavingsGoal::where('user_id', $user->id)->delete();
        RecurringTransaction::where('user_id', $user->id)->delete();
        Budget::where('user_id', $user->id)->delete();
        Wallet::where('user_id', $user->id)->delete();
        Category::where('user_id', $user->id)->delete();

        // =====================================================
        // KATEGORI DEFAULT
        // =====================================================
        DefaultCategoriesSeeder::buatKategoriDefault($user);

        $catGaji       = Category::where('user_id', $user->id)->where('nama', 'Gaji')->first();
        $catFreelance  = Category::where('user_id', $user->id)->where('nama', 'Freelance')->first();
        $catBonus      = Category::where('user_id', $user->id)->where('nama', 'Bonus')->first();
        $catMakan      = Category::where('user_id', $user->id)->where('nama', 'Makan & Minum')->first();
        $catTransport  = Category::where('user_id', $user->id)->where('nama', 'Transportasi')->first();
        $catTagihan    = Category::where('user_id', $user->id)->where('nama', 'Tagihan')->first();
        $catBelanja    = Category::where('user_id', $user->id)->where('nama', 'Belanja')->first();
        $catHiburan    = Category::where('user_id', $user->id)->where('nama', 'Hiburan')->first();
        $catKesehatan  = Category::where('user_id', $user->id)->where('nama', 'Kesehatan')->first();
        $catTabungan   = Category::where('user_id', $user->id)->where('nama', 'Tabungan')->first();

        // =====================================================
        // DOMPET
        // =====================================================
        $dompetTunai = Wallet::create([
            'user_id'    => $user->id,
            'nama'       => 'Tunai',
            'tipe'       => 'tunai',
            'saldo_awal' => 500_000,
            'warna'      => '#10b981',
            'ikon'       => 'wallet',
            'urutan'     => 1,
        ]);

        $dompetBca = Wallet::create([
            'user_id'    => $user->id,
            'nama'       => 'BCA Tabungan',
            'tipe'       => 'bank',
            'saldo_awal' => 3_500_000,
            'warna'      => '#3b82f6',
            'ikon'       => 'building-2',
            'urutan'     => 2,
        ]);

        $dompetGopay = Wallet::create([
            'user_id'    => $user->id,
            'nama'       => 'GoPay',
            'tipe'       => 'e-wallet',
            'saldo_awal' => 200_000,
            'warna'      => '#22c55e',
            'ikon'       => 'smartphone',
            'urutan'     => 3,
        ]);

        // =====================================================
        // TRANSAKSI — 3 bulan terakhir
        // =====================================================
        $now        = Carbon::now();
        $bulanIni   = $now->copy();
        $bulanLalu  = $now->copy()->subMonth();
        $dua_bulan  = $now->copy()->subMonths(2);

        $transaksi = [];

        // --- Gaji 3 bulan ---
        foreach ([$dua_bulan, $bulanLalu, $bulanIni] as $bulan) {
            $transaksi[] = [
                'user_id'     => $user->id,
                'wallet_id'   => $dompetBca->id,
                'category_id' => $catGaji->id,
                'tipe'        => 'pemasukan',
                'nominal'     => 8_500_000,
                'tanggal'     => $bulan->copy()->startOfMonth()->addDays(24)->toDateString(),
                'catatan'     => 'Gaji bulan ' . $bulan->translatedFormat('F Y'),
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }

        // --- Freelance ---
        $transaksi[] = [
            'user_id'     => $user->id,
            'wallet_id'   => $dompetBca->id,
            'category_id' => $catFreelance->id,
            'tipe'        => 'pemasukan',
            'nominal'     => 2_000_000,
            'tanggal'     => $bulanLalu->copy()->day(10)->toDateString(),
            'catatan'     => 'Proyek website toko online',
            'created_at'  => now(),
            'updated_at'  => now(),
        ];

        $transaksi[] = [
            'user_id'     => $user->id,
            'wallet_id'   => $dompetBca->id,
            'category_id' => $catBonus->id,
            'tipe'        => 'pemasukan',
            'nominal'     => 1_500_000,
            'tanggal'     => $bulanIni->copy()->day(5)->toDateString(),
            'catatan'     => 'Bonus proyek selesai lebih awal',
            'created_at'  => now(),
            'updated_at'  => now(),
        ];

        // --- Pengeluaran rutin per bulan ---
        foreach ([$dua_bulan, $bulanLalu, $bulanIni] as $bulan) {
            // Makan
            for ($i = 1; $i <= 4; $i++) {
                $transaksi[] = [
                    'user_id'     => $user->id,
                    'wallet_id'   => ($i % 2 === 0) ? $dompetGopay->id : $dompetTunai->id,
                    'category_id' => $catMakan->id,
                    'tipe'        => 'pengeluaran',
                    'nominal'     => rand(50_000, 150_000),
                    'tanggal'     => $bulan->copy()->day($i * 7)->toDateString(),
                    'catatan'     => 'Makan ' . ($i % 2 === 0 ? 'siang' : 'malam'),
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];
            }

            // Tagihan internet
            $transaksi[] = [
                'user_id'     => $user->id,
                'wallet_id'   => $dompetBca->id,
                'category_id' => $catTagihan->id,
                'tipe'        => 'pengeluaran',
                'nominal'     => 299_000,
                'tanggal'     => $bulan->copy()->day(5)->toDateString(),
                'catatan'     => 'Internet IndiHome',
                'created_at'  => now(),
                'updated_at'  => now(),
            ];

            // Transportasi
            $transaksi[] = [
                'user_id'     => $user->id,
                'wallet_id'   => $dompetGopay->id,
                'category_id' => $catTransport->id,
                'tipe'        => 'pengeluaran',
                'nominal'     => rand(150_000, 350_000),
                'tanggal'     => $bulan->copy()->day(15)->toDateString(),
                'catatan'     => 'Bensin & parkir',
                'created_at'  => now(),
                'updated_at'  => now(),
            ];

            // Belanja
            $transaksi[] = [
                'user_id'     => $user->id,
                'wallet_id'   => $dompetBca->id,
                'category_id' => $catBelanja->id,
                'tipe'        => 'pengeluaran',
                'nominal'     => rand(200_000, 800_000),
                'tanggal'     => $bulan->copy()->day(20)->toDateString(),
                'catatan'     => 'Belanja kebutuhan bulanan',
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }

        // Pengeluaran tambahan bulan ini
        $transaksi[] = [
            'user_id'     => $user->id,
            'wallet_id'   => $dompetGopay->id,
            'category_id' => $catHiburan->id,
            'tipe'        => 'pengeluaran',
            'nominal'     => 59_000,
            'tanggal'     => $bulanIni->copy()->day(1)->toDateString(),
            'catatan'     => 'Netflix bulan ini',
            'created_at'  => now(),
            'updated_at'  => now(),
        ];

        $transaksi[] = [
            'user_id'     => $user->id,
            'wallet_id'   => $dompetTunai->id,
            'category_id' => $catKesehatan->id,
            'tipe'        => 'pengeluaran',
            'nominal'     => 150_000,
            'tanggal'     => $bulanIni->copy()->day(8)->toDateString(),
            'catatan'     => 'Beli vitamin dan suplemen',
            'created_at'  => now(),
            'updated_at'  => now(),
        ];

        Transaction::insert($transaksi);

        // =====================================================
        // TRANSFER ANTAR DOMPET
        // =====================================================
        Transfer::create([
            'user_id'        => $user->id,
            'dari_wallet_id' => $dompetBca->id,
            'ke_wallet_id'   => $dompetGopay->id,
            'nominal'        => 500_000,
            'biaya_admin'    => 0,
            'tanggal'        => $bulanIni->copy()->day(3)->toDateString(),
            'catatan'        => 'Top up GoPay dari BCA',
        ]);

        Transfer::create([
            'user_id'        => $user->id,
            'dari_wallet_id' => $dompetBca->id,
            'ke_wallet_id'   => $dompetTunai->id,
            'nominal'        => 300_000,
            'biaya_admin'    => 0,
            'tanggal'        => $bulanIni->copy()->day(10)->toDateString(),
            'catatan'        => 'Tarik tunai ATM',
        ]);

        // =====================================================
        // TRANSAKSI BERULANG
        // =====================================================
        RecurringTransaction::create([
            'user_id'         => $user->id,
            'wallet_id'       => $dompetBca->id,
            'category_id'     => $catGaji->id,
            'tipe'            => 'pemasukan',
            'nominal'         => 8_500_000,
            'catatan'         => 'Gaji bulanan',
            'frekuensi'       => 'bulanan',
            'interval'        => 1,
            'tanggal_mulai'   => $dua_bulan->copy()->day(25)->toDateString(),
            'tanggal_selesai' => null,
            'next_run_date'   => $bulanIni->copy()->endOfMonth()->day(25)->toDateString(),
            'is_active'       => true,
        ]);

        RecurringTransaction::create([
            'user_id'         => $user->id,
            'wallet_id'       => $dompetGopay->id,
            'category_id'     => $catHiburan->id,
            'tipe'            => 'pengeluaran',
            'nominal'         => 59_000,
            'catatan'         => 'Langganan Netflix',
            'frekuensi'       => 'bulanan',
            'interval'        => 1,
            'tanggal_mulai'   => $dua_bulan->copy()->day(1)->toDateString(),
            'tanggal_selesai' => null,
            'next_run_date'   => $bulanIni->copy()->addMonth()->day(1)->toDateString(),
            'is_active'       => true,
        ]);

        RecurringTransaction::create([
            'user_id'         => $user->id,
            'wallet_id'       => $dompetBca->id,
            'category_id'     => $catTagihan->id,
            'tipe'            => 'pengeluaran',
            'nominal'         => 299_000,
            'catatan'         => 'Internet IndiHome',
            'frekuensi'       => 'bulanan',
            'interval'        => 1,
            'tanggal_mulai'   => $dua_bulan->copy()->day(5)->toDateString(),
            'tanggal_selesai' => null,
            'next_run_date'   => $bulanIni->copy()->addMonth()->day(5)->toDateString(),
            'is_active'       => true,
        ]);

        // =====================================================
        // TARGET TABUNGAN
        // =====================================================
        $goalLaptop = SavingsGoal::create([
            'user_id'        => $user->id,
            'wallet_id'      => $dompetBca->id,
            'nama'           => 'Laptop Baru',
            'target_nominal' => 15_000_000,
            'tanggal_target' => Carbon::now()->addMonths(6)->toDateString(),
            'ikon'           => 'laptop',
            'warna'          => '#6366f1',
            'status'         => 'aktif',
            'catatan'        => 'MacBook Air M2',
        ]);

        // Setoran ke target laptop
        SavingsContribution::create([
            'goal_id'   => $goalLaptop->id,
            'user_id'   => $user->id,
            'wallet_id' => $dompetBca->id,
            'nominal'   => 2_000_000,
            'tanggal'   => $dua_bulan->copy()->day(28)->toDateString(),
            'catatan'   => 'Setoran pertama',
        ]);

        SavingsContribution::create([
            'goal_id'   => $goalLaptop->id,
            'user_id'   => $user->id,
            'wallet_id' => $dompetBca->id,
            'nominal'   => 2_500_000,
            'tanggal'   => $bulanLalu->copy()->day(28)->toDateString(),
            'catatan'   => 'Setoran bulan ke-2',
        ]);

        SavingsContribution::create([
            'goal_id'   => $goalLaptop->id,
            'user_id'   => $user->id,
            'wallet_id' => $dompetBca->id,
            'nominal'   => 2_000_000,
            'tanggal'   => $bulanIni->copy()->day(28)->toDateString(),
            'catatan'   => 'Setoran bulan ke-3',
        ]);

        $goalLiburan = SavingsGoal::create([
            'user_id'        => $user->id,
            'wallet_id'      => null,
            'nama'           => 'Liburan ke Bali',
            'target_nominal' => 5_000_000,
            'tanggal_target' => Carbon::now()->addMonths(3)->toDateString(),
            'ikon'           => 'plane',
            'warna'          => '#f59e0b',
            'status'         => 'aktif',
            'catatan'        => 'Family trip akhir tahun',
        ]);

        SavingsContribution::create([
            'goal_id'   => $goalLiburan->id,
            'user_id'   => $user->id,
            'wallet_id' => null,
            'nominal'   => 1_000_000,
            'tanggal'   => $bulanIni->copy()->day(15)->toDateString(),
            'catatan'   => 'Setoran awal liburan Bali',
        ]);

        // =====================================================
        // ANGGARAN BULAN INI
        // =====================================================
        $bulanFormat = $bulanIni->format('Y-m');

        $anggaranData = [
            ['category_id' => $catMakan->id,     'batas_nominal' => 1_500_000],
            ['category_id' => $catTransport->id,  'batas_nominal' => 500_000],
            ['category_id' => $catTagihan->id,    'batas_nominal' => 600_000],
            ['category_id' => $catBelanja->id,    'batas_nominal' => 1_000_000],
            ['category_id' => $catHiburan->id,    'batas_nominal' => 200_000],
        ];

        foreach ($anggaranData as $anggaran) {
            Budget::create([
                'user_id'       => $user->id,
                'category_id'   => $anggaran['category_id'],
                'bulan'         => $bulanFormat,
                'batas_nominal' => $anggaran['batas_nominal'],
            ]);
        }

        $this->command->info("✅ Demo user berhasil dibuat!");
        $this->command->info("   Email   : demo@keuangan.app");
        $this->command->info("   Password: demo123456");
        $this->command->line('');
        $this->command->info("   Dompet  : Tunai, BCA Tabungan, GoPay");
        $this->command->info("   Transaksi: " . count($transaksi) . " transaksi (3 bulan)");
        $this->command->info("   Recurring: Gaji, Netflix, IndiHome");
        $this->command->info("   Tabungan : Laptop Baru, Liburan ke Bali");
        $this->command->info("   Anggaran : " . count($anggaranData) . " kategori");
    }
}
