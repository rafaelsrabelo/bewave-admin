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
import { usePlan, useCreatePlan, useUpdatePlan } from '@/hooks/usePlans'

const planFormSchema = z.object({
  name: z.string().min(2, 'Mínimo de 2 caracteres'),
  description: z.string().optional(),
  priceReais: z.coerce.number().min(0, 'Valor deve ser positivo'),
  durationMonths: z.coerce.number().int().min(1, 'Mínimo 1 mês').max(120, 'Máximo 120 meses'),
  period: z.enum(['monthly', 'quarterly', 'yearly', 'free']),
})

type PlanFormData = z.infer<typeof planFormSchema>

const periodLabels: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
  free: 'Gratuito',
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export function PlanFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: plan, isLoading: isLoadingPlan } = usePlan(id ?? '')
  const createMutation = useCreatePlan()
  const updateMutation = useUpdatePlan()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      priceReais: 0,
      durationMonths: 1,
      period: 'monthly',
    },
  })

  const periodValue = watch('period')
  const priceReais = watch('priceReais')
  const durationMonths = watch('durationMonths')
  const priceCents = Math.round((priceReais || 0) * 100)
  const totalCents = priceCents * (durationMonths || 1)

  useEffect(() => {
    if (plan && isEditing) {
      reset({
        name: plan.name,
        description: plan.description ?? '',
        priceReais: plan.price / 100,
        durationMonths: plan.durationMonths,
        period: plan.period,
      })
    }
  }, [plan, isEditing, reset])

  function onSubmit(data: PlanFormData) {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      price: Math.round(data.priceReais * 100),
      durationMonths: data.durationMonths,
      period: data.period,
    }

    if (isEditing && id) {
      updateMutation.mutate({ id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  if (isEditing && isLoadingPlan) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar Plano' : 'Novo Plano'}
        description={isEditing ? `Editando ${plan?.name}` : 'Preencha os dados do novo plano'}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Dados do Plano</CardTitle>
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
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" {...register('description')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceReais">Valor Mensal (R$) *</Label>
                <Input id="priceReais" type="number" step="0.01" {...register('priceReais')} />
                {errors.priceReais && <p className="text-sm text-destructive">{errors.priceReais.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMonths">Duração (meses) *</Label>
                <Input id="durationMonths" type="number" {...register('durationMonths')} />
                {errors.durationMonths && <p className="text-sm text-destructive">{errors.durationMonths.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Período *</Label>
                <Select
                  value={periodValue}
                  onValueChange={(value) => setValue('period', value as PlanFormData['period'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(periodLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {priceCents > 0 && durationMonths > 0 && (
              <div className="rounded-md bg-muted p-3 text-sm">
                Valor total: <span className="font-semibold">{formatCurrency(totalCents)}</span> em {durationMonths} {durationMonths === 1 ? 'mês' : 'meses'}
              </div>
            )}

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
              <Button type="button" variant="outline" onClick={() => navigate('/plans')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
