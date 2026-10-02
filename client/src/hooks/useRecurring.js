import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { recurringService } from '../services/recurringService'

export function useRecurringRules() {
  return useQuery({
    queryKey: ['recurring-rules'],
    queryFn: () => recurringService.getRules(),
  })
}

export function useUpcomingBills(days = 30) {
  return useQuery({
    queryKey: ['upcoming-bills', days],
    queryFn: () => recurringService.getUpcoming(days),
  })
}

export function useCreateRecurringRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => recurringService.createRule(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Aturan berulang berhasil dibuat')
      queryClient.invalidateQueries({ queryKey: ['recurring-rules'] })
      queryClient.invalidateQueries({ queryKey: ['upcoming-bills'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal membuat aturan berulang')
    },
  })
}

export function useUpdateRecurringRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => recurringService.updateRule(id, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Aturan berulang berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['recurring-rules'] })
      queryClient.invalidateQueries({ queryKey: ['upcoming-bills'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal memperbarui aturan berulang')
    },
  })
}

export function useDeleteRecurringRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => recurringService.deleteRule(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Aturan berulang berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['recurring-rules'] })
      queryClient.invalidateQueries({ queryKey: ['upcoming-bills'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus aturan berulang')
    },
  })
}

export function useProcessDueRecurring() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => recurringService.processDue(),
    onSuccess: (res) => {
      const { created_transactions } = res.data
      toast.success(`Pemrosesan selesai. ${created_transactions} transaksi dibuat.`)
      queryClient.invalidateQueries({ queryKey: ['recurring-rules'] })
      queryClient.invalidateQueries({ queryKey: ['upcoming-bills'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menjalankan pemrosesan')
    },
  })
}
