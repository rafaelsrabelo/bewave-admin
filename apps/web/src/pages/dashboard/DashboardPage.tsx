import { useQuery } from '@tanstack/react-query'
import { Users, UserRound, DollarSign, CheckCircle, Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dashboardService } from '@/services/dashboard.service'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500/10 text-red-500',
  high: 'bg-amber-500/10 text-amber-500',
  medium: 'bg-blue-500/10 text-blue-500',
  low: 'bg-zinc-500/10 text-zinc-400',
}

export function DashboardPage() {
  const clientsQuery = useQuery({
    queryKey: ['dashboard', 'clients'],
    queryFn: dashboardService.getClientsStats,
  })

  const financeQuery = useQuery({
    queryKey: ['dashboard', 'finance'],
    queryFn: dashboardService.getFinanceSummary,
  })

  const activitiesQuery = useQuery({
    queryKey: ['dashboard', 'activities'],
    queryFn: dashboardService.getRecentActivities,
  })

  const isLoading = clientsQuery.isLoading || financeQuery.isLoading

  if (isLoading) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  const clients = clientsQuery.data
  const finance = financeQuery.data

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral do sistema" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clientes Ativos"
          value={clients?.totalActive ?? 0}
          icon={Users}
        />
        <StatCard
          title="Leads"
          value={clients?.totalLeads ?? 0}
          icon={UserRound}
        />
        <StatCard
          title="Mensalidades Pagas"
          value={`${clients?.totalPaid ?? 0} / ${(clients?.totalPaid ?? 0) + (clients?.totalPending ?? 0)}`}
          icon={CheckCircle}
          description={`${clients?.totalPending ?? 0} pendente(s)`}
        />
        <StatCard
          title="Saldo do Mês"
          value={formatCurrency(finance?.balance ?? 0)}
          icon={DollarSign}
          trend={(finance?.balance ?? 0) >= 0 ? 'up' : 'down'}
          description={`Entradas: ${formatCurrency(finance?.totalIncome ?? 0)}`}
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesQuery.isLoading ? (
              <LoadingSpinner className="h-32" />
            ) : activitiesQuery.data?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma atividade recente
              </p>
            ) : (
              <div className="space-y-3">
                {activitiesQuery.data?.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.column?.title}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={priorityColors[activity.priority] ?? ''}
                    >
                      {activity.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
