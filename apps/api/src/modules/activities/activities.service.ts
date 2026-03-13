import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type {
  CreateActivityInput,
  UpdateActivityInput,
  MoveActivityInput,
} from './activities.schema.js'

export class ActivitiesService {
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
        columnId: data.columnId,
        position,
        ...(data.assigneeIds && {
          assignees: {
            create: data.assigneeIds.map((userId) => ({ userId })),
          },
        }),
      },
      include: {
        assignees: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    })
  }

  static async update(id: string, data: UpdateActivityInput) {
    await this.findById(id)

    return prisma.activity.update({
      where: { id },
      data,
      include: {
        assignees: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    })
  }

  static async move(id: string, data: MoveActivityInput) {
    await this.findById(id)

    return prisma.activity.update({
      where: { id },
      data: {
        columnId: data.columnId,
        position: data.position,
      },
      include: {
        assignees: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    })
  }

  static async addAssignee(activityId: string, userId: string) {
    return prisma.activityAssignee.create({
      data: { activityId, userId },
    })
  }

  static async removeAssignee(activityId: string, userId: string) {
    await prisma.activityAssignee.delete({
      where: {
        activityId_userId: { activityId, userId },
      },
    })
  }

  static async remove(id: string) {
    await this.findById(id)

    await prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  private static async findById(id: string) {
    const activity = await prisma.activity.findFirst({
      where: { id, deletedAt: null },
    })

    if (!activity) {
      throw new AppError('ACTIVITY_NOT_FOUND', 'Atividade não encontrada', 404)
    }

    return activity
  }
}
