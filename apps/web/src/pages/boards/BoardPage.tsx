import { useState } from 'react'
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
import { useBoard } from '@/hooks/useBoards'
import { useCreateColumn } from '@/hooks/useColumns'

export function BoardPage() {
  const { id } = useParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [columnTitle, setColumnTitle] = useState('')

  const { data: board, isLoading } = useBoard(id ?? '')
  const createColumn = useCreateColumn(id ?? '')

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
        title={board.name}
        description={`${board.columns.length} coluna(s)`}
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Coluna
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden">
        <Board board={board} />
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
