import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Users, Trash2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Board } from '@/components/kanban/Board'
import { ActivityPanel } from '@/components/kanban/ActivityPanel'
import { BoardMembersModal } from '@/components/boards/BoardMembersModal'
import { useBoard, useRemoveBoard } from '@/hooks/useBoards'
import { useCreateColumn } from '@/hooks/useColumns'
import { useKanbanStore } from '@/stores/kanban.store'
import { cn } from '@/lib/utils'

export function BoardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [columnTitle, setColumnTitle] = useState('')
  const [membersOpen, setMembersOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [filterUserId, setFilterUserId] = useState<string | null>(null)

  const { data: board, isLoading } = useBoard(id ?? '')
  const createColumn = useCreateColumn(id ?? '')
  const removeBoard = useRemoveBoard()
  const { isPanelOpen, setSelectedActivity } = useKanbanStore()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isPanelOpen) {
        setSelectedActivity(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPanelOpen, setSelectedActivity])

  useEffect(() => {
    return () => setSelectedActivity(null)
  }, [setSelectedActivity])

  function handleCreateColumn() {
    if (columnTitle.trim() && board) {
      createColumn.mutate(
        { title: columnTitle.trim(), position: board.columns.length },
        {
          onSuccess: () => {
            setColumnTitle('')
            setDialogOpen(false)
          },
        },
      )
    }
  }

  function handleDeleteBoard() {
    if (!id) return
    removeBoard.mutate(id, {
      onSuccess: () => navigate('/boards'),
    })
  }

  if (isLoading) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  if (!board) {
    return <p className="text-muted-foreground">Quadro não encontrado</p>
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            {board.icon && <span className="text-lg">{board.icon}</span>}
            <span>{board.name}</span>
            {board.color && (
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: board.color }} />
            )}
          </div>
        }
        description={`${board.columns.length} coluna(s) · ${board.members?.length ?? 0} membro(s)`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setMembersOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Membros
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Deletar
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Coluna
            </Button>
          </div>
        }
      />

      {/* Filter by member */}
      {board.members && board.members.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filtrar:</span>
          <button
            type="button"
            className={cn(
              'rounded-full px-2.5 py-1 text-xs transition-colors',
              !filterUserId ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent',
            )}
            onClick={() => setFilterUserId(null)}
          >
            Todos
          </button>
          {board.members.map((m) => (
            <button
              key={m.userId}
              type="button"
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors',
                filterUserId === m.userId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent',
              )}
              onClick={() => setFilterUserId(filterUserId === m.userId ? null : m.userId)}
            >
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[7px] bg-primary/20">
                  {m.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {m.user.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className={cn('flex-1 overflow-hidden transition-all', isPanelOpen && 'mr-[420px]')}>
          <Board board={board} filterUserId={filterUserId} />
        </div>

        {isPanelOpen && <ActivityPanel boardId={board.id} />}
      </div>

      {/* Create Column Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Coluna</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Título da coluna"
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateColumn} disabled={createColumn.isPending}>
              {createColumn.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Board Members Modal */}
      {id && (
        <BoardMembersModal
          open={membersOpen}
          onOpenChange={setMembersOpen}
          boardId={id}
        />
      )}

      {/* Delete Board Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Deletar quadro"
        description={`Deletar "${board.name}"? Todas as colunas e atividades serão removidas.`}
        confirmLabel="Deletar"
        loading={removeBoard.isPending}
        onConfirm={handleDeleteBoard}
      />
    </div>
  )
}
