import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useClients, useRemoveClient } from '@/hooks/useClients'

type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: 'lead' | 'active'
  contractMonths: number
  paid: boolean
  createdAt: string
  address: string | null
  deletedAt: string | null
}

export function ClientsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paidFilter, setPaidFilter] = useState<string>('all')
  const [removeTarget, setRemoveTarget] = useState<Client | null>(null)

  const { data, isLoading } = useClients({
    page,
    limit: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    paid: paidFilter !== 'all' ? paidFilter : undefined,
  })
  const removeMutation = useRemoveClient()

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (client: Client) => <span className="font-medium">{client.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (client: Client) => (
        <span className="text-muted-foreground">{client.email ?? '—'}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Telefone',
      render: (client: Client) => (
        <span className="text-muted-foreground">{client.phone ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (client: Client) => (
        <StatusBadge
          variant={client.status}
          label={client.status === 'active' ? 'Ativo' : 'Lead'}
        />
      ),
    },
    {
      key: 'contract',
      header: 'Contrato',
      render: (client: Client) => (
        <span className="text-muted-foreground">{client.contractMonths} meses</span>
      ),
    },
    {
      key: 'paid',
      header: 'Mensalidade',
      render: (client: Client) => (
        <StatusBadge
          variant={client.paid ? 'paid' : 'pending'}
          label={client.paid ? 'Pago' : 'Pendente'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (client: Client) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/clients/${client.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setRemoveTarget(client)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes e leads"
        action={
          <Button asChild>
            <Link to="/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paidFilter} onValueChange={setPaidFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Pago</SelectItem>
            <SelectItem value="false">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.meta.totalPages ?? 1}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remover cliente"
        description={`Tem certeza que deseja remover o cliente "${removeTarget?.name}"?`}
        confirmLabel="Remover"
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
