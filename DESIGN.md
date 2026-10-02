# DESIGN.md: Sistem Desain Aplikasi Keuangan Pribadi

Dokumen ini adalah acuan visual dan UX untuk implementasi di React + Tailwind CSS. Baca bersama `PRD.md`.

---

## 1. Arah Desain

**Subjek:** aplikasi pencatat uang harian untuk anak muda dan pekerja di Indonesia, dipakai terutama di HP, sering dengan satu tangan.

**Tugas utama layar:** menjawab "uangku sekarang tinggal berapa?" dalam sekali lihat, lalu membuat pencatatan secepat mungkin.

**Konsep: "Buku kas yang hidup."** Rasa buku kas yang rapi dan tepercaya (angka sejajar, baris bersih, tanpa hiasan), diterjemahkan menjadi antarmuka modern yang tenang. Warna hanya dipakai untuk menyampaikan arti uang: masuk, keluar, tabungan.

**Satu elemen yang diingat: Pita Aliran.** Di dashboard, satu pita horizontal menunjukkan ke mana pemasukan periode ini mengalir: potongan per kategori pengeluaran, lalu sisa uang di ujung. Satu pandangan menggantikan beberapa kartu statistik.

**Prinsip**
1. **Angka adalah bintangnya.** Nominal selalu paling jelas, sejajar, dan konsisten formatnya.
2. **Warna berarti sesuatu.** Hijau = masuk, merah = keluar, emas = tabungan, teal = aksi dan identitas. Tidak ada warna dekoratif.
3. **Satu ibu jari, satu tangan.** Aksi utama ada di bagian bawah layar.
4. **Datar dan tenang.** Baris dan pemisah tipis alih-alih tumpukan kartu identik. Bayangan hanya untuk elemen yang melayang (FAB, bottom sheet, toast).
5. **Mengurangi usaha mengetik.** Default cerdas: tanggal hari ini, dompet terakhir dipakai, kategori yang sering dipakai di depan.

**Yang dihindari:** deretan kartu statistik yang seragam, gradasi dekoratif, label huruf kapital semua di atas setiap judul, tanda panah ditempel di semua tombol, dan animasi masuk pada setiap bagian.

---

## 2. Token Desain

### 2.1 Warna

Warna dikelola sebagai CSS variable agar mode terang/gelap tinggal bertukar nilai.

| Token | Terang | Gelap | Fungsi |
|---|---|---|---|
| `--bg` Kertas | `#F1F5F4` | `#0C171B` | Latar halaman |
| `--surface` Permukaan | `#FFFFFF` | `#14242A` | Panel, sheet, input |
| `--surface-2` | `#E8EEEC` | `#1B3037` | Latar sekunder, chip nonaktif |
| `--line` Garis | `#D9E2E0` | `#26404A` | Pemisah dan border tipis |
| `--ink` Tinta | `#12262E` | `#E6EFEE` | Teks utama |
| `--ink-muted` | `#506468` | `#96ADB0` | Teks sekunder |
| `--brand` Laut | `#0A6B6B` | `#4FC1BC` | Aksi utama, tautan, fokus |
| `--on-brand` | `#FFFFFF` | `#06201F` | Teks di atas warna brand |
| `--income` Daun | `#16885A` | `#4CCB95` | Pemasukan, saldo positif |
| `--expense` Delima | `#C93A54` | `#F27C8F` | Pengeluaran, saldo negatif |
| `--saving` Emas | `#B8860B` | `#F0C45A` | Tabungan dan target |
| `--warn` | `#B76E00` | `#F2B24C` | Anggaran 80% |

Catatan kontras: teks `--ink` dan `--ink-muted` di atas `--bg`/`--surface` harus lolos WCAG AA (4.5:1). Verifikasi nilai akhir dengan alat pengecek kontras sebelum dikunci. Warna `--income`/`--expense` dipakai sebagai teks hanya pada ukuran 16px ke atas atau bobot 600 ke atas; selalu disertai tanda `+`/`-` agar tidak bergantung pada warna.

**Palet kategori (grafik):** delapan warna yang mudah dibedakan, selalu disertai label teks dan nominal pada legenda.

`#0A6B6B` · `#C93A54` · `#D98A1F` · `#5B6EE1` · `#8A4FB5` · `#2E9CCA` · `#7A8F3A` · `#8C6D5A`

### 2.2 Tipografi

