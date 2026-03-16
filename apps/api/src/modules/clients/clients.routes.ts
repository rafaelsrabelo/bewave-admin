import type { FastifyInstance } from 'fastify'
import { ClientsController } from './clients.controller.js'
import { SubscriptionsController } from '../subscriptions/subscriptions.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'
import { requireAdmin } from '../../shared/middleware/require-role.middleware.js'

export async function clientsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)
  app.addHook('preHandler', requireAdmin)

  app.get('/', ClientsController.list)
  app.post('/', ClientsController.create)
  app.get('/:id', ClientsController.findById)
  app.put('/:id', ClientsController.update)
  app.delete('/:id', ClientsController.remove)
  app.get('/:clientId/subscriptions', SubscriptionsController.findByClient)
}
