import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { transferService } from '../services/transferService'

export function useTransfers(params = {}) {
  return useQuery({
    queryKey: ['transfers', params],
    queryFn: () => transferService.getTransfers(params),
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => transferService.createTransfer(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Transfer saldo berhasil diproses')
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal memproses transfer')
    },
  })
}
