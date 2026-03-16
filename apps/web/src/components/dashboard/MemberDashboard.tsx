import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, Kanban } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/shared/StatCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { useMemberDashboard } from '@/hooks/useMemberDashboard'
import { useAuthStore } from '@/stores/auth.store'

export function MemberDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useMemberDashboard()

  if (isLoading) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Bem-vindo, ${user?.name?.split(' ')[0] ?? 'Usuário'}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Atividades Atribuídas"
          value={data?.activitiesAssigned ?? 0}
          icon={Kanban}
        />
        <StatCard
          title="Atividades Pendentes"
          value={data?.activitiesPending ?? 0}
          icon={Clock}
        />
        <StatCard
          title="Atividades Concluídas"
          value={data?.activitiesCompleted ?? 0}
          icon={CheckCircle2}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Seus Quadros</CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.boardsWithPendingActivities?.length ? (
            <EmptyState
              icon={Kanban}
              title="Nenhum quadro encontrado"
              description="Você ainda não foi adicionado a nenhum quadro"
            />
          ) : (
            <div className="space-y-2">
              {data.boardsWithPendingActivities.map((board) => (
                <div
                  key={board.boardId}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
                      style={{ backgroundColor: board.color ?? '#3b82f6' }}
                    >
                      {board.boardName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{board.boardName}</p>
                      <Badge variant="secondary" className="mt-0.5 text-xs">
                        {board.count} pendente{board.count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/boards/${board.boardId}`)}
                  >
                    Abrir Quadro
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
