import { z } from 'zod'

export const createActivitySchema = z.object({
  columnId: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  assigneeIds: z.array(z.string()).optional(),
  coverColor: z.string().optional(),
})

export const updateActivitySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  coverColor: z.string().nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
})

export const moveActivitySchema = z.object({
  columnId: z.string(),
  position: z.number().int().min(0),
})

export const completeActivitySchema = z.object({
  isCompleted: z.boolean(),
})

export const listActivitiesSchema = z.object({
  columnId: z.string().optional(),
  boardId: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  isCompleted: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const addAssigneeSchema = z.object({
  userId: z.string(),
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>
export type MoveActivityInput = z.infer<typeof moveActivitySchema>
export type CompleteActivityInput = z.infer<typeof completeActivitySchema>
export type ListActivitiesInput = z.infer<typeof listActivitiesSchema>
