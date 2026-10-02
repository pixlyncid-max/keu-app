import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-surface-900 dark:text-surface-100 mb-2">404</h1>
      <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-6">
        Halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak tersedia.
      </p>
      <Link to="/">
        <Button size="md">Kembali ke Beranda</Button>
      </Link>
    </div>
  )
}
