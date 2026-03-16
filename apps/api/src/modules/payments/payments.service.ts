import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type {
  ListPaymentsInput,
  CreatePaymentInput,
  UpdatePaymentStatusInput,
  GeneratePaymentsInput,
} from './payments.schema.js'

export class PaymentsService {
  static async list(filters: ListPaymentsInput) {
    return prisma.payment.findMany({
      where: {
        ...(filters.clientId && { clientId: filters.clientId }),
        ...(filters.status && { status: filters.status }),
      },
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: { referenceMonth: 'asc' },
    })
  }

  static async findById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { client: { select: { id: true, name: true } } },
    })

    if (!payment) {
      throw new AppError('PAYMENT_NOT_FOUND', 'Pagamento não encontrado', 404)
    }

    return payment
  }

  static async create(data: CreatePaymentInput) {
    return prisma.payment.create({
      data: {
        clientId: data.clientId,
        amount: data.amount,
        referenceMonth: new Date(data.referenceMonth),
        status: data.status,
        ...(data.status === 'paid' && { paidAt: new Date() }),
      },
    })
  }

  static async updateStatus(id: string, data: UpdatePaymentStatusInput) {
    await this.findById(id)

    return prisma.payment.update({
      where: { id },
      data: {
        status: data.status,
        paidAt: data.status === 'paid' ? new Date() : null,
      },
    })
  }

  static async generateForClient(data: GeneratePaymentsInput) {
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, deletedAt: null },
      include: { plan: true },
    })

    if (!client) {
      throw new AppError('CLIENT_NOT_FOUND', 'Cliente não encontrado', 404)
    }

    if (!client.plan) {
      throw new AppError('CLIENT_NO_PLAN', 'Cliente não possui plano associado', 400)
    }

    if (client.plan.period === 'free') {
      throw new AppError('PLAN_IS_FREE', 'Plano gratuito não gera pagamentos', 400)
    }

    const amount = client.plan.price
    const now = new Date()
    const payments = []

    for (let i = 0; i < data.months; i++) {
      const refDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const referenceMonth = refDate.toISOString().slice(0, 10)

      payments.push({
        clientId: data.clientId,
        amount,
        referenceMonth: new Date(referenceMonth),
        status: 'pending' as const,
      })
    }

    const created = await prisma.$transaction(
      payments.map((p) =>
        prisma.payment.upsert({
          where: {
            clientId_referenceMonth: {
              clientId: p.clientId,
              referenceMonth: p.referenceMonth,
            },
          },
          create: p,
          update: {},
        }),
      ),
    )

    return created
  }

  static async remove(id: string) {
    await this.findById(id)
    await prisma.payment.delete({ where: { id } })
  }
}
