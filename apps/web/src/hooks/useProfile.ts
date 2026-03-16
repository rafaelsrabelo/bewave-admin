import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => usersService.getMe(),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const accessToken = useAuthStore((s) => s.accessToken)

  return useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      if (accessToken) {
        setAuth(accessToken, {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        })
      }
      toast.success('Perfil atualizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar perfil')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: usersService.changePassword,
    onSuccess: () => {
      toast.success('Senha alterada com sucesso')
    },
  })
}