| Peran | Font | Catatan |
|---|---|---|
| Judul dan angka besar | **Bricolage Grotesque** (600-700) | Karakter tegas untuk saldo dan judul halaman |
| UI dan isi | **Plus Jakarta Sans** (400, 500, 600) | Terbaca baik di layar kecil, cocok untuk teks Indonesia |
| Fallback | `system-ui, sans-serif` | Wajib didefinisikan |

- Semua nominal memakai `font-variant-numeric: tabular-nums` (di Tailwind: `tabular-nums`) agar digit sejajar. Uji bahwa font yang dimuat mendukung fitur ini; jika tidak, ganti font angka.
- Muat dari Google Fonts dengan `display=swap` dan subset Latin.

| Skala | Ukuran / tinggi baris | Pemakaian |
|---|---|---|
| `display` | 44 / 48 (mobile), 56 / 60 (desktop) | Sisa Uang di dashboard |
| `title` | 24 / 30 | Judul halaman |
| `heading` | 18 / 24 | Judul bagian |
| `body` | 16 / 24 | Isi utama dan input (minimal 16px agar tidak zoom di iOS) |
| `small` | 14 / 20 | Teks sekunder, catatan transaksi |
| `micro` | 12 / 16 | Keterangan kecil (tanggal, hint) |

Gaya teks: huruf kalimat biasa (sentence case). Panjang baris isi maksimal 70 karakter.

### 2.3 Jarak, Sudut, Elevasi

- Basis jarak 4px. Gutter halaman: 16px (mobile), 24px (tablet), 32px (desktop).
- **Hierarki sudut (sengaja berbeda per peran):**
  - Panel hero dan bottom sheet: 24px
  - Panel biasa: 16px
  - Tombol: 14px
  - Input: 12px
  - Chip dan progress bar: penuh (pill)
- **Elevasi:** halaman datar dengan border `--line` 1px. Bayangan hanya pada FAB, bottom sheet/modal, dan toast.
- **Safe area:** `padding-bottom: env(safe-area-inset-bottom)` pada bottom nav dan sheet; `padding-top: env(safe-area-inset-top)` pada header.

### 2.4 Konfigurasi Tailwind (acuan)

```js
// tailwind.config.js
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--line)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        brand: 'var(--brand)',
        'on-brand': 'var(--on-brand)',
        income: 'var(--income)',
        expense: 'var(--expense)',
        saving: 'var(--saving)',
        warn: 'var(--warn)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sheet: '24px', panel: '16px', btn: '14px', field: '12px' },
      boxShadow: {
        float: '0 8px 24px -8px rgb(18 38 46 / 0.35)',
      },
    },
  },
};
```

Tema: atur `data-theme` pada `<html>`; default mengikuti `prefers-color-scheme`, pilihan pengguna disimpan.

---

## 3. Layout dan Navigasi

### 3.1 Breakpoint

| Nama | Lebar | Perilaku |
|---|---|---|
| Mobile | 360-767px | Satu kolom, bottom nav, FAB, form di bottom sheet |
| Tablet | 768-1023px | Satu-dua kolom, bottom nav tetap, sheet menjadi modal tengah |
| Desktop | 1024px+ | Sidebar kiri, konten maksimal 1200px, dashboard dua kolom |

### 3.2 Mobile (acuan 390px)

```
┌──────────────────────────────┐
│ Halo, Rina            ◐  👤  │  header ringkas
├──────────────────────────────┤
│ Oktober 2026  ▾              │  filter periode
│                              │
│ Sisa uang                    │
│ Rp 3.250.000                 │  display, hijau/merah
│ ▓▓▓▓▓▓▓░░░░ ▓▓░░░░░░░░░░░░░  │  Pita Aliran
│ Makan  Tagihan  ...   Sisa   │  legenda ringkas
│                              │
│ ◀ Total saldo │ Masuk │ Keluar ▶ │  strip geser horizontal
│                              │
│ Target tabungan              │
│ Laptop baru   62% ━━━━━░░░   │
│                              │
│ Terbaru                      │
│ ──────────────────────────── │
│ 🍜 Makan siang      -Rp 28.000│
│    Hari ini · GoPay           │
│ ──────────────────────────── │
│ 💼 Gaji          +Rp 6.500.000│
│    1 Okt · BCA                │
├──────────────────────────────┤
│ Beranda Transaksi (＋) Dompet Lainnya │  bottom nav + FAB tengah
└──────────────────────────────┘
```

- Bottom nav: **Beranda, Transaksi, (FAB Tambah), Dompet, Lainnya**. Target tabungan, transaksi berulang, anggaran, kategori, dan pengaturan berada di Lainnya atau diakses dari kartu di Beranda.
- FAB berada menyatu di tengah bottom nav (menonjol 12px), diameter 56px.
- Tinggi bottom nav 64px + safe area. Konten diberi `padding-bottom` agar tidak tertutup.

