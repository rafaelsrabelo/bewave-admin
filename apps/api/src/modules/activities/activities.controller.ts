import type { FastifyRequest, FastifyReply } from 'fastify'
import { ActivitiesService } from './activities.service.js'
import {
  createActivitySchema,
  updateActivitySchema,
  moveActivitySchema,
  completeActivitySchema,
  listActivitiesSchema,
  addAssigneeSchema,
} from './activities.schema.js'
import { ok, created, noContent } from '../../shared/utils/response.js'

export class ActivitiesController {
  static async listMine(req: FastifyRequest, reply: FastifyReply) {
    const query = listActivitiesSchema.parse(req.query)
    const result = await ActivitiesService.listMine(req.user.sub, query)
    return reply.send({ data: result.items, meta: result.meta })
  }

  static async getById(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const activity = await ActivitiesService.findById(req.params.id)
    return ok(reply, activity)
  }

  static async create(req: FastifyRequest, reply: FastifyReply) {
    const body = createActivitySchema.parse(req.body)
    const activity = await ActivitiesService.create(body)
    return created(reply, activity)
  }

  static async update(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = updateActivitySchema.parse(req.body)
    const activity = await ActivitiesService.update(req.params.id, body)
    return ok(reply, activity)
  }

  static async move(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = moveActivitySchema.parse(req.body)
    const activity = await ActivitiesService.move(req.params.id, body)
    return ok(reply, activity)
  }

  static async toggleComplete(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = completeActivitySchema.parse(req.body)
    const activity = await ActivitiesService.toggleComplete(req.params.id, body.isCompleted)
    return ok(reply, activity)
  }

  static async remove(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await ActivitiesService.remove(req.params.id)
    return noContent(reply)
  }

  static async addAssignee(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = addAssigneeSchema.parse(req.body)
    const assignee = await ActivitiesService.addAssignee(req.params.id, body.userId)
    return created(reply, assignee)
  }

  static async removeAssignee(
    req: FastifyRequest<{ Params: { id: string; userId: string } }>,
    reply: FastifyReply,
  ) {
    await ActivitiesService.removeAssignee(req.params.id, req.params.userId)
    return noContent(reply)
  }

  static async listByBoard(
    req: FastifyRequest<{ Params: { boardId: string } }>,
    reply: FastifyReply,
  ) {
    const query = listActivitiesSchema.parse(req.query)
    const result = await ActivitiesService.listByBoard(req.params.boardId, query)
    return reply.send({ data: result.items, meta: result.meta })
  }
}
