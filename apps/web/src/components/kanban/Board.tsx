import { useState, useCallback } from 'react'
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
import { useQueryClient } from '@tanstack/react-query'
import { Column } from './Column'
import { ActivityCard } from './ActivityCard'
import { useCreateActivity, useMoveActivity, useToggleComplete } from '@/hooks/useActivities'
import { useUpdateColumn, useRemoveColumn } from '@/hooks/useColumns'
import { useKanbanStore } from '@/stores/kanban.store'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { Board as BoardType, Activity, Column as ColumnType } from '@/services/boards.service'

type BoardProps = {
  board: BoardType
  filterUserId?: string | null
}

export function Board({ board, filterUserId }: BoardProps) {
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null)
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const setSelectedActivity = useKanbanStore((s) => s.setSelectedActivity)
  const createActivity = useCreateActivity(board.id)
  const moveActivity = useMoveActivity(board.id)
  const toggleComplete = useToggleComplete(board.id)
  const updateColumn = useUpdateColumn(board.id)
  const removeColumn = useRemoveColumn(board.id)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  function handleDragStart(event: DragStartEvent) {
    const activity = event.active.data.current?.activity as Activity | undefined
    if (activity) setActiveActivity(activity)
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveActivity(null)

      if (!over) return

      const activityId = active.id as string
      const activity = active.data.current?.activity as Activity | undefined
      if (!activity) return

      let targetColumnId: string
      let targetPosition: number

      if (over.data.current?.type === 'column') {
        targetColumnId = over.data.current.columnId as string
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
        const newColumns = old.columns.map((col: ColumnType) => {
          let activities = col.activities.filter((a: Activity) => a.id !== activityId)
          if (col.id === targetColumnId) {
            const movedActivity = { ...activity, columnId: targetColumnId, position: targetPosition }
            activities.splice(targetPosition, 0, movedActivity)
            activities = activities.map((a: Activity, i: number) => ({ ...a, position: i }))
          }
          return { ...col, activities }
        })
        return { ...old, columns: newColumns }
      })

      moveActivity.mutate({ activityId, data: { columnId: targetColumnId, position: targetPosition } })
    },
    [board, queryClient, moveActivity],
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

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
            <Column
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

        <DragOverlay>
          {activeActivity ? (
            <div className="w-[280px]">
              <ActivityCard activity={activeActivity} />
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
