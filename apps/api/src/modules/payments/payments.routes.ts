import type { FastifyInstance } from 'fastify'
import { PaymentsController } from './payments.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'

export async function paymentsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/', PaymentsController.list)
  app.post('/', PaymentsController.create)
  app.post('/generate', PaymentsController.generate)
  app.get('/:id', PaymentsController.findById)
  app.patch('/:id/status', PaymentsController.updateStatus)
  app.delete('/:id', PaymentsController.remove)
}