### 3.3 Desktop (acuan 1440px)

```
┌────────┬─────────────────────────────────────────────┐
│ Logo   │ Oktober 2026 ▾                [＋ Tambah]  ◐ 👤│
│        ├───────────────────────────┬─────────────────┤
│ Beranda│ Sisa uang                 │ Dompet          │
│ Transak│ Rp 3.250.000              │  Tunai   450rb  │
│ Dompet │ ▓▓▓▓▓▓▓░░░░ Pita Aliran   │  BCA   5,1jt    │
│ Target │ ──────────────────────────│  GoPay  320rb   │
│ Berulang│ Pemasukan vs pengeluaran │ ─────────────── │
│ Anggaran│ [grafik batang]          │ Tagihan 30 hari │
│ Kategori│ ─────────────────────────│  Netflix  5 Okt │
│ Pengatur│ Transaksi terbaru        │  Internet 8 Okt │
│        │ [tabel]                   │ Target tabungan │
└────────┴───────────────────────────┴─────────────────┘
```

- Sidebar 240px, dapat diciutkan menjadi ikon saja pada 1024-1279px.
- Halaman Transaksi di desktop memakai tabel dengan kolom: Tanggal, Catatan, Kategori, Dompet, Nominal (rata kanan), Aksi. Filter tampil sebagai baris di atas tabel, bukan di dalam sheet.
- Form tambah/edit membuka sebagai panel samping kanan (420px) atau modal, bukan halaman penuh.

---

## 4. Komponen

### 4.1 Pita Aliran (komponen khas)
- Satu bar horizontal tinggi 14px (mobile) / 18px (desktop), sudut penuh, mewakili 100% pemasukan periode.
- Segmen berurutan: tiap kategori pengeluaran (warna palet kategori), lalu segmen **Sisa** berwarna `--income`. Jika pengeluaran melebihi pemasukan, bar penuh dengan tanda defisit `--expense` dan teks "Pengeluaran melebihi pemasukan Rp X".
- Ketuk/hover segmen menampilkan nama kategori, nominal, dan persen. Di bawah bar, legenda menampilkan tiga kategori terbesar + "Lainnya".
- Alternatif teks tersedia untuk pembaca layar: kalimat ringkasan ("Pengeluaran terbesar: Makan, 32% dari pemasukan").
- Bila pemasukan = 0: tampilkan keadaan kosong, bukan bar.

### 4.2 Tombol
| Varian | Tampilan | Pemakaian |
|---|---|---|
| Utama | Latar `--brand`, teks `--on-brand` | Satu per layar/sheet: "Simpan transaksi" |
| Sekunder | Border `--line`, teks `--ink` | "Batal", "Filter" |
| Teks | Tanpa latar, teks `--brand` | Aksi ringan |
| Bahaya | Latar `--expense` | Hapus (hanya di dialog konfirmasi) |

Tinggi 48px (mobile) / 44px (desktop), sudut 14px. Status: hover, active (skala 0.98), fokus, nonaktif, memuat (spinner dan teks tetap).

### 4.3 Form Tambah Transaksi (paling penting)
Bottom sheet di mobile (naik dari bawah, tinggi hingga 92% layar), modal/panel di desktop. Urutan dirancang untuk kecepatan:

1. **Tipe:** segmented control "Pengeluaran | Pemasukan | Transfer" (default: Pengeluaran). Warna aksen mengikuti tipe.
2. **Nominal:** field besar (display), `inputmode="numeric"`, format ribuan otomatis, fokus otomatis saat sheet terbuka.
3. **Kategori:** grid chip 4 kolom dengan ikon; 8 kategori yang paling sering dipakai ditampilkan dulu, sisanya lewat "Lainnya".
4. **Dompet:** chip horizontal; default dompet terakhir dipakai.
5. **Tanggal:** default hari ini, chip cepat "Hari ini / Kemarin / Pilih tanggal".
6. **Catatan:** opsional, satu baris.
7. Tombol **Simpan transaksi** menempel di bawah sheet di atas keyboard virtual.

Validasi: pesan di bawah field, contoh "Nominal harus lebih dari 0". Setelah simpan: sheet menutup, toast "Transaksi disimpan", saldo dan Pita Aliran diperbarui.

