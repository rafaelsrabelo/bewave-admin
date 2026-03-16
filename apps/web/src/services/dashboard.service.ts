import { api } from '@/lib/axios'

type ClientsResponse = {
  data: Array<{ id: string; status: string; planId: string | null }>
  meta: { total: number }
}

type FinanceSummaryResponse = {
  data: {
    totalIncome: number
    totalExpense: number
    balance: number
    period: { from: string; to: string }
  }
}

type ActivitiesResponse = {
  data: Array<{
    id: string
    title: string
    priority: string
    createdAt: string
    column: { title: string }
  }>
}

type PaymentsResponse = {
  data: Array<{ id: string; status: string }>
}

export const dashboardService = {
  async getClientsStats() {
    const [clientsRes, paymentsRes] = await Promise.all([
      api.get<ClientsResponse>('/clients', { params: { limit: 999 } }),
      api.get<PaymentsResponse>('/payments', { params: { status: undefined } }),
    ])
    const clients = clientsRes.data.data
    const payments = paymentsRes.data.data
    const active = clients.filter((c) => c.status === 'active')
    const leads = clients.filter((c) => c.status === 'lead')
    const paid = payments.filter((p) => p.status === 'paid')
    const pending = payments.filter((p) => p.status === 'pending')

    return {
      totalActive: active.length,
      totalLeads: leads.length,
      totalPaid: paid.length,
      totalPending: pending.length,
    }
  },

  async getFinanceSummary() {
    const now = new Date()
    const dateFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const dateTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`

    const response = await api.get<FinanceSummaryResponse>('/finance/summary', {
      params: { dateFrom, dateTo },
    })
    return response.data.data
  },

  async getRecentActivities() {
    const response = await api.get<ActivitiesResponse>('/activities', {
      params: { limit: 5 },
    })
    return response.data.data
  },
}
