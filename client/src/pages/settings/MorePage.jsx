import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertOctagon,
  ChevronRight,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  KeyRound,
  LogOut,
  Moon,
  PieChart,
  Repeat,
  Shield,
  Sun,
  Tag,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { getInisial } from '@/lib/formatters'
import { authService } from '@/services/authService'
import { dataService } from '@/services/dataService'
import { BankStatementModal } from './BankStatementModal'

export function MorePage() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const fileInputRef = useRef(null)

  // Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)
  const [isBankStatementModalOpen, setIsBankStatementModalOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Password Change Form State
  const [passwordLama, setPasswordLama] = useState('')
  const [passwordBaru, setPasswordBaru] = useState('')
  const [passwordBaruConfirmation, setPasswordBaruConfirmation] = useState('')
  const [loadingPassword, setLoadingPassword] = useState(false)

  // Import JSON Form State
  const [selectedFile, setSelectedFile] = useState(null)
  const [modeOverwrite, setModeOverwrite] = useState(false)
  const [loadingImport, setLoadingImport] = useState(false)

  // Delete Account Form State
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('')
  const [loadingDeleteAccount, setLoadingDeleteAccount] = useState(false)

  // Handle Submit Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordBaru !== passwordBaruConfirmation) {
      toast.error('Konfirmasi password baru tidak sesuai')
      return
    }

    setLoadingPassword(true)
    try {
      await authService.changePassword({
        password_lama: passwordLama,
        password_baru: passwordBaru,
        password_baru_confirmation: passwordBaruConfirmation,
      })
      toast.success('Password berhasil diubah. Silakan login ulang.')
      setIsPasswordModalOpen(false)
      setTimeout(() => logout(), 1000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password')
    } finally {
      setLoadingPassword(false)
    }
  }

  // Handle Export CSV
  const handleExportCsv = async () => {
    try {
      const blob = await dataService.exportCsv()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transaksi_backup_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('File CSV berhasil diunduh')
    } catch {
      toast.error('Gagal mengekspor data CSV')
    }
  }

  // Handle Export Backup JSON
  const handleExportJson = async () => {
    try {
      const blob = await dataService.exportJson()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `backup_keuangan_${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('File backup JSON berhasil diunduh')
    } catch {
      toast.error('Gagal mengekspor backup JSON')
    }
  }

  // Handle Submit Import JSON
  const handleImportJson = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Pilih file JSON backup terlebih dahulu')
      return
    }

    setLoadingImport(true)
    try {
      const res = await dataService.importJson(selectedFile, modeOverwrite)
      toast.success(res.message || 'Impor data berhasil diproses!')
      setIsImportModalOpen(false)
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengimpor file backup')
    } finally {
      setLoadingImport(false)
    }
  }

  // Handle Submit Delete Account
  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    if (!deleteConfirmPassword) return

    setLoadingDeleteAccount(true)
    try {
      await authService.deleteAccount(deleteConfirmPassword)
      toast.success('Akun Anda berhasil dihapus permanen.')
      setIsDeleteAccountModalOpen(false)
      logout()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password konfirmasi tidak sesuai')
    } finally {
      setLoadingDeleteAccount(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10 animate-fade-in">
      {/* Profile Header Card */}
      {user && (
        <Card className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            {getInisial(user.nama)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">{user.nama}</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">{user.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
              Zona Waktu: {user.timezone || 'Asia/Makassar'}
            </span>
          </div>
        </Card>
      )}

      {/* Navigation Quick Links Section */}
      <Card className="divide-y divide-surface-100 dark:divide-surface-800 p-0 overflow-hidden">
        <div className="p-3 bg-surface-50 dark:bg-surface-800/50">
          <span className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
            Fitur Keuangan
          </span>
        </div>

        <Link
          to="/budgets"
          className="p-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-surface-900 dark:text-surface-100">Anggaran Bulanan</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Atur batas pengeluaran per kategori</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-surface-400" />
        </Link>

        <Link
          to="/recurring"
          className="p-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-surface-900 dark:text-surface-100">Transaksi Berulang</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Kelola tagihan & gaji otomatis</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-surface-400" />
        </Link>

        <Link
          to="/categories"
          className="p-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-surface-900 dark:text-surface-100">Kelola Kategori</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Atur kategori pengeluaran & pemasukan</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-surface-400" />
        </Link>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Tampilan & Mode Gelap */}
        <Card className="divide-y divide-surface-100 dark:divide-surface-800 p-0 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">Mode Tampilan</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  {isDark ? 'Mode Gelap (Dark)' : 'Mode Terang (Light)'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Ubah Tema
            </Button>
          </div>

          {/* Ubah Password */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">Keamanan Password</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Ubah password akun Anda</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
              Ubah Password
            </Button>
          </div>
        </Card>

        {/* Ekspor & Impor Data */}
        <Card className="divide-y divide-surface-100 dark:divide-surface-800 p-0 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">Rekening Koran / Mutasi Bank</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Pilih bulan & tahun, format cetak resmi Bank BCA</p>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={FileText} onClick={() => setIsBankStatementModalOpen(true)}>
              Rekening Koran
            </Button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">Ekspor Excel / Spreadsheet</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Unduh riwayat ke Microsoft Excel / Google Sheets</p>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={Download} onClick={handleExportCsv}>
              Unduh Excel/CSV
            </Button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">Backup Seluruh Data (JSON)</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Simpan salinan data lengkap Anda</p>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={Download} onClick={handleExportJson}>
              Backup JSON
            </Button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">Impor Restore Data (JSON)</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Pulihkan data dari file JSON backup</p>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={Upload} onClick={() => setIsImportModalOpen(true)}>
              Impor JSON
            </Button>
          </div>
        </Card>

        {/* Bahaya & Hapus Akun */}
        <Card className="p-4 flex items-center justify-between border-danger-200 dark:border-danger-900/50 bg-danger-50/30 dark:bg-danger-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-100 dark:bg-danger-950/60 text-danger-600 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-danger-600 dark:text-danger-400">Hapus Akun Permanen</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Hapus seluruh data Anda secara permanen</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setIsDeleteAccountModalOpen(true)}>
            Hapus Akun
          </Button>
        </Card>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <Button
          variant="outline"
          fullWidth
          size="lg"
          icon={LogOut}
          onClick={() => setShowLogoutConfirm(true)}
        >
          Keluar dari Akun
        </Button>
      </div>

      {/* Modal Ubah Password */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Ubah Password Akun"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Password Saat Ini"
            type="password"
            placeholder="••••••••"
            value={passwordLama}
            onChange={(e) => setPasswordLama(e.target.value)}
            required
          />
          <Input
            label="Password Baru"
            type="password"
            placeholder="Minimal 8 karakter"
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            required
          />
          <Input
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ulangi password baru"
            value={passwordBaruConfirmation}
            onChange={(e) => setPasswordBaruConfirmation(e.target.value)}
            required
          />

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsPasswordModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={loadingPassword}>
              Simpan Password Baru
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Impor Backup JSON */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Impor Data dari Backup JSON"
      >
        <form onSubmit={handleImportJson} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5 block">
              Pilih File Backup (.json)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              className="w-full text-xs text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 cursor-pointer"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="modeOverwrite"
              checked={modeOverwrite}
              onChange={(e) => setModeOverwrite(e.target.checked)}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-surface-300"
            />
            <label htmlFor="modeOverwrite" className="text-xs text-surface-600 dark:text-surface-400">
              Timpa seluruh data lama saya (Mode Overwrite)
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsImportModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={loadingImport}>
              Mulai Impor Data
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus Akun */}
      <Modal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        title="Konfirmasi Hapus Akun"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-xs text-danger-600 dark:text-danger-400 font-medium bg-danger-50 dark:bg-danger-950/40 p-3 rounded-xl">
            Peringatan: Seluruh data Anda (dompet, transaksi, target tabungan, anggaran) akan dihapus secara permanen dari server.
          </p>

          <Input
            label="Masukkan Password Anda untuk Konfirmasi"
            type="password"
            placeholder="Password saat ini"
            value={deleteConfirmPassword}
            onChange={(e) => setDeleteConfirmPassword(e.target.value)}
            required
            autoFocus
          />

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsDeleteAccountModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" type="submit" loading={loadingDeleteAccount}>
              Hapus Akun Permanen
            </Button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirm Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari akun Anda?"
        confirmLabel="Ya, Keluar"
        variant="danger"
      />

      {/* Rekening Koran Modal */}
      <BankStatementModal
        isOpen={isBankStatementModalOpen}
        onClose={() => setIsBankStatementModalOpen(false)}
        user={user}
      />
    </div>
  )
}
