import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import { registerErrorHandler } from './shared/middleware/error-handler.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { clientsRoutes } from './modules/clients/clients.routes.js'
import { boardsRoutes } from './modules/boards/boards.routes.js'
import { activitiesRoutes } from './modules/activities/activities.routes.js'
import { financeRoutes } from './modules/finance/finance.routes.js'
import { env } from './env.js'

export async function buildApp() {
  const app = Fastify({
    logger: true,
  })

  await app.register(cors, {
    origin: true,
    credentials: true,
  })

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  })

  await app.register(cookie)

  registerErrorHandler(app)

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.register(usersRoutes, { prefix: '/api/v1/users' })
  await app.register(clientsRoutes, { prefix: '/api/v1/clients' })
  await app.register(boardsRoutes, { prefix: '/api/v1' })
  await app.register(activitiesRoutes, { prefix: '/api/v1/activities' })
  await app.register(financeRoutes, { prefix: '/api/v1/finance' })

  return app
}
