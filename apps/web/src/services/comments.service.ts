import { api } from '@/lib/axios'

type Comment = {
  id: string
  content: string
  activityId: string
  userId: string
  createdAt: string
  updatedAt: string
  user: { id: string; name: string }
}

export const commentsService = {
  async list(activityId: string) {
    const response = await api.get<{ data: Comment[] }>(`/activities/${activityId}/comments`)
    return response.data.data
  },

  async create(activityId: string, content: string) {
    const response = await api.post<{ data: Comment }>(`/activities/${activityId}/comments`, { content })
    return response.data.data
  },

  async update(commentId: string, content: string) {
    const response = await api.put<{ data: Comment }>(`/comments/${commentId}`, { content })
    return response.data.data
  },

  async remove(commentId: string) {
    await api.delete(`/comments/${commentId}`)
  },
}

export type { Comment }
