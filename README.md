# Aplikasi Pengelola Keuangan Pribadi (Full-Stack Monorepo)

Aplikasi web pengelola keuangan pribadi full-stack modern, multi-user, aman, dan *mobile-first* yang dibangun dengan **Laravel 12 (API)** dan **React + Vite + Tailwind CSS (Client)**.

![Stack](https://img.shields.io/badge/Laravel-12.x-red)
![Frontend](https://img.shields.io/badge/React-18.x-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-teal)
![Database](https://img.shields.io/badge/MySQL-8.0-orange)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

---

## 🌟 Fitur Utama

1. **Dashboard & Analytics Interaktif**
   - Ringkasan Arus Kas (Total Saldo, Pemasukan, Pengeluaran, Net Cashflow positif/negatif).
   - Filter Periode Cepat (*Bulan Ini*, *Bulan Lalu*, *Tahun Ini*, *Semua*).
   - **Grafik Donut (Recharts)** untuk pengeluaran per kategori.
   - **Grafik Batang (Recharts)** untuk tren 6 bulan Pemasukan vs Pengeluaran.
   - 5 Transaksi Terakhir & Tagihan Mendatang.

2. **Manajemen Transaksi (CRUD & Filter)**
   - Daftar transaksi dikelompokkan secara rapi per tanggal (*Hari Ini*, *Kemarin*, dll).
   - Pencarian kata kunci & filter multi-kolom (tipe, dompet, kategori).
   - Form Modal / Bottom Sheet dengan input nominal berformat ribuan otomatis (`1.500.000`).
   - Ekspor data transaksi ke file **CSV**.

3. **Manajemen Dompet & Transfer Antar Dompet**
   - Multi-dompet (Tunai, Rekening Bank, E-Wallet, Investasi, dll).
   - Kalkulasi saldo **aktual** secara real-time via 5 batch aggregate queries (bebas masalah N+1).
   - Fitur arsip/restore dompet & transfer saldo antar dompet (termasuk biaya admin).

4. **Target Tabungan (Savings Goals)**
   - Progress bar persentase terkumpul, sisa kebutuhan, dan estimasi setoran bulanan hingga tenggat.
   - Setoran tabungan yang dapat memotong saldo dompet pilihan secara otomatis (1 DB Transaction).
   - Status otomatis berubah menjadi **"Tercapai"** saat target terpenuhi.

5. **Transaksi Berulang & Scheduler (Catch-Up & Idempotent)**
   - Aturan transaksi berulang (*Harian*, *Mingguan*, *Bulanan*, *Tahunan*).
   - **Catch-up & Idempotent Execution**: Mengeksekusi transaksi yang terlewat tanpa duplikasi jika server sempat mati.
   - Penanganan akhir bulan aman (misal: aturan tanggal 31 pada bulan Februari).
   - Prediksi tagihan 30 hari ke depan & Instant Manual Trigger via CLI/API.

6. **Anggaran Bulanan & Kelola Kategori**
   - Batas anggaran per kategori dengan indikator visual persentase pemakaian:
     - 💚 **Aman** (< 80%)
     - 💛 **Waspada** (80% – 99%)
     - ❤️ **Overbudget** (>= 100%)
   - Manajemen kategori custom (ikon & warna hex) dengan proteksi kategori bawaan sistem.

7. **Keamanan, Auth JWT & Data Backup**
   - Dual-token JWT (Access Token 60 menit & Refresh Token 30 hari) via Laravel Sanctum.
   - **Auto-Refresh Interceptor**: Mengulangi request secara transparan jika token expired.
   - Rate limiting protection pada endpoint login & register (`throttle:6,1`).
   - Backup seluruh data ke **JSON** & Restore Atomic (DB Transaction Rollback).
   - Hapus akun permanen wajib konfirmasi password.

8. **PWA & Responsif Mobile-First**
   - Tampilan responsif murni dari layar 360px hingga 4K.
   - Progressive Web App (PWA) dengan `manifest.json` & Service Worker (`sw.js`).
   - Dukungan safe-area iOS (notch iPhone) dan Bottom Navigation Bar 5-Item.

---

## 🛠️ Tech Stack

### Backend (API)
- **Framework**: Laravel 12
- **Database**: MySQL 8.0 (Database name: `keuangan`)
- **Autentikasi**: Laravel Sanctum JWT Bearer Token (bcrypt password hashing)
- **Scheduler**: Laravel Console Command (`php artisan recurring:process`)

### Frontend (Client)
- **Framework**: React 18 (Vite 5)
- **Styling**: Tailwind CSS v3.4 (Dark Mode class-based, custom HSL palette)
- **State & Query**: TanStack Query v5 (React Query) + Axios
- **Form**: React Hook Form + Zod Validator
- **Visualisasi**: Recharts
- **Notifikasi**: Sonner Toast

---

## 📁 Struktur Proyek Monorepo

```
keu-app/
├── app/                        # Logic Backend Laravel
│   ├── Console/Commands/       # Command Scheduler (recurring:process)
│   ├── Http/Controllers/Api/   # API Controllers (Auth, Wallet, Transaction, dll)
│   ├── Http/Middleware/        # Middleware Access Token Guard
│   ├── Http/Requests/          # Form Requests Validation
│   ├── Http/Resources/         # API Resource JSON Formatters
│   ├── Models/                 # Eloquent Models & Scopes
│   └── Services/               # Business Logic Services
├── client/                     # Monorepo Frontend React (Vite)
│   ├── public/                 # Static Assets, manifest.json, sw.js
│   └── src/
│       ├── components/ui/      # Reusable Design System Components
│       ├── components/layout/  # Header, Sidebar, BottomNav, AppLayout
│       ├── context/            # AuthContext & ThemeContext
│       ├── hooks/              # TanStack Query Custom Hooks
│       ├── lib/                # Formatters & Axios Instance
│       ├── pages/              # Dashboard, Transactions, Wallets, dll
│       └── services/           # Frontend API Gateway Services
├── database/
│   ├── migrations/             # 11 File Migrasi Tabel Database
│   └── seeders/                # Default Categories & Demo Seeder
├── routes/
│   ├── api.php                 # 54 Route API /api/v1
│   └── console.php             # Cron Schedule Configuration
├── Dockerfile                  # Production Dockerfile Backend
├── docker-compose.yml          # Production Docker Orchestration
└── README.md                   # Dokumentasi Resmi Proyek
```

---

## 🚀 Panduan Instalasi & Menjalankan (Development)

### 1. Prasyarat Sistem
- PHP >= 8.2 & Composer
- Node.js >= 18 & npm
- MySQL Server 8.0 (misal: via XAMPP / Laragon)

### 2. Setup Backend (Laravel)
```bash
# 1. Masuk ke root proyek
cd c:\xampp\htdocs\keu-app

# 2. Install dependensi Composer
composer install

# 3. Salin file .env dan generate App Key
cp .env.example .env
php artisan key:generate

# 4. Konfigurasi kredensial MySQL di .env
# DB_DATABASE=keuangan
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Jalankan migrasi database & seeder default
php artisan migrate --seed

# 6. Jalankan server backend Laravel (port 8000)
php artisan serve
```

### 3. Setup Frontend (React Vite)
```bash
# 1. Masuk ke folder client
cd client

# 2. Install dependensi npm
npm install

# 3. Jalankan server development Vite (port 5173)
npm run dev
```
Buka browser Anda di `http://localhost:5173`.

---

## 🔑 Akun Demo Pengujian

Saat menjalankan `php artisan db:seed`, akun demo berikut otomatis dibuat:

| Email | Password | Keterangan |
| :--- | :--- | :--- |
| `demo@keuangan.com` | `password123` | Memiliki saldo awal, kategori default, & sampel transaksi |

---

## ⏰ Menjalankan Cron Scheduler (Transaksi Berulang)

Untuk mengeksekusi transaksi berulang yang jatuh tempo secara otomatis:

- **Cara Manual (Instant Testing)**:
  ```bash
  php artisan recurring:process
  ```
- **Cara Otomatis di Production Server (Crontab)**:
  Tambahkan baris berikut di crontab server VPS Anda:
  ```cron
  * * * * * cd /path-to-app && php artisan schedule:run >> /dev/null 2>&1
  ```

---

## 🐳 Deployment Production (Docker / VPS)

### 1. Menjalankan Docker Compose
```bash
docker-compose up -d --build
```
Aplikasi akan aktif di port `8000` (Backend) dan `3306` (Database).

### 2. Rekomendasi Backup Database Automated
Jalankan dump MySQL harian via crontab:
```bash
mysqldump -u root -pkeuangan_db_pass keuangan > /backup/keuangan_$(date +%Y%m%d).sql
```

---

## 🧪 Pengujian Otomatis (PHPUnit)

Jalankan pengujian otomatis untuk memverifikasi kalkulasi saldo dan isolasi data multi-user:
```bash
php artisan test
```

---

## 📝 Lisensi
Proyek ini dibuat secara khusus dan dilindungi untuk pengembangan aplikasi Keuangan Pribadi Full-Stack.
