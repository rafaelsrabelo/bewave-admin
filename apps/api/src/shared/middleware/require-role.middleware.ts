import type { FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from '../errors/app-error.js'

export function requireRole(roles: string[]) {
  return async (req: FastifyRequest, _reply: FastifyReply) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('FORBIDDEN', 'Acesso restrito a administradores', 403)
    }
  }
}

export const requireAdmin = requireRole(['admin'])
