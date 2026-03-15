import { useEffect, useState, type ReactNode } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

type RefreshResponse = {
  data: {
    accessToken: string
    user: {
      id: string
      name: string
      email: string
      role: 'admin' | 'member'
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const { accessToken, setAuth } = useAuthStore()

  useEffect(() => {
    if (accessToken) {
      setIsLoading(false)
      return
    }

    async function tryRefresh() {
      try {
        const { data } = await axios.post<RefreshResponse>('/api/v1/auth/refresh', null, {
          withCredentials: true,
        })
        setAuth(data.data.accessToken, data.data.user)
      } catch {
        // No valid refresh token — user needs to login
      } finally {
        setIsLoading(false)
      }
    }

    tryRefresh()
  }, [accessToken, setAuth])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    )
  }

  return <>{children}</>
}
