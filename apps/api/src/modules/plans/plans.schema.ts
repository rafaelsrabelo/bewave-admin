import { z } from 'zod'

export const createPlanSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  price: z.number().int().min(0),
  durationMonths: z.number().int().min(1).max(120),
  period: z.enum(['monthly', 'quarterly', 'yearly', 'free']),
})

export const updatePlanSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  price: z.number().int().min(0).optional(),
  durationMonths: z.number().int().min(1).max(120).optional(),
  period: z.enum(['monthly', 'quarterly', 'yearly', 'free']).optional(),
  isActive: z.boolean().optional(),
})

export const listPlansSchema = z.object({
  isActive: z.string().transform((v) => v === 'true').optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
export type ListPlansInput = z.infer<typeof listPlansSchema>
