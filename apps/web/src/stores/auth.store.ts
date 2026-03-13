import { create } from 'zustand'

type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
}

type AuthState = {
  accessToken: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
  isAuthenticated: () => get().accessToken !== null,
}))
