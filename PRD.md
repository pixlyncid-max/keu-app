# PRD: Aplikasi Pengelola Keuangan Pribadi

| | |
|---|---|
| Versi | 1.0 (draf) |
| Tanggal | 2 Oktober 2026 |
| Stack | React (Vite), Tailwind CSS, Node.js + Express, MySQL |
| Platform | Web responsif, mobile-first, dapat di-install sebagai PWA |
| Dokumen terkait | `DESIGN.md` (sistem desain dan UI) |

---

## 1. Ringkasan

Aplikasi web multi-user untuk mencatat pemasukan dan pengeluaran, mengelola beberapa dompet (tunai, bank, e-wallet), mengatur transaksi berulang, menabung untuk target tertentu, dan melihat sisa uang secara jelas. Pengalaman di HP adalah prioritas utama; tampilan desktop dirancang setara untuk analisis dan input data dalam jumlah besar.

## 2. Latar Belakang dan Masalah

Banyak orang mencatat keuangan di catatan HP atau spreadsheet. Pendekatan ini sering gagal karena:

- Pencatatan terasa merepotkan sehingga berhenti setelah beberapa minggu.
- Uang tersebar di banyak tempat (tunai, rekening, e-wallet) dan tidak ada gambaran total.
- Pengeluaran rutin (langganan, cicilan) terlupakan sampai tagihan datang.
- Target menabung tidak punya angka dan progres yang jelas.
- Data tidak bisa diakses dari beberapa perangkat.

## 3. Tujuan dan Non-Tujuan

### Tujuan
1. Mencatat satu transaksi dalam kurang dari 15 detik di HP.
2. Menampilkan total saldo dan sisa uang periode berjalan secara akurat dan real-time.
3. Mengurangi pencatatan manual lewat transaksi berulang otomatis.
4. Membantu pengguna menabung dengan target, progres, dan estimasi setoran.
5. Menyimpan data per pengguna secara aman dan terisolasi.

### Non-Tujuan (di luar versi 1.0)
- Sinkronisasi otomatis dengan rekening bank atau e-wallet.
- Scan struk atau OCR.
- Fitur investasi, utang-piutang antar orang, atau patungan.
- Multi-mata uang dan konversi kurs.
- Aplikasi native (iOS/Android); cukup PWA.

## 4. Pengguna Target

**Persona utama: Rina, 24 tahun, karyawan baru.** Gaji bulanan masuk ke satu bank, memakai dua e-wallet untuk harian, masih memegang uang tunai. Ingin tahu sisa uang sampai gajian berikutnya dan menabung untuk laptop baru. Mencatat lewat HP, biasanya sambil berdiri atau di perjalanan.

**Persona kedua: Bima, 28 tahun, freelancer.** Pemasukan tidak tetap, banyak langganan digital. Butuh melihat pemasukan vs pengeluaran per bulan dan mengekspor data ke spreadsheet untuk keperluan pajak.

## 5. User Stories

| ID | Sebagai | Saya ingin | Supaya |
|---|---|---|---|
| US-01 | Pengguna baru | mendaftar dengan email dan password | data saya tersimpan pribadi |
| US-02 | Pengguna | masuk dan tetap login di HP | tidak perlu login berulang |
| US-03 | Pengguna | menambah transaksi dengan cepat | pencatatan tidak merepotkan |
| US-04 | Pengguna | punya beberapa dompet | melihat posisi uang di tiap tempat |
| US-05 | Pengguna | memindahkan uang antar dompet | saldo tiap dompet tetap benar |
| US-06 | Pengguna | membuat transaksi berulang | gaji dan langganan tercatat otomatis |
| US-07 | Pengguna | melihat tagihan 30 hari ke depan | tidak kaget saat jatuh tempo |
| US-08 | Pengguna | membuat target tabungan | tahu progres dan sisa yang dibutuhkan |
| US-09 | Pengguna | menetapkan anggaran per kategori | pengeluaran tidak melebihi rencana |
| US-10 | Pengguna | melihat grafik per kategori dan per bulan | memahami kebiasaan belanja |
| US-11 | Pengguna | mencari dan memfilter transaksi | menemukan catatan lama dengan mudah |
| US-12 | Pengguna | mengekspor dan membackup data | data saya tidak terkunci di aplikasi |
| US-13 | Pengguna | memakai mode gelap | nyaman dipakai malam hari |
| US-14 | Pengguna | menghapus akun beserta datanya | mengendalikan data pribadi saya |

