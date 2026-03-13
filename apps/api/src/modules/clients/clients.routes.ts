import type { FastifyInstance } from 'fastify'
import { ClientsController } from './clients.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'

export async function clientsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/', ClientsController.list)
  app.post('/', ClientsController.create)
  app.get('/:id', ClientsController.findById)
  app.put('/:id', ClientsController.update)
  app.delete('/:id', ClientsController.remove)
}
