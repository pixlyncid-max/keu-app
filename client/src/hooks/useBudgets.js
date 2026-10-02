import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { budgetService } from '../services/budgetService'

export function useBudgetSummary(bulan = null) {
  return useQuery({
    queryKey: ['budgets-summary', bulan],
    queryFn: () => budgetService.getSummary(bulan ? { bulan } : {}),
  })
}

export function useSetBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => budgetService.setBudget(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Anggaran berhasil diatur')
      queryClient.invalidateQueries({ queryKey: ['budgets-summary'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal mengatur anggaran')
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => budgetService.deleteBudget(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Anggaran berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['budgets-summary'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus anggaran')
    },
  })
}
