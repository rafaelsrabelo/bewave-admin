import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activitiesService } from '@/services/activities.service'
import type { CreateActivityInput, UpdateActivityInput } from '@/services/activities.service'
import { toast } from 'sonner'

export function useMyActivities(params?: { isCompleted?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ['my-activities', params],
    queryFn: () => activitiesService.listMine(params),
    staleTime: 30 * 1000,
  })
}

export function useActivity(activityId: string | null) {
  return useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => activitiesService.getById(activityId!),
    enabled: !!activityId,
  })
}

export function useCreateActivity(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateActivityInput) => activitiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: () => {
      toast.error('Erro ao criar atividade')
    },
  })
}

export function useUpdateActivity(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, data }: { activityId: string; data: UpdateActivityInput }) =>
      activitiesService.update(activityId, data),
    onSuccess: (_, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] })
    },
    onError: () => {
      toast.error('Erro ao atualizar atividade')
    },
  })
}

export function useMoveActivity(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, data }: { activityId: string; data: { columnId: string; position: number } }) =>
      activitiesService.move(activityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: () => {
      toast.error('Erro ao mover atividade')
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })
}

export function useToggleComplete(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, isCompleted }: { activityId: string; isCompleted: boolean }) =>
      activitiesService.toggleComplete(activityId, isCompleted),
    onSuccess: (_, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] })
    },
    onError: () => {
      toast.error('Erro ao atualizar status')
    },
  })
}

export function useRemoveActivity(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: activitiesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Atividade removida')
    },
    onError: () => {
      toast.error('Erro ao remover atividade')
    },
  })
}

export function useAddAssignee(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, userId }: { activityId: string; userId: string }) =>
      activitiesService.addAssignee(activityId, userId),
    onSuccess: (_, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] })
    },
    onError: () => {
      toast.error('Erro ao adicionar responsável')
    },
  })
}

export function useRemoveAssignee(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, userId }: { activityId: string; userId: string }) =>
      activitiesService.removeAssignee(activityId, userId),
    onSuccess: (_, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] })
    },
    onError: () => {
      toast.error('Erro ao remover responsável')
    },
  })
}
