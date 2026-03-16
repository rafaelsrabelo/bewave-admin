import type { FastifyInstance } from 'fastify'
import { BoardsController } from './boards.controller.js'
import { ActivitiesController } from '../activities/activities.controller.js'
import { authenticate } from '../../shared/middleware/auth.middleware.js'
import { requireAdmin } from '../../shared/middleware/require-role.middleware.js'

export async function boardsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // Workspaces
  app.get('/workspaces', BoardsController.listWorkspaces)
  app.register(async (adminScope) => {
    adminScope.addHook('preHandler', requireAdmin)
    adminScope.post('/workspaces', BoardsController.createWorkspace)
    adminScope.post('/workspaces/:id/members', BoardsController.addWorkspaceMember)
    adminScope.delete('/workspaces/:id/members/:userId', BoardsController.removeWorkspaceMember)
  })

  // Boards — leitura aberta
  app.get('/boards', BoardsController.listBoards)
  app.get('/boards/:id', BoardsController.getBoard)
  app.get('/boards/:id/members', BoardsController.listMembers)
  app.get('/boards/:boardId/activities', ActivitiesController.listByBoard)

  // Boards — mutações admin only
  app.register(async (adminScope) => {
    adminScope.addHook('preHandler', requireAdmin)
    adminScope.post('/boards', BoardsController.createBoard)
    adminScope.put('/boards/:id', BoardsController.updateBoard)
    adminScope.delete('/boards/:id', BoardsController.removeBoard)
    adminScope.post('/boards/:id/members', BoardsController.addMember)
    adminScope.put('/boards/:id/members/:userId', BoardsController.updateMemberRole)
    adminScope.delete('/boards/:id/members/:userId', BoardsController.removeMember)
  })
}
