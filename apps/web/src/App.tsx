import { useEffect } from 'react'
import { AppRoutes } from '@/routes'
import { AuthProvider } from '@/providers/AuthProvider'
import { useUiStore } from '@/stores/ui.store'

export function App() {
  const theme = useUiStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
