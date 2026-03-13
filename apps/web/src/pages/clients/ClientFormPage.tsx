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
import { useClient, useCreateClient, useUpdateClient } from '@/hooks/useClients'

const clientFormSchema = z.object({
  name: z.string().min(2, 'Mínimo de 2 caracteres'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
  contractMonths: z.coerce.number().int().positive('Deve ser positivo'),
  paid: z.boolean(),
  status: z.enum(['lead', 'active']),
})

type ClientFormData = z.infer<typeof clientFormSchema>

export function ClientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: client, isLoading: isLoadingClient } = useClient(id ?? '')
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      contractMonths: 12,
      paid: false,
      status: 'lead',
    },
  })

  const statusValue = watch('status')
  const paidValue = watch('paid')

  useEffect(() => {
    if (client && isEditing) {
      reset({
        name: client.name,
        address: client.address ?? undefined,
        phone: client.phone ?? undefined,
        email: client.email ?? undefined,
        contractMonths: client.contractMonths,
        paid: client.paid,
        status: client.status,
      })
    }
  }, [client, isEditing, reset])

  function onSubmit(data: ClientFormData) {
    if (isEditing && id) {
      updateMutation.mutate({ id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  if (isEditing && isLoadingClient) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        description={isEditing ? `Editando ${client?.name}` : 'Preencha os dados do novo cliente'}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Dados do Cliente</CardTitle>
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
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" {...register('phone')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" {...register('address')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractMonths">Tempo de Contrato (meses)</Label>
                <Input id="contractMonths" type="number" {...register('contractMonths')} />
                {errors.contractMonths && (
                  <p className="text-sm text-destructive">{errors.contractMonths.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={statusValue}
                  onValueChange={(value) => setValue('status', value as 'lead' | 'active')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="paid"
                  checked={paidValue}
                  onChange={(e) => setValue('paid', e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="paid" className="cursor-pointer">
                  Mensalidade paga
                </Label>
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
              <Button type="button" variant="outline" onClick={() => navigate('/clients')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
