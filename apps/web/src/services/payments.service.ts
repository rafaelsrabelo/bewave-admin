import { api } from '@/lib/axios'

export type Payment = {
  id: string
  clientId: string
  amount: number
  referenceMonth: string
  status: 'paid' | 'pending'
  paidAt: string | null
  createdAt: string
  client: { id: string; name: string }
}

type PaymentsResponse = {
  data: Payment[]
}

type PaymentResponse = {
  data: Payment
}

export const paymentsService = {
  async list(params?: { clientId?: string; status?: string }) {
    const response = await api.get<PaymentsResponse>('/payments', { params })
    return response.data.data
  },

  async updateStatus(id: string, status: 'paid' | 'pending') {
    const response = await api.patch<PaymentResponse>(`/payments/${id}/status`, { status })
    return response.data.data
  },

  async generate(clientId: string, months: number) {
    const response = await api.post<{ data: Payment[] }>('/payments/generate', { clientId, months })
    return response.data.data
  },

  async remove(id: string) {
    await api.delete(`/payments/${id}`)
  },
}
