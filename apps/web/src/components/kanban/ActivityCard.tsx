import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Activity } from '@/services/boards.service'

const priorityConfig: Record<string, { label: string; className: string }> = {
  urgent: { label: 'Urgente', className: 'bg-red-500/10 text-red-500' },
  high: { label: 'Alta', className: 'bg-amber-500/10 text-amber-500' },
  medium: { label: 'Média', className: 'bg-blue-500/10 text-blue-500' },
  low: { label: 'Baixa', className: 'bg-zinc-500/10 text-zinc-400' },
}

type ActivityCardProps = {
  activity: Activity
  onClick?: () => void
}

export function ActivityCard({ activity, onClick }: ActivityCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg',
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">{activity.title}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className={cn('text-xs', priority.className)}>
              {priority.label}
            </Badge>
            {activity.category && (
              <Badge variant="outline" className="text-xs">
                {activity.category}
              </Badge>
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
                <span className="ml-1 text-xs text-muted-foreground">
                  +{activity.assignees.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
