import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserRound,
  Kanban,
  DollarSign,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Usuários', href: '/users', icon: Users },
  { label: 'Clientes', href: '/clients', icon: UserRound },
  { label: 'Quadros', href: '/boards', icon: Kanban },
  { label: 'Financeiro', href: '/finance', icon: DollarSign },
]

export function Sidebar() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const { sidebarOpen, toggleSidebar } = useUiStore()

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {sidebarOpen && (
          <span className="text-lg font-bold text-primary">bewave</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-sidebar-foreground"
        >
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href)
          const linkContent = (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                !sidebarOpen && 'justify-center px-0',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          )

          if (!sidebarOpen) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          }

          return linkContent
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className={cn('flex items-center gap-3 p-3', !sidebarOpen && 'justify-center')}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
          </AvatarFallback>
        </Avatar>
        {sidebarOpen && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.name ?? 'Usuário'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
