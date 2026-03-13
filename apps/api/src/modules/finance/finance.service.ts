import { prisma } from '../../lib/prisma.js'
import { getPagination, buildMeta } from '../../shared/utils/pagination.js'
import type {
  CreateFinanceEntryInput,
  ListFinanceEntriesInput,
  SummaryInput,
} from './finance.schema.js'

export class FinanceService {
  static async list(filters: ListFinanceEntriesInput) {
    const { skip, take } = getPagination(filters)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20

    const where = {
      ...(filters.type && { type: filters.type }),
      ...(filters.category && { category: filters.category }),
      ...(filters.dateFrom && {
        date: {
          ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
          ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
        },
      }),
    }

    const [items, total] = await prisma.$transaction([
      prisma.financeEntry.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
      }),
      prisma.financeEntry.count({ where }),
    ])

    return { items, meta: buildMeta(page, limit, total) }
  }

  static async create(data: CreateFinanceEntryInput) {
    return prisma.financeEntry.create({
      data: {
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: new Date(data.date),
      },
    })
  }

  static async remove(id: string) {
    await prisma.financeEntry.delete({
      where: { id },
    })
  }

  static async getSummary(filters: SummaryInput) {
    const dateFrom = new Date(filters.dateFrom)
    const dateTo = new Date(filters.dateTo)

    const entries = await prisma.financeEntry.findMany({
      where: {
        date: { gte: dateFrom, lte: dateTo },
      },
      select: { type: true, amount: true },
    })

    const totalIncome = entries
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0)

    const totalExpense = entries
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0)

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      period: { from: filters.dateFrom, to: filters.dateTo },
    }
  }
}
