import { z } from 'zod'

export const listPaymentsSchema = z.object({
  clientId: z.string().optional(),
  status: z.enum(['paid', 'pending']).optional(),
})

export const createPaymentSchema = z.object({
  clientId: z.string(),
  amount: z.number().int().min(0),
  referenceMonth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD'),
  status: z.enum(['paid', 'pending']).default('pending'),
})

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['paid', 'pending']),
})

export const generatePaymentsSchema = z.object({
  clientId: z.string(),
  months: z.number().int().min(1).max(24).default(12),
})

export type ListPaymentsInput = z.infer<typeof listPaymentsSchema>
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>
export type GeneratePaymentsInput = z.infer<typeof generatePaymentsSchema>
