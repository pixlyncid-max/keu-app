import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoryService } from '../services/categoryService'

export function useCategories(tipe = null) {
  return useQuery({
    queryKey: ['categories', { tipe }],
    queryFn: () => categoryService.getCategories(tipe ? { tipe } : {}),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => categoryService.createCategory(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Kategori berhasil dibuat')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal membuat kategori')
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Kategori berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal memperbarui kategori')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Kategori berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus kategori')
    },
  })
}
