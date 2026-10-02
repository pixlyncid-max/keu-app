import React from 'react'
import { clsx } from 'clsx'

export function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-200',
        onClick && 'cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
