import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronDown,
  FileText,
  Loader2,
  Printer,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
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

/**
 * Komponen dokumen rekening koran sesuai format resmi Bank BCA (Rekening Tahapan).
 * Digunakan baik untuk tampilan preview di modal maupun saat dicetak/diekspor ke PDF.
 */
function StatementDocument({ statement, user, selectedMonth }) {
  if (!statement) return null

  const bankName = statement?.bank_info?.nama_bank || 'BCA'

  return (
    <div className="w-full bg-white text-black p-4 sm:p-6 font-sans leading-tight text-xs sm:text-sm">
      {/* Header Bank & Document Title */}
      <div className="flex items-start justify-between pb-3">
        {/* Left: Bank Logo & Branch */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            {/* Keu-Ku Brand Logo Emblem & Text */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#005EAA] flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
                <span className="font-black text-base">K</span>
              </div>
              <span className="text-2xl font-black text-[#005EAA] tracking-tight">
                Keu-Ku
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-gray-700 tracking-wider">
            KCP SAMARINDA UTAMA
          </span>
        </div>

        {/* Right: Document Type */}
        <div className="text-right">
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-gray-900 uppercase">
            REKENING TAHAPAN
          </h1>
        </div>
      </div>

      {/* Top 2 Side-by-Side Framed Boxes */}
      <div className="grid grid-cols-2 gap-3 my-2">
        {/* Left Box: Nasabah / Customer */}
        <div className="border border-black rounded-lg p-3 text-[11px] leading-relaxed font-mono">
          <p className="font-bold text-black text-xs uppercase">{statement.nasabah?.nama}</p>
          <p className="text-gray-800">{user?.email || 'NASABAH TERDAFTAR'}</p>
          <p className="text-gray-800">Delima Dalam</p>
          <p className="text-gray-800">Samarinda</p>
          <p className="text-gray-800">Kalimantan Timur</p>
          <p className="text-gray-800 font-bold">INDONESIA</p>
        </div>

        {/* Right Box: Account & Period Meta */}
        <div className="border border-black rounded-lg p-3 text-[11px] leading-relaxed font-mono flex flex-col justify-center">
          <div className="grid grid-cols-12 gap-1 py-0.5">
            <span className="col-span-5 font-bold text-gray-800">NO. REKENING</span>
            <span className="col-span-1 text-center font-bold">:</span>
            <span className="col-span-6 font-bold text-black tracking-wider">
              {statement.nasabah?.no_rekening}
            </span>
          </div>
          <div className="grid grid-cols-12 gap-1 py-0.5">
            <span className="col-span-5 font-bold text-gray-800">HALAMAN</span>
            <span className="col-span-1 text-center font-bold">:</span>
            <span className="col-span-6 font-bold text-black">
              {statement.nasabah?.halaman || '1 / 1'}
            </span>
          </div>
          <div className="grid grid-cols-12 gap-1 py-0.5">
            <span className="col-span-5 font-bold text-gray-800">PERIODE</span>
            <span className="col-span-1 text-center font-bold">:</span>
            <span className="col-span-6 font-bold text-black">
              {statement.nasabah?.periode}
            </span>
          </div>
          <div className="grid grid-cols-12 gap-1 py-0.5">
            <span className="col-span-5 font-bold text-gray-800">MATA UANG</span>
            <span className="col-span-1 text-center font-bold">:</span>
            <span className="col-span-6 font-bold text-black">
              {statement.nasabah?.mata_uang || 'IDR'}
            </span>
          </div>
        </div>
      </div>

      {/* Catatan Box */}
      <div className="border border-black rounded-lg p-2.5 my-2 text-[9px] sm:text-[10px] leading-tight text-gray-800 bg-gray-50/50">
        <p className="font-bold text-black mb-1">CATATAN:</p>
        <div className="grid grid-cols-2 gap-3">
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
              Keu-Ku berhak setiap saat melakukan koreksi apabila ada kesalahan pada Laporan
              Mutasi Rekening.
            </span>
          </p>
        </div>
      </div>

      {/* Main Mutation Table */}
      <div className="w-full my-3">
        <table className="w-full border-collapse font-mono text-[10px] sm:text-xs">
          <thead>
            <tr className="border-t-2 border-b-2 border-black font-bold text-black">
              <th className="py-1.5 px-2 text-left w-16">TANGGAL</th>
              <th className="py-1.5 px-2 text-left">KETERANGAN</th>
              <th className="py-1.5 px-2 text-center w-12">CBG</th>
              <th className="py-1.5 px-2 text-right w-28 sm:w-36">MUTASI</th>
              <th className="py-1.5 px-2 text-right w-28 sm:w-36">SALDO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Saldo Awal Row */}
            <tr className="font-semibold text-black">
              <td className="py-1 px-2 whitespace-nowrap">
                {String(selectedMonth).padStart(2, '0')}/01
              </td>
              <td className="py-1 px-2 font-bold tracking-wider">SALDO AWAL</td>
              <td className="py-1 px-2 text-center"></td>
              <td className="py-1 px-2 text-right"></td>
              <td className="py-1 px-2 text-right font-bold text-black">
                {formatBankNumber(statement.ringkasan?.saldo_awal)}
              </td>
            </tr>

            {/* Transaction Rows */}
            {statement.mutasi && statement.mutasi.length > 0 ? (
              statement.mutasi.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-1 px-2 align-top whitespace-nowrap text-black">
                    {row.tanggal}
                  </td>
                  <td className="py-1 px-2 align-top uppercase text-black pr-3 break-words font-medium">
                    {row.keterangan}
                  </td>
                  <td className="py-1 px-2 align-top text-center text-gray-700">
                    {row.cbg}
                  </td>
                  <td className="py-1 px-2 align-top text-right whitespace-nowrap text-black font-semibold">
                    {formatBankNumber(row.nominal)}{' '}
                    <span className="text-black font-bold">
                      {row.tipe}
                    </span>
                  </td>
                  <td className="py-1 px-2 align-top text-right whitespace-nowrap text-black font-bold">
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
      <div className="mt-4 pt-3 border-t-2 border-black font-mono text-[10px] sm:text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between py-0.5 border-b border-gray-200">
              <span className="text-gray-700 font-bold">SALDO AWAL :</span>
              <span className="font-bold text-black">
                Rp {formatBankNumber(statement.ringkasan?.saldo_awal)}
              </span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-gray-200">
              <span className="text-gray-700 font-bold">
                TOTAL MUTASI KREDIT (CR) [{statement.ringkasan?.count_cr || 0}] :
              </span>
              <span className="font-bold text-black">
                Rp {formatBankNumber(statement.ringkasan?.total_cr)}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between py-0.5 border-b border-gray-200">
              <span className="text-gray-700 font-bold">
                TOTAL MUTASI DEBET (DB) [{statement.ringkasan?.count_db || 0}] :
              </span>
              <span className="font-bold text-black">
                Rp {formatBankNumber(statement.ringkasan?.total_db)}
              </span>
            </div>
            <div className="flex justify-between py-0.5 border-b-2 border-black bg-gray-50 px-1 rounded">
              <span className="text-black font-black">SALDO AKHIR :</span>
              <span className="font-black text-black text-xs sm:text-sm">
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
  )
}

export function BankStatementModal({ isOpen, onClose, user }) {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedWalletId, setSelectedWalletId] = useState('')
  const [wallets, setWallets] = useState([])
  const [statement, setStatement] = useState(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <>
      {/* Global Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 8mm 8mm 8mm;
          }
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Sembunyikan seluruh tampilan aplikasi dan modal */
          #root,
          .no-print {
            display: none !important;
          }
          /* Tampilkan hanya dokumen print portal */
          #rekening-koran-portal-print {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
        @media screen {
          #rekening-koran-portal-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Portal cetak langsung ke document.body (bebas dari pembungkus fixed / modal / overflow) */}
      {typeof document !== 'undefined' &&
        statement &&
        createPortal(
          <div id="rekening-koran-portal-print">
            <StatementDocument
              statement={statement}
              user={user}
              selectedMonth={selectedMonth}
            />
          </div>,
          document.body
        )}

      {/* Modal Dialog untuk Preview di Layar */}
      <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-surface-950/70 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-4xl bg-white dark:bg-surface-900 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[95vh] border border-surface-200 dark:border-surface-800 overflow-hidden">
          
          {/* Header Controls */}
          <div className="p-4 sm:p-5 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex flex-col gap-4">
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

          {/* Statement View Body (Scrollable in modal preview) */}
          <div className="p-3 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-100 dark:bg-surface-950 flex justify-center">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-surface-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm font-medium">Menyusun rekening koran resmi...</p>
              </div>
            ) : statement ? (
              <div className="w-full max-w-3xl bg-white text-black p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
                <StatementDocument
                  statement={statement}
                  user={user}
                  selectedMonth={selectedMonth}
                />
              </div>
            ) : null}
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:p-4 border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-center justify-between">
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
