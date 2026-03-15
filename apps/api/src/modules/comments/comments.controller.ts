import type { FastifyRequest, FastifyReply } from 'fastify'
import { CommentsService } from './comments.service.js'
import { createCommentSchema, updateCommentSchema } from './comments.schema.js'
import { ok, created, noContent } from '../../shared/utils/response.js'

export class CommentsController {
  static async list(
    req: FastifyRequest<{ Params: { activityId: string } }>,
    reply: FastifyReply,
  ) {
    const comments = await CommentsService.list(req.params.activityId)
    return ok(reply, comments)
  }

  static async create(
    req: FastifyRequest<{ Params: { activityId: string } }>,
    reply: FastifyReply,
  ) {
    const body = createCommentSchema.parse(req.body)
    const comment = await CommentsService.create(req.params.activityId, req.user.sub, body.content)
    return created(reply, comment)
  }

  static async update(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = updateCommentSchema.parse(req.body)
    const comment = await CommentsService.update(req.params.id, req.user.sub, body.content)
    return ok(reply, comment)
  }

  static async remove(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await CommentsService.remove(req.params.id, req.user.sub)
    return noContent(reply)
  }
}
