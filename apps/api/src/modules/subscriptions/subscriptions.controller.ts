import type { FastifyRequest, FastifyReply } from 'fastify'
import { SubscriptionsService } from './subscriptions.service.js'
import { createSubscriptionSchema, updatePaymentSchema } from './subscriptions.schema.js'
import { ok, created, noContent } from '../../shared/utils/response.js'

export class SubscriptionsController {
  static async create(req: FastifyRequest, reply: FastifyReply) {
    const body = createSubscriptionSchema.parse(req.body)
    const subscription = await SubscriptionsService.create(body)
    return created(reply, subscription)
  }

  static async findByClient(
    req: FastifyRequest<{ Params: { clientId: string } }>,
    reply: FastifyReply,
  ) {
    const subscriptions = await SubscriptionsService.findByClient(req.params.clientId)
    return ok(reply, subscriptions)
  }

  static async getDetails(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const subscription = await SubscriptionsService.getDetails(req.params.id)
    return ok(reply, subscription)
  }

  static async markPaid(
    req: FastifyRequest<{ Params: { id: string; paymentId: string } }>,
    reply: FastifyReply,
  ) {
    const body = updatePaymentSchema.parse(req.body)
    const payment = await SubscriptionsService.markPaymentPaid(req.params.paymentId, body)
    return ok(reply, payment)
  }

  static async unmarkPaid(
    req: FastifyRequest<{ Params: { id: string; paymentId: string } }>,
    reply: FastifyReply,
  ) {
    const payment = await SubscriptionsService.unmarkPaymentPaid(req.params.paymentId)
    return ok(reply, payment)
  }

  static async cancel(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = req.body as { notes?: string } | undefined
    await SubscriptionsService.cancel(req.params.id, body?.notes)
    return noContent(reply)
  }
}
