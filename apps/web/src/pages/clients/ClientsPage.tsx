import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import type { Client } from '@/services/clients.service'

const periodLabels: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
  free: 'Gratuito',
}

function ClientActions({
  client,
  isOpen,
  onToggle,
  onRemove,
}: {
  client: Client
  isOpen: boolean
  onToggle: () => void
  onRemove: (client: Client) => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const close = useCallback(() => {
    if (isOpen) onToggle()
  }, [isOpen, onToggle])

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, close])

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
              close()
              navigate(`/clients/${client.id}`)
            }}
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            Ver detalhes
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            onClick={() => {
              close()
              navigate(`/clients/${client.id}/edit`)
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            Editar
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            onClick={() => {
              close()
              onRemove(client)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remover
          </button>
        </div>
      )}
    </div>
  )
}

export function ClientsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Client | null>(null)

  const { data, isLoading } = useClients({
    page,
    limit: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
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
      key: 'plan',
      header: 'Plano',
      render: (client: Client) => (
        <span className="text-muted-foreground">
          {client.plan ? `${client.plan.name} (${periodLabels[client.plan.period]})` : '—'}
        </span>
      ),
    },
    {
      key: 'payment',
      header: 'Último Pgto',
      render: (client: Client) => {
        const lastPayment = client.payments?.[0]
        if (!lastPayment) return <span className="text-muted-foreground">—</span>
        return (
          <StatusBadge
            variant={lastPayment.status === 'paid' ? 'paid' : 'pending'}
            label={lastPayment.status === 'paid' ? 'Pago' : 'Pendente'}
          />
        )
      },
    },
    {
      key: 'actions',
      header: '',
      render: (client: Client) => (
        <ClientActions
          client={client}
          isOpen={openMenuId === client.id}
          onToggle={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
          onRemove={setRemoveTarget}
        />
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
