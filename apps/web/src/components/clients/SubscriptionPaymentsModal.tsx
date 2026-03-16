import { useState } from 'react'
import { format, differenceInDays, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Circle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useSubscriptionDetails, useMarkPaid, useUnmarkPaid } from '@/hooks/useSubscriptions'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { cn } from '@/lib/utils'
import type { SubscriptionPayment } from '@/services/subscriptions.service'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function parseDateLocal(dateStr: string): Date {
  return new Date(dateStr.split('T')[0] + 'T12:00:00')
}

export function SubscriptionPaymentsModal({
  subscriptionId,
  onClose,
}: {
  subscriptionId: string
  onClose: () => void
}) {
  const { data: subscription, isLoading } = useSubscriptionDetails(subscriptionId)
  const markPaid = useMarkPaid(subscriptionId)
  const unmarkPaid = useUnmarkPaid(subscriptionId)

  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null)
  const [unmarkTarget, setUnmarkTarget] = useState<SubscriptionPayment | null>(null)
  const [payDate, setPayDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [payNotes, setPayNotes] = useState('')
  const [createFinance, setCreateFinance] = useState(true)

  if (isLoading || !subscription) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl">
          <LoadingSpinner className="h-32" />
        </div>
      </div>
    )
  }

  const payments = subscription.payments ?? []
  const paidCount = payments.filter((p) => p.paidAt).length
  const totalReceived = payments.filter((p) => p.paidAt).reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter((p) => !p.paidAt).reduce((sum, p) => sum + p.amount, 0)

  function handleMarkPaid(paymentId: string) {
    markPaid.mutate(
      {
        paymentId,
        data: {
          paidAt: payDate,
          notes: payNotes || undefined,
          createFinanceEntry: createFinance,
        },
      },
      {
        onSuccess: () => {
          setExpandedPaymentId(null)
          setPayNotes('')
          setCreateFinance(true)
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            {subscription.plan.name} — {subscription.client?.name}
          </h2>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-1">
            {payments.map((payment) => {
              const dueDate = parseDateLocal(payment.dueDate)
              const isOverdue = !payment.paidAt && isPast(dueDate)
              const daysOverdue = isOverdue ? differenceInDays(new Date(), dueDate) : 0
              const isExpanded = expandedPaymentId === payment.id

              return (
                <div key={payment.id} className="relative pl-7 pb-4">
                  {/* Timeline line */}
                  <div className="absolute left-[11px] top-6 h-full w-px bg-border" />

                  {/* Icon */}
                  <div className="absolute left-0 top-1">
                    {payment.paidAt ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : isOverdue ? (
                      <XCircle className="h-6 w-6 text-red-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Mês {payment.month}</p>
                      {payment.paidAt ? (
                        <p className="text-xs text-muted-foreground">
                          Pago em {format(parseDateLocal(payment.paidAt), 'dd/MM/yyyy')} — {formatCurrency(payment.amount)}
                        </p>
                      ) : isOverdue ? (
                        <p className="text-xs text-red-500 font-medium">
                          Vencido há {daysOverdue} dia{daysOverdue !== 1 ? 's' : ''}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Vence em {format(dueDate, 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>

                    {payment.paidAt ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => setUnmarkTarget(payment)}
                      >
                        Desmarcar
                      </Button>
                    ) : (
                      <Button
                        variant={isOverdue ? 'destructive' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setExpandedPaymentId(isExpanded ? null : payment.id)
                          setPayDate(format(new Date(), 'yyyy-MM-dd'))
                          setPayNotes('')
                          setCreateFinance(true)
                        }}
                      >
                        Marcar como Pago
                      </Button>
                    )}
                  </div>

                  {/* Expanded form */}
                  {isExpanded && (
                    <div className="mt-3 space-y-3 rounded-md border border-border bg-muted/50 p-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Data do pagamento</Label>
                        <Input
                          type="date"
                          value={payDate}
                          onChange={(e) => setPayDate(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Observações</Label>
                        <Input
                          value={payNotes}
                          onChange={(e) => setPayNotes(e.target.value)}
                          placeholder="Opcional"
                          className="h-8 text-sm"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={createFinance}
                          onChange={(e) => setCreateFinance(e.target.checked)}
                          className="rounded"
                        />
                        Criar lançamento financeiro automaticamente
                      </label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          disabled={markPaid.isPending}
                          onClick={() => handleMarkPaid(payment.id)}
                        >
                          {markPaid.isPending ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : null}
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setExpandedPaymentId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-3">
          <p className="text-sm text-muted-foreground">
            {paidCount} de {payments.length} meses pagos
            {' · '}Recebido: <span className="font-medium text-foreground">{formatCurrency(totalReceived)}</span>
            {' · '}Pendente: <span className="font-medium text-foreground">{formatCurrency(totalPending)}</span>
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={!!unmarkTarget}
        onOpenChange={(open) => !open && setUnmarkTarget(null)}
        title="Desmarcar pagamento"
        description={
          unmarkTarget?.financeEntryId
            ? 'O lançamento financeiro associado será removido automaticamente.'
            : 'O pagamento será marcado como pendente novamente.'
        }
        confirmLabel="Desmarcar"
        loading={unmarkPaid.isPending}
        onConfirm={() => {
          if (unmarkTarget) {
            unmarkPaid.mutate(unmarkTarget.id, {
              onSettled: () => setUnmarkTarget(null),
            })
          }
        }}
      />
    </div>
  )
}
