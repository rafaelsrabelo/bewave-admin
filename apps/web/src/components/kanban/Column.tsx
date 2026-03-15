import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ActivityCard } from './ActivityCard'
import type { Column as ColumnType, Activity } from '@/services/boards.service'

type ColumnProps = {
  column: ColumnType
  onCreateActivity: (columnId: string, title: string) => void
  onActivityClick?: (activity: Activity) => void
  onToggleComplete?: (activityId: string, isCompleted: boolean) => void
  onUpdateTitle?: (columnId: string, title: string) => void
  onDelete?: (columnId: string) => void
}

export function Column({
  column,
  onCreateActivity,
  onActivityClick,
  onToggleComplete,
  onUpdateTitle,
  onDelete,
}: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column', columnId: column.id },
  })

  function handleAdd() {
    if (newTitle.trim()) {
      onCreateActivity(column.id, newTitle.trim())
      setNewTitle('')
      setIsAdding(false)
    }
  }

  function handleSaveTitle() {
    if (editTitle.trim() && editTitle !== column.title) {
      onUpdateTitle?.(column.id, editTitle.trim())
    }
    setIsEditingTitle(false)
  }

  const activityIds = column.activities.map((a) => a.id)

  return (
    <div className="flex h-full max-h-[calc(100vh-180px)] w-[280px] shrink-0 flex-col rounded-lg bg-muted/50">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {column.color && (
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: column.color }} />
          )}
          {isEditingTitle ? (
            <Input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') setIsEditingTitle(false)
              }}
              className="h-6 px-1 text-sm font-semibold"
            />
          ) : (
            <h3
              className="cursor-pointer truncate text-sm font-semibold"
              onClick={() => setIsEditingTitle(true)}
            >
              {column.title}
            </h3>
          )}
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {column.activities.length}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                Renomear
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(column.id)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[100px] flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 transition-colors',
          isOver && 'bg-primary/5 rounded-md',
        )}
      >
        <SortableContext items={activityIds} strategy={verticalListSortingStrategy}>
          {column.activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => onActivityClick?.(activity)}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </SortableContext>

        {isAdding && (
          <div className="space-y-2">
            <Input
              autoFocus
              placeholder="Título da atividade"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') setIsAdding(false)
              }}
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleAdd}>
                Adicionar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
