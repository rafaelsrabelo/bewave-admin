import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Kanban, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { useBoards, useCreateBoard } from '@/hooks/useBoards'

const BOARD_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
]

export function WorkspaceBoardsPage() {
  const { workspaceId } = useParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [boardName, setBoardName] = useState('')
  const [boardColor, setBoardColor] = useState(BOARD_COLORS[0])

  const { data: boards, isLoading } = useBoards(workspaceId ?? '')
  const createMutation = useCreateBoard()

  function handleCreate() {
    if (boardName.trim() && workspaceId) {
      createMutation.mutate(
        { name: boardName.trim(), color: boardColor, workspaceId },
        {
          onSuccess: () => {
            setBoardName('')
            setDialogOpen(false)
          },
        },
      )
    }
  }

  if (isLoading) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  return (
    <div>
      <PageHeader
        title="Boards"
        description="Quadros deste workspace"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Quadro
          </Button>
        }
      />

      {!boards || boards.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="Nenhum board"
          description="Crie seu primeiro board para organizar atividades"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Board
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link key={board.id} to={`/boards/${board.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div
                  className="h-2 rounded-t-lg"
                  style={{ backgroundColor: board.color ?? '#3b82f6' }}
                />
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    {board.icon && <span className="text-lg">{board.icon}</span>}
                    <h3 className="font-semibold">{board.name}</h3>
                  </div>
                  {board.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {board.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {board._count?.members ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Kanban className="h-3.5 w-3.5" />
                      {board._count?.columns ?? 0} colunas
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Quadro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              placeholder="Nome do board"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
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
