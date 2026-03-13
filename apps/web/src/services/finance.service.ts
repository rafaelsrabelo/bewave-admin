import { api } from '@/lib/axios'

type FinanceEntry = {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  createdAt: string
}

type FinanceListResponse = {
  data: FinanceEntry[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

type FinanceSummary = {
  totalIncome: number
  totalExpense: number
  balance: number
  period: { from: string; to: string }
}

type CreateEntryInput = {
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
}

export const financeService = {
  async list(params?: { page?: number; limit?: number; type?: string; dateFrom?: string; dateTo?: string }) {
    const response = await api.get<FinanceListResponse>('/finance/entries', { params })
    return response.data
  },

  async create(data: CreateEntryInput) {
    const response = await api.post<{ data: FinanceEntry }>('/finance/entries', data)
    return response.data.data
  },

  async remove(id: string) {
    await api.delete(`/finance/entries/${id}`)
  },

  async getSummary(params: { dateFrom: string; dateTo: string }) {
    const response = await api.get<{ data: FinanceSummary }>('/finance/summary', { params })
    return response.data.data
  },
}

export type { FinanceEntry, FinanceSummary }
