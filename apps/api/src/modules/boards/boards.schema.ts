import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(255),
})

export const addMemberSchema = z.object({
  userId: z.string(),
  role: z.string().default('member'),
})

export const createBoardSchema = z.object({
  name: z.string().min(2).max(255),
})

export const createColumnSchema = z.object({
  title: z.string().min(1).max(255),
  position: z.number().int().min(0).default(0),
})

export const updateColumnSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  position: z.number().int().min(0).optional(),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type AddMemberInput = z.infer<typeof addMemberSchema>
export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type CreateColumnInput = z.infer<typeof createColumnSchema>
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>
