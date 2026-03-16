import { z } from 'zod'

export const createSubscriptionSchema = z.object({
  clientId: z.string(),
  planId: z.string(),
  startDate: z.string(),
  notes: z.string().optional(),
})

export const updatePaymentSchema = z.object({
  paidAt: z.string().nullable().optional(),
  amount: z.number().int().positive().optional(),
  notes: z.string().optional(),
  createFinanceEntry: z.boolean().default(true),
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
