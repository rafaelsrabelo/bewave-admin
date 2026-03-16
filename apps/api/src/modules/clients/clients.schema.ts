import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().min(2).max(255),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(['lead', 'active']).default('lead'),
  planId: z.string().optional(),
})

export const updateClientSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(['lead', 'active']).optional(),
  planId: z.string().nullable().optional(),
})

export const listClientsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['lead', 'active']).optional(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ListClientsInput = z.infer<typeof listClientsSchema>
