import { useQuery } from '@tanstack/react-query'
import { Users, UserRound, CheckCircle, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { dashboardService } from '@/services/dashboard.service'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
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
    </div>
  )
}
