import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Kanban, Users, Trash2, MoreHorizontal } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useWorkspaces, useCreateWorkspace, useCreateBoard, useRemoveBoard } from '@/hooks/useBoards'
import type { Workspace } from '@/services/boards.service'

const BOARD_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
]

export function WorkspacesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [boardName, setBoardName] = useState('')
  const [boardColor, setBoardColor] = useState(BOARD_COLORS[0])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: workspaces, isLoading } = useWorkspaces()
  const createWorkspace = useCreateWorkspace()
  const createBoard = useCreateBoard()
  const removeBoard = useRemoveBoard()

  // Flatten all boards from all workspaces
  const allBoards = workspaces?.flatMap((ws: Workspace) =>
    ws.boards.map((b) => ({ ...b, workspaceId: ws.id, memberCount: ws.members.length })),
  ) ?? []

  // Get or create default workspace
  function getDefaultWorkspaceId(): Promise<string> {
    if (workspaces && workspaces.length > 0) {
      return Promise.resolve(workspaces[0].id)
    }
    return new Promise((resolve) => {
      createWorkspace.mutate(
        { name: 'Meu Workspace' },
        {
          onSuccess: (ws) => resolve(ws.id),
        },
      )
    })
  }

  async function handleCreateBoard() {
    if (!boardName.trim()) return
    const workspaceId = await getDefaultWorkspaceId()
    createBoard.mutate(
      { name: boardName.trim(), color: boardColor, workspaceId },
      {
        onSuccess: () => {
          setBoardName('')
          setBoardColor(BOARD_COLORS[0])
          setDialogOpen(false)
        },
      },
    )
  }

  function handleDeleteBoard() {
    if (deleteTarget) {
      removeBoard.mutate(deleteTarget, {
        onSettled: () => setDeleteTarget(null),
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
        description="Organize suas atividades em quadros Kanban"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Quadro
          </Button>
        }
      />

      {allBoards.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="Nenhum quadro"
          description="Crie seu primeiro quadro para organizar atividades"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Quadro
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allBoards.map((board) => (
            <Card key={board.id} className="group relative transition-shadow hover:shadow-md">
              <div
                className="h-2 rounded-t-lg"
                style={{ backgroundColor: (board as Record<string, unknown>).color as string ?? '#3b82f6' }}
              />

              {/* Menu */}
              <div className="absolute right-2 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.preventDefault()
                        setDeleteTarget(board.id)
                      }}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link to={`/boards/${board.id}`}>
                <CardContent className="pt-4">
                  <h3 className="font-semibold">{board.name}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {board.memberCount} membro(s)
                    </span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Create Board Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Quadro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              placeholder="Nome do quadro"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
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
            <Button onClick={handleCreateBoard} disabled={createBoard.isPending || createWorkspace.isPending}>
              {createBoard.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Deletar quadro"
        description="Todas as colunas e atividades serão removidas. Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        loading={removeBoard.isPending}
        onConfirm={handleDeleteBoard}
      />
    </div>
  )
}
