import type { FastifyRequest, FastifyReply } from 'fastify'
import { UsersService } from '../users/users.service.js'
import { updateProfileSchema, changePasswordSchema } from '../users/users.schema.js'
import { ok, noContent } from '../../shared/utils/response.js'

export class ProfileController {
  static async getMe(req: FastifyRequest, reply: FastifyReply) {
    const user = await UsersService.findById(req.user.sub)
    return ok(reply, user)
  }

  static async updateProfile(req: FastifyRequest, reply: FastifyReply) {
    const body = updateProfileSchema.parse(req.body)
    const user = await UsersService.updateProfile(req.user.sub, body)
    return ok(reply, user)
  }

  static async changePassword(req: FastifyRequest, reply: FastifyReply) {
    const body = changePasswordSchema.parse(req.body)
    await UsersService.changePassword(req.user.sub, body)
    return noContent(reply)
  }
}
