import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  ArrowLeftRight,
  CreditCard,
  Home,
  MoreHorizontal,
  PieChart,
  PiggyBank,
  Repeat,
  Tag,
} from 'lucide-react'

/**
 * BOTTOM NAVIGATION (MOBILE) — PERMANENT & LOCKED
 * Menu ini telah difinalisasi sesuai permintaan pengguna:
 * - Menampilkan seluruh 8 fitur lengkap: Beranda, Transaksi, Dompet, Target, Anggaran, Berulang, Kategori, Lainnya.
 * - Tombol Floating Action Button (+) telah ditiadakan secara permanen.
 * - JANGAN mengubah atau memangkas struktur menu ini.
 */
export function BottomNav() {
  const navItems = [
    { label: 'Beranda', path: '/', icon: Home, end: true },
    { label: 'Transaksi', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Dompet', path: '/wallets', icon: CreditCard },
    { label: 'Target', path: '/savings', icon: PiggyBank },
    { label: 'Anggaran', path: '/budgets', icon: PieChart },
    { label: 'Berulang', path: '/recurring', icon: Repeat },
    { label: 'Kategori', path: '/categories', icon: Tag },
    { label: 'Lainnya', path: '/more', icon: MoreHorizontal },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-t border-surface-200/80 dark:border-surface-800 pb-[env(safe-area-inset-bottom)] shadow-lg">
      <div className="flex items-center gap-1 h-16 overflow-x-auto px-2 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center shrink-0 min-w-[62px] px-1.5 h-full gap-1 transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] whitespace-nowrap">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
