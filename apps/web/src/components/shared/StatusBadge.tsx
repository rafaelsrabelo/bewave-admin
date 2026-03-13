import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusBadgeProps = {
  variant: 'lead' | 'active' | 'paid' | 'pending' | 'income' | 'expense'
  label: string
}

const variantStyles: Record<StatusBadgeProps['variant'], string> = {
  lead: 'bg-amber-500/10 text-amber-500',
  active: 'bg-emerald-500/10 text-emerald-500',
  paid: 'bg-emerald-500/10 text-emerald-500',
  pending: 'bg-red-500/10 text-red-500',
  income: 'bg-emerald-500/10 text-emerald-500',
  expense: 'bg-red-500/10 text-red-500',
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <Badge variant="secondary" className={cn(variantStyles[variant])}>
      {label}
    </Badge>
  )
}
