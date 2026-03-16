import { prisma } from '../../lib/prisma.js'

export class DashboardService {
  static async getMemberStats(userId: string) {
    const [assigned, completed, boardsRaw] = await Promise.all([
      prisma.activityAssignee.count({
        where: {
          userId,
          activity: { deletedAt: null },
        },
      }),
      prisma.activityAssignee.count({
        where: {
          userId,
          activity: { deletedAt: null, isCompleted: true },
        },
      }),
      prisma.activity.groupBy({
        by: ['columnId'],
        where: {
          deletedAt: null,
          isCompleted: false,
          assignees: { some: { userId } },
        },
        _count: { id: true },
      }),
    ])

    const columnIds = boardsRaw.map((r) => r.columnId)
    const columns = columnIds.length > 0
      ? await prisma.column.findMany({
          where: { id: { in: columnIds }, deletedAt: null },
          select: {
            id: true,
            board: {
              select: { id: true, name: true, color: true, workspaceId: true },
            },
          },
        })
      : []

    const boardMap = new Map<string, { boardId: string; boardName: string; color: string | null; workspaceId: string; count: number }>()
    for (const row of boardsRaw) {
      const col = columns.find((c) => c.id === row.columnId)
      if (!col) continue
      const existing = boardMap.get(col.board.id)
      if (existing) {
        existing.count += row._count.id
      } else {
        boardMap.set(col.board.id, {
          boardId: col.board.id,
          boardName: col.board.name,
          color: col.board.color,
          workspaceId: col.board.workspaceId,
          count: row._count.id,
        })
      }
    }

    return {
      activitiesAssigned: assigned,
      activitiesCompleted: completed,
      activitiesPending: assigned - completed,
      boardsWithPendingActivities: Array.from(boardMap.values()),
    }
  }
}
