import React from 'react'
import { clsx } from 'clsx'

export function Skeleton({ className = '', variant = 'text', ...props }) {
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }

  return (
    <div
      className={clsx(
        'bg-surface-200 dark:bg-surface-800 animate-pulse',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
