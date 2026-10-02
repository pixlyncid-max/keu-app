import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  PiggyBank,
  PieChart as PieIcon,
  Plus,
  Repeat,
  Tag,
  Wallet,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { useCategoriesReport, useMonthlyTrend, useReportSummary } from '@/hooks/useReports'
import { useTransactions } from '@/hooks/useTransactions'
import { formatRupiah, formatTanggalPendek, getBulanIniString } from '@/lib/formatters'

export function DashboardPage() {
  const { user } = useAuth()
  const [periode, setPeriode] = useState('bulan_ini')

  // Parameter tanggal berdasarkan filter periode
  const getPeriodParams = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    switch (periode) {
      case 'bulan_ini':
        return {
          tanggal_mulai: `${year}-${month}-01`,
          tanggal_selesai: new Date(year, now.getMonth() + 1, 0).toISOString().split('T')[0],
        }
      case 'bulan_lalu': {
        const lastMonthDate = new Date(year, now.getMonth() - 1, 1)
        const lmYear = lastMonthDate.getFullYear()
        const lmMonth = String(lastMonthDate.getMonth() + 1).padStart(2, '0')
        return {
          tanggal_mulai: `${lmYear}-${lmMonth}-01`,
          tanggal_selesai: new Date(lmYear, lastMonthDate.getMonth() + 1, 0).toISOString().split('T')[0],
        }
      }
      case 'tahun_ini':
        return {
          tanggal_mulai: `${year}-01-01`,
          tanggal_selesai: `${year}-12-31`,
        }
      case 'semua':
      default:
        return {}
    }
  }

  const periodParams = getPeriodParams()

  // Queries dengan TanStack Query
  const { data: summaryRes, isLoading: loadingSummary } = useReportSummary(periodParams)
  const { data: catReportRes, isLoading: loadingCatReport } = useCategoriesReport(periodParams)
  const { data: trendRes, isLoading: loadingTrend } = useMonthlyTrend(6)
  const { data: recentTransRes, isLoading: loadingTrans } = useTransactions({ per_page: 5 })

  const summary = summaryRes?.data
  const catReport = Array.isArray(catReportRes?.data?.data) ? catReportRes.data.data : []
  const trendData = Array.isArray(trendRes?.data) ? trendRes.data : []
  const recentTransactions = Array.isArray(recentTransRes?.data) ? recentTransRes.data : []

  // Palet warna untuk Donut Chart
  const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316']

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Header & Filter Periode */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
            Halo, {user?.nama}! 👋
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Berikut ringkasan kesehatan keuangan Anda
          </p>
        </div>

        {/* Filter Periode Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'bulan_ini', label: 'Bulan Ini' },
            { id: 'bulan_lalu', label: 'Bulan Lalu' },
            { id: 'tahun_ini', label: 'Tahun Ini' },
            { id: 'semua', label: 'Semua' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriode(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                periode === p.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Cards — Langsung terlihat di Mobile tanpa slide */}
      {loadingSummary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-3.5 sm:p-5 space-y-2 sm:space-y-3">
              <Skeleton className="h-4 w-20 sm:w-24" />
              <Skeleton className="h-6 sm:h-8 w-28 sm:w-36" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Total Saldo Dompet */}
          <Card className="p-3.5 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-medium text-surface-500 dark:text-surface-400">Total Saldo</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-2xl font-bold text-surface-900 dark:text-surface-100 truncate">
                {formatRupiah(summary?.total_saldo_dompet ?? 0)}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-surface-400 mt-0.5 truncate">Seluruh dompet aktif</p>
            </div>
          </Card>

          {/* Total Pemasukan */}
          <Card className="p-3.5 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-medium text-surface-500 dark:text-surface-400">Pemasukan</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-success-50 dark:bg-success-950/60 text-success-600 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-2xl font-bold text-success-600 dark:text-success-400 truncate">
                {formatRupiah(summary?.total_pemasukan ?? 0)}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-surface-400 mt-0.5 truncate">Total pemasukan</p>
            </div>
          </Card>

          {/* Total Pengeluaran */}
          <Card className="p-3.5 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-medium text-surface-500 dark:text-surface-400">Pengeluaran</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-danger-50 dark:bg-danger-950/60 text-danger-500 flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-2xl font-bold text-danger-500 dark:text-danger-400 truncate">
                {formatRupiah(summary?.total_pengeluaran ?? 0)}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-surface-400 mt-0.5 truncate">Total pengeluaran</p>
            </div>
          </Card>

          {/* Sisa Uang / Net Cashflow */}
          <Card className="p-3.5 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-medium text-surface-500 dark:text-surface-400">Arus Kas Bersih</span>
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                  (summary?.net_cashflow ?? 0) >= 0
                    ? 'bg-success-50 dark:bg-success-950/60 text-success-600'
                    : 'bg-danger-50 dark:bg-danger-950/60 text-danger-500'
                }`}
              >
                {(summary?.net_cashflow ?? 0) >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
            </div>
            <div>
              <h3
                className={`text-base sm:text-2xl font-bold truncate ${
                  (summary?.net_cashflow ?? 0) >= 0
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-danger-500 dark:text-danger-400'
                }`}
              >
                {formatRupiah(summary?.net_cashflow ?? 0)}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-surface-400 mt-0.5 truncate">Pemasukan - pengeluaran</p>
            </div>
          </Card>
        </div>
      )}

      {/* Akses Cepat Menu Fitur Lengkap di Beranda */}
      <div className="space-y-2">
        <h3 className="text-xs sm:text-sm font-bold text-surface-700 dark:text-surface-300">
          Fitur Keuangan
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          <Link
            to="/transactions"
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700/80 hover:border-primary-400 transition-all text-center group shadow-2xs"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-surface-800 dark:text-surface-200">Transaksi</span>
          </Link>

          <Link
            to="/wallets"
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700/80 hover:border-primary-400 transition-all text-center group shadow-2xs"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-surface-800 dark:text-surface-200">Dompet</span>
          </Link>

          <Link
            to="/savings"
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700/80 hover:border-primary-400 transition-all text-center group shadow-2xs"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-surface-800 dark:text-surface-200">Target</span>
          </Link>

          <Link
            to="/budgets"
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700/80 hover:border-primary-400 transition-all text-center group shadow-2xs"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <PieIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-surface-800 dark:text-surface-200">Anggaran</span>
          </Link>

          <Link
            to="/recurring"
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700/80 hover:border-primary-400 transition-all text-center group shadow-2xs"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-surface-800 dark:text-surface-200">Berulang</span>
          </Link>

          <Link
            to="/categories"
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700/80 hover:border-primary-400 transition-all text-center group shadow-2xs"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-surface-800 dark:text-surface-200">Kategori</span>
          </Link>
        </div>
      </div>

      {/* Analytics Charts Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart — Pengeluaran Per Kategori */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
                Pengeluaran per Kategori
              </h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">Distribusi pengeluaran periode ini</p>
            </div>
            <PieIcon className="w-5 h-5 text-primary-500" />
          </div>

          {loadingCatReport ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="w-48 h-48 rounded-full" />
            </div>
          ) : catReport.length === 0 ? (
            <EmptyState
              title="Belum Ada Pengeluaran"
              description="Tidak ada data transaksi pengeluaran pada periode ini."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catReport}
                    dataKey="total"
                    nameKey="nama"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {catReport.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.warna || CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatRupiah(val)}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Bar Chart — Pemasukan vs Pengeluaran Bulanan */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
                Tren Pemasukan vs Pengeluaran
              </h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">Perbandingan 6 bulan terakhir</p>
            </div>
            <Calendar className="w-5 h-5 text-primary-500" />
          </div>

          {loadingTrend ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="w-full h-48" />
            </div>
          ) : trendData.length === 0 ? (
            <EmptyState title="Belum Ada Tren" description="Data riwayat bulanan belum mencukupi." />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 1000000}M`} />
                  <Tooltip
                    formatter={(val) => formatRupiah(val)}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="total_pemasukan" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_pengeluaran" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* 5 Transaksi Terakhir Section */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
            Transaksi Terakhir
          </h3>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Lihat Semua →
          </Link>
        </div>

        {loadingTrans ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <EmptyState
            title="Belum Ada Transaksi"
            description="Mulai mencatat transaksi pertama Anda sekarang."
          />
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {recentTransactions.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      t.tipe === 'pemasukan'
                        ? 'bg-success-50 text-success-600 dark:bg-success-950/40'
                        : 'bg-danger-50 text-danger-500 dark:bg-danger-950/40'
                    }`}
                  >
                    {t.tipe === 'pemasukan' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                      {t.catatan || t.category?.nama || 'Transaksi'}
                    </p>
                    <p className="text-xs text-surface-400">
                      {t.wallet?.nama ?? 'Dompet'} • {formatTanggalPendek(t.tanggal)}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-sm font-bold ${
                    t.tipe === 'pemasukan' ? 'text-success-600 dark:text-success-400' : 'text-danger-500 dark:text-danger-400'
                  }`}
                >
                  {t.tipe === 'pemasukan' ? '+' : '-'} {formatRupiah(t.jumlah ?? t.nominal ?? 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
