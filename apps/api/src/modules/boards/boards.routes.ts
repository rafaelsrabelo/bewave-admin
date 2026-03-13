import type { FastifyInstance } from 'fastify'
import { BoardsController } from './boards.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'

export async function boardsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // Workspaces
  app.get('/workspaces', BoardsController.listWorkspaces)
  app.post('/workspaces', BoardsController.createWorkspace)
  app.post('/workspaces/:id/members', BoardsController.addMember)
  app.delete('/workspaces/:id/members/:userId', BoardsController.removeMember)

  // Boards
  app.get('/workspaces/:workspaceId/boards', BoardsController.listBoards)
  app.post('/workspaces/:workspaceId/boards', BoardsController.createBoard)
  app.get('/boards/:id', BoardsController.getBoardWithColumns)

  // Columns
  app.post('/boards/:boardId/columns', BoardsController.createColumn)
  app.put('/columns/:id', BoardsController.updateColumn)
  app.delete('/columns/:id', BoardsController.deleteColumn)
}
