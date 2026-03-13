import type { FastifyInstance } from 'fastify'
import { ActivitiesController } from './activities.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'

export async function activitiesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.post('/', ActivitiesController.create)
  app.put('/:id', ActivitiesController.update)
  app.patch('/:id/move', ActivitiesController.move)
  app.post('/:id/assignees', ActivitiesController.addAssignee)
  app.delete('/:id/assignees/:userId', ActivitiesController.removeAssignee)
  app.delete('/:id', ActivitiesController.remove)
}
