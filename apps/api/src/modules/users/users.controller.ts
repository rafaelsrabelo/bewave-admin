import type { FastifyRequest, FastifyReply } from 'fastify'
import { UsersService } from './users.service.js'
import { createUserSchema, updateUserSchema, listUsersSchema } from './users.schema.js'
import { ok, created, paginated, noContent } from '../../shared/utils/response.js'
import { AppError } from '../../shared/errors/app-error.js'

export class UsersController {
  static async list(req: FastifyRequest, reply: FastifyReply) {
    const filters = listUsersSchema.parse(req.query)
    const result = await UsersService.list(filters)
    return paginated(reply, result.items, result.meta)
  }

  static async findById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await UsersService.findById(req.params.id)
    return ok(reply, user)
  }

  static async create(req: FastifyRequest, reply: FastifyReply) {
    const body = createUserSchema.parse(req.body)
    const user = await UsersService.create(body)
    return created(reply, user)
  }

  static async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = updateUserSchema.parse(req.body)
    const user = await UsersService.update(req.params.id, body)
    return ok(reply, user)
  }

  static async deactivate(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await UsersService.deactivate(req.params.id)
    return noContent(reply)
  }

  static async remove(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    if (req.user.role !== 'admin') {
      throw new AppError('FORBIDDEN', 'Apenas administradores podem excluir usuários', 403)
    }
    await UsersService.remove(req.params.id)
    return noContent(reply)
  }
}
