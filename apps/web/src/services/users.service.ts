import { api } from '@/lib/axios'

type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  phone: string | null
  isActive: boolean
  createdAt: string
}

type UsersResponse = {
  data: User[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

type UserResponse = {
  data: User
}

type CreateUserInput = {
  name: string
  email: string
  password: string
  role: 'admin' | 'member'
  phone?: string
}

type UpdateUserInput = {
  name?: string
  email?: string
  role?: 'admin' | 'member'
  phone?: string
}

type UpdateProfileInput = {
  name?: string
  email?: string
  phone?: string
}

type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const usersService = {
  async list(params?: { page?: number; limit?: number; role?: string; isActive?: string }) {
    const response = await api.get<UsersResponse>('/users', { params })
    return response.data
  },

  async getById(id: string) {
    const response = await api.get<UserResponse>(`/users/${id}`)
    return response.data.data
  },

  async create(data: CreateUserInput) {
    const response = await api.post<UserResponse>('/users', data)
    return response.data.data
  },

  async update(id: string, data: UpdateUserInput) {
    const response = await api.put<UserResponse>(`/users/${id}`, data)
    return response.data.data
  },

  async deactivate(id: string) {
    await api.delete(`/users/${id}`)
  },

  async remove(id: string) {
    await api.delete(`/users/${id}/permanent`)
  },

  async getMe() {
    const response = await api.get<UserResponse>('/me')
    return response.data.data
  },

  async updateProfile(data: UpdateProfileInput) {
    const response = await api.put<UserResponse>('/me', data)
    return response.data.data
  },

  async changePassword(data: ChangePasswordInput) {
    await api.patch('/me/password', data)
  },
}
