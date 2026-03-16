import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  role: z.enum(['admin', 'member']).default('member'),
  phone: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  role: z.enum(['admin', 'member']).optional(),
  phone: z.string().optional(),
})

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.enum(['admin', 'member']).optional(),
  isActive: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ListUsersInput = z.infer<typeof listUsersSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
