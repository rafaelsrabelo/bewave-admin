export type FinanceType = 'income' | 'expense'

export type FinanceEntry = {
  id: string
  type: FinanceType
  amount: number
  description: string
  category: string | null
  date: string
  createdAt: string
}
