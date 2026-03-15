import { z } from 'zod'

export const createColumnSchema = z.object({
  title: z.string().min(1).max(255),
  boardId: z.string(),
  color: z.string().max(20).optional(),
  position: z.number().int().min(0).optional(),
})

export const updateColumnSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  color: z.string().max(20).optional(),
})

export const reorderColumnsSchema = z.object({
  columns: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    }),
  ),
})

export type CreateColumnInput = z.infer<typeof createColumnSchema>
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>
