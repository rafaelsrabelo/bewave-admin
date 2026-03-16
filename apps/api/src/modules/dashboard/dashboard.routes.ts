import type { FastifyInstance } from 'fastify'
import { DashboardController } from './dashboard.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/member', DashboardController.memberStats)
}
