import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsService } from '@/services/comments.service'
import { toast } from 'sonner'

export function useComments(activityId: string | null) {
  return useQuery({
    queryKey: ['comments', activityId],
    queryFn: () => commentsService.list(activityId!),
    enabled: !!activityId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, content }: { activityId: string; content: string }) =>
      commentsService.create(activityId, content),
    onSuccess: (_, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', activityId] })
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] })
    },
    onError: () => {
      toast.error('Erro ao criar comentário')
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, content, activityId }: { commentId: string; content: string; activityId: string }) =>
      commentsService.update(commentId, content),
    onSuccess: (_, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', activityId] })
    },
    onError: () => {
      toast.error('Erro ao editar comentário')
    },
  })
}

export function useRemoveComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, activityId }: { commentId: string; activityId: string }) =>
      commentsService.remove(commentId),
    onSuccess: (_, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', activityId] })
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] })
    },
    onError: () => {
      toast.error('Erro ao remover comentário')
    },
  })
}
