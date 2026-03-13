import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().min(2).max(255),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  contractMonths: z.number().int().positive().default(12),
  paid: z.boolean().default(false),
  status: z.enum(['lead', 'active']).default('lead'),
})

export const updateClientSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  contractMonths: z.number().int().positive().optional(),
  paid: z.boolean().optional(),
  status: z.enum(['lead', 'active']).optional(),
})

export const listClientsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['lead', 'active']).optional(),
  paid: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ListClientsInput = z.infer<typeof listClientsSchema>