### 4.4 Baris Transaksi
Baris datar (bukan kartu): ikon kategori dalam lingkaran 40px berwarna lembut, catatan/nama kategori (heading kecil), baris kedua berisi dompet dan waktu, nominal rata kanan dengan tanda `+`/`-`. Dikelompokkan per tanggal dengan judul grup ("Hari ini", "Kemarin", "28 September"). Pemisah tipis `--line`. Mobile: ketuk untuk membuka detail/edit, geser kiri untuk hapus (dengan konfirmasi), plus menu titik tiga sebagai alternatif aksesibel.

### 4.5 Dompet
Daftar dompet dengan penanda warna di sisi kiri, nama, tipe, dan saldo. Di Beranda mobile, strip dompet dapat digeser. Tombol "Transfer" tampil di halaman Dompet. Dompet terarsip ditaruh di bagian terpisah yang dapat dilipat.

### 4.6 Target Tabungan
Baris dengan ikon emas, nama, "Rp terkumpul dari Rp target", progress bar pill (`--saving`), persentase, dan baris estimasi: "Setor sekitar Rp 450.000 per bulan untuk tercapai sebelum 30 Juni." Saat tercapai: bar penuh, lencana "Tercapai", dan tombol "Arsipkan".

### 4.7 Anggaran
Progress bar per kategori: normal `--brand`, 80-99% `--warn`, 100%+ `--expense`. Selalu ada teks status (bukan hanya warna): "Tersisa Rp 120.000", "Hampir habis (85%)", "Melebihi Rp 40.000".

### 4.8 Transaksi Berulang
Baris dengan ikon ulang, nama aturan, frekuensi ("Setiap bulan, tanggal 25"), nominal, dan sakelar aktif/jeda. Bagian "Tagihan 30 hari ke depan" berupa daftar kronologis dengan tanggal jatuh tempo.

### 4.9 Grafik
- **Donat pengeluaran per kategori:** pusat donat menampilkan total pengeluaran. Di bawah, legenda berupa daftar (warna, nama, nominal, persen) dan berfungsi sebagai alternatif teks.
- **Batang pemasukan vs pengeluaran:** dua batang per bulan (`--income` dan `--expense`), sumbu Y diringkas ("1jt", "5jt"), tooltip dengan nominal lengkap. Mobile: tampilkan 6 bulan terakhir dan dapat digeser.
- Pakai Recharts dengan `ResponsiveContainer`; jangan sampai grafik memicu scroll horizontal pada halaman.

### 4.10 Komponen Pendukung
- **Input:** tinggi 48px, label di atas (tidak hanya placeholder), border `--line`, fokus cincin 2px `--brand`.
- **Toast:** muncul di atas bottom nav (mobile) atau pojok kanan bawah (desktop), hilang otomatis 4 detik, bisa ditutup, `role="status"`.
- **Dialog konfirmasi:** judul jelas, ringkasan apa yang dihapus, tombol "Hapus" (bahaya) dan "Batal".
- **Skeleton:** meniru bentuk konten (pita, baris transaksi), bukan spinner layar penuh.
- **Empty state:** ilustrasi sederhana atau ikon, satu kalimat, satu tombol aksi.

---

## 5. Keadaan dan Teks Antarmuka

### 5.1 Gaya penulisan
Bahasa Indonesia sehari-hari yang sopan dan lugas, huruf kalimat biasa, kata kerja aktif. Satu aksi memakai nama yang sama di seluruh alur: tombol "Simpan transaksi" menghasilkan toast "Transaksi disimpan".

| Konteks | Contoh |
|---|---|
| Tombol | Simpan transaksi, Tambah dompet, Setor ke target, Hapus |
| Toast sukses | Transaksi disimpan · Dompet diarsipkan · Target tercapai |
| Konfirmasi hapus | "Hapus transaksi Makan siang Rp 28.000? Tindakan ini tidak dapat dibatalkan." |
| Error validasi | "Nominal harus lebih dari 0" · "Pilih kategori" |
| Error jaringan | "Tidak bisa terhubung ke server. Periksa koneksi, lalu coba lagi." + tombol "Coba lagi" |
| Login gagal | "Email atau password salah." |
| Saldo defisit | "Pengeluaran melebihi pemasukan Rp 150.000 bulan ini." |

Error tidak meminta maaf berlebihan dan selalu menyebut apa yang terjadi dan langkah perbaikannya.

### 5.2 Empty state
| Layar | Teks | Aksi |
|---|---|---|
| Transaksi kosong | "Belum ada transaksi. Catat pengeluaran pertamamu." | Tambah transaksi |
| Target kosong | "Belum ada target. Mulai dengan satu tujuan, misalnya dana darurat." | Buat target |
| Berulang kosong | "Belum ada transaksi berulang. Tambahkan gaji atau langganan agar tercatat otomatis." | Tambah aturan |
| Hasil filter kosong | "Tidak ada transaksi yang cocok dengan filter." | Hapus filter |

