import { z } from 'zod'

export const createFinanceEntrySchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().int().positive(),
  description: z.string().min(1).max(500),
  category: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const listFinanceEntriesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const summarySchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type CreateFinanceEntryInput = z.infer<typeof createFinanceEntrySchema>
export type ListFinanceEntriesInput = z.infer<typeof listFinanceEntriesSchema>
export type SummaryInput = z.infer<typeof summarySchema>
