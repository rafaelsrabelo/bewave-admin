import type { FastifyRequest, FastifyReply } from 'fastify'
import { PlansService } from './plans.service.js'
import { createPlanSchema, updatePlanSchema, listPlansSchema } from './plans.schema.js'
import { ok, created, noContent, paginated } from '../../shared/utils/response.js'

export class PlansController {
  static async list(req: FastifyRequest, reply: FastifyReply) {
    const filters = listPlansSchema.parse(req.query)
    const result = await PlansService.list(filters)
    return paginated(reply, result.items, result.meta)
  }

  static async findById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const plan = await PlansService.findById(req.params.id)
    return ok(reply, plan)
  }

  static async create(req: FastifyRequest, reply: FastifyReply) {
    const body = createPlanSchema.parse(req.body)
    const plan = await PlansService.create(body)
    return created(reply, plan)
  }

  static async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = updatePlanSchema.parse(req.body)
    const plan = await PlansService.update(req.params.id, body)
    return ok(reply, plan)
  }

  static async remove(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await PlansService.deactivate(req.params.id)
    return noContent(reply)
  }
}