### 5.3 Memuat dan offline
Skeleton pada pemuatan pertama; saat memuat ulang data lama tetap tampil dengan indikator tipis di atas. Offline: banner "Kamu sedang offline. Data terakhir ditampilkan; perubahan belum bisa disimpan."

---

## 6. Gerak

Gerak seperlunya dan menjawab aksi pengguna.

- **Satu momen terencana:** saat Dashboard pertama kali dimuat di sesi, Pita Aliran terisi dari kiri ke kanan (600ms, ease-out). Tidak diulang saat berpindah periode; saat periode berganti, segmen berubah dengan transisi 250ms.
- **Respons terhadap aksi:** bottom sheet naik/turun (250ms), progress bar bertambah saat setoran, toast masuk dari bawah, tombol memberi umpan active (skala 0.98).
- **Tanpa** animasi masuk per bagian, hover berlebihan pada setiap kartu, atau animasi dekoratif yang berjalan terus.
- Hormati `prefers-reduced-motion`: ganti dengan perubahan langsung atau fade singkat.

---

## 7. Aksesibilitas

- Kontras WCAG AA untuk teks dan elemen kontrol di kedua tema.
- Informasi tidak hanya lewat warna: tanda `+`/`-`, ikon, dan teks status pada anggaran dan saldo.
- Fokus keyboard selalu terlihat (cincin 2px `--brand`, offset 2px); urutan tab logis; bottom sheet dan modal menjebak fokus dan menutup dengan `Esc`.
- Semua input punya `<label>`; error dihubungkan dengan `aria-describedby`; toast memakai `role="status"`.
- Target sentuh minimal 44x44px, jarak antar-target minimal 8px.
- Grafik punya alternatif teks (legenda berisi nominal dan ringkasan kalimat).
- Dukung pembesaran teks hingga 200% tanpa kehilangan fungsi.

---

## 8. Panduan Implementasi Mobile

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Font input >= 16px; `inputmode="numeric"` untuk nominal; gunakan `type="date"` bawaan atau pemilih tanggal yang ramah sentuhan.
- Gunakan `100dvh` (bukan `100vh`) untuk sheet dan layout satu layar agar tidak terpotong bilah alamat browser.
- Saat keyboard muncul, pastikan tombol Simpan dan field aktif tetap terlihat (`scrollIntoView` dan padding bawah sheet).
- Tabel lebar hanya muncul di desktop; di mobile ganti dengan baris transaksi (4.4).
- Hindari hover sebagai satu-satunya cara memunculkan informasi; sediakan ketuk.
- PWA: `theme-color` mengikuti `--bg`, ikon maskable 192/512, layar splash sederhana.

---

## 9. Struktur Komponen React (saran)

```
src/
  components/
    ui/        Button, Input, MoneyInput, Select, Chip, Segmented, Sheet, Modal, Toast, Skeleton, EmptyState, ConfirmDialog
    finance/   FlowRibbon, TransactionRow, TransactionForm, WalletRow, GoalRow, BudgetBar, RecurringRow, CategoryDonut, MonthlyBars
    layout/    AppShell, BottomNav, Sidebar, Header, PeriodFilter
  pages/       Dashboard, Transactions, Wallets, Goals, Recurring, Budgets, Categories, Settings, Login, Register
  hooks/       useAuth, useTransactions, useSummary, useTheme, useMediaQuery
  lib/         api (axios), format (rupiah, tanggal), money (parse nominal)
```

`Sheet` dirender sebagai bottom sheet di bawah 768px dan sebagai modal/panel samping di atasnya, dengan API komponen yang sama.

---

## 10. Daftar Periksa Desain Sebelum Rilis

- [ ] Semua halaman rapi di 360, 390, 768, 1024, 1440 tanpa scroll horizontal.
- [ ] Mode terang dan gelap lolos pengecekan kontras.
- [ ] Mencatat transaksi dari Beranda dapat dilakukan < 15 detik.
- [ ] Pita Aliran benar untuk kasus: pemasukan 0, defisit, satu kategori, banyak kategori.
- [ ] Semua keadaan ada: memuat, kosong, error, offline, sukses.
- [ ] Keyboard dan pembaca layar dapat menyelesaikan alur tambah transaksi.
- [ ] `prefers-reduced-motion` dihormati.
- [ ] Angka sejajar (tabular) di semua daftar dan tabel.
