import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MoreHorizontal, Pencil, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useUsers, useDeactivateUser } from '@/hooks/useUsers'

type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  phone: string | null
  isActive: boolean
  createdAt: string
}

export function UsersPage() {
  const [page, setPage] = useState(1)
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null)

  const { data, isLoading } = useUsers({ page, limit: 20 })
  const deactivateMutation = useDeactivateUser()

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/users/${user.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            {user.isActive && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeactivateTarget(user)}
              >
                <UserX className="mr-2 h-4 w-4" />
                Desativar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
    </div>
  )
}
