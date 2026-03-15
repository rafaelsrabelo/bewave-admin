import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type {
  CreateActivityInput,
  UpdateActivityInput,
  MoveActivityInput,
  ListActivitiesInput,
} from './activities.schema.js'

const activityInclude = {
  assignees: {
    include: {
      user: { select: { id: true, name: true } },
    },
  },
  _count: { select: { comments: true } },
} as const

export class ActivitiesService {
  static async findById(id: string) {
    const activity = await prisma.activity.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...activityInclude,
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        column: { select: { id: true, title: true, boardId: true } },
      },
    })

    if (!activity) {
      throw new AppError('ACTIVITY_NOT_FOUND', 'Atividade não encontrada', 404)
    }

    return activity
  }

  static async create(data: CreateActivityInput) {
    const lastActivity = await prisma.activity.findFirst({
      where: { columnId: data.columnId, deletedAt: null },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const position = lastActivity ? lastActivity.position + 1 : 0

    return prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        coverColor: data.coverColor,
        tags: data.tags ?? [],
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        columnId: data.columnId,
        position,
        ...(data.assigneeIds?.length && {
          assignees: {
            create: data.assigneeIds.map((userId) => ({ userId })),
          },
        }),
      },
      include: activityInclude,
    })
  }

  static async update(id: string, data: UpdateActivityInput) {
    await this.assertExists(id)

    const { assigneeIds, dueDate, ...rest } = data

    const activity = await prisma.$transaction(async (tx) => {
      if (assigneeIds !== undefined) {
        await tx.activityAssignee.deleteMany({ where: { activityId: id } })
        if (assigneeIds.length > 0) {
          await tx.activityAssignee.createMany({
            data: assigneeIds.map((userId) => ({ activityId: id, userId })),
          })
        }
      }

      return tx.activity.update({
        where: { id },
        data: {
          ...rest,
          ...(dueDate !== undefined && {
            dueDate: dueDate ? new Date(dueDate) : null,
          }),
        },
        include: activityInclude,
      })
    })

    return activity
  }

  static async move(id: string, data: MoveActivityInput) {
    await this.assertExists(id)

    return prisma.activity.update({
      where: { id },
      data: {
        columnId: data.columnId,
        position: data.position,
      },
      include: activityInclude,
    })
  }

  static async toggleComplete(id: string, isCompleted: boolean) {
    await this.assertExists(id)

    return prisma.activity.update({
      where: { id },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: activityInclude,
    })
  }

  static async remove(id: string) {
    await this.assertExists(id)

    await prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  static async addAssignee(activityId: string, userId: string) {
    const existing = await prisma.activityAssignee.findUnique({
      where: { activityId_userId: { activityId, userId } },
    })

    if (existing) {
      throw new AppError('ASSIGNEE_EXISTS', 'Usuário já é responsável por esta atividade', 400)
    }

    return prisma.activityAssignee.create({
      data: { activityId, userId },
      include: {
        user: { select: { id: true, name: true } },
      },
    })
  }

  static async removeAssignee(activityId: string, userId: string) {
    await prisma.activityAssignee.delete({
      where: {
        activityId_userId: { activityId, userId },
      },
    })
  }

  static async listByBoard(boardId: string, filters: ListActivitiesInput) {
    const where: Record<string, unknown> = {
      deletedAt: null,
      column: { boardId, deletedAt: null },
    }

    if (filters.columnId) where.columnId = filters.columnId
    if (filters.priority) where.priority = filters.priority
    if (filters.isCompleted !== undefined) where.isCompleted = filters.isCompleted
    if (filters.assigneeId) {
      where.assignees = { some: { userId: filters.assigneeId } }
    }

    const [items, total] = await prisma.$transaction([
      prisma.activity.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { position: 'asc' },
        include: activityInclude,
      }),
      prisma.activity.count({ where }),
    ])

    return {
      items,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    }
  }

  static async listMine(userId: string, filters: ListActivitiesInput) {
    const where: Record<string, unknown> = {
      deletedAt: null,
      column: { deletedAt: null, board: { deletedAt: null } },
      assignees: { some: { userId } },
    }

    if (filters.priority) where.priority = filters.priority
    if (filters.isCompleted !== undefined) where.isCompleted = filters.isCompleted

    const [items, total] = await prisma.$transaction([
      prisma.activity.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        include: {
          ...activityInclude,
          column: {
            select: {
              id: true,
              title: true,
              board: { select: { id: true, name: true, color: true, icon: true } },
            },
          },
        },
      }),
      prisma.activity.count({ where }),
    ])

    return {
      items,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    }
  }

  private static async assertExists(id: string) {
    const activity = await prisma.activity.findFirst({
      where: { id, deletedAt: null },
    })

    if (!activity) {
      throw new AppError('ACTIVITY_NOT_FOUND', 'Atividade não encontrada', 404)
    }

    return activity
  }
}