## 6. Ruang Lingkup Fitur

Prioritas: **P0** wajib untuk rilis pertama, **P1** penting, **P2** bila waktu tersedia.

### 6.1 Autentikasi (P0)
- Registrasi (nama, email, password) dan login.
- JWT: access token berumur pendek dan refresh token berumur panjang yang disimpan dalam bentuk hash dan dapat dicabut.
- Refresh token otomatis di frontend; logout otomatis jika refresh gagal.
- Saat registrasi dibuat otomatis: kategori default dan satu dompet "Tunai".
- Ubah password dan hapus akun (konfirmasi password).

**Kriteria penerimaan**
- Password minimal 8 karakter, disimpan dengan bcrypt.
- Email unik; pesan error tidak membocorkan apakah email terdaftar saat login gagal.
- Endpoint login dibatasi rate limit.
- Pengguna A tidak pernah dapat membaca atau mengubah data pengguna B pada endpoint mana pun.

### 6.2 Dompet (P0)
- CRUD dompet: nama, tipe (tunai/bank/e-wallet), saldo awal, warna, ikon.
- Saldo dompet = saldo awal + pemasukan - pengeluaran + transfer masuk - transfer keluar - biaya admin.
- Dompet yang sudah punya transaksi tidak dapat dihapus, hanya diarsipkan.
- Transfer antar dompet, dengan biaya admin opsional. Transfer **tidak** dihitung sebagai pemasukan atau pengeluaran.

### 6.3 Kategori (P0)
- Default pemasukan: Gaji, Bonus, Freelance, Lainnya.
- Default pengeluaran: Makan, Transportasi, Tagihan, Belanja, Hiburan, Kesehatan, Pendidikan, Lainnya.
- Pengguna dapat menambah, mengubah nama/ikon/warna, dan menghapus kategori. Kategori yang sudah dipakai transaksi hanya bisa dihapus setelah transaksinya dipindahkan ke kategori lain.

### 6.4 Transaksi (P0)
- Field: tipe, nominal (> 0), dompet, kategori, tanggal, catatan opsional.
- Edit dan hapus dengan konfirmasi.
- Daftar dikelompokkan per tanggal; pencarian pada catatan; filter tipe, kategori, dompet, rentang tanggal; pagination atau infinite scroll.
- Nominal disimpan sebagai `DECIMAL(15,2)`; tampil dalam format Rupiah.

**Kriteria penerimaan**
- Setelah transaksi ditambah, diubah, atau dihapus, saldo dompet, kartu ringkasan, dan grafik langsung diperbarui tanpa muat ulang halaman.
- Transaksi tanggal lampau dan masa depan diperbolehkan.

### 6.5 Dashboard (P0)
- Kartu: Total Saldo (semua dompet aktif), Pemasukan, Pengeluaran, dan Sisa Uang periode terpilih (hijau jika positif, merah jika negatif).
- Filter periode: Bulan ini, Bulan lalu, Tahun ini, Semua, Kustom.
- Grafik donat pengeluaran per kategori dan grafik batang pemasukan vs pengeluaran per bulan.
- 5 transaksi terakhir, ringkasan target tabungan, ringkasan anggaran, tagihan mendatang.

### 6.6 Transaksi Berulang (P1)
- Aturan: tipe, nominal, dompet, kategori, catatan, frekuensi (harian/mingguan/bulanan/tahunan), interval, tanggal mulai, tanggal selesai opsional, status aktif/jeda.
- Penjadwal harian (node-cron) membuat transaksi saat jatuh tempo.
- **Catch-up:** jika server mati, transaksi yang terlewat dibuat saat server menyala kembali, tanpa duplikat (proses idempoten).
- Aturan tanggal 29-31 menyesuaikan akhir bulan (misal 31 Januari menjadi 28/29 Februari).
- Tampilan "tagihan mendatang" 30 hari.

