import type { FastifyInstance } from 'fastify'
import { PlansController } from './plans.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'
import { requireAdmin } from '../../shared/middleware/require-role.middleware.js'

export async function plansRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)
  app.addHook('preHandler', requireAdmin)

  app.get('/', PlansController.list)
  app.post('/', PlansController.create)
  app.get('/:id', PlansController.findById)
  app.put('/:id', PlansController.update)
  app.delete('/:id', PlansController.remove)
}
