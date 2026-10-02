import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { savingsService } from '../services/savingsService'

export function useSavingsGoals() {
  return useQuery({
    queryKey: ['savings-goals'],
    queryFn: () => savingsService.getGoals(),
  })
}

export function useSavingsGoal(id) {
  return useQuery({
    queryKey: ['savings-goal', id],
    queryFn: () => savingsService.getGoal(id),
    enabled: !!id,
  })
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => savingsService.createGoal(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Target tabungan berhasil dibuat')
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal membuat target tabungan')
    },
  })
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => savingsService.updateGoal(id, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Target tabungan berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['savings-goal'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal memperbarui target tabungan')
    },
  })
}

export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => savingsService.deleteGoal(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Target tabungan berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus target tabungan')
    },
  })
}

export function useAddSavingsContribution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ goalId, data }) => savingsService.addContribution(goalId, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Setoran tabungan berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['savings-goal'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
      queryClient.invalidateQueries({ queryKey: ['reports-monthly-trend'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menambahkan setoran tabungan')
    },
  })
}
