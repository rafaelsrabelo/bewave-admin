import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeService } from '@/services/finance.service'
import { toast } from 'sonner'

export function useFinanceEntries(params?: { page?: number; limit?: number; type?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['finance', 'entries', params],
    queryFn: () => financeService.list(params),
  })
}

export function useFinanceSummary(params: { dateFrom: string; dateTo: string }) {
  return useQuery({
    queryKey: ['finance', 'summary', params],
    queryFn: () => financeService.getSummary(params),
    enabled: !!params.dateFrom && !!params.dateTo,
  })
}

export function useCreateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: financeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] })
      toast.success('Lançamento criado')
    },
    onError: () => {
      toast.error('Erro ao criar lançamento')
    },
  })
}

export function useRemoveEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: financeService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] })
      toast.success('Lançamento removido')
    },
    onError: () => {
      toast.error('Erro ao remover lançamento')
    },
  })
}
