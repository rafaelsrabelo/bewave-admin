import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQueryClient } from '@tanstack/react-query'
import { Column } from './Column'
import { ActivityCard } from './ActivityCard'
import { useCreateActivity, useMoveActivity, useToggleComplete } from '@/hooks/useActivities'
import { useUpdateColumn, useRemoveColumn, useReorderColumns } from '@/hooks/useColumns'
import { useKanbanStore } from '@/stores/kanban.store'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { Board as BoardType, Activity, Column as ColumnType } from '@/services/boards.service'

type BoardProps = {
  board: BoardType
  filterUserId?: string | null
}

function SortableColumn({
  column,
  onCreateActivity,
  onActivityClick,
  onToggleComplete,
  onUpdateTitle,
  onDelete,
}: {
  column: ColumnType
  onCreateActivity: (columnId: string, title: string) => void
  onActivityClick: (activity: Activity) => void
  onToggleComplete: (activityId: string, isCompleted: boolean) => void
  onUpdateTitle: (columnId: string, title: string) => void
  onDelete: (columnId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `sortable-col-${column.id}`,
    data: { type: 'sortable-column', columnId: column.id },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Column
        column={column}
        onCreateActivity={onCreateActivity}
        onActivityClick={onActivityClick}
        onToggleComplete={onToggleComplete}
        onUpdateTitle={onUpdateTitle}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

export function Board({ board, filterUserId }: BoardProps) {
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null)
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const setSelectedActivity = useKanbanStore((s) => s.setSelectedActivity)
  const createActivity = useCreateActivity(board.id)
  const moveActivity = useMoveActivity(board.id)
  const toggleComplete = useToggleComplete(board.id)
  const updateColumn = useUpdateColumn(board.id)
  const removeColumn = useRemoveColumn(board.id)
  const reorderColumns = useReorderColumns(board.id)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const columnIds = useMemo(
    () => board.columns.map((c) => `sortable-col-${c.id}`),
    [board.columns],
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const activity = active.data.current?.activity as Activity | undefined
    if (activity) {
      setActiveActivity(activity)
      return
    }
    if (active.data.current?.type === 'sortable-column') {
      setActiveColumnId(active.data.current.columnId as string)
    }
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveActivity(null)
      setActiveColumnId(null)

      if (!over) return

      // Column reorder
      if (active.data.current?.type === 'sortable-column') {
        const activeColId = active.data.current.columnId as string
        let overColId: string | null = null

        if (over.data.current?.type === 'sortable-column') {
          overColId = over.data.current.columnId as string
        } else if (over.data.current?.type === 'column') {
          overColId = over.data.current.columnId as string
        }

        if (!overColId || activeColId === overColId) return

        const oldIndex = board.columns.findIndex((c) => c.id === activeColId)
        const newIndex = board.columns.findIndex((c) => c.id === overColId)
        if (oldIndex === -1 || newIndex === -1) return

        const newColumns = [...board.columns]
        const [moved] = newColumns.splice(oldIndex, 1)
        newColumns.splice(newIndex, 0, moved)

        // Optimistic update
        queryClient.setQueryData(['board', board.id], (old: BoardType | undefined) => {
          if (!old) return old
          return { ...old, columns: newColumns }
        })

        reorderColumns.mutate(
          newColumns.map((c, i) => ({ id: c.id, position: i })),
        )
        return
      }

      // Activity move
      const activityId = active.id as string
      const activity = active.data.current?.activity as Activity | undefined
      if (!activity) return

      let targetColumnId: string
      let targetPosition: number

      if (over.data.current?.type === 'column' || over.data.current?.type === 'sortable-column') {
        targetColumnId = (over.data.current.columnId as string)
        const targetColumn = board.columns.find((c) => c.id === targetColumnId)
        targetPosition = targetColumn?.activities.length ?? 0
      } else {
        const overActivity = over.data.current?.activity as Activity | undefined
        if (!overActivity) return
        targetColumnId = overActivity.columnId
        targetPosition = overActivity.position
      }

      if (activity.columnId === targetColumnId && activity.position === targetPosition) return

      queryClient.setQueryData(['board', board.id], (old: BoardType | undefined) => {
        if (!old) return old
        const newCols = old.columns.map((col: ColumnType) => {
          let activities = col.activities.filter((a: Activity) => a.id !== activityId)
          if (col.id === targetColumnId) {
            const movedActivity = { ...activity, columnId: targetColumnId, position: targetPosition }
            activities.splice(targetPosition, 0, movedActivity)
            activities = activities.map((a: Activity, i: number) => ({ ...a, position: i }))
          }
          return { ...col, activities }
        })
        return { ...old, columns: newCols }
      })

      moveActivity.mutate({ activityId, data: { columnId: targetColumnId, position: targetPosition } })
    },
    [board, queryClient, moveActivity, reorderColumns],
  )

  function handleCreateActivity(columnId: string, title: string) {
    createActivity.mutate({ columnId, title })
  }

  function handleActivityClick(activity: Activity) {
    setSelectedActivity(activity.id)
  }

  function handleToggleComplete(activityId: string, isCompleted: boolean) {
    toggleComplete.mutate({ activityId, isCompleted })
  }

  function handleUpdateColumnTitle(columnId: string, title: string) {
    updateColumn.mutate({ columnId, data: { title } })
  }

  function handleDeleteColumn() {
    if (deleteColumnId) {
      removeColumn.mutate(deleteColumnId, {
        onSettled: () => setDeleteColumnId(null),
      })
    }
  }

  const activeColumn = activeColumnId ? board.columns.find((c) => c.id === activeColumnId) : null

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          <div className="flex h-full gap-4 overflow-x-auto pb-4">
            {board.columns.map((column) => {
              const filteredColumn = filterUserId
                ? {
                    ...column,
                    activities: column.activities.filter((a) =>
                      a.assignees.some((assignee) => assignee.userId === filterUserId),
                    ),
                  }
                : column

              return (
                <SortableColumn
                  key={column.id}
                  column={filteredColumn}
                  onCreateActivity={handleCreateActivity}
                  onActivityClick={handleActivityClick}
                  onToggleComplete={handleToggleComplete}
                  onUpdateTitle={handleUpdateColumnTitle}
                  onDelete={setDeleteColumnId}
                />
              )
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeActivity ? (
            <div className="w-[280px]">
              <ActivityCard activity={activeActivity} />
            </div>
          ) : null}
          {activeColumn ? (
            <div className="w-[280px] rounded-lg border border-border bg-muted/80 p-3 shadow-lg opacity-80">
              <p className="text-sm font-semibold">{activeColumn.title}</p>
              <p className="text-xs text-muted-foreground">{activeColumn.activities.length} atividades</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ConfirmDialog
        open={!!deleteColumnId}
        onOpenChange={(open) => !open && setDeleteColumnId(null)}
        title="Deletar coluna"
        description="Todos os cards desta coluna serão removidos. Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        loading={removeColumn.isPending}
        onConfirm={handleDeleteColumn}
      />
    </>
  )
}
