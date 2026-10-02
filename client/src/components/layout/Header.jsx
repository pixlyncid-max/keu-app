import React from 'react'
import { Moon, Sun, Wallet } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getInisial } from '../../lib/formatters'

export function Header({ title = 'Keuangan' }) {
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200/80 dark:border-surface-800 px-3.5 sm:px-6 py-2 sm:py-2.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand & Mobile Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm shadow-primary-500/20">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-bold text-surface-900 dark:text-surface-100 leading-tight">
              {title}
            </h1>
            {user && (
              <p className="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">
                Halo, {user.nama}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-surface-600" />}
          </button>

          {/* User Profile Avatar */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-surface-200 dark:border-surface-800">
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-300 font-bold text-xs flex items-center justify-center ring-2 ring-primary-500/20">
                {getInisial(user.nama)}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
