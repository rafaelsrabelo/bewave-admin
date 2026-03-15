import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Kanban, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { useWorkspaces, useCreateWorkspace } from '@/hooks/useBoards'

export function WorkspacesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')

  const { data: workspaces, isLoading } = useWorkspaces()
  const createMutation = useCreateWorkspace()

  function handleCreate() {
    if (name.trim()) {
      createMutation.mutate({ name: name.trim() }, {
        onSuccess: () => {
          setName('')
          setDialogOpen(false)
        },
      })
    }
  }

  if (isLoading) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  return (
    <div>
      <PageHeader
        title="Quadros"
        description="Workspaces e boards do Kanban"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Workspace
          </Button>
        }
      />

      {!workspaces || workspaces.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="Nenhum workspace"
          description="Crie seu primeiro workspace para organizar seus quadros"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Workspace
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Card key={ws.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{ws.name}</CardTitle>
                  <Link
                    to={`/workspaces/${ws.id}/boards`}
                    className="text-xs text-primary hover:underline"
                  >
                    Ver boards
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{ws.members.length} membro(s)</span>
                </div>

                {ws.members.length > 0 && (
                  <div className="mt-2 flex -space-x-1">
                    {ws.members.slice(0, 5).map((m) => (
                      <Avatar key={m.userId} className="h-6 w-6 border-2 border-card">
                        <AvatarFallback className="bg-primary text-primary-foreground text-[9px]">
                          {m.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                )}

                <div className="mt-4 space-y-1">
                  {ws.boards.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum board</p>
                  ) : (
                    ws.boards.slice(0, 3).map((b) => (
                      <Link
                        key={b.id}
                        to={`/boards/${b.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent"
                      >
                        <Kanban className="h-3.5 w-3.5 text-muted-foreground" />
                        {b.name}
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              autoFocus
              placeholder="Nome do workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
