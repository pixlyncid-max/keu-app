import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  ArrowLeftRight,
  CreditCard,
  Home,
  LogOut,
  Moon,
  MoreHorizontal,
  PiggyBank,
  PieChart,
  Repeat,
  Sun,
  Tag,
  Wallet,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getInisial } from '../../lib/formatters'

export function Sidebar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const navItems = [
    { label: 'Beranda', path: '/', icon: Home },
    { label: 'Transaksi', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Dompet', path: '/wallets', icon: CreditCard },
    { label: 'Target Tabungan', path: '/savings', icon: PiggyBank },
    { label: 'Anggaran', path: '/budgets', icon: PieChart },
    { label: 'Transaksi Berulang', path: '/recurring', icon: Repeat },
    { label: 'Kategori', path: '/categories', icon: Tag },
    { label: 'Lainnya', path: '/more', icon: MoreHorizontal },
  ]


  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-surface-200/80 dark:border-surface-800 bg-white dark:bg-surface-900 h-screen sticky top-0 z-40 p-4">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">Keuangan App</h2>
          <span className="text-xs text-surface-500 dark:text-surface-400">Pengelola Keuangan</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer Profile & Controls */}
      <div className="pt-4 mt-auto border-t border-surface-200/80 dark:border-surface-800 space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
          </span>
          <span className="text-xs text-surface-400 uppercase font-mono">{isDark ? 'Dark' : 'Light'}</span>
        </button>

        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {getInisial(user.nama)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-surface-900 dark:text-surface-100 truncate">
                  {user.nama}
                </p>
                <p className="text-[10px] text-surface-500 dark:text-surface-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-surface-400 hover:text-danger-500 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
