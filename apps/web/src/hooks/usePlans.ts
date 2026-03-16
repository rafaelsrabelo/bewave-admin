import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { plansService } from '@/services/plans.service'
import { toast } from 'sonner'

export function usePlans(params?: { isActive?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['plans', params],
    queryFn: () => plansService.list(params),
  })
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: () => plansService.getById(id),
    enabled: !!id,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: plansService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success('Plano criado com sucesso')
      navigate('/plans')
    },
    onError: () => {
      toast.error('Erro ao criar plano')
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof plansService.update>[1] }) =>
      plansService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success('Plano atualizado com sucesso')
      navigate('/plans')
    },
    onError: () => {
      toast.error('Erro ao atualizar plano')
    },
  })
}

export function useDeactivatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: plansService.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success('Plano desativado')
    },
    onError: () => {
      toast.error('Erro ao desativar plano')
    },
  })
}
