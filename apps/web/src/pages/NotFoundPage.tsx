import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground/50" />
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">Página não encontrada</p>
      <Button asChild variant="outline">
        <Link to="/dashboard">Voltar ao Dashboard</Link>
      </Button>
    </div>
  )
}
