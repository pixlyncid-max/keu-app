import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', className = '' }) {
  // Kunci scroll body saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog / Bottom Sheet Container */}
      <div
        className={clsx(
          'relative w-full bg-white dark:bg-surface-900 rounded-t-3xl sm:rounded-2xl shadow-xl z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] transform transition-transform duration-300 animate-slide-up sm:animate-fade-in border-t sm:border border-surface-200 dark:border-surface-800',
          maxWidth,
          className
        )}
      >
        {/* Drag handle untuk mobile bottom sheet */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-surface-300 dark:bg-surface-700 rounded-full" />
        </div>

        {/* Header Modal */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Area dengan Auto Scroll */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  )
}
