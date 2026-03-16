import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Pencil, UserX, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useUsers, useDeactivateUser, useRemoveUser } from '@/hooks/useUsers'
import { useAuthStore } from '@/stores/auth.store'

type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  phone: string | null
  isActive: boolean
  createdAt: string
}

function UserActions({
  user,
  isAdmin,
  isOpen,
  onToggle,
  onDeactivate,
  onRemove,
}: {
  user: User
  isAdmin: boolean
  isOpen: boolean
  onToggle: () => void
  onDeactivate: (user: User) => void
  onRemove: (user: User) => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        onToggle()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onToggle])

  useEffect(() => {
    if (!isOpen || !menuRef.current || !buttonRef.current) return
    const btnRect = buttonRef.current.getBoundingClientRect()
    const menu = menuRef.current
    const menuHeight = menu.offsetHeight
    const menuWidth = menu.offsetWidth
    const spaceBelow = window.innerHeight - btnRect.bottom
    const top = spaceBelow < menuHeight + 8
      ? btnRect.top - menuHeight - 4
      : btnRect.bottom + 4
    const left = Math.min(btnRect.right - menuWidth, window.innerWidth - menuWidth - 8)
    menu.style.top = `${top}px`
    menu.style.left = `${Math.max(8, left)}px`
  }, [isOpen])

  return (
    <div>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggle}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 w-40 rounded-md border border-border bg-popover p-1 shadow-md"
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            onClick={() => {
              onToggle()
              navigate(`/users/${user.id}/edit`)
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            Editar
          </button>
          {user.isActive && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                onToggle()
                onDeactivate(user)
              }}
            >
              <UserX className="h-3.5 w-3.5" />
              Desativar
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                onToggle()
                onRemove(user)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function UsersPage() {
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null)
  const [removeTarget, setRemoveTarget] = useState<User | null>(null)

  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = currentUser?.role === 'admin'

  const { data, isLoading } = useUsers({ page, limit: 20 })
  const deactivateMutation = useDeactivateUser()
  const removeMutation = useRemoveUser()

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (user: User) => <span className="font-medium">{user.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: User) => <span className="text-muted-foreground">{user.email}</span>,
    },
    {
      key: 'role',
      header: 'Cargo',
      render: (user: User) => (
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
          {user.role === 'admin' ? 'Admin' : 'Membro'}
        </Badge>
      ),
    },
    {
      key: 'phone',
      header: 'Telefone',
      render: (user: User) => (
        <span className="text-muted-foreground">{user.phone ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => (
        <Badge variant={user.isActive ? 'default' : 'destructive'} className={user.isActive ? 'bg-emerald-500/10 text-emerald-500' : ''}>
          {user.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (user: User) => (
        <UserActions
          user={user}
          isAdmin={isAdmin}
          isOpen={openMenuId === user.id}
          onToggle={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
          onDeactivate={setDeactivateTarget}
          onRemove={setRemoveTarget}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários do sistema"
        action={
          <Button asChild>
            <Link to="/users/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.meta.totalPages ?? 1}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title="Desativar usuário"
        description={`Tem certeza que deseja desativar o usuário "${deactivateTarget?.name}"?`}
        confirmLabel="Desativar"
        loading={deactivateMutation.isPending}
        onConfirm={() => {
          if (deactivateTarget) {
            deactivateMutation.mutate(deactivateTarget.id, {
              onSettled: () => setDeactivateTarget(null),
            })
          }
        }}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Excluir usuário permanentemente"
        description={`Esta ação é irreversível. O usuário "${removeTarget?.name}" será excluído permanentemente do sistema.`}
        confirmLabel="Excluir permanentemente"
        loading={removeMutation.isPending}
        onConfirm={() => {
          if (removeTarget) {
            removeMutation.mutate(removeTarget.id, {
              onSettled: () => setRemoveTarget(null),
            })
          }
        }}
      />
    </div>
  )
}
