import type { FastifyRequest, FastifyReply } from 'fastify'
import { ActivitiesService } from './activities.service.js'
import {
  createActivitySchema,
  updateActivitySchema,
  moveActivitySchema,
  addAssigneeSchema,
} from './activities.schema.js'
import { ok, created, noContent } from '../../shared/utils/response.js'

export class ActivitiesController {
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

  static async remove(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await ActivitiesService.remove(req.params.id)
    return noContent(reply)
  }
}
