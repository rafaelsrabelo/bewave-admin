import type { FastifyRequest, FastifyReply } from 'fastify'
import { FinanceService } from './finance.service.js'
import {
  createFinanceEntrySchema,
  listFinanceEntriesSchema,
  summarySchema,
} from './finance.schema.js'
import { ok, created, paginated, noContent } from '../../shared/utils/response.js'

export class FinanceController {
  static async list(req: FastifyRequest, reply: FastifyReply) {
    const filters = listFinanceEntriesSchema.parse(req.query)
    const result = await FinanceService.list(filters)
    return paginated(reply, result.items, result.meta)
  }

  static async create(req: FastifyRequest, reply: FastifyReply) {
    const body = createFinanceEntrySchema.parse(req.body)
    const entry = await FinanceService.create(body)
    return created(reply, entry)
  }

  static async remove(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await FinanceService.remove(req.params.id)
    return noContent(reply)
  }

  static async summary(req: FastifyRequest, reply: FastifyReply) {
    const filters = summarySchema.parse(req.query)
    const result = await FinanceService.getSummary(filters)
    return ok(reply, result)
  }
}
