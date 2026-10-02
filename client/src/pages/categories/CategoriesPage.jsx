import React, { useState } from 'react'
import { Edit2, Lock, Plus, Tag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/useCategories'

export function CategoriesPage() {
  const [tipeTab, setTipeTab] = useState('pengeluaran')
  const { data: categoriesRes, isLoading } = useCategories(tipeTab)
  const categories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : []

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deletingCatId, setDeletingCatId] = useState(null)

  // Form State
  const [nama, setNama] = useState('')
  const [tipe, setTipe] = useState('pengeluaran')
  const [warna, setWarna] = useState('#10b981')
  const [ikon, setIkon] = useState('tag')

  const createCatMutation = useCreateCategory()
  const updateCatMutation = useUpdateCategory()
  const deleteCatMutation = useDeleteCategory()

  const handleOpenCreateModal = () => {
    setEditingCategory(null)
    setNama('')
    setTipe(tipeTab)
    setWarna('#10b981')
    setIkon('tag')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (c) => {
    setEditingCategory(c)
    setNama(c.nama)
    setTipe(c.tipe)
    setWarna(c.warna || '#10b981')
    setIkon(c.ikon || 'tag')
    setIsModalOpen(true)
  }

  const handleSubmitForm = (e) => {
    e.preventDefault()
    if (!nama) return

    const payload = { nama, tipe, warna, ikon }

    if (editingCategory) {
      updateCatMutation.mutate(
        { id: editingCategory.id, data: payload },
        { onSuccess: () => setIsModalOpen(false) }
      )
    } else {
      createCatMutation.mutate(payload, {
        onSuccess: () => setIsModalOpen(false),
      })
    }
  }

  const handleConfirmDelete = () => {
    if (deletingCatId) {
      deleteCatMutation.mutate(deletingCatId, {
        onSuccess: () => setDeletingCatId(null),
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
            Kelola Kategori
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Daftar kategori untuk klasifikasi transaksi Anda
          </p>
        </div>

        <Button size="sm" icon={Plus} onClick={handleOpenCreateModal}>
          Tambah Kategori
        </Button>
      </div>

      {/* Tipe Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800">
        <button
          onClick={() => setTipeTab('pengeluaran')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
            tipeTab === 'pengeluaran'
              ? 'border-danger-500 text-danger-500'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Pengeluaran (-)
        </button>
        <button
          onClick={() => setTipeTab('pemasukan')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
            tipeTab === 'pemasukan'
              ? 'border-success-500 text-success-600 dark:text-success-400'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Pemasukan (+)
        </button>
      </div>

      {/* Grid Kategori */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Belum Ada Kategori"
          description="Tambahkan kategori custom untuk pengelompokan yang lebih spesifik."
          actionLabel="Tambah Kategori"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((c) => (
            <Card key={c.id} className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm"
                  style={{ backgroundColor: c.warna || '#10b981' }}
                >
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-1.5">
                    <span>{c.nama}</span>
                    {c.is_default && (
                      <span title="Kategori Default Sistem">
                        <Lock className="w-3 h-3 text-surface-400" />
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] text-surface-400 uppercase font-mono">{c.tipe}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(c)}
                  className="p-1.5 text-surface-400 hover:text-primary-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {!c.is_default && (
                  <button
                    onClick={() => setDeletingCatId(c.id)}
                    className="p-1.5 text-surface-400 hover:text-danger-500 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form Kategori */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Nama Kategori"
            placeholder="Contoh: Belanja Bulanan / Kopi & Nongkrong"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Tipe Kategori"
            value={tipe}
            onChange={(e) => setTipe(e.target.value)}
            disabled={!!editingCategory}
            required
          >
            <option value="pengeluaran">Pengeluaran (-)</option>
            <option value="pemasukan">Pemasukan (+)</option>
          </Select>

          <div>
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1 block">
              Warna Hex
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
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={createCatMutation.isPending || updateCatMutation.isPending}
            >
              {editingCategory ? 'Simpan Perubahan' : 'Buat Kategori'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCatId}
        onClose={() => setDeletingCatId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori custom ini?"
        confirmLabel="Hapus Kategori"
        loading={deleteCatMutation.isPending}
      />
    </div>
  )
}
