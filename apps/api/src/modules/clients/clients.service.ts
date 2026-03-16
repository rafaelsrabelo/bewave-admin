import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import { getPagination, buildMeta } from '../../shared/utils/pagination.js'
import type { CreateClientInput, UpdateClientInput, ListClientsInput } from './clients.schema.js'

export class ClientsService {
  static async list(filters: ListClientsInput) {
    const { skip, take } = getPagination(filters)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20

    const where = {
      deletedAt: null,
      ...(filters.status && { status: filters.status }),
    }

    const [items, total] = await prisma.$transaction([
      prisma.client.findMany({
        where,
        skip,
        take,
        include: {
          plan: { select: { id: true, name: true, price: true, period: true } },
          payments: {
            orderBy: { referenceMonth: 'desc' },
            take: 1,
            select: { id: true, status: true, referenceMonth: true },
          },
          subscriptions: {
            where: { status: { in: ['active', 'overdue'] } },
            take: 1,
            include: {
              plan: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ])

    return { items, meta: buildMeta(page, limit, total) }
  }

  static async findById(id: string) {
    const client = await prisma.client.findFirst({
      where: { id, deletedAt: null },
      include: {
        plan: true,
        payments: {
          orderBy: { referenceMonth: 'asc' },
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          include: {
            plan: { select: { id: true, name: true, price: true, durationMonths: true } },
          },
        },
      },
    })

    if (!client) {
      throw new AppError('CLIENT_NOT_FOUND', 'Cliente não encontrado', 404)
    }

    return client
  }

  static async create(data: CreateClientInput) {
    return prisma.client.create({
      data,
      include: {
        plan: { select: { id: true, name: true, price: true, period: true } },
      },
    })
  }

  static async update(id: string, data: UpdateClientInput) {
    await this.findById(id)
    return prisma.client.update({
      where: { id },
      data,
      include: {
        plan: { select: { id: true, name: true, price: true, period: true } },
      },
    })
  }

  static async remove(id: string) {
    await this.findById(id)
    return prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}
