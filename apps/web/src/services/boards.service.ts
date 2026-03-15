import { api } from '@/lib/axios'

type BoardMember = {
  boardId: string
  userId: string
  role: string
  user: { id: string; name: string; email: string }
}

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
  description: string | null
  color: string | null
  icon: string | null
  workspaceId: string
  columns: Column[]
  members: BoardMember[]
  _count?: { members: number; columns: number }
}

type Column = {
  id: string
  title: string
  position: number
  color: string | null
  boardId: string
  activities: Activity[]
  _count?: { activities: number }
}

type Activity = {
  id: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string | null
  position: number
  columnId: string
  dueDate: string | null
  completedAt: string | null
  isCompleted: boolean
  coverColor: string | null
  tags: string[]
  createdAt: string
  assignees: Array<{
    userId: string
    user: { id: string; name: string }
  }>
  _count?: { comments: number }
  comments?: Array<{
    id: string
    content: string
    createdAt: string
    user: { id: string; name: string }
  }>
  column?: { id: string; title: string; boardId: string }
}

export const boardsService = {
  // Workspaces
  async listWorkspaces() {
    const response = await api.get<{ data: Workspace[] }>('/workspaces')
    return response.data.data
  },

  async createWorkspace(data: { name: string }) {
    const response = await api.post<{ data: Workspace }>('/workspaces', data)
    return response.data.data
  },

  // Boards
  async listMyBoards() {
    const response = await api.get<{ data: Board[] }>('/boards')
    return response.data.data
  },

  async listBoards(workspaceId: string) {
    const response = await api.get<{ data: Board[] }>('/boards', {
      params: { workspaceId },
    })
    return response.data.data
  },

  async getById(boardId: string) {
    const response = await api.get<{ data: Board }>(`/boards/${boardId}`)
    return response.data.data
  },

  async createBoard(data: { name: string; description?: string; color?: string; icon?: string; workspaceId: string }) {
    const response = await api.post<{ data: Board }>('/boards', data)
    return response.data.data
  },

  async updateBoard(boardId: string, data: { name?: string; description?: string; color?: string; icon?: string }) {
    const response = await api.put<{ data: Board }>(`/boards/${boardId}`, data)
    return response.data.data
  },

  async removeBoard(boardId: string) {
    await api.delete(`/boards/${boardId}`)
  },

  // Board Members
  async listMembers(boardId: string) {
    const response = await api.get<{ data: BoardMember[] }>(`/boards/${boardId}/members`)
    return response.data.data
  },

  async addMember(boardId: string, userId: string, role?: string) {
    const response = await api.post<{ data: BoardMember }>(`/boards/${boardId}/members`, { userId, role })
    return response.data.data
  },

  async updateMemberRole(boardId: string, userId: string, role: string) {
    const response = await api.put<{ data: BoardMember }>(`/boards/${boardId}/members/${userId}`, { userId, role })
    return response.data.data
  },

  async removeMember(boardId: string, userId: string) {
    await api.delete(`/boards/${boardId}/members/${userId}`)
  },
}

export type { Workspace, Board, Column, Activity, BoardMember }
