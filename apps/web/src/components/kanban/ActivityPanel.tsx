import { useState, useRef, useEffect } from 'react'
import { X, Check, Calendar, Tag, MessageSquare, Trash2, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useActivity, useUpdateActivity, useToggleComplete, useRemoveActivity } from '@/hooks/useActivities'
import { useComments, useCreateComment, useRemoveComment } from '@/hooks/useComments'
import { useKanbanStore } from '@/stores/kanban.store'
import { useAuthStore } from '@/stores/auth.store'

type ActivityPanelProps = {
  boardId: string
}

export function ActivityPanel({ boardId }: ActivityPanelProps) {
  const { selectedActivityId, setSelectedActivity } = useKanbanStore()
  const currentUser = useAuthStore((s) => s.user)

  const { data: activity } = useActivity(selectedActivityId)
  const { data: comments } = useComments(selectedActivityId)
  const updateActivity = useUpdateActivity(boardId)
  const toggleComplete = useToggleComplete(boardId)
  const removeActivity = useRemoveActivity(boardId)
  const createComment = useCreateComment()
  const removeComment = useRemoveComment()

  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [commentText, setCommentText] = useState('')
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activity) {
      setTitle(activity.title)
      setDescription(activity.description ?? '')
    }
  }, [activity])

  if (!selectedActivityId || !activity) return null

  function saveField(field: string, value: unknown) {
    if (!selectedActivityId) return
    updateActivity.mutate({ activityId: selectedActivityId, data: { [field]: value } })
  }

  function handleTitleSave() {
    if (title.trim() && title !== activity?.title) {
      saveField('title', title.trim())
    }
    setEditingTitle(false)
  }

  function handleDescriptionBlur() {
    if (description !== (activity?.description ?? '')) {
      saveField('description', description)
    }
  }

  function handleAddTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTags = [...(activity?.tags ?? []), tagInput.trim()]
      saveField('tags', newTags)
      setTagInput('')
    }
  }

  function handleRemoveTag(tag: string) {
    const newTags = (activity?.tags ?? []).filter((t) => t !== tag)
    saveField('tags', newTags)
  }

  function handleSubmitComment() {
    if (commentText.trim() && selectedActivityId) {
      createComment.mutate(
        { activityId: selectedActivityId, content: commentText.trim() },
        { onSuccess: () => setCommentText('') },
      )
    }
  }

  function handleDelete() {
    if (!selectedActivityId) return
    removeActivity.mutate(selectedActivityId, {
      onSuccess: () => setSelectedActivity(null),
    })
  }

  return (
    <div className="fixed right-0 top-0 z-20 flex h-full w-[420px] flex-col border-l border-border bg-card shadow-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
              activity.isCompleted
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-muted-foreground/30 hover:border-primary',
            )}
            onClick={() => toggleComplete.mutate({ activityId: activity.id, isCompleted: !activity.isCompleted })}
          >
            {activity.isCompleted && <Check className="h-3.5 w-3.5" />}
          </button>

          {editingTitle ? (
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="h-7 text-sm font-semibold"
            />
          ) : (
            <h3
              className={cn('cursor-pointer truncate text-sm font-semibold', activity.isCompleted && 'line-through')}
              onClick={() => setEditingTitle(true)}
            >
              {activity.title}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedActivity(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Metadata */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Prioridade</span>
            <Select
              value={activity.priority}
              onValueChange={(v) => saveField('priority', v)}
            >
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Data limite
            </span>
            <Input
              type="date"
              className="h-7 w-36 text-xs"
              value={activity.dueDate ? activity.dueDate.split('T')[0] : ''}
              onChange={(e) => saveField('dueDate', e.target.value || null)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Categoria</span>
            <Input
              className="h-7 w-36 text-xs"
              placeholder="Sem categoria"
              defaultValue={activity.category ?? ''}
              onBlur={(e) => {
                if (e.target.value !== (activity.category ?? '')) {
                  saveField('category', e.target.value || null)
                }
              }}
            />
          </div>

          {activity.column && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Coluna</span>
              <Badge variant="outline" className="text-xs">{activity.column.title}</Badge>
            </div>
          )}
        </div>

        <Separator />

        {/* Tags */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Tags</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {activity.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs gap-1">
                {tag}
                <button type="button" className="hover:text-destructive" onClick={() => handleRemoveTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Adicionar tag (Enter)"
            className="h-7 text-xs"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
        </div>

        <Separator />

        {/* Description */}
        <div>
          <span className="mb-2 block text-xs font-medium text-muted-foreground">Descrição</span>
          <Textarea
            placeholder="Adicionar descrição..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            className="text-sm resize-none"
          />
        </div>

        <Separator />

        {/* Comments */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Comentários ({comments?.length ?? 0})
            </span>
          </div>

          <div className="space-y-3 mb-3">
            {comments?.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[8px]">
                    {comment.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{comment.user.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { locale: ptBR, addSuffix: true })}
                    </span>
                    {comment.userId === currentUser?.id && (
                      <button
                        type="button"
                        className="text-[10px] text-muted-foreground hover:text-destructive"
                        onClick={() => removeComment.mutate({ commentId: comment.id, activityId: activity.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Escrever comentário..."
              rows={2}
              className="text-sm resize-none flex-1"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleSubmitComment()
              }}
            />
            <Button
              size="icon"
              className="h-auto shrink-0"
              disabled={!commentText.trim() || createComment.isPending}
              onClick={handleSubmitComment}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
