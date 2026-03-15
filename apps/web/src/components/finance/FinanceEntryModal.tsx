import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const FINANCE_CATEGORIES = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'outros', label: 'Outros' },
] as const

const entrySchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição obrigatória'),
  category: z.enum(['tecnologia', 'marketing', 'atendimento', 'comercial', 'outros'], {
    required_error: 'Categoria obrigatória',
  }),
  date: z.string().min(1, 'Data obrigatória'),
})

type EntryFormData = z.infer<typeof entrySchema>

type FinanceEntryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: EntryFormData) => void
  loading?: boolean
}

export function FinanceEntryModal({ open, onOpenChange, onSave, loading }: FinanceEntryModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      type: 'income',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const typeValue = watch('type')
  const categoryValue = watch('category')

  function handleClose(isOpen: boolean) {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  function handleSave(data: EntryFormData) {
    onSave({ ...data, amount: Math.round(data.amount * 100) })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={typeValue === 'income' ? 'default' : 'outline'}
                className={cn(typeValue === 'income' && 'bg-emerald-600 hover:bg-emerald-700')}
                onClick={() => setValue('type', 'income')}
              >
                Entrada
              </Button>
              <Button
                type="button"
                variant={typeValue === 'expense' ? 'default' : 'outline'}
                className={cn(typeValue === 'expense' && 'bg-red-600 hover:bg-red-700')}
                onClick={() => setValue('type', 'expense')}
              >
                Saída
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                autoFocus
                {...register('amount')}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input id="description" {...register('description')} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select
              value={categoryValue}
              onValueChange={(val) => setValue('category', val as EntryFormData['category'], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {FINANCE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
