import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

type MemberDashboardData = {
  activitiesAssigned: number
  activitiesCompleted: number
  activitiesPending: number
  boardsWithPendingActivities: Array<{
    boardId: string
    boardName: string
    color: string | null
    workspaceId: string
    count: number
  }>
}

export function useMemberDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'member'],
    queryFn: async () => {
      const response = await api.get<{ data: MemberDashboardData }>('/dashboard/member')
      return response.data.data
    },
  })
}
