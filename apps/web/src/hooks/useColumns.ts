import { useMutation, useQueryClient } from '@tanstack/react-query'
import { columnsService } from '@/services/columns.service'
import { toast } from 'sonner'

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string; color?: string; position?: number }) =>
      columnsService.create(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: () => {
      toast.error('Erro ao criar coluna')
    },
  })
}

export function useUpdateColumn(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: { title?: string; color?: string } }) =>
      columnsService.update(columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: () => {
      toast.error('Erro ao atualizar coluna')
    },
  })
}

export function useReorderColumns(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (columns: Array<{ id: string; position: number }>) =>
      columnsService.reorder(boardId, columns),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: () => {
      toast.error('Erro ao reordenar colunas')
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })
}

export function useRemoveColumn(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: columnsService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Coluna removida')
    },
    onError: () => {
      toast.error('Erro ao remover coluna')
    },
  })
}
