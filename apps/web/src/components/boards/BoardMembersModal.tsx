import { useState } from 'react'
import { UserPlus, Trash2, Shield, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useBoardMembers, useAddBoardMember, useRemoveBoardMember, useUpdateBoardMemberRole } from '@/hooks/useBoards'
import { useAuthStore } from '@/stores/auth.store'
import { api } from '@/lib/axios'
import { toast } from 'sonner'

type BoardMembersModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
}

type UserSearchResult = {
  id: string
  name: string
  email: string
}

export function BoardMembersModal({ open, onOpenChange, boardId }: BoardMembersModalProps) {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [searching, setSearching] = useState(false)

  const currentUser = useAuthStore((s) => s.user)
  const { data: members } = useBoardMembers(boardId)
  const addMember = useAddBoardMember()
  const removeMember = useRemoveBoardMember()
  const updateRole = useUpdateBoardMemberRole()

  const memberIds = members?.map((m) => m.userId) ?? []

  async function handleSearch() {
    if (!search.trim()) return
    setSearching(true)
    try {
      const response = await api.get<{ data: UserSearchResult[] }>('/users', {
        params: { search: search.trim(), limit: 5 },
      })
      setSearchResults(
        (response.data.data ?? []).filter((u: UserSearchResult) => !memberIds.includes(u.id)),
      )
    } catch {
      toast.error('Erro ao buscar usuários')
    } finally {
      setSearching(false)
    }
  }

  function handleAdd(userId: string) {
    addMember.mutate(
      { boardId, userId },
      {
        onSuccess: () => {
          setSearchResults((prev) => prev.filter((u) => u.id !== userId))
          setSearch('')
        },
      },
    )
  }

  function handleRemove(userId: string) {
    removeMember.mutate({ boardId, userId })
  }

  function handleToggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'member' : 'admin'
    updateRole.mutate({ boardId, userId, role: newRole })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Membros do Quadro</DialogTitle>
        </DialogHeader>

        {/* Search to add */}
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching} size="sm">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 rounded-md border border-border p-2">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-muted text-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleAdd(user.id)} disabled={addMember.isPending}>
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Current members */}
        <div className="space-y-2">
          {members?.map((member) => (
            <div key={member.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {member.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleToggleRole(member.userId, member.role)}
                  title={member.role === 'admin' ? 'Rebaixar para membro' : 'Promover para admin'}
                >
                  {member.role === 'admin' ? (
                    <Shield className="h-3.5 w-3.5 text-amber-500" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                  {member.role === 'admin' ? 'Admin' : 'Membro'}
                </Badge>
                {member.userId !== currentUser?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleRemove(member.userId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
