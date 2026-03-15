import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Kanban, Calendar, Check, CheckCircle2 } from 'lucide-react'
import { format, isToday, isFuture, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useMyBoards, useWorkspaces, useCreateWorkspace, useCreateBoard, useRemoveBoard } from '@/hooks/useBoards'
import { useMyActivities } from '@/hooks/useActivities'
import { useAuthStore } from '@/stores/auth.store'
import { useKanbanStore } from '@/stores/kanban.store'
import { cn } from '@/lib/utils'
import type { Activity } from '@/services/boards.service'

const BOARD_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
]

const priorityConfig: Record<string, { label: string; className: string }> = {
  urgent: { label: 'Urgente', className: 'bg-red-500/10 text-red-500' },
  high: { label: 'Alta', className: 'bg-amber-500/10 text-amber-500' },
  medium: { label: 'Média', className: 'bg-blue-500/10 text-blue-500' },
  low: { label: 'Baixa', className: 'bg-zinc-500/10 text-zinc-400' },
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function groupActivities(activities: Activity[]) {
  const today: Activity[] = []
  const upcoming: Activity[] = []
  const noDate: Activity[] = []

  for (const a of activities) {
    if (!a.dueDate) {
      noDate.push(a)
    } else if (isToday(new Date(a.dueDate))) {
      today.push(a)
    } else if (isFuture(new Date(a.dueDate))) {
      upcoming.push(a)
    } else {
      today.push(a) // overdue goes with "today"
    }
  }

  return { today, upcoming, noDate }
}

export function BoardsHomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setSelectedActivity = useKanbanStore((s) => s.setSelectedActivity)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [boardName, setBoardName] = useState('')
  const [boardColor, setBoardColor] = useState(BOARD_COLORS[0])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: boards, isLoading: boardsLoading } = useMyBoards()
  const { data: activities, isLoading: activitiesLoading } = useMyActivities({ isCompleted: false, limit: 15 })
  const { data: workspaces } = useWorkspaces()
  const createWorkspace = useCreateWorkspace()
  const createBoard = useCreateBoard()
  const removeBoard = useRemoveBoard()

  const grouped = activities ? groupActivities(activities) : null

  function getDefaultWorkspaceId(): Promise<string> {
    if (workspaces && workspaces.length > 0) return Promise.resolve(workspaces[0].id)
    return new Promise((resolve) => {
      createWorkspace.mutate({ name: 'Meu Workspace' }, { onSuccess: (ws) => resolve(ws.id) })
    })
  }

  async function handleCreateBoard() {
    if (!boardName.trim()) return
    const workspaceId = await getDefaultWorkspaceId()
    createBoard.mutate(
      { name: boardName.trim(), color: boardColor, workspaceId },
      { onSuccess: () => { setBoardName(''); setBoardColor(BOARD_COLORS[0]); setDialogOpen(false) } },
    )
  }

  function handleActivityClick(activity: Activity) {
    const boardId = (activity.column as { board?: { id: string } })?.board?.id
    if (boardId) {
      setSelectedActivity(activity.id)
      navigate(`/boards/${boardId}`)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
        <h1 className="mt-1 text-3xl font-bold">
          {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Usuário'}
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left — Boards */}
        <div className="w-[60%] min-w-0">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Quadros</CardTitle>
                  {boards && (
                    <Badge variant="secondary" className="text-xs">{boards.length}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {boardsLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : !boards || boards.length === 0 ? (
                <EmptyState
                  icon={Kanban}
                  title="Nenhum quadro"
                  description="Crie seu primeiro quadro"
                  action={
                    <Button size="sm" onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar quadro
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* Create board button */}
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/20 p-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    onClick={() => setDialogOpen(true)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Plus className="h-5 w-5" />
                    </div>
                    Criar quadro
                  </button>

                  {boards.map((board) => (
                    <div key={board.id} className="group relative">
                      <Link
                        to={`/boards/${board.id}`}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 transition-shadow hover:shadow-md"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
                          style={{ backgroundColor: board.color ?? '#3b82f6' }}
                        >
                          {board.icon ?? board.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{board.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {board._count?.columns ?? 0} colunas · {board._count?.members ?? 0} membros
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — My Activities */}
        <div className="w-[40%] min-w-0">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Minhas atividades</CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : !activities || activities.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle2 className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Nenhuma atividade atribuída a você</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grouped && grouped.today.length > 0 && (
                    <ActivitySection
                      title="Hoje"
                      activities={grouped.today}
                      onActivityClick={handleActivityClick}
                    />
                  )}
                  {grouped && grouped.upcoming.length > 0 && (
                    <ActivitySection
                      title="Próximas"
                      activities={grouped.upcoming}
                      onActivityClick={handleActivityClick}
                    />
                  )}
                  {grouped && grouped.noDate.length > 0 && (
                    <ActivitySection
                      title="Sem data"
                      activities={grouped.noDate}
                      onActivityClick={handleActivityClick}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Board Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Deletar quadro"
        description="Todas as colunas e atividades serão removidas."
        confirmLabel="Deletar"
        loading={removeBoard.isPending}
        onConfirm={() => {
          if (deleteTarget) removeBoard.mutate(deleteTarget, { onSettled: () => setDeleteTarget(null) })
        }}
      />

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDialogOpen(false)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold">Novo Quadro</h2>
            <div className="space-y-4">
              <input
                autoFocus
                placeholder="Nome do quadro"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <div>
                <p className="mb-2 text-sm font-medium">Cor</p>
                <div className="flex gap-2">
                  {BOARD_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${
                        boardColor === color ? 'scale-110 border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBoardColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateBoard} disabled={createBoard.isPending || !boardName.trim()}>
                  {createBoard.isPending ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-component: Activity Section ──

function ActivitySection({
  title,
  activities,
  onActivityClick,
}: {
  title: string
  activities: Activity[]
  onActivityClick: (activity: Activity) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-1">
        {activities.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} onClick={() => onActivityClick(activity)} />
        ))}
      </div>
    </div>
  )
}

// ── Sub-component: Activity Row ──

function ActivityRow({ activity, onClick }: { activity: Activity; onClick: () => void }) {
  const priority = priorityConfig[activity.priority] ?? priorityConfig.medium
  const board = (activity.column as { board?: { id: string; name: string; color: string | null; icon: string | null } })?.board
  const columnTitle = (activity.column as { title?: string })?.title
  const isOverdue = activity.dueDate && isPast(new Date(activity.dueDate)) && !activity.isCompleted

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent"
      onClick={onClick}
    >
      {board && (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-white text-[10px] font-bold"
          style={{ backgroundColor: board.color ?? '#3b82f6' }}
        >
          {board.icon ?? board.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm', activity.isCompleted && 'line-through text-muted-foreground')}>
          {activity.title}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {board?.name}{columnTitle ? ` · ${columnTitle}` : ''}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary" className={cn('text-[10px] px-1.5', priority.className)}>
          {priority.label}
        </Badge>
        {activity.dueDate && (
          <span className={cn('flex items-center gap-1 text-[11px]', isOverdue ? 'text-red-500 font-semibold' : 'text-muted-foreground')}>
            <Calendar className="h-3 w-3" />
            {format(new Date(activity.dueDate), 'dd/MM')}
          </span>
        )}
      </div>
    </button>
  )
}
