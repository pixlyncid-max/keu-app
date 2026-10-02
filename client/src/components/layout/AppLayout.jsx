import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const location = useLocation()

  // Judul dinamis berdasarkan rute
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Beranda'
      case '/transactions':
        return 'Riwayat Transaksi'
      case '/wallets':
        return 'Kelola Dompet'
      case '/savings':
        return 'Target Tabungan'
      case '/budgets':
        return 'Anggaran Bulanan'
      case '/recurring':
        return 'Transaksi Berulang'
      case '/categories':
        return 'Kelola Kategori'
      case '/more':

        return 'Lainnya & Pengaturan'
      default:
        return 'Keuangan'
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex flex-col lg:flex-row antialiased transition-colors duration-200">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-6">
        {/* Header Compact */}
        <Header title={getPageTitle()} />

        {/* Dynamic Page Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation Bar (Mobile) */}
      <BottomNav />
    </div>
  )
}
