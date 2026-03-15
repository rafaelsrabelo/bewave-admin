import { api } from '@/lib/axios'
import type { Column } from './boards.service'

export const columnsService = {
  async list(boardId: string) {
    const response = await api.get<{ data: Column[] }>(`/boards/${boardId}/columns`)
    return response.data.data
  },

  async create(boardId: string, data: { title: string; color?: string; position?: number }) {
    const response = await api.post<{ data: Column }>(`/boards/${boardId}/columns`, data)
    return response.data.data
  },

  async update(columnId: string, data: { title?: string; color?: string }) {
    const response = await api.put<{ data: Column }>(`/columns/${columnId}`, data)
    return response.data.data
  },

  async reorder(boardId: string, columns: Array<{ id: string; position: number }>) {
    await api.patch(`/boards/${boardId}/columns/reorder`, { columns })
  },

  async remove(columnId: string) {
    await api.delete(`/columns/${columnId}`)
  },
}
