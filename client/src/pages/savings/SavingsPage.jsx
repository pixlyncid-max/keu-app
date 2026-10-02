import React, { useState } from 'react'
import {
  CheckCircle2,
  Edit2,
  PiggyBank,
  Plus,
  PlusCircle,
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
import {
  useAddSavingsContribution,
  useCreateSavingsGoal,
  useDeleteSavingsGoal,
  useSavingsGoals,
  useUpdateSavingsGoal,
} from '@/hooks/useSavings'
import { useWallets } from '@/hooks/useWallets'
import { formatRupiah, formatTanggalPendek, getTodayString } from '@/lib/formatters'

export function SavingsPage() {
  const { data: goalsRes, isLoading } = useSavingsGoals()
  const { data: walletsRes } = useWallets()
  const goals = Array.isArray(goalsRes?.data) ? goalsRes.data : []
  const wallets = Array.isArray(walletsRes?.data)
    ? walletsRes.data
    : Array.isArray(walletsRes?.data?.wallets)
    ? walletsRes.data.wallets
    : []

  // Modal States
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [selectedGoalForContrib, setSelectedGoalForContrib] = useState(null)
  const [deletingGoalId, setDeletingGoalId] = useState(null)

  // Goal Form State
  const [nama, setNama] = useState('')
  const [targetNominal, setTargetNominal] = useState('')
  const [tanggalTarget, setTanggalTarget] = useState('')
  const [walletId, setWalletId] = useState('')
  const [catatan, setCatatan] = useState('')

  // Contribution Form State
  const [contribNominal, setContribNominal] = useState('')
  const [contribWalletId, setContribWalletId] = useState('')
  const [contribTanggal, setContribTanggal] = useState(getTodayString())
  const [contribCatatan, setContribCatatan] = useState('')

  // Mutations
  const createGoalMutation = useCreateSavingsGoal()
  const updateGoalMutation = useUpdateSavingsGoal()
  const deleteGoalMutation = useDeleteSavingsGoal()
  const addContribMutation = useAddSavingsContribution()

  // Buka Modal Tambah Goal
  const handleOpenCreateGoal = () => {
    setEditingGoal(null)
    setNama('')
    setTargetNominal('')
    setTanggalTarget('')
    setWalletId('')
    setCatatan('')
    setIsGoalModalOpen(true)
  }

  // Buka Modal Edit Goal
  const handleOpenEditGoal = (g) => {
    setEditingGoal(g)
    setNama(g.nama)
    setTargetNominal(g.target_nominal)
    setTanggalTarget(g.tanggal_target || '')
    setWalletId(g.wallet_id ? String(g.wallet_id) : '')
    setCatatan(g.catatan || '')
    setIsGoalModalOpen(true)
  }

  // Buka Modal Setoran Tabungan
  const handleOpenContribModal = (g) => {
    setSelectedGoalForContrib(g)
    setContribNominal('')
    setContribWalletId(g.wallet_id ? String(g.wallet_id) : wallets[0]?.id ? String(wallets[0].id) : '')
    setContribTanggal(getTodayString())
    setContribCatatan('')
    setIsContributionModalOpen(true)
  }

  // Submit Goal Form
  const handleSubmitGoal = (e) => {
    e.preventDefault()
    if (!nama || !targetNominal || parseFloat(targetNominal) <= 0) return

    const payload = {
      nama,
      target_nominal: parseFloat(targetNominal),
      tanggal_target: tanggalTarget || null,
      wallet_id: walletId ? parseInt(walletId, 10) : null,
      catatan: catatan || null,
    }

    if (editingGoal) {
      updateGoalMutation.mutate(
        { id: editingGoal.id, data: payload },
        { onSuccess: () => setIsGoalModalOpen(false) }
      )
    } else {
      createGoalMutation.mutate(payload, {
        onSuccess: () => setIsGoalModalOpen(false),
      })
    }
  }

  // Submit Contribution Form
  const handleSubmitContribution = (e) => {
    e.preventDefault()
    if (!selectedGoalForContrib) return
    if (!contribNominal || parseFloat(contribNominal) <= 0) return

    const payload = {
      nominal: parseFloat(contribNominal),
      wallet_id: contribWalletId ? parseInt(contribWalletId, 10) : null,
      tanggal: contribTanggal,
      catatan: contribCatatan || null,
    }

    addContribMutation.mutate(
      { goalId: selectedGoalForContrib.id, data: payload },
      { onSuccess: () => setIsContributionModalOpen(false) }
    )
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingGoalId) {
      deleteGoalMutation.mutate(deletingGoalId, {
        onSuccess: () => setDeletingGoalId(null),
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
            Target Tabungan
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Rencanakan dan wujudkan impian finansial Anda
          </p>
        </div>

        <Button size="sm" icon={Plus} onClick={handleOpenCreateGoal}>
          Tambah Target
        </Button>
      </div>

      {/* Goal Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-5 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Belum Ada Target Tabungan"
          description="Buat target impian Anda (misal: Beli Laptop, Liburan, Dana Darurat) dan mulai menabung."
          actionLabel="Buat Target Pertama"
          onAction={handleOpenCreateGoal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const stats = g.stats || {}
            const persentase = stats.persentase ?? 0
            const totalTerkumpul = stats.total_terkumpul ?? 0
            const sisaKebutuhan = stats.sisa_kebutuhan ?? 0
            const isTercapai = g.status === 'tercapai' || persentase >= 100

            return (
              <Card key={g.id} className="p-5 space-y-4 flex flex-col justify-between">
                <div>
                  {/* Title & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                        <PiggyBank className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-surface-900 dark:text-surface-100 leading-tight">
                          {g.nama}
                        </h3>
                        {g.tanggal_target && (
                          <p className="text-xs text-surface-400">
                            Tenggat: {formatTanggalPendek(g.tanggal_target)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isTercapai && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-50 text-success-600 dark:bg-success-950/60 dark:text-success-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Tercapai
                        </span>
                      )}
                      <button
                        onClick={() => handleOpenEditGoal(g)}
                        className="p-1.5 text-surface-400 hover:text-primary-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                        title="Edit Target"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingGoalId(g.id)}
                        className="p-1.5 text-surface-400 hover:text-danger-500 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Nominal Summary */}
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-xs text-surface-500 dark:text-surface-400">
                      Terkumpul: <strong className="text-surface-900 dark:text-surface-100 font-bold">{formatRupiah(totalTerkumpul)}</strong>
                    </span>
                    <span className="text-xs font-semibold text-surface-500">
                      Target: {formatRupiah(g.target_nominal)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTercapai ? 'bg-success-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, persentase)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-surface-400 font-medium">
                      <span>{persentase}% Terkumpul</span>
                      <span>Sisa: {formatRupiah(sisaKebutuhan)}</span>
                    </div>
                  </div>

                  {/* Estimasi Setoran Bulanan */}
                  {stats.estimasi_setoran_per_bulan && !isTercapai && (
                    <div className="mt-3 p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 text-xs text-surface-600 dark:text-surface-300 flex items-center justify-between">
                      <span>Estimasi Setoran / Bulan:</span>
                      <strong className="text-primary-600 dark:text-primary-400">
                        {formatRupiah(stats.estimasi_setoran_per_bulan)}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Button Setoran */}
                {!isTercapai && (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={PlusCircle}
                    onClick={() => handleOpenContribModal(g)}
                  >
                    Setor Tabungan
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Goal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={editingGoal ? 'Edit Target Tabungan' : 'Tambah Target Tabungan'}
      >
        <form onSubmit={handleSubmitGoal} className="space-y-4">
          <Input
            label="Nama Target"
            placeholder="Contoh: Dana Darurat / Beli Laptop"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
            autoFocus
          />

          <CurrencyInput
            label="Target Nominal (IDR)"
            value={targetNominal}
            onChange={(val) => setTargetNominal(val)}
            required
          />

          <Input
            label="Tanggal Tenggat Target (Opsional)"
            type="date"
            value={tanggalTarget}
            onChange={(e) => setTanggalTarget(e.target.value)}
          />

          <Select
            label="Alokasi Dompet Otomatis (Opsional)"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            placeholder="-- Tidak Ada --"
          >
            <option value="">-- Tidak Terhubung ke Dompet Spesifik --</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nama}
              </option>
            ))}
          </Select>

          <Input
            label="Catatan (Opsional)"
            placeholder="Keterangan tambahan..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsGoalModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={createGoalMutation.isPending || updateGoalMutation.isPending}
            >
              {editingGoal ? 'Simpan Perubahan' : 'Buat Target'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Setor Tabungan */}
      <Modal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        title={`Setor Tabungan — ${selectedGoalForContrib?.nama || ''}`}
      >
        <form onSubmit={handleSubmitContribution} className="space-y-4">
          <CurrencyInput
            label="Nominal Setoran (IDR)"
            value={contribNominal}
            onChange={(val) => setContribNominal(val)}
            required
            autoFocus
          />

          <Select
            label="Potong Dari Dompet (Opsional)"
            value={contribWalletId}
            onChange={(e) => setContribWalletId(e.target.value)}
            placeholder="-- Tanpa Memotong Saldo Dompet --"
          >
            <option value="">-- Tanpa Memotong Saldo Dompet --</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nama} (Saldo: {formatRupiah(w.saldo_aktual ?? w.saldo_awal)})
              </option>
            ))}
          </Select>

          <Input
            label="Tanggal Setoran"
            type="date"
            value={contribTanggal}
            onChange={(e) => setContribTanggal(e.target.value)}
            required
          />

          <Input
            label="Catatan (Opsional)"
            placeholder="Catatan setoran..."
            value={contribCatatan}
            onChange={(e) => setContribCatatan(e.target.value)}
          />

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsContributionModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" loading={addContribMutation.isPending}>
              Simpan Setoran
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Goal Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingGoalId}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Target Tabungan"
        message="Apakah Anda yakin ingin menghapus target tabungan ini beserta seluruh riwayat setorannya?"
        confirmLabel="Hapus Target"
        loading={deleteGoalMutation.isPending}
      />
    </div>
  )
}
