import type { User } from './user'

export type ActivityPriority = 'low' | 'medium' | 'high' | 'urgent'

export type Activity = {
  id: string
  title: string
  description: string | null
  priority: ActivityPriority
  category: string | null
  position: number
  columnId: string
  assignees: Pick<User, 'id' | 'name'>[]
  createdAt: string
  updatedAt: string
}

export type Column = {
  id: string
  title: string
  position: number
  boardId: string
  activities: Activity[]
  createdAt: string
}

export type Board = {
  id: string
  name: string
  workspaceId: string
  columns: Column[]
  createdAt: string
}
