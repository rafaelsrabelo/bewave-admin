import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreditCard, Eye, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SubscriptionPaymentsModal } from './SubscriptionPaymentsModal'
import { useCancelSubscription } from '@/hooks/useSubscriptions'
import type { Subscription } from '@/services/subscriptions.service'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

const statusConfig: Record<string, { label: string; variant: string }> = {
  active: { label: 'Ativa', variant: 'bg-emerald-500/10 text-emerald-500' },
  overdue: { label: 'Em atraso', variant: 'bg-red-500/10 text-red-500' },
  completed: { label: 'Concluída', variant: 'bg-blue-500/10 text-blue-500' },
  cancelled: { label: 'Cancelada', variant: 'bg-zinc-500/10 text-zinc-500' },
}

export function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const [showPayments, setShowPayments] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const cancelMutation = useCancelSubscription()

  const paidCount = subscription.paidCount ?? subscription.payments?.filter((p) => p.paidAt).length ?? 0
  const totalCount = subscription.totalCount ?? subscription.payments?.length ?? subscription.plan.durationMonths
  const totalValue = subscription.plan.price * subscription.plan.durationMonths
  const status = statusConfig[subscription.status] ?? statusConfig.active
  const progressPercent = totalCount > 0 ? (paidCount / totalCount) * 100 : 0

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">{subscription.plan.name}</CardTitle>
            </div>
            <Badge className={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Período</p>
              <p className="font-medium">
                {format(new Date(subscription.startDate), 'dd/MM/yyyy')} — {format(new Date(subscription.endDate), 'dd/MM/yyyy')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Valor total</p>
              <p className="font-medium">{formatCurrency(totalValue)}</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mês {paidCount} de {totalCount}</span>
              <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => setShowPayments(true)}>
              <Eye className="mr-2 h-3.5 w-3.5" />
              Ver Pagamentos
            </Button>
            {(subscription.status === 'active' || subscription.status === 'overdue') && (
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => setShowCancel(true)}>
                <X className="mr-2 h-3.5 w-3.5" />
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showPayments && (
        <SubscriptionPaymentsModal
          subscriptionId={subscription.id}
          onClose={() => setShowPayments(false)}
        />
      )}

      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancelar assinatura"
        description={`Tem certeza que deseja cancelar a assinatura do plano "${subscription.plan.name}"? Pagamentos já realizados não serão afetados.`}
        confirmLabel="Cancelar Assinatura"
        loading={cancelMutation.isPending}
        onConfirm={() => {
          cancelMutation.mutate(
            { id: subscription.id },
            { onSettled: () => setShowCancel(false) },
          )
        }}
      />
    </>
  )
}
