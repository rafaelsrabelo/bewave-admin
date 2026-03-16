import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { useLogout } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Usuários',
  '/clients': 'Clientes',
  '/plans': 'Planos',
  '/boards': 'Quadros',
  '/finance': 'Financeiro',
  '/profile': 'Perfil',
}

export function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { theme, toggleTheme } = useUiStore()
  const logoutMutation = useLogout()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const currentTitle =
    Object.entries(pageTitles).find(([path]) =>
      location.pathname.startsWith(path),
    )?.[1] ?? ''

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-lg font-semibold text-foreground">{currentTitle}</h1>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
        >
          <div className="relative h-4 w-4">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 transition-transform duration-300" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-300" />
            )}
          </div>
        </Button>

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-[#03428E] text-xs font-semibold text-white">
                {user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-popover p-1 shadow-md">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="-mx-1 my-1 h-px bg-border" />
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/profile')
                }}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Meu Perfil
              </button>
              <div className="-mx-1 my-1 h-px bg-border" />
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setMenuOpen(false)
                  logoutMutation.mutate()
                }}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
