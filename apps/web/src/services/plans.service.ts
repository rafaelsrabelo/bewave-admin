import { api } from '@/lib/axios'

export type Plan = {
  id: string
  name: string
  description: string | null
  price: number
  durationMonths: number
  period: 'monthly' | 'quarterly' | 'yearly' | 'free'
  isActive: boolean
  createdAt: string
}

type PlansResponse = {
  data: Plan[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

type PlanResponse = {
  data: Plan
}

type CreatePlanInput = {
  name: string
  description?: string
  price: number
  durationMonths: number
  period: 'monthly' | 'quarterly' | 'yearly' | 'free'
}

type UpdatePlanInput = Partial<CreatePlanInput> & { isActive?: boolean }

export const plansService = {
  async list(params?: { isActive?: string; page?: number; limit?: number }) {
    const response = await api.get<PlansResponse>('/plans', { params })
    return response.data
  },

  async getById(id: string) {
    const response = await api.get<PlanResponse>(`/plans/${id}`)
    return response.data.data
  },

  async create(data: CreatePlanInput) {
    const response = await api.post<PlanResponse>('/plans', data)
    return response.data.data
  },

  async update(id: string, data: UpdatePlanInput) {
    const response = await api.put<PlanResponse>(`/plans/${id}`, data)
    return response.data.data
  },

  async deactivate(id: string) {
    await api.delete(`/plans/${id}`)
  },
}
