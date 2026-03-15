import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(255),
})

export const createBoardSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(500).optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(10).optional(),
  workspaceId: z.string(),
})

export const updateBoardSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(500).optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(10).optional(),
})

export const listBoardsSchema = z.object({
  workspaceId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const addBoardMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'member']).default('member'),
})

export const addWorkspaceMemberSchema = z.object({
  userId: z.string(),
  role: z.string().default('member'),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>
export type ListBoardsInput = z.infer<typeof listBoardsSchema>
export type AddBoardMemberInput = z.infer<typeof addBoardMemberSchema>
export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>
