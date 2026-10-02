<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultCategoriesSeeder extends Seeder
{
    /**
     * Daftar kategori default yang dibuat saat user baru mendaftar.
     * Struktur: [nama, tipe, ikon, warna, urutan]
     */
    public static array $DEFAULT_CATEGORIES = [
        // ---- PEMASUKAN ----
        ['Gaji',            'pemasukan',   'briefcase',    '#10b981', 1],
        ['Bonus',           'pemasukan',   'gift',         '#06b6d4', 2],
        ['Freelance',       'pemasukan',   'laptop',       '#8b5cf6', 3],
        ['Investasi',       'pemasukan',   'trending-up',  '#f59e0b', 4],
        ['Lainnya',         'pemasukan',   'plus-circle',  '#6366f1', 5],

        // ---- PENGELUARAN ----
        ['Makan & Minum',   'pengeluaran', 'utensils',     '#ef4444', 1],
        ['Transportasi',    'pengeluaran', 'car',          '#f97316', 2],
        ['Tagihan',         'pengeluaran', 'file-text',    '#eab308', 3],
        ['Belanja',         'pengeluaran', 'shopping-bag', '#ec4899', 4],
        ['Hiburan',         'pengeluaran', 'tv',           '#a855f7', 5],
        ['Kesehatan',       'pengeluaran', 'heart-pulse',  '#14b8a6', 6],
        ['Pendidikan',      'pengeluaran', 'graduation-cap','#3b82f6', 7],
        ['Tabungan',        'pengeluaran', 'piggy-bank',   '#10b981', 8],
        ['Lainnya',         'pengeluaran', 'more-horizontal','#6b7280',9],
    ];

    /**
     * Buat kategori default untuk user baru.
     * Dipanggil saat registrasi (dari AuthService) dan dari seeder ini.
     */
    public static function buatKategoriDefault(User $user): void
    {
        $kategori = [];
        foreach (self::$DEFAULT_CATEGORIES as $cat) {
            $kategori[] = [
                'user_id'    => $user->id,
                'nama'       => $cat[0],
                'tipe'       => $cat[1],
                'ikon'       => $cat[2],
                'warna'      => $cat[3],
                'urutan'     => $cat[4],
                'is_default' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        Category::insert($kategori);
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seeder ini biasanya dipanggil dari DemoUserSeeder.
        // Bisa juga dijalankan standalone jika ada user yang belum punya kategori default.
        $this->command->info('DefaultCategoriesSeeder: Tidak ada yang dijalankan secara standalone.');
        $this->command->info('Gunakan DemoUserSeeder untuk membuat user demo lengkap dengan kategori.');
    }
}
