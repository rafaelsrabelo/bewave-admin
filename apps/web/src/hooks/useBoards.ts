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

export function useBoards(workspaceId: string) {
  return useQuery({
    queryKey: ['boards', workspaceId],
    queryFn: () => boardsService.listBoards(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardsService.getById(boardId),
    enabled: !!boardId,
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: boardsService.createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      toast.success('Board criado')
    },
    onError: () => {
      toast.error('Erro ao criar board')
    },
  })
}

export function useUpdateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: Parameters<typeof boardsService.updateBoard>[1] }) =>
      boardsService.updateBoard(boardId, data),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Board atualizado')
    },
    onError: () => {
      toast.error('Erro ao atualizar board')
    },
  })
}

export function useRemoveBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: boardsService.removeBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      toast.success('Board removido')
    },
    onError: () => {
      toast.error('Erro ao remover board')
    },
  })
}

export function useBoardMembers(boardId: string) {
  return useQuery({
    queryKey: ['board-members', boardId],
    queryFn: () => boardsService.listMembers(boardId),
    enabled: !!boardId,
  })
}

export function useAddBoardMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, userId, role }: { boardId: string; userId: string; role?: string }) =>
      boardsService.addMember(boardId, userId, role),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['board-members', boardId] })
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Membro adicionado')
    },
    onError: () => {
      toast.error('Erro ao adicionar membro')
    },
  })
}

export function useUpdateBoardMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, userId, role }: { boardId: string; userId: string; role: string }) =>
      boardsService.updateMemberRole(boardId, userId, role),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['board-members', boardId] })
      toast.success('Role atualizada')
    },
    onError: () => {
      toast.error('Erro ao atualizar role')
    },
  })
}

export function useRemoveBoardMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, userId }: { boardId: string; userId: string }) =>
      boardsService.removeMember(boardId, userId),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['board-members', boardId] })
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Membro removido')
    },
    onError: () => {
      toast.error('Erro ao remover membro')
    },
  })
}
