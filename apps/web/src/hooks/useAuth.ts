import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user)
      navigate('/dashboard')
    },
    onError: () => {
      toast.error('Credenciais inválidas')
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth()
      navigate('/login')
    },
  })
}
