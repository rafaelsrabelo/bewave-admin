import { api } from '@/lib/axios'

type Workspace = {
  id: string
  name: string
  createdAt: string
  members: Array<{
    userId: string
    role: string
    user: { id: string; name: string }
  }>
  boards: Array<{ id: string; name: string }>
}

type Board = {
  id: string
  name: string
  workspaceId: string
  columns: Column[]
}

type Column = {
  id: string
  title: string
  position: number
  boardId: string
  activities: Activity[]
}

type Activity = {
  id: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string | null
  position: number
  columnId: string
  createdAt: string
  assignees: Array<{
    userId: string
    user: { id: string; name: string }
  }>
}

export const boardsService = {
  async listWorkspaces() {
    const response = await api.get<{ data: Workspace[] }>('/workspaces')
    return response.data.data
  },

  async createWorkspace(data: { name: string }) {
    const response = await api.post<{ data: Workspace }>('/workspaces', data)
    return response.data.data
  },

  async listBoards(workspaceId: string) {
    const response = await api.get<{ data: Array<{ id: string; name: string }> }>(
      `/workspaces/${workspaceId}/boards`,
    )
    return response.data.data
  },

  async createBoard(workspaceId: string, data: { name: string }) {
    const response = await api.post<{ data: Board }>(
      `/workspaces/${workspaceId}/boards`,
      data,
    )
    return response.data.data
  },

  async getBoardWithColumns(boardId: string) {
    const response = await api.get<{ data: Board }>(`/boards/${boardId}`)
    return response.data.data
  },

  async createColumn(boardId: string, data: { title: string; position: number }) {
    const response = await api.post<{ data: Column }>(
      `/boards/${boardId}/columns`,
      data,
    )
    return response.data.data
  },

  async createActivity(data: { columnId: string; title: string; description?: string; priority?: string; category?: string }) {
    const response = await api.post<{ data: Activity }>('/activities', data)
    return response.data.data
  },

  async updateActivity(id: string, data: { title?: string; description?: string; priority?: string; category?: string }) {
    const response = await api.put<{ data: Activity }>(`/activities/${id}`, data)
    return response.data.data
  },

  async moveActivity(id: string, data: { columnId: string; position: number }) {
    const response = await api.patch<{ data: Activity }>(`/activities/${id}/move`, data)
    return response.data.data
  },

  async deleteActivity(id: string) {
    await api.delete(`/activities/${id}`)
  },

  async addAssignee(activityId: string, userId: string) {
    await api.post(`/activities/${activityId}/assignees`, { userId })
  },

  async removeAssignee(activityId: string, userId: string) {
    await api.delete(`/activities/${activityId}/assignees/${userId}`)
  },
}

export type { Workspace, Board, Column, Activity }
