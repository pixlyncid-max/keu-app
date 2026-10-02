import React, { useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Edit2, PieChart, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useBudgetSummary, useDeleteBudget, useSetBudget } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { formatRupiah, getBulanIniString } from '@/lib/formatters'

export function BudgetsPage() {
  const [bulan, setBulan] = useState(getBulanIniString())
  const { data: summaryRes, isLoading } = useBudgetSummary(bulan)
  const { data: categoriesRes } = useCategories('pengeluaran')

  const summary = summaryRes?.data || {}
  const items = Array.isArray(summary?.items) ? summary.items : []
  const categories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : []

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deletingBudgetId, setDeletingBudgetId] = useState(null)

  // Form State
  const [categoryId, setCategoryId] = useState('')
  const [batasNominal, setBatasNominal] = useState('')

  const setBudgetMutation = useSetBudget()
  const deleteBudgetMutation = useDeleteBudget()

  const handleOpenCreateModal = () => {
    setEditingBudget(null)
    setCategoryId(categories[0]?.id ? String(categories[0].id) : '')
    setBatasNominal('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (b) => {
    setEditingBudget(b)
    setCategoryId(String(b.category_id))
    setBatasNominal(b.batas_nominal)
    setIsModalOpen(true)
  }

  const handleSubmitForm = (e) => {
    e.preventDefault()
    if (!categoryId || !batasNominal || parseFloat(batasNominal) <= 0) return

    const payload = {
      category_id: parseInt(categoryId, 10),
      bulan,
      batas_nominal: parseFloat(batasNominal),
    }

    setBudgetMutation.mutate(payload, {
      onSuccess: () => setIsModalOpen(false),
    })
  }

  const handleConfirmDelete = () => {
    if (deletingBudgetId) {
      deleteBudgetMutation.mutate(deletingBudgetId, {
        onSuccess: () => setDeletingBudgetId(null),
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
            Anggaran Bulanan
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Atur batas pengeluaran per kategori agar tidak melebihi anggaran
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="w-auto py-1.5 text-xs"
          />
          <Button size="sm" icon={Plus} onClick={handleOpenCreateModal}>
            Set Anggaran
          </Button>
        </div>
      </div>

      {/* Overall Summary Card */}
      {summary.total_budget > 0 && (
        <Card className="p-5 bg-gradient-to-r from-slate-900 to-surface-900 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
              Total Anggaran ({bulan})
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                summary.overall_status === 'overbudget'
                  ? 'bg-danger-500 text-white'
                  : summary.overall_status === 'waspada'
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {summary.overall_status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
            <div>
              <p className="text-[11px] text-surface-400">Batas Anggaran</p>
              <p className="text-base sm:text-xl font-bold">{formatRupiah(summary.total_budget)}</p>
            </div>
            <div>
              <p className="text-[11px] text-surface-400">Terpakai</p>
              <p className="text-base sm:text-xl font-bold text-amber-400">
                {formatRupiah(summary.total_terpakai)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-surface-400">Sisa</p>
              <p className="text-base sm:text-xl font-bold text-emerald-400">
                {formatRupiah(summary.total_sisa)}
              </p>
            </div>
          </div>

          {/* Progress Bar Overall */}
          <div className="space-y-1">
            <div className="w-full bg-surface-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.overall_persentase >= 100
                    ? 'bg-danger-500'
                    : summary.overall_persentase >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, summary.overall_persentase)}%` }}
              />
            </div>
            <p className="text-right text-[10px] text-surface-400 font-mono">
              {summary.overall_persentase}% terpakai
            </p>
          </div>
        </Card>
      )}

      {/* Budget Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="Belum Ada Anggaran"
          description={`Anda belum membuat batas anggaran kategori untuk bulan ${bulan}.`}
          actionLabel="Set Anggaran Pertama"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((b) => {
            const isOver = b.status === 'overbudget'
            const isWarning = b.status === 'waspada'

            return (
              <Card key={b.id} className="p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: b.category_warna || '#6366F1' }}
                      />
                      <h4 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                        {b.category_nama}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      {isOver ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger-50 text-danger-600 dark:bg-danger-950/60 dark:text-danger-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Overbudget
                        </span>
                      ) : isWarning ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Waspada
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-50 text-success-600 dark:bg-success-950/60 dark:text-success-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Aman
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="p-1 text-surface-400 hover:text-primary-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingBudgetId(b.id)}
                        className="p-1 text-surface-400 hover:text-danger-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between text-xs mt-2">
                    <span className="text-surface-500">
                      Terpakai:{' '}
                      <strong
                        className={`font-bold ${
                          isOver ? 'text-danger-500' : isWarning ? 'text-amber-500' : 'text-surface-900 dark:text-surface-100'
                        }`}
                      >
                        {formatRupiah(b.terpakai)}
                      </strong>
                    </span>
                    <span className="text-surface-400">Batas: {formatRupiah(b.batas_nominal)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-danger-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, b.persentase)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-surface-400">
                      <span>{b.persentase}% digunakan</span>
                      <span>Sisa: {formatRupiah(b.sisa)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Form Anggaran */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Edit Batas Anggaran' : 'Set Anggaran Kategori'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Select
            label="Kategori Pengeluaran"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!editingBudget}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </Select>

          <CurrencyInput
            label="Batas Anggaran Maksimum (IDR)"
            value={batasNominal}
            onChange={(val) => setBatasNominal(val)}
            required
            autoFocus
          />

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={setBudgetMutation.isPending}>
              Simpan Anggaran
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingBudgetId}
        onClose={() => setDeletingBudgetId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Anggaran"
        message="Apakah Anda yakin ingin menghapus batas anggaran untuk kategori ini?"
        confirmLabel="Hapus Anggaran"
        loading={deleteBudgetMutation.isPending}
      />
    </div>
  )
}
