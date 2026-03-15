import type { FastifyRequest, FastifyReply } from 'fastify'
import { ColumnsService } from './columns.service.js'
import {
  createColumnSchema,
  updateColumnSchema,
  reorderColumnsSchema,
} from './columns.schema.js'
import { ok, created, noContent } from '../../shared/utils/response.js'

export class ColumnsController {
  static async list(
    req: FastifyRequest<{ Params: { boardId: string } }>,
    reply: FastifyReply,
  ) {
    const columns = await ColumnsService.list(req.params.boardId)
    return ok(reply, columns)
  }

  static async create(
    req: FastifyRequest<{ Params: { boardId: string } }>,
    reply: FastifyReply,
  ) {
    const body = createColumnSchema.parse({ ...req.body as Record<string, unknown>, boardId: req.params.boardId })
    const column = await ColumnsService.create(body)
    return created(reply, column)
  }

  static async update(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = updateColumnSchema.parse(req.body)
    const column = await ColumnsService.update(req.params.id, body)
    return ok(reply, column)
  }

  static async reorder(
    req: FastifyRequest<{ Params: { boardId: string } }>,
    reply: FastifyReply,
  ) {
    const body = reorderColumnsSchema.parse(req.body)
    await ColumnsService.reorder(req.params.boardId, body)
    return noContent(reply)
  }

  static async remove(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await ColumnsService.remove(req.params.id)
    return noContent(reply)
  }
}
