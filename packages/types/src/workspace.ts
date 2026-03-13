import type { User } from './user'

export type WorkspaceMember = {
  userId: string
  workspaceId: string
  role: string
  user: Pick<User, 'id' | 'name'>
}

export type Workspace = {
  id: string
  name: string
  members: WorkspaceMember[]
  createdAt: string
}
