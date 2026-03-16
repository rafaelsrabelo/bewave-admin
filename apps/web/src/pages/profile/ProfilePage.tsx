import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useMe, useUpdateProfile, useChangePassword } from '@/hooks/useProfile'

const profileSchema = z.object({
  name: z.string().min(2, 'Mínimo de 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(8, 'Mínimo de 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const { data: user, isLoading } = useMe()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  if (isLoading) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  return (
    <div>
      <PageHeader
        title="Meu Perfil"
        description="Gerencie seus dados pessoais e senha"
      />

      <div className="max-w-2xl space-y-6">
        <ProfileForm user={user} mutation={updateProfile} />
        <PasswordForm mutation={changePassword} />
      </div>
    </div>
  )
}

function ProfileForm({
  user,
  mutation,
}: {
  user: { name: string; email: string; phone: string | null } | undefined
  mutation: ReturnType<typeof useUpdateProfile>
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
      })
    }
  }, [user, reset])

  function onSubmit(data: ProfileFormData) {
    mutation.mutate({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dados Pessoais</CardTitle>
        <CardDescription>Atualize seu nome, email e telefone</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register('phone')} />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordForm({
  mutation,
}: {
  mutation: ReturnType<typeof useChangePassword>
}) {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  function onSubmit(data: PasswordFormData) {
    setApiError(null)
    mutation.mutate(data, {
      onSuccess: () => {
        reset()
        setShowCurrent(false)
        setShowNew(false)
        setShowConfirm(false)
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: { error?: { code?: string } } } }
        if (axiosError.response?.data?.error?.code === 'INVALID_PASSWORD') {
          setApiError('Senha atual incorreta')
        } else {
          setApiError('Erro ao alterar senha')
        }
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alterar Senha</CardTitle>
        <CardDescription>Informe a senha atual e defina uma nova senha</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  {...register('currentPassword')}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
              {apiError && <p className="text-sm text-destructive">{apiError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
