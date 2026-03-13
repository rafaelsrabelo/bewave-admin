import type { FastifyInstance } from 'fastify'
import { UsersController } from './users.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/', UsersController.list)
  app.post('/', UsersController.create)
  app.get('/:id', UsersController.findById)
  app.put('/:id', UsersController.update)
  app.delete('/:id', UsersController.deactivate)
}
