import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  Filter,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories } from '@/hooks/useCategories'
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from '@/hooks/useTransactions'
import { useWallets } from '@/hooks/useWallets'
import { formatRupiah, formatTanggalRelatif, getTodayString } from '@/lib/formatters'
import { dataService } from '@/services/dataService'

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // State Filter Query
  const [search, setSearch] = useState('')
  const [tipe, setTipe] = useState('')
  const [walletId, setWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)

  // State Modal & Action
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'new')
  const [editingTx, setEditingTx] = useState(null)
  const [deletingTxId, setDeletingTxId] = useState(null)

  // State Form Transaksi
  const [formTipe, setFormTipe] = useState('pengeluaran')
  const [formJumlah, setFormJumlah] = useState('')
  const [formWalletId, setFormWalletId] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formTanggal, setFormTanggal] = useState(getTodayString())
  const [formCatatan, setFormCatatan] = useState('')
  const [formMerchant, setFormMerchant] = useState('')

  // Query Params
  const queryParams = {
    page,
    per_page: 20,
    search: search || undefined,
    tipe: tipe || undefined,
    wallet_id: walletId || undefined,
    category_id: categoryId || undefined,
  }

  // Data fetching
  const { data: txRes, isLoading, isError } = useTransactions(queryParams)
  const { data: walletsRes } = useWallets()
  const { data: categoriesRes } = useCategories(formTipe)

  const createTxMutation = useCreateTransaction()
  const updateTxMutation = useUpdateTransaction()
  const deleteTxMutation = useDeleteTransaction()

  const transactions = Array.isArray(txRes?.data) ? txRes.data : []
  const meta = txRes?.meta || {}
  const wallets = Array.isArray(walletsRes?.data)
    ? walletsRes.data
    : Array.isArray(walletsRes?.data?.wallets)
    ? walletsRes.data.wallets
    : []
  const categories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : []

  // Buka Modal Tambah Transaksi
  const handleOpenCreateModal = () => {
    setEditingTx(null)
    setFormTipe('pengeluaran')
    setFormJumlah('')
    setFormWalletId(wallets[0]?.id ? String(wallets[0].id) : '')
    setFormCategoryId('')
    setFormTanggal(getTodayString())
    setFormCatatan('')
    setFormMerchant('')
    setIsModalOpen(true)
  }

  // Buka Modal Edit Transaksi
  const handleOpenEditModal = (tx) => {
    setEditingTx(tx)
    setFormTipe(tx.tipe)
    setFormJumlah(tx.jumlah ?? tx.nominal ?? '')
    setFormWalletId(String(tx.wallet_id))
    setFormCategoryId(String(tx.category_id))
    setFormTanggal(tx.tanggal?.split('T')[0] || getTodayString())
    setFormCatatan(tx.catatan || '')
    setFormMerchant(tx.merchant || '')
    setIsModalOpen(true)
  }

  // Simpan Transaksi (Create / Update)
  const handleSubmitForm = (e) => {
    e.preventDefault()
    if (!formJumlah || parseFloat(formJumlah) <= 0) return
    if (!formWalletId || !formCategoryId) return

    const payload = {
      tipe: formTipe,
      nominal: parseFloat(formJumlah),
      jumlah: parseFloat(formJumlah),
      wallet_id: parseInt(formWalletId, 10),
      category_id: parseInt(formCategoryId, 10),
      tanggal: formTanggal,
      catatan: formCatatan || null,
    }

    if (editingTx) {
      updateTxMutation.mutate(
        { id: editingTx.id, data: payload },
        { onSuccess: () => setIsModalOpen(false) }
      )
    } else {
      createTxMutation.mutate(payload, {
        onSuccess: () => setIsModalOpen(false),
      })
    }
  }

  // Hapus Transaksi
  const handleConfirmDelete = () => {
    if (deletingTxId) {
      deleteTxMutation.mutate(deletingTxId, {
        onSuccess: () => setDeletingTxId(null),
      })
    }
  }

  // Ekspor Transaksi ke CSV
  const handleExportCsv = async () => {
    try {
      const blob = await dataService.exportCsv({
        tipe: tipe || undefined,
        wallet_id: walletId || undefined,
        category_id: categoryId || undefined,
      })
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transaksi_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      // Handled via interceptor
    }
  }

  // Pengelompokan transaksi berdasarkan tanggal
  const groupedTransactions = transactions.reduce((acc, tx) => {
    const dateKey = tx.tanggal?.split('T')[0] || 'Lainnya'
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(tx)
    return acc
  }, {})

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
            Riwayat Transaksi
          </h2>
          <p className="text-[11px] sm:text-xs text-surface-500 dark:text-surface-400">
            Kelola dan pantau seluruh transaksi keuangan Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportCsv}
            className="text-xs py-1.5 px-2.5 sm:px-3 min-h-[36px]"
          >
            <span className="hidden sm:inline">Ekspor Excel / Spreadsheet</span>
            <span className="sm:hidden">Ekspor Excel</span>
          </Button>
          <Button
            size="sm"
            icon={Plus}
            onClick={handleOpenCreateModal}
            className="text-xs py-1.5 px-3 min-h-[36px]"
          >
            Tambah
          </Button>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <Card className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Input Search */}
          <div className="col-span-2">
            <Input
              type="text"
              size="sm"
              placeholder="Cari catatan atau merchant..."
              icon={Search}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          {/* Filter Tipe */}
          <div className="col-span-1">
            <Select
              size="sm"
              value={tipe}
              onChange={(e) => {
                setTipe(e.target.value)
                setPage(1)
              }}
              placeholder="Semua Tipe"
              options={[
                { value: '', label: 'Semua Tipe' },
                { value: 'pemasukan', label: 'Pemasukan (+)' },
                { value: 'pengeluaran', label: 'Pengeluaran (-)' },
              ]}
            />
          </div>

          {/* Filter Dompet */}
          <div className="col-span-1">
            <Select
              size="sm"
              value={walletId}
              onChange={(e) => {
                setWalletId(e.target.value)
                setPage(1)
              }}
              placeholder="Semua Dompet"
            >
              <option value="">Semua Dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nama}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Grouped Transaction List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </Card>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="Tidak Ada Transaksi"
          description="Belum ada pencatatan transaksi yang cocok dengan filter Anda."
          actionLabel="Tambah Transaksi Baru"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedTransactions).map(([dateStr, items]) => (
            <div key={dateStr} className="space-y-2">
              {/* Header Tanggal */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  {formatTanggalRelatif(dateStr)}
                </span>
                <span className="text-xs font-medium text-surface-400">
                  {items.length} Transaksi
                </span>
              </div>

              {/* Items Card */}
              <Card className="divide-y divide-surface-100 dark:divide-surface-800 p-0 overflow-hidden">
                {items.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleOpenEditModal(t)}
                    className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          t.tipe === 'pemasukan'
                            ? 'bg-success-50 text-success-600 dark:bg-success-950/40'
                            : 'bg-danger-50 text-danger-500 dark:bg-danger-950/40'
                        }`}
                      >
                        {t.tipe === 'pemasukan' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>

                      <div className="truncate">
                        <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
                          {t.catatan || t.category?.nama || 'Transaksi'}
                        </p>
                        <p className="text-xs text-surface-400 truncate">
                          {t.category?.nama ?? 'Kategori'} • {t.wallet?.nama ?? 'Dompet'}
                          {t.merchant && ` • ${t.merchant}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-sm sm:text-base font-extrabold ${
                          t.tipe === 'pemasukan' ? 'text-success-600 dark:text-success-400' : 'text-danger-500 dark:text-danger-400'
                        }`}
                      >
                        {t.tipe === 'pemasukan' ? '+' : '-'} {formatRupiah(t.jumlah ?? t.nominal ?? 0)}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingTxId(t.id)
                        }}
                        title="Hapus"
                        className="p-1.5 text-surface-400 hover:text-danger-500 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}

          {/* Pagination Bar */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Sebelumnya
              </Button>
              <span className="text-xs text-surface-500 dark:text-surface-400">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Selanjutnya →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal / Bottom Sheet Form Transaksi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTx ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {/* Segmented Control Tipe Transaksi */}
          <div className="flex rounded-xl bg-surface-100 dark:bg-surface-800 p-1">
            <button
              type="button"
              onClick={() => setFormTipe('pengeluaran')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                formTipe === 'pengeluaran'
                  ? 'bg-danger-500 text-white shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900'
              }`}
            >
              Pengeluaran (-)
            </button>
            <button
              type="button"
              onClick={() => setFormTipe('pemasukan')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                formTipe === 'pemasukan'
                  ? 'bg-success-500 text-white shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900'
              }`}
            >
              Pemasukan (+)
            </button>
          </div>

          {/* Input Nominal Currency */}
          <CurrencyInput
            label="Nominal (IDR)"
            value={formJumlah}
            onChange={(val) => setFormJumlah(val)}
            required
            autoFocus
          />

          {/* Select Dompet */}
          <Select
            label="Dompet Sumber"
            value={formWalletId}
            onChange={(e) => setFormWalletId(e.target.value)}
            required
            placeholder="-- Pilih Dompet --"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nama} (Saldo: {formatRupiah(w.saldo_aktual ?? w.saldo_awal)})
              </option>
            ))}
          </Select>

          {/* Select Kategori */}
          <Select
            label="Kategori"
            value={formCategoryId}
            onChange={(e) => setFormCategoryId(e.target.value)}
            required
            placeholder="-- Pilih Kategori --"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </Select>

          {/* Tanggal Picker */}
          <Input
            label="Tanggal Transaksi"
            type="date"
            value={formTanggal}
            onChange={(e) => setFormTanggal(e.target.value)}
            required
          />

          {/* Catatan Input */}
          <Input
            label="Catatan (Opsional)"
            type="text"
            placeholder="Contoh: Makan Siang di Warung"
            value={formCatatan}
            onChange={(e) => setFormCatatan(e.target.value)}
          />

          {/* Merchant Input */}
          <Input
            label="Merchant / Toko (Opsional)"
            type="text"
            placeholder="Contoh: Starbucks / Indomaret"
            value={formMerchant}
            onChange={(e) => setFormMerchant(e.target.value)}
          />

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={createTxMutation.isPending || updateTxMutation.isPending}
            >
              {editingTx ? 'Simpan Perubahan' : 'Catat Transaksi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTxId}
        onClose={() => setDeletingTxId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        loading={deleteTxMutation.isPending}
      />
    </div>
  )
}
