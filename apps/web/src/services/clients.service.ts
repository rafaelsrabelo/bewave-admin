import { api } from '@/lib/axios'
import type { Plan } from '@/services/plans.service'

export type Client = {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  status: 'lead' | 'active'
  planId: string | null
  plan: Pick<Plan, 'id' | 'name' | 'price' | 'period'> | null
  payments: Array<{ id: string; status: 'paid' | 'pending'; referenceMonth: string }>
  subscriptions?: Array<{
    id: string
    status: 'active' | 'overdue' | 'completed' | 'cancelled'
    plan: { id: string; name: string }
  }>
  createdAt: string
  deletedAt: string | null
}

type ClientsResponse = {
  data: Client[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

type ClientResponse = {
  data: Client
}

type CreateClientInput = {
  name: string
  address?: string
  phone?: string
  email?: string
  status?: 'lead' | 'active'
  planId?: string
}

type UpdateClientInput = Partial<CreateClientInput> & { planId?: string | null }

export const clientsService = {
  async list(params?: { page?: number; limit?: number; status?: string }) {
    const response = await api.get<ClientsResponse>('/clients', { params })
    return response.data
  },

  async getById(id: string) {
    const response = await api.get<ClientResponse>(`/clients/${id}`)
    return response.data.data
  },

  async create(data: CreateClientInput) {
    const response = await api.post<ClientResponse>('/clients', data)
    return response.data.data
  },

  async update(id: string, data: UpdateClientInput) {
    const response = await api.put<ClientResponse>(`/clients/${id}`, data)
    return response.data.data
  },

  async remove(id: string) {
    await api.delete(`/clients/${id}`)
  },
}
