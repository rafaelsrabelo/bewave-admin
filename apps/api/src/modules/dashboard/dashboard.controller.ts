import type { FastifyRequest, FastifyReply } from 'fastify'
import { DashboardService } from './dashboard.service.js'
import { ok } from '../../shared/utils/response.js'

export class DashboardController {
  static async memberStats(req: FastifyRequest, reply: FastifyReply) {
    const data = await DashboardService.getMemberStats(req.user.sub)
    return ok(reply, data)
  }
}
