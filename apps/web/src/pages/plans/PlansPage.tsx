import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Pencil, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { usePlans, useDeactivatePlan } from '@/hooks/usePlans'
import type { Plan } from '@/services/plans.service'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

function PlanActions({
  plan,
  isOpen,
  onToggle,
  onDeactivate,
}: {
  plan: Plan
  isOpen: boolean
  onToggle: () => void
  onDeactivate: (plan: Plan) => void
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
              navigate(`/plans/${plan.id}/edit`)
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            Editar
          </button>
          {plan.isActive && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                close()
                onDeactivate(plan)
              }}
            >
              <Ban className="h-3.5 w-3.5" />
              Desativar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function PlansPage() {
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Plan | null>(null)

  const { data, isLoading } = usePlans({ page, limit: 20 })
  const deactivateMutation = useDeactivatePlan()

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (plan: Plan) => (
        <div>
          <span className="font-medium">{plan.name}</span>
          {plan.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{plan.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duração',
      render: (plan: Plan) => (
        <Badge variant="secondary">{plan.durationMonths} {plan.durationMonths === 1 ? 'mês' : 'meses'}</Badge>
      ),
    },
    {
      key: 'price',
      header: 'Valor Mensal',
      render: (plan: Plan) => (
        <span className="font-medium">{formatCurrency(plan.price)}</span>
      ),
    },
    {
      key: 'total',
      header: 'Valor Total',
      render: (plan: Plan) => (
        <span className="text-muted-foreground">{formatCurrency(plan.price * plan.durationMonths)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (plan: Plan) => (
        <StatusBadge
          variant={plan.isActive ? 'active' : 'inactive'}
          label={plan.isActive ? 'Ativo' : 'Inativo'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (plan: Plan) => (
        <PlanActions
          plan={plan}
          isOpen={openMenuId === plan.id}
          onToggle={() => setOpenMenuId(openMenuId === plan.id ? null : plan.id)}
          onDeactivate={setDeactivateTarget}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Planos"
        description="Gerencie os planos disponíveis para clientes"
        action={
          <Button asChild>
            <Link to="/plans/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano
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
        title="Desativar plano"
        description={`Tem certeza que deseja desativar o plano "${deactivateTarget?.name}"? Planos com assinaturas ativas não podem ser desativados.`}
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
