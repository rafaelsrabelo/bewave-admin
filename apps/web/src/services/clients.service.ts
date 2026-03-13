import { api } from '@/lib/axios'

type Client = {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  contractMonths: number
  paid: boolean
  status: 'lead' | 'active'
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
  contractMonths?: number
  paid?: boolean
  status?: 'lead' | 'active'
}

type UpdateClientInput = Partial<CreateClientInput>

export const clientsService = {
  async list(params?: { page?: number; limit?: number; status?: string; paid?: string }) {
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