**Kriteria penerimaan**
- Menjalankan penjadwal dua kali pada hari yang sama tidak menghasilkan transaksi ganda.
- Transaksi hasil aturan ditandai (`recurring_id`) dan tetap bisa diedit atau dihapus sebagai transaksi biasa tanpa mengubah aturannya.

### 6.6b Target Tabungan (P1)
- Target: nama, nominal target, tenggat opsional, dompet sumber opsional, ikon, warna.
- Setoran: nominal, tanggal, catatan; bila dompet dipilih, saldo dompet berkurang (dalam satu database transaction).
- Progres: terkumpul, persentase, sisa, dan estimasi setoran per bulan sampai tenggat.
- Status otomatis menjadi "tercapai" ketika terkumpul >= target.

### 6.7 Anggaran Bulanan (P1)
- Batas per kategori pengeluaran per bulan.
- Progress bar; peringatan visual pada 80% dan 100%+.

### 6.8 Data dan Pengaturan (P1)
- Ekspor CSV (mengikuti filter aktif) dan backup JSON.
- Impor JSON dengan validasi dan database transaction (gagal satu, batal semua).
- Tema terang/gelap/ikuti sistem, tersimpan.
- Profil: ubah nama dan password.

### 6.9 PWA dan Offline (P2)
- Dapat di-install ke layar utama; aset statis di-cache.
- Saat offline: tampilan jelas yang memberi tahu bahwa data tidak dapat dimuat/disimpan (tanpa antrian sinkronisasi di v1.0).

## 7. Aturan Bisnis Penting

1. Sisa Uang periode = total pemasukan - total pengeluaran pada periode (transfer dan setoran tabungan tidak ikut dihitung sebagai pengeluaran, kecuali setoran ditandai memotong dompet; lihat poin 3).
2. Total Saldo = jumlah saldo seluruh dompet aktif (dompet terarsip tidak ikut).
3. Setoran tabungan yang memotong dompet dicatat sebagai pengurangan saldo dompet dan sebagai kontribusi target, bukan sebagai pengeluaran kategori. Keputusan ini perlu dikonfirmasi (lihat Pertanyaan Terbuka).
4. Biaya admin transfer dihitung sebagai pengeluaran pada dompet asal.
5. Semua tanggal disimpan dalam UTC dan ditampilkan sesuai zona waktu pengguna (default Asia/Makassar atau pengaturan perangkat).
6. Penghapusan transaksi tidak dapat dibatalkan kecuali lewat impor backup.

## 8. Kebutuhan Non-Fungsional

| Area | Kebutuhan |
|---|---|
| Performa | Dashboard termuat < 2 detik pada jaringan 4G; aksi tambah transaksi terasa instan (optimistic update) |
| Keamanan | bcrypt, JWT, prepared statement, helmet, CORS terbatas, rate limit, validasi Zod di server, semua query difilter `user_id` |
| Privasi | Data hanya milik pengguna; hapus akun menghapus seluruh data; tidak ada pelacak pihak ketiga |
| Responsif | Lebar minimum 360px; diuji di 360, 390, 768, 1024, 1440 |
| Aksesibilitas | Kontras WCAG AA, fokus terlihat, navigasi keyboard, label form, target sentuh >= 44px |
| Lokalisasi | Bahasa Indonesia; Rupiah via `Intl.NumberFormat('id-ID')`; tanggal format Indonesia |
| Keandalan | Backup database terjadwal; migrasi berversi; penjadwal idempoten |
| Kualitas | Tes untuk perhitungan saldo, transaksi berulang, dan otorisasi antar-user |

## 9. Model Data (Ringkas)

`users`, `refresh_tokens`, `wallets`, `categories`, `transactions`, `transfers`, `recurring_transactions`, `savings_goals`, `savings_contributions`, `budgets`.

