import React from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({
  icon: Icon = FolderOpen,
  title = 'Belum Ada Data',
  description = 'Data belum tersedia untuk saat ini.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/30">
      <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">{title}</h4>
      <p className="text-xs text-surface-500 dark:text-surface-400 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
