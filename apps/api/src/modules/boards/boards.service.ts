import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type {
  CreateWorkspaceInput,
  AddMemberInput,
  CreateBoardInput,
  CreateColumnInput,
  UpdateColumnInput,
} from './boards.schema.js'

export class BoardsService {
  static async listWorkspaces(userId: string) {
    return prisma.workspace.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        boards: {
          select: { id: true, name: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async createWorkspace(data: CreateWorkspaceInput, userId: string) {
    return prisma.workspace.create({
      data: {
        name: data.name,
        members: {
          create: { userId, role: 'admin' },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    })
  }

  static async addMember(workspaceId: string, data: AddMemberInput) {
    return prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: data.userId,
        role: data.role,
      },
    })
  }

  static async removeMember(workspaceId: string, userId: string) {
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    })
  }

  static async listBoards(workspaceId: string) {
    return prisma.board.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async createBoard(workspaceId: string, data: CreateBoardInput) {
    return prisma.board.create({
      data: {
        name: data.name,
        workspaceId,
      },
    })
  }

  static async getBoardWithColumns(boardId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            activities: {
              where: { deletedAt: null },
              orderBy: { position: 'asc' },
              include: {
                assignees: {
                  include: {
                    user: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!board) {
      throw new AppError('BOARD_NOT_FOUND', 'Board não encontrado', 404)
    }

    return board
  }

  static async createColumn(boardId: string, data: CreateColumnInput) {
    return prisma.column.create({
      data: {
        title: data.title,
        position: data.position,
        boardId,
      },
    })
  }

  static async updateColumn(columnId: string, data: UpdateColumnInput) {
    return prisma.column.update({
      where: { id: columnId },
      data,
    })
  }

  static async deleteColumn(columnId: string) {
    await prisma.column.delete({
      where: { id: columnId },
    })
  }
}
