import type { FastifyInstance } from 'fastify'
import { BoardsController } from './boards.controller.js'
import { ActivitiesController } from '../activities/activities.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'

export async function boardsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // Workspaces
  app.get('/workspaces', BoardsController.listWorkspaces)
  app.post('/workspaces', BoardsController.createWorkspace)
  app.post('/workspaces/:id/members', BoardsController.addWorkspaceMember)
  app.delete('/workspaces/:id/members/:userId', BoardsController.removeWorkspaceMember)

  // Boards
  app.get('/boards', BoardsController.listBoards)
  app.get('/boards/:id', BoardsController.getBoard)
  app.post('/boards', BoardsController.createBoard)
  app.put('/boards/:id', BoardsController.updateBoard)
  app.delete('/boards/:id', BoardsController.removeBoard)

  // Board Members
  app.get('/boards/:id/members', BoardsController.listMembers)
  app.post('/boards/:id/members', BoardsController.addMember)
  app.put('/boards/:id/members/:userId', BoardsController.updateMemberRole)
  app.delete('/boards/:id/members/:userId', BoardsController.removeMember)

  // Board Activities
  app.get('/boards/:boardId/activities', ActivitiesController.listByBoard)
}
