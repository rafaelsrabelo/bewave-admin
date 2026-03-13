import type { FastifyRequest, FastifyReply } from 'fastify'
import { ClientsService } from './clients.service.js'
import { createClientSchema, updateClientSchema, listClientsSchema } from './clients.schema.js'
import { ok, created, paginated, noContent } from '../../shared/utils/response.js'

export class ClientsController {
  static async list(req: FastifyRequest, reply: FastifyReply) {
    const filters = listClientsSchema.parse(req.query)
    const result = await ClientsService.list(filters)
    return paginated(reply, result.items, result.meta)
  }

  static async findById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const client = await ClientsService.findById(req.params.id)
    return ok(reply, client)
  }

  static async create(req: FastifyRequest, reply: FastifyReply) {
    const body = createClientSchema.parse(req.body)
    const client = await ClientsService.create(body)
    return created(reply, client)
  }

  static async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = updateClientSchema.parse(req.body)
    const client = await ClientsService.update(req.params.id, body)
    return ok(reply, client)
  }

  static async remove(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await ClientsService.remove(req.params.id)
    return noContent(reply)
  }
}
