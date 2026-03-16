import type { FastifyRequest, FastifyReply } from 'fastify'
import { PaymentsService } from './payments.service.js'
import {
  listPaymentsSchema,
  createPaymentSchema,
  updatePaymentStatusSchema,
  generatePaymentsSchema,
} from './payments.schema.js'
import { ok, created, noContent } from '../../shared/utils/response.js'

export class PaymentsController {
  static async list(req: FastifyRequest, reply: FastifyReply) {
    const filters = listPaymentsSchema.parse(req.query)
    const payments = await PaymentsService.list(filters)
    return ok(reply, payments)
  }

  static async findById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const payment = await PaymentsService.findById(req.params.id)
    return ok(reply, payment)
  }

  static async create(req: FastifyRequest, reply: FastifyReply) {
    const body = createPaymentSchema.parse(req.body)
    const payment = await PaymentsService.create(body)
    return created(reply, payment)
  }

  static async updateStatus(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = updatePaymentStatusSchema.parse(req.body)
    const payment = await PaymentsService.updateStatus(req.params.id, body)
    return ok(reply, payment)
  }

  static async generate(req: FastifyRequest, reply: FastifyReply) {
    const body = generatePaymentsSchema.parse(req.body)
    const payments = await PaymentsService.generateForClient(body)
    return created(reply, payments)
  }

  static async remove(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await PaymentsService.remove(req.params.id)
    return noContent(reply)
  }
}
