import { z } from 'zod'

export const createActivitySchema = z.object({
  columnId: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
})

export const updateActivitySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().optional(),
})

export const moveActivitySchema = z.object({
  columnId: z.string(),
  position: z.number().int().min(0),
})

export const addAssigneeSchema = z.object({
  userId: z.string(),
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>
export type MoveActivityInput = z.infer<typeof moveActivitySchema>
