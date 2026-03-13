import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ActivityCard } from './ActivityCard'
import type { Column as ColumnType, Activity } from '@/services/boards.service'

type ColumnProps = {
  column: ColumnType
  onCreateActivity: (columnId: string, title: string) => void
  onActivityClick?: (activity: Activity) => void
}

export function Column({ column, onCreateActivity, onActivityClick }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

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

  const activityIds = column.activities.map((a) => a.id)

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{column.title}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {column.activities.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[100px] flex-1 flex-col gap-2 px-2 pb-2 transition-colors',
          isOver && 'bg-primary/5 rounded-md',
        )}
      >
        <SortableContext items={activityIds} strategy={verticalListSortingStrategy}>
          {column.activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => onActivityClick?.(activity)}
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
