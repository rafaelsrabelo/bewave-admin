import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FinanceEntryModal } from '@/components/finance/FinanceEntryModal'
import { useFinanceEntries, useFinanceSummary, useCreateEntry, useRemoveEntry } from '@/hooks/useFinance'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

function getMonthRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
  return {
    dateFrom: `${year}-${month}-01`,
    dateTo: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  }
}

type Entry = {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  createdAt: string
}

export function FinancePage() {
  const defaultRange = getMonthRange()
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom)
  const [dateTo, setDateTo] = useState(defaultRange.dateTo)
  const [modalOpen, setModalOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<Entry | null>(null)

  const { data: entries, isLoading } = useFinanceEntries({ page, limit: 20, dateFrom, dateTo })
  const { data: summary } = useFinanceSummary({ dateFrom, dateTo })
  const createMutation = useCreateEntry()
  const removeMutation = useRemoveEntry()

  const columns = [
    {
      key: 'date',
      header: 'Data',
      render: (e: Entry) => (
        <span className="text-muted-foreground">
          {format(new Date(e.date), 'dd/MM/yyyy')}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (e: Entry) => (
        <StatusBadge
          variant={e.type}
          label={e.type === 'income' ? 'Entrada' : 'Saída'}
        />
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (e: Entry) => <span className="font-medium">{e.description}</span>,
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (e: Entry) => (
        <span className="text-muted-foreground capitalize">{e.category}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (e: Entry) => (
        <span className={e.type === 'income' ? 'text-emerald-500 font-medium' : 'text-red-500 font-medium'}>
          {e.type === 'income' ? '+' : '-'} {formatCurrency(e.amount)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (e: Entry) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => setRemoveTarget(e)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Controle de entradas e saídas"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Lançamento
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard
          title="Total Entradas"
          value={formatCurrency(summary?.totalIncome ?? 0)}
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Total Saídas"
          value={formatCurrency(summary?.totalExpense ?? 0)}
          icon={TrendingDown}
          trend="down"
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(summary?.balance ?? 0)}
          icon={DollarSign}
          trend={(summary?.balance ?? 0) >= 0 ? 'up' : 'down'}
        />
      </div>

      <div className="mb-4 flex gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-xs">De</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Até</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={entries?.data ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={entries?.meta.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="Nenhum lançamento no período"
      />

      <FinanceEntryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        loading={createMutation.isPending}
        onSave={(data) => {
          createMutation.mutate(data, {
            onSuccess: () => setModalOpen(false),
          })
        }}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remover lançamento"
        description={`Remover "${removeTarget?.description}"?`}
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
