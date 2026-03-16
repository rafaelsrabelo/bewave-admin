import type { FastifyInstance } from 'fastify'
import { FinanceController } from './finance.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'
import { requireAdmin } from '../../shared/middleware/require-role.middleware.js'

export async function financeRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)
  app.addHook('preHandler', requireAdmin)

  app.get('/entries', FinanceController.list)
  app.post('/entries', FinanceController.create)
  app.delete('/entries/:id', FinanceController.remove)
  app.get('/summary', FinanceController.summary)
}
