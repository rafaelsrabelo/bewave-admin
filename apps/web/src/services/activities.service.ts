import { api } from '@/lib/axios'
import type { Activity } from './boards.service'

type CreateActivityInput = {
  columnId: string
  title: string
  description?: string
  priority?: string
  category?: string
  dueDate?: string
  tags?: string[]
  assigneeIds?: string[]
  coverColor?: string
}

type UpdateActivityInput = {
  title?: string
  description?: string
  priority?: string
  category?: string
  dueDate?: string | null
  tags?: string[]
  coverColor?: string | null
  assigneeIds?: string[]
}

export const activitiesService = {
  async getById(activityId: string) {
    const response = await api.get<{ data: Activity }>(`/activities/${activityId}`)
    return response.data.data
  },

  async create(data: CreateActivityInput) {
    const response = await api.post<{ data: Activity }>('/activities', data)
    return response.data.data
  },

  async update(activityId: string, data: UpdateActivityInput) {
    const response = await api.put<{ data: Activity }>(`/activities/${activityId}`, data)
    return response.data.data
  },

  async move(activityId: string, data: { columnId: string; position: number }) {
    const response = await api.patch<{ data: Activity }>(`/activities/${activityId}/move`, data)
    return response.data.data
  },

  async toggleComplete(activityId: string, isCompleted: boolean) {
    const response = await api.patch<{ data: Activity }>(`/activities/${activityId}/complete`, { isCompleted })
    return response.data.data
  },

  async remove(activityId: string) {
    await api.delete(`/activities/${activityId}`)
  },

  async addAssignee(activityId: string, userId: string) {
    const response = await api.post(`/activities/${activityId}/assignees`, { userId })
    return response.data.data
  },

  async removeAssignee(activityId: string, userId: string) {
    await api.delete(`/activities/${activityId}/assignees/${userId}`)
  },

  async listMine(params?: { isCompleted?: boolean; limit?: number }) {
    const response = await api.get<{ data: Activity[] }>('/activities', { params })
    return response.data.data
  },
}

export type { CreateActivityInput, UpdateActivityInput }
