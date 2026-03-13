import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { clientsService } from '@/services/clients.service'
import { toast } from 'sonner'

export function useClients(params?: { page?: number; limit?: number; status?: string; paid?: string }) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => clientsService.list(params),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: clientsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente criado com sucesso')
      navigate('/clients')
    },
    onError: () => {
      toast.error('Erro ao criar cliente')
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof clientsService.update>[1] }) =>
      clientsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente atualizado com sucesso')
      navigate('/clients')
    },
    onError: () => {
      toast.error('Erro ao atualizar cliente')
    },
  })
}

export function useRemoveClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clientsService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente removido')
    },
    onError: () => {
      toast.error('Erro ao remover cliente')
    },
  })
}
