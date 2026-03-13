import type { FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'

export async function cookiePlugin(app: FastifyInstance) {
  await app.register(cookie)
}
