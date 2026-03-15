import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, MessageSquare, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { format, isPast } from 'date-fns'
import type { Activity } from '@/services/boards.service'

const priorityConfig: Record<string, { label: string; className: string }> = {
  urgent: { label: 'Urgente', className: 'bg-red-500/10 text-red-500' },
  high: { label: 'Alta', className: 'bg-amber-500/10 text-amber-500' },
  medium: { label: 'Média', className: 'bg-blue-500/10 text-blue-500' },
  low: { label: 'Baixa', className: 'bg-zinc-500/10 text-zinc-400' },
}

const tagColors = [
  'bg-blue-500/10 text-blue-500',
  'bg-emerald-500/10 text-emerald-500',
  'bg-violet-500/10 text-violet-500',
  'bg-amber-500/10 text-amber-500',
  'bg-pink-500/10 text-pink-500',
]

type ActivityCardProps = {
  activity: Activity
  onClick?: () => void
  onToggleComplete?: (activityId: string, isCompleted: boolean) => void
}

export function ActivityCard({ activity, onClick, onToggleComplete }: ActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id, data: { type: 'activity', activity } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = priorityConfig[activity.priority] ?? priorityConfig.medium
  const dueDateLocal = activity.dueDate ? new Date(activity.dueDate.split('T')[0] + 'T12:00:00') : null
  const isOverdue = dueDateLocal && !activity.isCompleted && isPast(dueDateLocal)
  const commentCount = activity._count?.comments ?? 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group cursor-pointer rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg',
        activity.isCompleted && 'opacity-60',
      )}
      onClick={onClick}
    >
      {activity.coverColor && (
        <div className="h-1.5 rounded-t-lg" style={{ backgroundColor: activity.coverColor }} />
      )}

      <div className="p-3">
        <div className="flex items-start gap-2">
          <button
            type="button"
            className={cn(
              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
              activity.isCompleted
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-muted-foreground/30 hover:border-primary',
            )}
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete?.(activity.id, !activity.isCompleted)
            }}
          >
            {activity.isCompleted && <Check className="h-3 w-3" />}
          </button>

          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <p className={cn('text-sm font-medium leading-tight', activity.isCompleted && 'line-through')}>
              {activity.title}
            </p>

            {activity.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {activity.tags.map((tag, i) => (
                  <Badge key={tag} variant="secondary" className={cn('px-1.5 py-0 text-[10px]', tagColors[i % tagColors.length])}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className={cn('text-[10px]', priority.className)}>
                {priority.label}
              </Badge>

              {dueDateLocal && (
                <span className={cn('flex items-center gap-1 text-[10px]', isOverdue ? 'text-red-500' : 'text-muted-foreground')}>
                  <Calendar className="h-3 w-3" />
                  {format(dueDateLocal, 'dd/MM')}
                </span>
              )}

              {commentCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {commentCount}
                </span>
              )}
            </div>

            {activity.assignees.length > 0 && (
              <div className="mt-2 flex -space-x-1">
                {activity.assignees.slice(0, 3).map((a) => (
                  <Avatar key={a.userId} className="h-5 w-5 border-2 border-card">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[8px]">
                      {a.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {activity.assignees.length > 3 && (
                  <span className="ml-1 text-xs text-muted-foreground">+{activity.assignees.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
