import Fastify from 'fastify'
import { corsPlugin } from './shared/plugins/cors.plugin.js'
import { jwtPlugin } from './shared/plugins/jwt.plugin.js'
import { cookiePlugin } from './shared/plugins/cookie.plugin.js'
import { registerErrorHandler } from './shared/middleware/error-handler.js'

export async function buildApp() {
  const app = Fastify({
    logger: true,
  })

  await app.register(corsPlugin)
  await app.register(jwtPlugin)
  await app.register(cookiePlugin)

  registerErrorHandler(app)

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  return app
}
