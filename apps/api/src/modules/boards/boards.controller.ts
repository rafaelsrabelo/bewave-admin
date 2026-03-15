import type { FastifyRequest, FastifyReply } from 'fastify'
import { BoardsService } from './boards.service.js'
import {
  createWorkspaceSchema,
  addWorkspaceMemberSchema,
  createBoardSchema,
  updateBoardSchema,
  listBoardsSchema,
  addBoardMemberSchema,
} from './boards.schema.js'
import { ok, created, noContent } from '../../shared/utils/response.js'

export class BoardsController {
  // ── Workspaces ──

  static async listWorkspaces(req: FastifyRequest, reply: FastifyReply) {
    const workspaces = await BoardsService.listWorkspaces(req.user.sub)
    return ok(reply, workspaces)
  }

  static async createWorkspace(req: FastifyRequest, reply: FastifyReply) {
    const body = createWorkspaceSchema.parse(req.body)
    const workspace = await BoardsService.createWorkspace(body, req.user.sub)
    return created(reply, workspace)
  }

  static async addWorkspaceMember(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = addWorkspaceMemberSchema.parse(req.body)
    const member = await BoardsService.addWorkspaceMember(req.params.id, body)
    return created(reply, member)
  }

  static async removeWorkspaceMember(
    req: FastifyRequest<{ Params: { id: string; userId: string } }>,
    reply: FastifyReply,
  ) {
    await BoardsService.removeWorkspaceMember(req.params.id, req.params.userId)
    return noContent(reply)
  }

  // ── Boards ──

  static async listBoards(req: FastifyRequest, reply: FastifyReply) {
    const query = listBoardsSchema.parse(req.query)
    const result = await BoardsService.list(query, req.user.sub)
    return reply.send({ data: result.items, meta: result.meta })
  }

  static async getBoard(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const board = await BoardsService.findById(req.params.id, req.user.sub)
    return ok(reply, board)
  }

  static async createBoard(req: FastifyRequest, reply: FastifyReply) {
    const body = createBoardSchema.parse(req.body)
    const board = await BoardsService.create(body, req.user.sub)
    return created(reply, board)
  }

  static async updateBoard(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = updateBoardSchema.parse(req.body)
    const board = await BoardsService.update(req.params.id, body, req.user.sub)
    return ok(reply, board)
  }

  static async removeBoard(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await BoardsService.remove(req.params.id, req.user.sub)
    return noContent(reply)
  }

  // ── Board Members ──

  static async listMembers(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const members = await BoardsService.listMembers(req.params.id, req.user.sub)
    return ok(reply, members)
  }

  static async addMember(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const body = addBoardMemberSchema.parse(req.body)
    const member = await BoardsService.addMember(req.params.id, req.user.sub, body)
    return created(reply, member)
  }

  static async updateMemberRole(
    req: FastifyRequest<{ Params: { id: string; userId: string } }>,
    reply: FastifyReply,
  ) {
    const body = addBoardMemberSchema.parse(req.body)
    const member = await BoardsService.updateMemberRole(
      req.params.id,
      req.user.sub,
      req.params.userId,
      body.role,
    )
    return ok(reply, member)
  }

  static async removeMember(
    req: FastifyRequest<{ Params: { id: string; userId: string } }>,
    reply: FastifyReply,
  ) {
    await BoardsService.removeMember(req.params.id, req.user.sub, req.params.userId)
    return noContent(reply)
  }
}
