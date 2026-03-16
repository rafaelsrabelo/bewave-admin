import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type { CreateSubscriptionInput, UpdatePaymentInput } from './subscriptions.schema.js'

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export class SubscriptionsService {
  static async create(data: CreateSubscriptionInput) {
    const plan = await prisma.plan.findFirst({
      where: { id: data.planId, deletedAt: null, isActive: true },
    })
    if (!plan) {
      throw new AppError('PLAN_NOT_FOUND', 'Plano não encontrado ou inativo', 404)
    }

    const existingSub = await prisma.clientSubscription.findFirst({
      where: {
        clientId: data.clientId,
        status: { in: ['active', 'overdue'] },
      },
    })
    if (existingSub) {
      throw new AppError(
        'SUBSCRIPTION_ALREADY_EXISTS',
        'Cliente já possui uma assinatura ativa ou em atraso',
        409,
      )
    }

    const startDate = new Date(data.startDate)
    const endDate = addMonths(startDate, plan.durationMonths)

    return prisma.$transaction(async (tx) => {
      const subscription = await tx.clientSubscription.create({
        data: {
          clientId: data.clientId,
          planId: data.planId,
          startDate,
          endDate,
          notes: data.notes,
        },
      })

      const payments = Array.from({ length: plan.durationMonths }, (_, i) => ({
        subscriptionId: subscription.id,
        month: i + 1,
        dueDate: addMonths(startDate, i),
        amount: plan.price,
      }))

      await tx.subscriptionPayment.createMany({ data: payments })

      return tx.clientSubscription.findUnique({
        where: { id: subscription.id },
        include: {
          plan: true,
          payments: { orderBy: { month: 'asc' } },
        },
      })
    })
  }

  static async findByClient(clientId: string) {
    const subscriptions = await prisma.clientSubscription.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: { select: { id: true, name: true, price: true, durationMonths: true } },
        payments: {
          select: { id: true, paidAt: true },
        },
      },
    })

    return subscriptions.map((sub) => ({
      ...sub,
      paidCount: sub.payments.filter((p) => p.paidAt !== null).length,
      totalCount: sub.payments.length,
    }))
  }

  static async getDetails(subscriptionId: string) {
    const subscription = await prisma.clientSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        client: { select: { id: true, name: true } },
        payments: { orderBy: { month: 'asc' } },
      },
    })

    if (!subscription) {
      throw new AppError('SUBSCRIPTION_NOT_FOUND', 'Assinatura não encontrada', 404)
    }

    return subscription
  }

  static async markPaymentPaid(paymentId: string, data: UpdatePaymentInput) {
    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: { plan: { select: { name: true } } },
        },
      },
    })

    if (!payment) {
      throw new AppError('PAYMENT_NOT_FOUND', 'Pagamento não encontrado', 404)
    }

    const paidAt = data.paidAt ? new Date(data.paidAt) : new Date()
    const amount = data.amount ?? payment.amount

    return prisma.$transaction(async (tx) => {
      let financeEntryId: string | null = null

      if (data.createFinanceEntry !== false) {
        const entry = await tx.financeEntry.create({
          data: {
            type: 'income',
            amount,
            description: `Pagamento — ${payment.subscription.plan.name} — Mês ${payment.month}`,
            category: 'comercial',
            date: paidAt,
          },
        })
        financeEntryId = entry.id
      }

      const updated = await tx.subscriptionPayment.update({
        where: { id: paymentId },
        data: {
          paidAt,
          amount,
          notes: data.notes,
          financeEntryId,
        },
      })

      await this.recalculateStatusTx(tx, payment.subscriptionId)

      return updated
    })
  }

  static async unmarkPaymentPaid(paymentId: string) {
    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
    })

    if (!payment) {
      throw new AppError('PAYMENT_NOT_FOUND', 'Pagamento não encontrado', 404)
    }

    return prisma.$transaction(async (tx) => {
      if (payment.financeEntryId) {
        await tx.financeEntry.delete({ where: { id: payment.financeEntryId } })
      }

      const updated = await tx.subscriptionPayment.update({
        where: { id: paymentId },
        data: {
          paidAt: null,
          notes: null,
          financeEntryId: null,
        },
      })

      await this.recalculateStatusTx(tx, payment.subscriptionId)

      return updated
    })
  }

  static async cancel(subscriptionId: string, notes?: string) {
    const subscription = await prisma.clientSubscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) {
      throw new AppError('SUBSCRIPTION_NOT_FOUND', 'Assinatura não encontrada', 404)
    }

    return prisma.clientSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'cancelled',
        notes: notes ?? subscription.notes,
      },
    })
  }

  private static async recalculateStatusTx(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    subscriptionId: string,
  ) {
    const payments = await tx.subscriptionPayment.findMany({
      where: { subscriptionId },
    })

    const allPaid = payments.every((p) => p.paidAt !== null)
    const hasOverdue = payments.some(
      (p) => p.paidAt === null && p.dueDate < new Date(),
    )

    let status: 'active' | 'overdue' | 'completed' = 'active'
    if (allPaid) status = 'completed'
    else if (hasOverdue) status = 'overdue'

    await tx.clientSubscription.update({
      where: { id: subscriptionId },
      data: { status },
    })
  }
}
