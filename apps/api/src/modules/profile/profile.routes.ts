import type { FastifyInstance } from 'fastify'
import { ProfileController } from './profile.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'

export async function profileRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/', ProfileController.getMe)
  app.put('/', ProfileController.updateProfile)
  app.patch('/password', ProfileController.changePassword)
}
