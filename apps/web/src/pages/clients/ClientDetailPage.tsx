import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pencil, CalendarPlus, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SubscriptionCard } from '@/components/clients/SubscriptionCard'
import { useClient } from '@/hooks/useClients'
import { usePayments, useUpdatePaymentStatus, useGeneratePayments } from '@/hooks/usePayments'
import { useClientSubscriptions, useCreateSubscription } from '@/hooks/useSubscriptions'
import { usePlans } from '@/hooks/usePlans'
import { format } from 'date-fns'

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

function formatMonth(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function ClientDetailPage() {
  const { id } = useParams()
  const [months, setMonths] = useState(12)

  const { data: client, isLoading } = useClient(id ?? '')
  const { data: payments, isLoading: isLoadingPayments } = usePayments({ clientId: id })
  const { data: subscriptions, isLoading: isLoadingSubs } = useClientSubscriptions(id ?? '')
  const updateStatusMutation = useUpdatePaymentStatus()
  const generateMutation = useGeneratePayments()

  if (isLoading) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  if (!client) {
    return <p className="text-muted-foreground">Cliente não encontrado</p>
  }

  const activeSubscription = subscriptions?.find(
    (s) => s.status === 'active' || s.status === 'overdue',
  )
  const pastSubscriptions = subscriptions?.filter(
    (s) => s.status === 'completed' || s.status === 'cancelled',
  )

  const paidCount = payments?.filter((p) => p.status === 'paid').length ?? 0
  const pendingCount = payments?.filter((p) => p.status === 'pending').length ?? 0

  return (
    <div>
      <PageHeader
        title={client.name}
        description={`${client.status === 'active' ? 'Cliente ativo' : 'Lead'} ${client.plan ? `• Plano: ${client.plan.name}` : ''}`}
        action={
          <Button asChild variant="outline">
            <Link to={`/clients/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{client.email ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Telefone</p>
            <p className="font-medium">{client.phone ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Plano</p>
            <p className="font-medium">
              {client.plan
                ? `${client.plan.name} — ${formatCurrency(client.plan.price)} / ${periodLabels[client.plan.period]}`
                : 'Nenhum'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assinaturas */}
      <div className="mb-6 space-y-4">
        <h2 className="text-base font-semibold">Assinaturas</h2>
        {isLoadingSubs ? (
          <LoadingSpinner className="h-20" />
        ) : activeSubscription ? (
          <SubscriptionCard subscription={activeSubscription} />
        ) : (
          <NewSubscriptionForm clientId={id!} />
        )}

        {pastSubscriptions && pastSubscriptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Assinaturas anteriores</p>
            {pastSubscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>
        )}
      </div>

      {/* Pagamentos legados */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Pagamentos</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {paidCount} pago(s) • {pendingCount} pendente(s)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="months" className="text-sm whitespace-nowrap">
              Meses:
            </Label>
            <Input
              id="months"
              type="number"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-20"
              min={1}
              max={24}
            />
            <Button
              size="sm"
              onClick={() => generateMutation.mutate({ clientId: id!, months })}
              disabled={generateMutation.isPending || !client.planId}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Gerar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <LoadingSpinner className="h-32" />
          ) : !payments || payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum pagamento registrado. {!client.planId && 'Associe um plano ao cliente primeiro.'}
            </p>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {formatMonth(payment.referenceMonth)}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      variant={payment.status === 'paid' ? 'paid' : 'pending'}
                      label={payment.status === 'paid' ? 'Pago' : 'Pendente'}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: payment.id,
                          status: payment.status === 'paid' ? 'pending' : 'paid',
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      {payment.status === 'paid' ? (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function NewSubscriptionForm({ clientId }: { clientId: string }) {
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const { data: plansData } = usePlans({ isActive: 'true' })
  const createSubscription = useCreateSubscription()

  const plans = plansData?.data ?? []

  function handleCreate() {
    if (!selectedPlanId || !startDate) return
    createSubscription.mutate({
      clientId,
      planId: selectedPlanId,
      startDate,
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="mb-3 text-sm text-muted-foreground">Nenhuma assinatura ativa. Contrate um plano:</p>
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Plano</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price / 100)}/mês ({plan.durationMonths}m)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Data de início</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9"
            />
          </div>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!selectedPlanId || createSubscription.isPending}
          >
            Contratar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
