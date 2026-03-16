import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionsService } from '@/services/subscriptions.service'
import { toast } from 'sonner'

export function useClientSubscriptions(clientId: string) {
  return useQuery({
    queryKey: ['subscriptions', 'client', clientId],
    queryFn: () => subscriptionsService.listByClient(clientId),
    enabled: !!clientId,
  })
}

export function useSubscriptionDetails(id: string) {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => subscriptionsService.getDetails(id),
    enabled: !!id,
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionsService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Assinatura criada com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar assinatura')
    },
  })
}

export function useMarkPaid(subscriptionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: Parameters<typeof subscriptionsService.markPaid>[2] }) =>
      subscriptionsService.markPaid(subscriptionId, paymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', subscriptionId] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'client'] })
      toast.success('Pagamento marcado como pago')
    },
    onError: () => {
      toast.error('Erro ao marcar pagamento')
    },
  })
}

export function useUnmarkPaid(subscriptionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentId: string) =>
      subscriptionsService.unmarkPaid(subscriptionId, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', subscriptionId] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'client'] })
      toast.success('Pagamento desmarcado')
    },
    onError: () => {
      toast.error('Erro ao desmarcar pagamento')
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      subscriptionsService.cancel(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Assinatura cancelada')
    },
    onError: () => {
      toast.error('Erro ao cancelar assinatura')
    },
  })
}
