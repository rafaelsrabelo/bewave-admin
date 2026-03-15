import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Board } from '@/components/kanban/Board'
import { ActivityPanel } from '@/components/kanban/ActivityPanel'
import { useBoard } from '@/hooks/useBoards'
import { useCreateColumn } from '@/hooks/useColumns'
import { useKanbanStore } from '@/stores/kanban.store'
import { cn } from '@/lib/utils'

export function BoardPage() {
  const { id } = useParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [columnTitle, setColumnTitle] = useState('')

  const { data: board, isLoading } = useBoard(id ?? '')
  const createColumn = useCreateColumn(id ?? '')
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

  // Cleanup on unmount
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

  if (isLoading) {
    return <LoadingSpinner className="h-64" size="lg" />
  }

  if (!board) {
    return <p className="text-muted-foreground">Board não encontrado</p>
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
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Coluna
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div className={cn('flex-1 overflow-hidden transition-all', isPanelOpen && 'mr-[420px]')}>
          <Board board={board} />
        </div>

        {isPanelOpen && <ActivityPanel boardId={board.id} />}
      </div>

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
    </div>
  )
}
