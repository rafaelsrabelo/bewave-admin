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
import { ActivityModal } from './ActivityModal'
import { useCreateActivity, useUpdateActivity, useMoveActivity } from '@/hooks/useBoards'
import type { Board as BoardType, Activity, Column as ColumnType } from '@/services/boards.service'

type BoardProps = {
  board: BoardType
}

export function Board({ board }: BoardProps) {
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const queryClient = useQueryClient()
  const createActivity = useCreateActivity(board.id)
  const updateActivity = useUpdateActivity(board.id)
  const moveActivity = useMoveActivity(board.id)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const activity = active.data.current?.activity as Activity | undefined
    if (activity) {
      setActiveActivity(activity)
    }
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

      if (activity.columnId === targetColumnId && activity.position === targetPosition) {
        return
      }

      // Optimistic update
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

      moveActivity.mutate({ id: activityId, data: { columnId: targetColumnId, position: targetPosition } })
    },
    [board, queryClient, moveActivity],
  )

  function handleCreateActivity(columnId: string, title: string) {
    createActivity.mutate({ columnId, title })
  }

  function handleActivityClick(activity: Activity) {
    setEditingActivity(activity)
    setModalOpen(true)
  }

  function handleSaveActivity(data: { title: string; description?: string; priority: string; category?: string }) {
    if (editingActivity) {
      updateActivity.mutate(
        { id: editingActivity.id, data },
        { onSettled: () => setModalOpen(false) },
      )
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
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onCreateActivity={handleCreateActivity}
              onActivityClick={handleActivityClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeActivity ? (
            <div className="w-72">
              <ActivityCard activity={activeActivity} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ActivityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        activity={editingActivity}
        onSave={handleSaveActivity}
        loading={updateActivity.isPending}
      />
    </>
  )
}
