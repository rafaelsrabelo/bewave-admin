import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserRound,
  Kanban,
  DollarSign,
  PanelLeftClose,
  PanelLeft,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Usuários', href: '/users', icon: Users },
  { label: 'Clientes', href: '/clients', icon: UserRound },
  { label: 'Planos', href: '/plans', icon: CreditCard },
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
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#03428E]">
              <span className="font-display text-xs font-bold text-white">B</span>
            </div>
            <span className="text-base font-bold text-foreground">bewave</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 pt-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href)
          const linkContent = (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#03428E]/10 text-[#03428E] dark:bg-[#03428E]/15 dark:text-[#4a8fd4]'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                !sidebarOpen && 'justify-center px-0',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#03428E]" />
              )}
              <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-[#03428E] dark:text-[#4a8fd4]')} />
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

      {/* Footer — User */}
      <div className={cn(
        'border-t border-sidebar-border p-3',
        !sidebarOpen && 'flex justify-center',
      )}>
        <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-[#03428E] text-xs font-semibold text-white">
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
      </div>
    </aside>
  )
}
