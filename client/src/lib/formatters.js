/**
 * Utility functions untuk format mata uang, tanggal, dan angka.
 * Sesuai spesifikasi: Rupiah, bahasa Indonesia, zona waktu Asia/Makassar.
 */

// =====================================================================
// FORMAT MATA UANG (Rupiah)
// =====================================================================

/**
 * Format angka ke format Rupiah Indonesia.
 * Contoh: 1500000 → "Rp 1.500.000"
 */
export function formatRupiah(nominal, options = {}) {
  const { showSymbol = true, compact = false } = options

  if (nominal === null || nominal === undefined || isNaN(nominal)) {
    return showSymbol ? 'Rp 0' : '0'
  }

  const num = parseFloat(nominal)

  if (compact && Math.abs(num) >= 1_000_000) {
    const juta = num / 1_000_000
    return `${showSymbol ? 'Rp ' : ''}${juta.toFixed(juta % 1 === 0 ? 0 : 1)} jt`
  }

  return new Intl.NumberFormat('id-ID', {
    style:    showSymbol ? 'currency' : 'decimal',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format input angka saat mengetik (tambahkan titik ribuan).
 * Contoh: "1500000" → "1.500.000"
 */
export function formatInputRupiah(value) {
  if (!value) return ''
  // Hapus semua karakter non-digit
  const angka = String(value).replace(/\D/g, '')
  if (!angka) return ''
  return new Intl.NumberFormat('id-ID').format(parseInt(angka, 10))
}

/**
 * Parse string format Rupiah kembali ke number.
 * Contoh: "1.500.000" → 1500000
 */
export function parseRupiah(value) {
  if (!value) return 0
  const cleaned = String(value).replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

// =====================================================================
// FORMAT TANGGAL
// =====================================================================

const LOCALE = 'id-ID'
const TIMEZONE = 'Asia/Makassar'

/**
 * Format tanggal ke format Indonesia panjang.
 * Contoh: "2026-10-02" → "2 Oktober 2026"
 */
export function formatTanggalPanjang(tanggal) {
  if (!tanggal) return '-'
  return new Intl.DateTimeFormat(LOCALE, {
    day:      'numeric',
    month:    'long',
    year:     'numeric',
    timeZone: TIMEZONE,
  }).format(new Date(tanggal))
}

/**
 * Format tanggal ke format pendek.
 * Contoh: "2026-10-02" → "2 Okt 2026"
 */
export function formatTanggalPendek(tanggal) {
  if (!tanggal) return '-'
  return new Intl.DateTimeFormat(LOCALE, {
    day:      'numeric',
    month:    'short',
    year:     'numeric',
    timeZone: TIMEZONE,
  }).format(new Date(tanggal))
}

/**
 * Format tanggal ke format hari ini / kemarin / tanggal.
 * Contoh: Hari ini, Kemarin, atau "2 Oktober 2026"
 */
export function formatTanggalRelatif(tanggal) {
  if (!tanggal) return '-'

  const date    = new Date(tanggal)
  const today   = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  // Bandingkan hanya tanggal (tanpa waktu)
  const dateStr      = date.toDateString()
  const todayStr     = today.toDateString()
  const yesterdayStr = yesterday.toDateString()

  if (dateStr === todayStr) return 'Hari ini'
  if (dateStr === yesterdayStr) return 'Kemarin'

  return formatTanggalPanjang(tanggal)
}

/**
 * Format ke nama bulan dan tahun.
 * Contoh: "2026-10" → "Oktober 2026"
 */
export function formatBulanTahun(tanggal) {
  if (!tanggal) return '-'
  return new Intl.DateTimeFormat(LOCALE, {
    month:    'long',
    year:     'numeric',
    timeZone: TIMEZONE,
  }).format(new Date(tanggal))
}

/**
 * Dapatkan tanggal hari ini dalam format YYYY-MM-DD.
 */
export function getTodayString() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: TIMEZONE })
}

/**
 * Dapatkan bulan ini dalam format YYYY-MM.
 */
export function getBulanIniString() {
  return getTodayString().substring(0, 7)
}

// =====================================================================
// FORMAT PERSENTASE
// =====================================================================
export function formatPersentase(nilai, desimal = 1) {
  if (isNaN(nilai)) return '0%'
  return `${parseFloat(nilai).toFixed(desimal)}%`
}

// =====================================================================
// WARNA BERDASARKAN NOMINAL (positif/negatif)
// =====================================================================
export function getWarnaNominal(nominal) {
  return parseFloat(nominal) >= 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-500 dark:text-red-400'
}

/**
 * Singkat nama: "Budi Santoso" → "BS"
 */
export function getInisial(nama) {
  if (!nama) return '?'
  return nama
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}
