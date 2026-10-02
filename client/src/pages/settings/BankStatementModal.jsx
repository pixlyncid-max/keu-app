import React, { useEffect, useState, useRef } from 'react'
import {
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Loader2,
  Printer,
  Wallet as WalletIcon,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { formatRupiah } from '@/lib/formatters'
import { reportService } from '@/services/reportService'
import { walletService } from '@/services/walletService'

const BULAN_OPTIONS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
]

function formatBankNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0.00'
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function BankStatementModal({ isOpen, onClose, user }) {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedWalletId, setSelectedWalletId] = useState('')
  const [wallets, setWallets] = useState([])
  const [statement, setStatement] = useState(null)
  const [loading, setLoading] = useState(false)
  const printAreaRef = useRef(null)

  // Generate Year range (last 4 years to next year)
  const currentYear = currentDate.getFullYear()
  const yearOptions = [
    currentYear - 3,
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ]

  // Load wallets on open
  useEffect(() => {
    if (isOpen) {
      walletService
        .getWallets()
        .then((res) => {
          const list = Array.isArray(res?.data) ? res.data : []
          setWallets(list)
        })
        .catch(() => {})
    }
  }, [isOpen])

  // Fetch statement data when filters change
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)

    const params = {
      bulan: selectedMonth,
      tahun: selectedYear,
    }
    if (selectedWalletId) {
      params.wallet_id = selectedWalletId
    }

    reportService
      .getBankStatement(params)
      .then((res) => {
        if (isMounted) {
          setStatement(res?.data || null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          toast.error(err.response?.data?.message || 'Gagal mengambil rekening koran')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, selectedMonth, selectedYear, selectedWalletId])

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen) return null

  const bankName = statement?.bank_info?.nama_bank || 'BCA'
  const isBca = bankName.toUpperCase().includes('BCA') || !selectedWalletId

  return (
    <>
      {/* Global Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden !important;
          }
          #rekening-koran-print-area,
          #rekening-koran-print-area * {
            visibility: visible !important;
          }
          #rekening-koran-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-surface-950/70 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-4xl bg-white dark:bg-surface-900 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[95vh] border border-surface-200 dark:border-surface-800 overflow-hidden">
          
          {/* Header Controls (No-Print) */}
          <div className="no-print p-4 sm:p-5 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                    Rekening Koran / Mutasi Rekening
                  </h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Laporan mutasi resmi dengan format rekening koran perbankan
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 rounded-lg hover:bg-surface-200/50 dark:hover:bg-surface-800 transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
              {/* Dompet / Rekening Selector */}
              <div>
                <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                  Pilih Dompet / Rekening
                </label>
                <div className="relative">
                  <select
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-3 pr-8 py-2 rounded-xl bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Semua Rekening (Gabungan)</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nama}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-surface-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Bulan Selector */}
              <div>
                <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                  Bulan
                </label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm pl-3 pr-8 py-2 rounded-xl bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                  >
                    {BULAN_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-surface-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Tahun Selector */}
              <div>
                <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                  Tahun
                </label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm pl-3 pr-8 py-2 rounded-xl bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-surface-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Cetak / Download Action */}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2 px-3 h-[38px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                  onClick={handlePrint}
                  disabled={loading || !statement}
                >
                  <Printer className="w-4 h-4" />
                  Cetak / PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Statement View Body (Scrollable in modal, visible during print) */}
          <div className="p-3 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-100 dark:bg-surface-950 flex justify-center">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-surface-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm font-medium">Menyusun rekening koran resmi...</p>
              </div>
            ) : statement ? (
              <div
                id="rekening-koran-print-area"
                ref={printAreaRef}
                className="w-full max-w-3xl bg-white text-black p-5 sm:p-8 rounded-xl shadow-md border border-gray-200 font-sans leading-tight text-xs sm:text-sm transition-all"
                style={{ minHeight: '800px', color: '#111827' }}
              >
                {/* Header Bank & Document Title */}
                <div className="flex items-start justify-between pb-4">
                  {/* Left: Bank Logo & Branch */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Stylized BCA Logo Emblem */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-[#005EAA] flex items-center justify-center text-white font-black text-sm shadow-sm">
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z" opacity="0" />
                            <circle cx="12" cy="12" r="9" fill="#005EAA" />
                            <path d="M7 8h4.5a3 3 0 0 1 0 4.5A3 3 0 0 1 7 17H7V8zm2.5 3h2a1.5 1.5 0 0 0 0-3h-2v3zm0 4.5h2a1.5 1.5 0 0 0 0-3h-2v3z" fill="#ffffff" />
                            <path d="M15 8h2v9h-2z" fill="#ffffff" />
                          </svg>
                        </div>
                        <span className="text-2xl font-black text-[#005EAA] tracking-tight">
                          {bankName.toUpperCase().includes('BCA') ? 'BCA' : bankName.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-700 tracking-wider">
                      {statement.bank_info?.cabang || 'KCP UTAMA'}
                    </span>
                  </div>

                  {/* Right: Document Type */}
                  <div className="text-right">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-gray-900 uppercase">
                      REKENING TAHAPAN
                    </h1>
                  </div>
                </div>

                {/* Top 2 Side-by-Side Framed Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-2">
                  {/* Left Box: Nasabah / Customer */}
                  <div className="border border-gray-900 rounded-lg p-3 text-[11px] sm:text-xs leading-relaxed font-mono">
                    <p className="font-bold text-gray-900 text-sm">{statement.nasabah?.nama}</p>
                    <p className="text-gray-800">{user?.email || 'NASABAH TERDAFTAR'}</p>
                    <p className="text-gray-800">CIKAMPEK RT 005 RW 003</p>
                    <p className="text-gray-800">PERUM GIYA</p>
                    <p className="text-gray-800">KARAWANG 41311</p>
                    <p className="text-gray-800 font-semibold">INDONESIA</p>
                  </div>

                  {/* Right Box: Account & Period Meta */}
                  <div className="border border-gray-900 rounded-lg p-3 text-[11px] sm:text-xs leading-relaxed font-mono flex flex-col justify-center">
                    <div className="grid grid-cols-12 gap-1 py-0.5">
                      <span className="col-span-5 font-bold text-gray-800">NO. REKENING</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <span className="col-span-6 font-bold text-gray-900 tracking-wider">
                        {statement.nasabah?.no_rekening}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 py-0.5">
                      <span className="col-span-5 font-bold text-gray-800">HALAMAN</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <span className="col-span-6 font-bold text-gray-900">
                        {statement.nasabah?.halaman || '1 / 1'}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 py-0.5">
                      <span className="col-span-5 font-bold text-gray-800">PERIODE</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <span className="col-span-6 font-bold text-gray-900">
                        {statement.nasabah?.periode}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 py-0.5">
                      <span className="col-span-5 font-bold text-gray-800">MATA UANG</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <span className="col-span-6 font-bold text-gray-900">
                        {statement.nasabah?.mata_uang || 'IDR'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Catatan Box */}
                <div className="border border-gray-900 rounded-lg p-2.5 my-2.5 text-[9px] sm:text-[10px] leading-tight text-gray-700 bg-gray-50/50">
                  <p className="font-bold text-gray-900 mb-1">CATATAN:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <p className="flex items-start gap-1">
                      <span>•</span>
                      <span>
                        Apabila nasabah tidak melakukan sanggahan atas Laporan Mutasi Rekening ini
                        sampai dengan akhir bulan berikutnya, nasabah dianggap telah menyetujui
                        segala data yang tercantum pada Laporan Mutasi Rekening ini.
                      </span>
                    </p>
                    <p className="flex items-start gap-1">
                      <span>•</span>
                      <span>
                        Bank berhak setiap saat melakukan koreksi apabila ada kesalahan pada Laporan
                        Mutasi Rekening.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Main Mutation Table */}
                <div className="overflow-x-auto my-3">
                  <table className="w-full border-collapse font-mono text-[10px] sm:text-xs">
                    <thead>
                      <tr className="border-t-2 border-b-2 border-gray-900 font-bold text-gray-900">
                        <th className="py-1.5 px-2 text-left w-16 sm:w-20">TANGGAL</th>
                        <th className="py-1.5 px-2 text-left">KETERANGAN</th>
                        <th className="py-1.5 px-2 text-center w-12 sm:w-16">CBG</th>
                        <th className="py-1.5 px-2 text-right w-28 sm:w-36">MUTASI</th>
                        <th className="py-1.5 px-2 text-right w-28 sm:w-36">SALDO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* Saldo Awal Row */}
                      <tr className="font-semibold text-gray-900">
                        <td className="py-1 px-2 whitespace-nowrap">
                          {String(selectedMonth).padStart(2, '0')}/01
                        </td>
                        <td className="py-1 px-2 font-bold tracking-wider">SALDO AWAL</td>
                        <td className="py-1 px-2 text-center"></td>
                        <td className="py-1 px-2 text-right"></td>
                        <td className="py-1 px-2 text-right font-bold text-gray-950">
                          {formatBankNumber(statement.ringkasan?.saldo_awal)}
                        </td>
                      </tr>

                      {/* Transaction Rows */}
                      {statement.mutasi && statement.mutasi.length > 0 ? (
                        statement.mutasi.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-1 px-2 align-top whitespace-nowrap text-gray-900">
                              {row.tanggal}
                            </td>
                            <td className="py-1 px-2 align-top uppercase text-gray-900 pr-3 break-words font-medium">
                              {row.keterangan}
                            </td>
                            <td className="py-1 px-2 align-top text-center text-gray-700">
                              {row.cbg}
                            </td>
                            <td className="py-1 px-2 align-top text-right whitespace-nowrap text-gray-900 font-semibold">
                              {formatBankNumber(row.nominal)}{' '}
                              <span
                                className={
                                  row.tipe === 'CR'
                                    ? 'text-emerald-700 font-bold'
                                    : 'text-gray-900 font-bold'
                                }
                              >
                                {row.tipe}
                              </span>
                            </td>
                            <td className="py-1 px-2 align-top text-right whitespace-nowrap text-gray-950 font-bold">
                              {formatBankNumber(row.saldo)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-500 italic">
                            --- TIDAK ADA TRANSAKSI PADA PERIODE INI ---
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Table at Bottom */}
                <div className="mt-4 pt-3 border-t-2 border-gray-900 font-mono text-[10px] sm:text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between py-0.5 border-b border-gray-200">
                        <span className="text-gray-700 font-bold">SALDO AWAL :</span>
                        <span className="font-bold text-gray-900">
                          Rp {formatBankNumber(statement.ringkasan?.saldo_awal)}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-gray-200">
                        <span className="text-gray-700 font-bold">
                          TOTAL MUTASI KREDIT (CR) [{statement.ringkasan?.count_cr || 0}] :
                        </span>
                        <span className="font-bold text-emerald-700">
                          Rp {formatBankNumber(statement.ringkasan?.total_cr)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between py-0.5 border-b border-gray-200">
                        <span className="text-gray-700 font-bold">
                          TOTAL MUTASI DEBET (DB) [{statement.ringkasan?.count_db || 0}] :
                        </span>
                        <span className="font-bold text-rose-700">
                          Rp {formatBankNumber(statement.ringkasan?.total_db)}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b-2 border-gray-900 bg-gray-50 px-1 rounded">
                        <span className="text-gray-900 font-black">SALDO AKHIR :</span>
                        <span className="font-black text-gray-950 text-xs sm:text-sm">
                          Rp {formatBankNumber(statement.ringkasan?.saldo_akhir)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Official statement notice */}
                  <div className="mt-4 text-center text-[9px] text-gray-500 italic">
                    Bersambung ke Halaman berikut
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Modal Footer (No-Print) */}
          <div className="no-print p-3 sm:p-4 border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-center justify-between">
            <p className="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">
              Tip: Tekan Cetak / PDF untuk mencetak langsung ke printer atau simpan sebagai dokumen PDF resmi.
            </p>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={onClose}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={handlePrint}
                disabled={loading || !statement}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Cetak / PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