Prinsip: semua tabel milik pengguna memiliki `user_id` dan index yang sesuai; nominal memakai `DECIMAL(15,2)`; relasi memakai foreign key. Skema lengkap didefinisikan pada Tahap 1.

## 10. Gambaran API

Prefix `/api/v1`, respons JSON konsisten (`{ data, meta? }` atau `{ error: { code, message, details? } }`).

| Grup | Contoh endpoint |
|---|---|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Dompet | `GET/POST /wallets`, `PATCH/DELETE /wallets/:id`, `POST /transfers` |
| Kategori | `GET/POST /categories`, `PATCH/DELETE /categories/:id` |
| Transaksi | `GET/POST /transactions`, `PATCH/DELETE /transactions/:id` |
| Berulang | `GET/POST /recurring`, `PATCH/DELETE /recurring/:id`, `GET /recurring/upcoming` |
| Target | `GET/POST /goals`, `POST /goals/:id/contributions` |
| Anggaran | `GET/PUT /budgets?month=YYYY-MM` |
| Laporan | `GET /reports/summary`, `/reports/by-category`, `/reports/monthly` |
| Data | `GET /export/csv`, `GET /export/json`, `POST /import/json`, `DELETE /account` |

## 11. Metrik Keberhasilan

| Metrik | Target awal |
|---|---|
| Waktu rata-rata mencatat transaksi | < 15 detik |
| Pengguna yang mencatat >= 5 transaksi di minggu pertama | >= 50% |
| Retensi minggu ke-4 | >= 30% |
| Pengguna yang memakai minimal satu transaksi berulang atau target | >= 40% |
| Error rate API (5xx) | < 1% |
| Skor Lighthouse mobile (Performance/Accessibility) | >= 85 / >= 95 |

## 12. Rencana Rilis

| Tahap | Cakupan | Hasil yang dapat dites |
|---|---|---|
| 1 | Fondasi proyek, skema MySQL, migrasi, seed | Server berjalan, database terisi |
| 2 | Auth, dompet, kategori, transaksi, transfer | Endpoint dites lewat cURL/Postman |
| 3 | Berulang + penjadwal, target, anggaran, laporan, ekspor/impor | Penjadwal dan perhitungan terbukti benar |
| 4 | Setup frontend, layout responsif, auth UI | Login dan registrasi terhubung ke backend |
| 5 | Semua halaman utama | Alur lengkap dapat dipakai |
| 6 | Polishing, PWA, keamanan, deployment, dokumentasi | Siap dirilis |

## 13. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Transaksi berulang ganda atau terlewat | Saldo salah, kepercayaan hilang | Proses idempoten, `next_run_date`, tes catch-up |
| Perhitungan saldo tidak konsisten (transfer, setoran) | Data salah | Satu sumber kebenaran di service backend, tes unit |
| Kebocoran data antar pengguna | Pelanggaran privasi | Filter `user_id` wajib, tes otorisasi, code review |
| Pencatatan terasa berat di HP | Pengguna berhenti | Form minimal, nominal dan kategori diutamakan, uji usability |
| Pencurian token | Akses ilegal | Access token singkat, refresh token di-hash dan dapat dicabut, cookie `httpOnly` bila memakai cookie |
| Presisi uang | Selisih angka | `DECIMAL`, tidak memakai float |

## 14. Pertanyaan Terbuka

1. Apakah setoran tabungan dihitung sebagai pengeluaran pada laporan atau hanya perpindahan dana? (Usulan: perpindahan dana, bukan pengeluaran.)
2. Penyimpanan token: `httpOnly cookie` (lebih aman terhadap XSS) atau memori + localStorage (lebih sederhana)? (Usulan: refresh token di `httpOnly` cookie.)
3. Perlu fitur lupa password via email di v1.0? (Memerlukan layanan email; saat ini hanya ubah password dari profil.)
4. Perlu laporan PDF atau cukup CSV/JSON?
5. Hosting yang dituju (VPS sendiri, platform PaaS) untuk menentukan konfigurasi Docker dan backup.
