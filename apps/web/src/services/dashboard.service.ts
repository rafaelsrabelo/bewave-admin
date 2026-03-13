import { api } from '@/lib/axios'

type ClientsResponse = {
  data: Array<{ id: string; status: string; paid: boolean }>
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

export const dashboardService = {
  async getClientsStats() {
    const response = await api.get<ClientsResponse>('/clients', {
      params: { limit: 999 },
    })
    const clients = response.data.data
    const active = clients.filter((c) => c.status === 'active')
    const leads = clients.filter((c) => c.status === 'lead')
    const paid = active.filter((c) => c.paid)
    const pending = active.filter((c) => !c.paid)

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
