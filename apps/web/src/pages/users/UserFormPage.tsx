import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useUser, useCreateUser, useUpdateUser } from '@/hooks/useUsers'

const userFormSchema = z.object({
  name: z.string().min(2, 'Mínimo de 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres').or(z.literal('')).optional(),
  role: z.enum(['admin', 'member']),
  phone: z.string().optional(),
})

type UserFormData = z.infer<typeof userFormSchema>

export function UserFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: user, isLoading: isLoadingUser } = useUser(id ?? '')
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: 'member',
      password: '',
    },
  })

  const roleValue = watch('role')

  useEffect(() => {
    if (user && isEditing) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? undefined,
        password: '',
      })
    }
  }, [user, isEditing, reset])

  function onSubmit(data: UserFormData) {
    if (isEditing && id) {
      const { password: _, ...updateData } = data
      updateMutation.mutate({ id, data: updateData })
    } else {
      createMutation.mutate({
        name: data.name,
        email: data.email,
        password: data.password!,
        role: data.role,
        phone: data.phone,
      })
    }
  }

  if (isEditing && isLoadingUser) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar Usuário' : 'Novo Usuário'}
        description={isEditing ? `Editando ${user?.name}` : 'Preencha os dados do novo usuário'}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Dados do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" autoFocus {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input id="password" type="password" {...register('password')} />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" {...register('phone')} />
              </div>

              <div className="space-y-2">
                <Label>Cargo *</Label>
                <Select
                  value={roleValue}
                  onValueChange={(value) => setValue('role', value as 'admin' | 'member')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Membro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
