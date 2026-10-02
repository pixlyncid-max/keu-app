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
  const { data: walletsRes, isLoading } = useWallets({ termasuk_arsip: 1 })
  const allWallets = Array.isArray(walletsRes?.data)
    ? walletsRes.data
    : Array.isArray(walletsRes?.data?.wallets)
    ? walletsRes.data.wallets
    : []

  const activeWallets = allWallets.filter((w) => !w.is_archived)
  const archivedWallets = allWallets.filter((w) => w.is_archived)

  // Tab State: 'aktif' | 'arsip'
  const [activeTab, setActiveTab] = useState('aktif')

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
    setDariWalletId(activeWallets[0]?.id ? String(activeWallets[0].id) : '')
    setKeWalletId(activeWallets[1]?.id ? String(activeWallets[1].id) : '')
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
            disabled={activeWallets.length < 2}
          >
            Transfer Saldo
          </Button>
          <Button size="sm" icon={Plus} onClick={handleOpenCreateWallet}>
            Tambah Dompet
          </Button>
        </div>
      </div>

      {/* Tabs Filter: Dompet Aktif vs Arsip */}
      <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-800">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('aktif')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'aktif'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <span>Dompet Aktif</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'aktif'
                  ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
              }`}
            >
              {activeWallets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('arsip')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'arsip'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Diarsipkan</span>
            {archivedWallets.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'arsip'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}
              >
                {archivedWallets.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-44" />
            </Card>
          ))}
        </div>
      ) : activeTab === 'aktif' ? (
        /* ================= TAB 1: DOMPET AKTIF ================= */
        activeWallets.length === 0 ? (
          archivedWallets.length > 0 ? (
            /* Jika semua dompet sedang diarsipkan */
            <div className="p-8 text-center bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Archive className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Tidak Ada Dompet Aktif
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 max-w-md mx-auto">
                  Anda memiliki{' '}
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {archivedWallets.length} dompet yang diarsipkan
                  </span>
                  . Anda dapat memulihkannya kembali ke status aktif atau membuat dompet baru.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  icon={ArchiveRestore}
                  onClick={() => setActiveTab('arsip')}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Lihat & Pulihkan Dompet ({archivedWallets.length})
                </Button>
                <Button variant="outline" icon={Plus} onClick={handleOpenCreateWallet}>
                  Tambah Dompet Baru
                </Button>
              </div>
            </div>
          ) : (
            /* Benar-benar belum ada dompet sama sekali */
            <EmptyState
              icon={CreditCard}
              title="Belum Ada Dompet"
              description="Buat dompet pertama Anda untuk mulai mencatat keuangan."
              actionLabel="Tambah Dompet"
              onAction={handleOpenCreateWallet}
            />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWallets.map((w) => (
              <Card
                key={w.id}
                className="p-5 flex flex-col justify-between border-t-4 relative overflow-hidden"
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
                        title="Arsipkan Dompet"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingWalletId(w.id)}
                        className="p-1.5 text-surface-400 hover:text-danger-500 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                        title="Hapus Dompet"
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
        )
      ) : (
        /* ================= TAB 2: DOMPET DIARSIPKAN ================= */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-3">
            <Archive className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <p className="font-bold text-sm mb-0.5">Daftar Dompet yang Diarsipkan</p>
              Dompet yang diarsipkan disembunyikan dari transaksi baru dan transfer, namun seluruh
              saldo dan data riwayat transaksinya tetap tersimpan dengan aman. Anda dapat
              mengembalikannya ke status aktif kapan saja dengan menekan tombol{' '}
              <strong>Pulihkan</strong>.
            </div>
          </div>

          {archivedWallets.length === 0 ? (
            <EmptyState
              icon={ArchiveRestore}
              title="Tidak Ada Dompet yang Diarsipkan"
              description="Saat ini tidak ada dompet dalam arsip. Dompet yang Anda arsipkan akan muncul di sini."
              actionLabel="Kembali ke Dompet Aktif"
              onAction={() => setActiveTab('aktif')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedWallets.map((w) => (
                <Card
                  key={w.id}
                  className="p-5 flex flex-col justify-between border-t-4 border-amber-500 bg-amber-50/20 dark:bg-amber-950/10 relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <Archive className="w-3 h-3" />
                          Diarsipkan
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                          {w.tipe}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleArchive(w)}
                          className="p-1.5 text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg transition-colors"
                          title="Pulihkan ke Dompet Aktif"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingWalletId(w.id)}
                          className="p-1.5 text-surface-400 hover:text-danger-500 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                          title="Hapus Permanen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-amber-500" />
                      <span>{w.nama}</span>
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-100 dark:border-surface-800">
                    <p className="text-[11px] text-surface-400">Saldo Terakhir</p>
                    <h4 className="text-xl font-extrabold text-surface-900 dark:text-surface-100">
                      {formatRupiah(w.saldo_aktual ?? w.saldo_awal)}
                    </h4>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArchiveRestore}
                      className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                      onClick={() => handleToggleArchive(w)}
                      loading={archiveWalletMutation.isPending}
                    >
                      Pulihkan Dompet Ini
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
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
            {activeWallets.map((w) => (
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
            {activeWallets
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
