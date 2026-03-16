import { useAuthStore } from '@/stores/auth.store'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { MemberDashboard } from '@/components/dashboard/MemberDashboard'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  return <MemberDashboard />
}
