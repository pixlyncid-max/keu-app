import React, { useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  ArrowRightLeft,
  CreditCard,
  Edit2,
  Plus,
  Trash2,
  Wallet,
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
import { useCreateTransfer } from '@/hooks/useTransfers'
import {
  useArchiveWallet,
  useCreateWallet,
  useDeleteWallet,
  useUpdateWallet,
  useWallets,
} from '@/hooks/useWallets'
import { formatRupiah, getTodayString } from '@/lib/formatters'

export function WalletsPage() {
  const { data: walletsRes, isLoading } = useWallets()
  const wallets = Array.isArray(walletsRes?.data)
    ? walletsRes.data
    : Array.isArray(walletsRes?.data?.wallets)
    ? walletsRes.data.wallets
    : []

  // Modal States
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null)
  const [deletingWalletId, setDeletingWalletId] = useState(null)

  // Wallet Form State
  const [nama, setNama] = useState('')
  const [tipe, setTipe] = useState('bank')
  const [saldoAwal, setSaldoAwal] = useState('')
  const [warna, setWarna] = useState('#3b82f6')
  const [ikon, setIkon] = useState('wallet')

  // Transfer Form State
  const [dariWalletId, setDariWalletId] = useState('')
  const [keWalletId, setKeWalletId] = useState('')
  const [jumlahTransfer, setJumlahTransfer] = useState('')
  const [biayaAdmin, setBiayaAdmin] = useState('')
  const [tanggalTransfer, setTanggalTransfer] = useState(getTodayString())
  const [catatanTransfer, setCatatanTransfer] = useState('')

  // Mutations
  const createWalletMutation = useCreateWallet()
  const updateWalletMutation = useUpdateWallet()
  const deleteWalletMutation = useDeleteWallet()
  const archiveWalletMutation = useArchiveWallet()
  const createTransferMutation = useCreateTransfer()

  // Buka Modal Tambah Dompet
  const handleOpenCreateWallet = () => {
    setEditingWallet(null)
    setNama('')
    setTipe('bank')
    setSaldoAwal('')
    setWarna('#3b82f6')
    setIkon('wallet')
    setIsWalletModalOpen(true)
  }

  // Buka Modal Edit Dompet
  const handleOpenEditWallet = (w) => {
    setEditingWallet(w)
    setNama(w.nama)
    setTipe(w.tipe)
    setSaldoAwal(w.saldo_awal)
    setWarna(w.warna || '#3b82f6')
    setIkon(w.ikon || 'wallet')
    setIsWalletModalOpen(true)
  }

  // Buka Modal Transfer
  const handleOpenTransferModal = () => {
    setDariWalletId(wallets[0]?.id ? String(wallets[0].id) : '')
    setKeWalletId(wallets[1]?.id ? String(wallets[1].id) : '')
    setJumlahTransfer('')
    setBiayaAdmin('')
    setTanggalTransfer(getTodayString())
    setCatatanTransfer('')
    setIsTransferModalOpen(true)
  }

  // Submit Dompet (Create / Edit)
  const handleSubmitWallet = (e) => {
    e.preventDefault()
    if (!nama) return

    const payload = {
      nama,
      tipe,
      saldo_awal: parseFloat(saldoAwal) || 0,
      warna,
      ikon,
    }

    if (editingWallet) {
      updateWalletMutation.mutate(
        { id: editingWallet.id, data: payload },
        { onSuccess: () => setIsWalletModalOpen(false) }
      )
    } else {
      createWalletMutation.mutate(payload, {
        onSuccess: () => setIsWalletModalOpen(false),
      })
    }
  }

  // Submit Transfer
  const handleSubmitTransfer = (e) => {
    e.preventDefault()
    if (!dariWalletId || !keWalletId || dariWalletId === keWalletId) return
    if (!jumlahTransfer || parseFloat(jumlahTransfer) <= 0) return

    const payload = {
      dari_wallet_id: parseInt(dariWalletId, 10),
      ke_wallet_id: parseInt(keWalletId, 10),
      jumlah: parseFloat(jumlahTransfer),
      biaya_admin: biayaAdmin ? parseFloat(biayaAdmin) : 0,
      tanggal: tanggalTransfer,
      catatan: catatanTransfer || null,
    }

    createTransferMutation.mutate(payload, {
      onSuccess: () => setIsTransferModalOpen(false),
    })
  }

  // Toggle Archive
  const handleToggleArchive = (w) => {
    archiveWalletMutation.mutate({ id: w.id, archive: !w.is_archived })
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingWalletId) {
      deleteWalletMutation.mutate(deletingWalletId, {
        onSuccess: () => setDeletingWalletId(null),
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
            Kelola Dompet
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Daftar dompet tunai, rekening bank, dan e-wallet Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRightLeft}
            onClick={handleOpenTransferModal}
            disabled={wallets.length < 2}
          >
            Transfer Saldo
          </Button>
          <Button size="sm" icon={Plus} onClick={handleOpenCreateWallet}>
            Tambah Dompet
          </Button>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-44" />
            </Card>
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Belum Ada Dompet"
          description="Buat dompet pertama Anda untuk mulai mencatat keuangan."
          actionLabel="Tambah Dompet"
          onAction={handleOpenCreateWallet}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((w) => (
            <Card
              key={w.id}
              className={`p-5 flex flex-col justify-between border-t-4 relative overflow-hidden ${
                w.is_archived ? 'opacity-60 bg-surface-100/50 dark:bg-surface-900/40' : ''
              }`}
              style={{ borderTopColor: w.warna || '#3b82f6' }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                    {w.tipe}
                  </span>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditWallet(w)}
                      className="p-1.5 text-surface-400 hover:text-primary-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      title="Edit Dompet"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(w)}
                      className="p-1.5 text-surface-400 hover:text-amber-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      title={w.is_archived ? 'Pulihkan' : 'Arsipkan'}
                    >
                      {w.is_archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setDeletingWalletId(w.id)}
                      className="p-1.5 text-surface-400 hover:text-danger-500 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-surface-400" />
                  <span>{w.nama}</span>
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-100 dark:border-surface-800">
                <p className="text-[11px] text-surface-400">Saldo Saat Ini</p>
                <h4 className="text-xl font-extrabold text-surface-900 dark:text-surface-100">
                  {formatRupiah(w.saldo_aktual ?? w.saldo_awal)}
                </h4>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Dompet */}
      <Modal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        title={editingWallet ? 'Edit Dompet' : 'Tambah Dompet Baru'}
      >
        <form onSubmit={handleSubmitWallet} className="space-y-4">
          <Input
            label="Nama Dompet"
            placeholder="Contoh: BCA Tabungan / E-Wallet OVO"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Tipe Dompet"
            value={tipe}
            onChange={(e) => setTipe(e.target.value)}
            required
          >
            <option value="tunai">Tunai</option>
            <option value="bank">Rekening Bank</option>
            <option value="e-wallet">E-Wallet (Gopay/OVO/ShopeePay)</option>
            <option value="investasi">Investasi / Reksadana</option>
            <option value="lainnya">Lainnya</option>
          </Select>

          {!editingWallet && (
            <CurrencyInput
              label="Saldo Awal"
              value={saldoAwal}
              onChange={(val) => setSaldoAwal(val)}
              placeholder="0"
            />
          )}

          <div>
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1 block">
              Warna Tag Dompet
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={warna}
                onChange={(e) => setWarna(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-surface-500 uppercase">{warna}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsWalletModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={createWalletMutation.isPending || updateWalletMutation.isPending}
            >
              {editingWallet ? 'Simpan Perubahan' : 'Buat Dompet'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Transfer Saldo Antar Dompet */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Saldo Antar Dompet"
      >
        <form onSubmit={handleSubmitTransfer} className="space-y-4">
          <Select
            label="Dompet Asal (Pengirim)"
            value={dariWalletId}
            onChange={(e) => setDariWalletId(e.target.value)}
            required
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nama} (Saldo: {formatRupiah(w.saldo_aktual ?? w.saldo_awal)})
              </option>
            ))}
          </Select>

          <Select
            label="Dompet Tujuan (Penerima)"
            value={keWalletId}
            onChange={(e) => setKeWalletId(e.target.value)}
            required
          >
            {wallets
              .filter((w) => String(w.id) !== dariWalletId)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nama}
                </option>
              ))}
          </Select>

          <CurrencyInput
            label="Jumlah Transfer (IDR)"
            value={jumlahTransfer}
            onChange={(val) => setJumlahTransfer(val)}
            required
          />

          <CurrencyInput
            label="Biaya Admin (Opsional)"
            value={biayaAdmin}
            onChange={(val) => setBiayaAdmin(val)}
            placeholder="0"
          />

          <Input
            label="Tanggal Transfer"
            type="date"
            value={tanggalTransfer}
            onChange={(e) => setTanggalTransfer(e.target.value)}
            required
          />

          <Input
            label="Catatan Transfer (Opsional)"
            type="text"
            placeholder="Contoh: Tarik Tunai di ATM BCA"
            value={catatanTransfer}
            onChange={(e) => setCatatanTransfer(e.target.value)}
          />

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsTransferModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={createTransferMutation.isPending}>
              Proses Transfer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Wallet Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingWalletId}
        onClose={() => setDeletingWalletId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Dompet"
        message="Apakah Anda yakin ingin menghapus dompet ini? Jika dompet sudah memiliki transaksi, disarankan untuk mengarsipkannya saja."
        confirmLabel="Hapus Dompet"
        loading={deleteWalletMutation.isPending}
      />
    </div>
  )
}
