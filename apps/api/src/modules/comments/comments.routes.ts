import type { FastifyInstance } from 'fastify'
import { CommentsController } from './comments.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'

export async function commentsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/activities/:activityId/comments', CommentsController.list)
  app.post('/activities/:activityId/comments', CommentsController.create)
  app.put('/comments/:id', CommentsController.update)
  app.delete('/comments/:id', CommentsController.remove)
}
