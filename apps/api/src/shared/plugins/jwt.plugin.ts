import type { FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { env } from '../../env.js'

export async function jwtPlugin(app: FastifyInstance) {
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  })
}
