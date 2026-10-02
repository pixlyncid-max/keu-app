import React, { useState } from 'react'
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  Play,
  Plus,
  Repeat,
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
  useCreateRecurringRule,
  useDeleteRecurringRule,
  useProcessDueRecurring,
  useRecurringRules,
  useUpcomingBills,
  useUpdateRecurringRule,
} from '@/hooks/useRecurring'
import { useWallets } from '@/hooks/useWallets'
import { formatRupiah, formatTanggalPendek, getTodayString } from '@/lib/formatters'

export function RecurringPage() {
  const { data: rulesRes, isLoading: loadingRules } = useRecurringRules()
  const { data: upcomingRes, isLoading: loadingUpcoming } = useUpcomingBills(30)
  const { data: walletsRes } = useWallets()

  const rules = Array.isArray(rulesRes?.data) ? rulesRes.data : []
  const upcoming = Array.isArray(upcomingRes?.data) ? upcomingRes.data : []
  const wallets = Array.isArray(walletsRes?.data)
    ? walletsRes.data
    : Array.isArray(walletsRes?.data?.wallets)
    ? walletsRes.data.wallets
    : []

  // Active Tab
  const [tab, setTab] = useState('rules') // 'rules' | 'upcoming'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [deletingRuleId, setDeletingRuleId] = useState(null)

  // Rule Form State
  const [tipe, setTipe] = useState('pengeluaran')
  const [nominal, setNominal] = useState('')
  const [walletId, setWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [frekuensi, setFrekuensi] = useState('bulanan')
  const [interval, setIntervalVal] = useState('1')
  const [tanggalMulai, setTanggalMulai] = useState(getTodayString())
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [catatan, setCatatan] = useState('')

  const { data: categoriesRes } = useCategories(tipe)
  const categories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : []

  // Mutations
  const createRuleMutation = useCreateRecurringRule()
  const updateRuleMutation = useUpdateRecurringRule()
  const deleteRuleMutation = useDeleteRecurringRule()
  const processDueMutation = useProcessDueRecurring()

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingRule(null)
    setTipe('pengeluaran')
    setNominal('')
    setWalletId(wallets[0]?.id ? String(wallets[0].id) : '')
    setCategoryId('')
    setFrekuensi('bulanan')
    setIntervalVal('1')
    setTanggalMulai(getTodayString())
    setTanggalSelesai('')
    setCatatan('')
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (r) => {
    setEditingRule(r)
    setTipe(r.tipe)
    setNominal(r.nominal)
    setWalletId(String(r.wallet_id))
    setCategoryId(String(r.category_id))
    setFrekuensi(r.frekuensi)
    setIntervalVal(String(r.interval || 1))
    setTanggalMulai(r.tanggal_mulai ? r.tanggal_mulai.split('T')[0] : getTodayString())
    setTanggalSelesai(r.tanggal_selesai ? r.tanggal_selesai.split('T')[0] : '')
    setCatatan(r.catatan || '')
    setIsModalOpen(true)
  }

  // Submit Rule
  const handleSubmitRule = (e) => {
    e.preventDefault()
    if (!nominal || parseFloat(nominal) <= 0) return
    if (!walletId || !categoryId) return

    const payload = {
      tipe,
      nominal: parseFloat(nominal),
      wallet_id: parseInt(walletId, 10),
      category_id: parseInt(categoryId, 10),
      frekuensi,
      interval: parseInt(interval, 10) || 1,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai || null,
      catatan: catatan || null,
    }

    if (editingRule) {
      updateRuleMutation.mutate(
        { id: editingRule.id, data: payload },
        { onSuccess: () => setIsModalOpen(false) }
      )
    } else {
      createRuleMutation.mutate(payload, {
        onSuccess: () => setIsModalOpen(false),
      })
    }
  }

  // Toggle Rule Status (Aktif / Jeda)
  const handleToggleRuleStatus = (r) => {
    updateRuleMutation.mutate({
      id: r.id,
      data: { is_active: !r.is_active },
    })
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingRuleId) {
      deleteRuleMutation.mutate(deletingRuleId, {
        onSuccess: () => setDeletingRuleId(null),
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header & Instant Trigger Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
            Transaksi Berulang
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Kelola gaji, langganan, dan tagihan bulanan otomatis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Play}
            loading={processDueMutation.isPending}
            onClick={() => processDueMutation.mutate()}
            title="Proses aturan yang jatuh tempo sekarang"
          >
            Proses Sekarang
          </Button>
          <Button size="sm" icon={Plus} onClick={handleOpenCreateModal}>
            Tambah Aturan
          </Button>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-surface-200 dark:border-surface-800">
        <button
          onClick={() => setTab('rules')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
            tab === 'rules'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Aturan Berulang ({rules.length})
        </button>
        <button
          onClick={() => setTab('upcoming')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
            tab === 'upcoming'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Tagihan Mendatang ({upcoming.length})
        </button>
      </div>

      {/* Tab 1: Rules List */}
      {tab === 'rules' && (
        <>
          {loadingRules ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} className="p-4 space-y-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-full" />
                </Card>
              ))}
            </div>
          ) : rules.length === 0 ? (
            <EmptyState
              icon={Repeat}
              title="Belum Ada Aturan Transaksi Berulang"
              description="Buat aturan berulang (misal: Tagihan Wi-Fi setiap tanggal 1, Gaji bulanan)."
              actionLabel="Tambah Aturan Baru"
              onAction={handleOpenCreateModal}
            />
          ) : (
            <div className="space-y-3">
              {rules.map((r) => (
                <Card key={r.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        r.tipe === 'pemasukan'
                          ? 'bg-success-50 text-success-600 dark:bg-success-950/40'
                          : 'bg-danger-50 text-danger-500 dark:bg-danger-950/40'
                      }`}
                    >
                      <Repeat className="w-5 h-5" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-surface-900 dark:text-surface-100 truncate">
                          {r.catatan || r.category?.nama || 'Aturan Berulang'}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            r.is_active
                              ? 'bg-success-50 text-success-600 dark:bg-success-950/40'
                              : 'bg-surface-200 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
                          }`}
                        >
                          {r.is_active ? 'Aktif' : 'Dijeda'}
                        </span>
                      </div>
                      <p className="text-xs text-surface-400 truncate mt-0.5">
                        {r.frekuensi} • {r.wallet?.nama ?? 'Dompet'} • Jadwal Berikutnya:{' '}
                        {r.next_run_date ? formatTanggalPendek(r.next_run_date) : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-sm font-extrabold ${
                        r.tipe === 'pemasukan' ? 'text-success-600 dark:text-success-400' : 'text-danger-500 dark:text-danger-400'
                      }`}
                    >
                      {r.tipe === 'pemasukan' ? '+' : '-'} {formatRupiah(r.nominal)}
                    </span>

                    <button
                      onClick={() => handleToggleRuleStatus(r)}
                      className="text-xs font-semibold underline text-primary-600 hover:text-primary-700"
                    >
                      {r.is_active ? 'Jeda' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(r)}
                      className="p-1.5 text-surface-400 hover:text-primary-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingRuleId(r.id)}
                      className="p-1.5 text-surface-400 hover:text-danger-500 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Upcoming Bills (30 Hari Ke Depan) */}
      {tab === 'upcoming' && (
        <>
          {loadingUpcoming ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Tidak Ada Tagihan Mendatang"
              description="Tidak ada perkiraan transaksi berulang dalam 30 hari ke depan."
            />
          ) : (
            <Card className="divide-y divide-surface-100 dark:divide-surface-800 p-0 overflow-hidden">
              {upcoming.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-surface-900 dark:text-surface-100">
                        {item.catatan || item.category?.nama || 'Tagihan Mendatang'}
                      </p>
                      <p className="text-xs text-surface-400">
                        Jatuh Tempo: {formatTanggalPendek(item.tanggal)} • Dompet: {item.wallet?.nama ?? 'N/A'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-bold ${
                      item.tipe === 'pemasukan' ? 'text-success-600 dark:text-success-400' : 'text-danger-500 dark:text-danger-400'
                    }`}
                  >
                    {item.tipe === 'pemasukan' ? '+' : '-'} {formatRupiah(item.nominal)}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </>
      )}

      {/* Modal Form Aturan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? 'Edit Aturan Berulang' : 'Tambah Aturan Transaksi Berulang'}
      >
        <form onSubmit={handleSubmitRule} className="space-y-4">
          <div className="flex rounded-xl bg-surface-100 dark:bg-surface-800 p-1">
            <button
              type="button"
              onClick={() => setTipe('pengeluaran')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                tipe === 'pengeluaran' ? 'bg-danger-500 text-white shadow-sm' : 'text-surface-600'
              }`}
            >
              Pengeluaran (-)
            </button>
            <button
              type="button"
              onClick={() => setTipe('pemasukan')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                tipe === 'pemasukan' ? 'bg-success-500 text-white shadow-sm' : 'text-surface-600'
              }`}
            >
              Pemasukan (+)
            </button>
          </div>

          <CurrencyInput
            label="Nominal (IDR)"
            value={nominal}
            onChange={(val) => setNominal(val)}
            required
            autoFocus
          />

          <Select
            label="Dompet Sumber"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            required
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nama}
              </option>
            ))}
          </Select>

          <Select
            label="Kategori"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Frekuensi"
              value={frekuensi}
              onChange={(e) => setFrekuensi(e.target.value)}
              required
            >
              <option value="harian">Harian</option>
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
              <option value="tahunan">Tahunan</option>
            </Select>

            <Input
              label="Setiap (Interval)"
              type="number"
              min="1"
              value={interval}
              onChange={(e) => setIntervalVal(e.target.value)}
              required
            />
          </div>

          <Input
            label="Tanggal Mulai Berlaku"
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            required
          />

          <Input
            label="Tanggal Berakhir (Opsional)"
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
          />

          <Input
            label="Catatan / Keterangan"
            placeholder="Contoh: Indihome Wi-Fi"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={createRuleMutation.isPending || updateRuleMutation.isPending}
            >
              {editingRule ? 'Simpan Perubahan' : 'Buat Aturan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Rule Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingRuleId}
        onClose={() => setDeletingRuleId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Aturan Berulang"
        message="Apakah Anda yakin ingin menghapus aturan transaksi berulang ini?"
        confirmLabel="Hapus Aturan"
        loading={deleteRuleMutation.isPending}
      />
    </div>
  )
}
