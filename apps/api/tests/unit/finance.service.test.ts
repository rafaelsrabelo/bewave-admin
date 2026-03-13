import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    financeEntry: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { FinanceService } from '../../src/modules/finance/finance.service.js'
import { prisma } from '../../src/lib/prisma.js'

const mockEntry = {
  id: 'fin-1',
  type: 'income' as const,
  amount: 150000,
  description: 'Mensalidade',
  category: 'Mensalidade',
  date: new Date('2026-03-01'),
  createdAt: new Date(),
}

describe('FinanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should return paginated entries', async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockEntry], 1])

      const result = await FinanceService.list({ page: 1, limit: 20 })

      expect(result.items).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })
  })

  describe('create', () => {
    it('should create finance entry', async () => {
      vi.mocked(prisma.financeEntry.create).mockResolvedValue(mockEntry)

      const result = await FinanceService.create({
        type: 'income',
        amount: 150000,
        description: 'Mensalidade',
        category: 'Mensalidade',
        date: '2026-03-01',
      })

      expect(result.amount).toBe(150000)
    })
  })

  describe('remove', () => {
    it('should delete entry', async () => {
      vi.mocked(prisma.financeEntry.delete).mockResolvedValue(mockEntry)

      await FinanceService.remove('fin-1')

      expect(prisma.financeEntry.delete).toHaveBeenCalledWith({
        where: { id: 'fin-1' },
      })
    })
  })

  describe('getSummary', () => {
    it('should return income, expense and balance', async () => {
      vi.mocked(prisma.financeEntry.findMany).mockResolvedValue([
        { type: 'income', amount: 150000 } as never,
        { type: 'income', amount: 100000 } as never,
        { type: 'expense', amount: 50000 } as never,
      ])

      const result = await FinanceService.getSummary({
        dateFrom: '2026-03-01',
        dateTo: '2026-03-31',
      })

      expect(result.totalIncome).toBe(250000)
      expect(result.totalExpense).toBe(50000)
      expect(result.balance).toBe(200000)
      expect(result.period.from).toBe('2026-03-01')
    })

    it('should return zero when no entries', async () => {
      vi.mocked(prisma.financeEntry.findMany).mockResolvedValue([])

      const result = await FinanceService.getSummary({
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      })

      expect(result.totalIncome).toBe(0)
      expect(result.totalExpense).toBe(0)
      expect(result.balance).toBe(0)
    })
  })
})
