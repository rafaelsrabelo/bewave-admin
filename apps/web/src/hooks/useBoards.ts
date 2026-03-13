import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardsService } from '@/services/boards.service'
import { toast } from 'sonner'

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: boardsService.listWorkspaces,
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: boardsService.createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success('Workspace criado')
    },
    onError: () => {
      toast.error('Erro ao criar workspace')
    },
  })
}

export function useCreateBoard(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string }) => boardsService.createBoard(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success('Board criado')
    },
    onError: () => {
      toast.error('Erro ao criar board')
    },
  })
}

export function useBoardWithColumns(boardId: string) {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardsService.getBoardWithColumns(boardId),
    enabled: !!boardId,
  })
}

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string; position: number }) =>
      boardsService.createColumn(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: () => {
      toast.error('Erro ao criar coluna')
    },
  })
}

export function useCreateActivity(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: boardsService.createActivity,
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
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof boardsService.updateActivity>[1] }) =>
      boardsService.updateActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: () => {
      toast.error('Erro ao atualizar atividade')
    },
  })
}

export function useMoveActivity(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { columnId: string; position: number } }) =>
      boardsService.moveActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: () => {
      toast.error('Erro ao mover atividade')
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })
}

export function useDeleteActivity(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: boardsService.deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Atividade removida')
    },
    onError: () => {
      toast.error('Erro ao remover atividade')
    },
  })
}
