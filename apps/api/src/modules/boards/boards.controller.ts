import type { FastifyRequest, FastifyReply } from 'fastify'
import { BoardsService } from './boards.service.js'
import {
  createWorkspaceSchema,
  addMemberSchema,
  createBoardSchema,
  createColumnSchema,
  updateColumnSchema,
} from './boards.schema.js'
import { ok, created, noContent } from '../../shared/utils/response.js'

export class BoardsController {
  static async listWorkspaces(req: FastifyRequest, reply: FastifyReply) {
    const workspaces = await BoardsService.listWorkspaces(req.user.sub)
    return ok(reply, workspaces)
  }

  static async createWorkspace(req: FastifyRequest, reply: FastifyReply) {
    const body = createWorkspaceSchema.parse(req.body)
    const workspace = await BoardsService.createWorkspace(body, req.user.sub)
    return created(reply, workspace)
  }

  static async addMember(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = addMemberSchema.parse(req.body)
    const member = await BoardsService.addMember(req.params.id, body)
    return created(reply, member)
  }

  static async removeMember(
    req: FastifyRequest<{ Params: { id: string; userId: string } }>,
    reply: FastifyReply,
  ) {
    await BoardsService.removeMember(req.params.id, req.params.userId)
    return noContent(reply)
  }

  static async listBoards(
    req: FastifyRequest<{ Params: { workspaceId: string } }>,
    reply: FastifyReply,
  ) {
    const boards = await BoardsService.listBoards(req.params.workspaceId)
    return ok(reply, boards)
  }

  static async createBoard(
    req: FastifyRequest<{ Params: { workspaceId: string } }>,
    reply: FastifyReply,
  ) {
    const body = createBoardSchema.parse(req.body)
    const board = await BoardsService.createBoard(req.params.workspaceId, body)
    return created(reply, board)
  }

  static async getBoardWithColumns(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const board = await BoardsService.getBoardWithColumns(req.params.id)
    return ok(reply, board)
  }

  static async createColumn(
    req: FastifyRequest<{ Params: { boardId: string } }>,
    reply: FastifyReply,
  ) {
    const body = createColumnSchema.parse(req.body)
    const column = await BoardsService.createColumn(req.params.boardId, body)
    return created(reply, column)
  }

  static async updateColumn(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = updateColumnSchema.parse(req.body)
    const column = await BoardsService.updateColumn(req.params.id, body)
    return ok(reply, column)
  }

  static async deleteColumn(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await BoardsService.deleteColumn(req.params.id)
    return noContent(reply)
  }
}
