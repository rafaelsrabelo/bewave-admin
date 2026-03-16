import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import { getPagination, buildMeta } from '../../shared/utils/pagination.js'
import type { CreatePlanInput, UpdatePlanInput, ListPlansInput } from './plans.schema.js'

export class PlansService {
  static async list(filters: ListPlansInput) {
    const { skip, take } = getPagination(filters)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 50

    const where: Record<string, unknown> = { deletedAt: null }
    if (filters.isActive !== undefined) where.isActive = filters.isActive

    const [items, total] = await prisma.$transaction([
      prisma.plan.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      prisma.plan.count({ where }),
    ])

    return { items, meta: buildMeta(page, limit, total) }
  }

  static async findById(id: string) {
    const plan = await prisma.plan.findFirst({
      where: { id, deletedAt: null },
    })

    if (!plan) {
      throw new AppError('PLAN_NOT_FOUND', 'Plano não encontrado', 404)
    }

    return plan
  }

  static async create(data: CreatePlanInput) {
    return prisma.plan.create({ data })
  }

  static async update(id: string, data: UpdatePlanInput) {
    const plan = await this.findById(id)

    if (data.durationMonths !== undefined && data.durationMonths !== plan.durationMonths) {
      const activeSubscriptions = await prisma.clientSubscription.count({
        where: { planId: id, status: 'active' },
      })
      if (activeSubscriptions > 0) {
        throw new AppError(
          'PLAN_HAS_ACTIVE_SUBSCRIPTIONS',
          'Não é possível alterar a duração do plano pois há assinaturas ativas',
          409,
        )
      }
    }

    return prisma.plan.update({ where: { id }, data })
  }

  static async deactivate(id: string) {
    await this.findById(id)

    const activeSubscriptions = await prisma.clientSubscription.count({
      where: { planId: id, status: { in: ['active', 'overdue'] } },
    })
    if (activeSubscriptions > 0) {
      throw new AppError(
        'PLAN_HAS_ACTIVE_SUBSCRIPTIONS',
        `Não é possível desativar o plano pois há ${activeSubscriptions} assinatura(s) ativa(s)`,
        409,
      )
    }

    return prisma.plan.update({
      where: { id },
      data: { isActive: false },
    })
  }
}
