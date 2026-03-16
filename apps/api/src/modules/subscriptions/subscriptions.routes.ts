import type { FastifyInstance } from 'fastify'
import { SubscriptionsController } from './subscriptions.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'
import { requireAdmin } from '../../shared/middleware/require-role.middleware.js'

export async function subscriptionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)
  app.addHook('preHandler', requireAdmin)

  app.post('/', SubscriptionsController.create)
  app.get('/:id', SubscriptionsController.getDetails)
  app.patch('/:id/payments/:paymentId/pay', SubscriptionsController.markPaid)
  app.patch('/:id/payments/:paymentId/unpay', SubscriptionsController.unmarkPaid)
  app.patch('/:id/cancel', SubscriptionsController.cancel)
}
