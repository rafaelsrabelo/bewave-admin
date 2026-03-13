export type UserRole = 'admin' | 'member'

export type User = {
  id: string
  name: string
  role: UserRole
  phone: string | null
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
