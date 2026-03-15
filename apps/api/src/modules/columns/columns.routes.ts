import type { FastifyInstance } from 'fastify'
import { ColumnsController } from './columns.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'

export async function columnsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/boards/:boardId/columns', ColumnsController.list)
  app.post('/boards/:boardId/columns', ColumnsController.create)
  app.patch('/boards/:boardId/columns/reorder', ColumnsController.reorder)
  app.put('/columns/:id', ColumnsController.update)
  app.delete('/columns/:id', ColumnsController.remove)
}
