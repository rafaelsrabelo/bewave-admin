import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsService } from '@/services/payments.service'
import { toast } from 'sonner'

export function usePayments(params?: { clientId?: string; status?: string }) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsService.list(params),
    enabled: !!params?.clientId,
  })
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'paid' | 'pending' }) =>
      paymentsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Status de pagamento atualizado')
    },
    onError: () => {
      toast.error('Erro ao atualizar pagamento')
    },
  })
}

export function useGeneratePayments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, months }: { clientId: string; months: number }) =>
      paymentsService.generate(clientId, months),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Pagamentos gerados com sucesso')
    },
    onError: () => {
      toast.error('Erro ao gerar pagamentos')
    },
  })
}
