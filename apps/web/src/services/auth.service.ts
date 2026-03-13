import { api } from '@/lib/axios'

type LoginResponse = {
  data: {
    accessToken: string
    user: {
      id: string
      name: string
      email: string
      role: 'admin' | 'member'
    }
  }
}

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post<LoginResponse>('/auth/login', { email, password })
    return response.data.data
  },

  async logout() {
    await api.post('/auth/logout')
  },

  async refreshToken() {
    const response = await api.post<LoginResponse>('/auth/refresh')
    return response.data.data
  },
}
