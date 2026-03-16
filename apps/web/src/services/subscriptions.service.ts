import { api } from '@/lib/axios'

export type SubscriptionPayment = {
  id: string
  subscriptionId: string
  month: number
  dueDate: string
  paidAt: string | null
  amount: number
  notes: string | null
  financeEntryId: string | null
  createdAt: string
}

export type Subscription = {
  id: string
  clientId: string
  planId: string
  startDate: string
  endDate: string
  status: 'active' | 'overdue' | 'completed' | 'cancelled'
  notes: string | null
  createdAt: string
  plan: {
    id: string
    name: string
    price: number
    durationMonths: number
  }
  client?: { id: string; name: string }
  payments: SubscriptionPayment[]
  paidCount?: number
  totalCount?: number
}

type CreateSubscriptionInput = {
  clientId: string
  planId: string
  startDate: string
  notes?: string
}

type MarkPaidInput = {
  paidAt?: string
  amount?: number
  notes?: string
  createFinanceEntry?: boolean
}

export const subscriptionsService = {
  async create(data: CreateSubscriptionInput) {
    const response = await api.post<{ data: Subscription }>('/subscriptions', data)
    return response.data.data
  },

  async listByClient(clientId: string) {
    const response = await api.get<{ data: Subscription[] }>(`/clients/${clientId}/subscriptions`)
    return response.data.data
  },

  async getDetails(id: string) {
    const response = await api.get<{ data: Subscription }>(`/subscriptions/${id}`)
    return response.data.data
  },

  async markPaid(subscriptionId: string, paymentId: string, data: MarkPaidInput) {
    const response = await api.patch<{ data: SubscriptionPayment }>(
      `/subscriptions/${subscriptionId}/payments/${paymentId}/pay`,
      data,
    )
    return response.data.data
  },

  async unmarkPaid(subscriptionId: string, paymentId: string) {
    const response = await api.patch<{ data: SubscriptionPayment }>(
      `/subscriptions/${subscriptionId}/payments/${paymentId}/unpay`,
    )
    return response.data.data
  },

  async cancel(id: string, notes?: string) {
    await api.patch(`/subscriptions/${id}/cancel`, { notes })
  },
}
