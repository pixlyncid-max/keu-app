import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { walletService } from '../services/walletService'

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletService.getWallets(),
  })
}

export function useCreateWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => walletService.createWallet(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Dompet berhasil dibuat')
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal membuat dompet')
    },
  })
}

export function useUpdateWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => walletService.updateWallet(id, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Dompet berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal memperbarui dompet')
    },
  })
}

export function useDeleteWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => walletService.deleteWallet(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Dompet berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus dompet')
    },
  })
}

export function useArchiveWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, archive }) =>
      archive ? walletService.archiveWallet(id) : walletService.unarchiveWallet(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Status dompet diperbarui')
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal mengarsipkan dompet')
    },
  })
}
