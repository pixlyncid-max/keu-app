import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { transactionService } from '../services/transactionService'

export function useTransactions(params = {}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.getTransactions(params),
  })
}

export function useTransactionSummary(params = {}) {
  return useQuery({
    queryKey: ['transaction-summary', params],
    queryFn: () => transactionService.getSummary(params),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => transactionService.createTransaction(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Transaksi berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
      queryClient.invalidateQueries({ queryKey: ['reports-categories'] })
      queryClient.invalidateQueries({ queryKey: ['reports-monthly-trend'] })
      queryClient.invalidateQueries({ queryKey: ['budgets-summary'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan transaksi')
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => transactionService.updateTransaction(id, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Transaksi berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
      queryClient.invalidateQueries({ queryKey: ['reports-categories'] })
      queryClient.invalidateQueries({ queryKey: ['reports-monthly-trend'] })
      queryClient.invalidateQueries({ queryKey: ['budgets-summary'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui transaksi')
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => transactionService.deleteTransaction(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Transaksi berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
      queryClient.invalidateQueries({ queryKey: ['reports-categories'] })
      queryClient.invalidateQueries({ queryKey: ['reports-monthly-trend'] })
      queryClient.invalidateQueries({ queryKey: ['budgets-summary'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus transaksi')
    },
  })
}
