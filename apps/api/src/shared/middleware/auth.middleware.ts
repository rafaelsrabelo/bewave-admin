import type { FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from '../errors/app-error.js'

export async function authenticate(req: FastifyRequest, _reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    throw new AppError('UNAUTHORIZED', 'Token ausente ou expirado', 401)
  }
}
