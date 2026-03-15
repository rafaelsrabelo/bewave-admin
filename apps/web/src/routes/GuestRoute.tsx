import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function GuestRoute() {
  const accessToken = useAuthStore((s) => s.accessToken)

  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
