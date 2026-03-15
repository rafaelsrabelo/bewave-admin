import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type {
  CreateWorkspaceInput,
  AddWorkspaceMemberInput,
  CreateBoardInput,
  UpdateBoardInput,
  ListBoardsInput,
  AddBoardMemberInput,
} from './boards.schema.js'

export class BoardsService {
  // ── Workspaces ──

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
          where: { deletedAt: null },
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

  static async addWorkspaceMember(workspaceId: string, data: AddWorkspaceMemberInput) {
    return prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: data.userId,
        role: data.role,
      },
    })
  }

  static async removeWorkspaceMember(workspaceId: string, userId: string) {
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    })
  }

  // ── Boards ──

  static async list(input: ListBoardsInput, userId: string) {
    const where = {
      ...(input.workspaceId && { workspaceId: input.workspaceId }),
      deletedAt: null,
      members: { some: { userId } },
    }

    const [items, total] = await prisma.$transaction([
      prisma.board.findMany({
        where,
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { members: true, columns: true } },
        },
      }),
      prisma.board.count({ where }),
    ])

    return {
      items,
      meta: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    }
  }

  static async findById(boardId: string, userId: string) {
    const board = await prisma.board.findFirst({
      where: { id: boardId, deletedAt: null },
      include: {
        columns: {
          where: { deletedAt: null },
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
                _count: { select: { comments: true } },
              },
            },
          },
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!board) {
      throw new AppError('BOARD_NOT_FOUND', 'Board não encontrado', 404)
    }

    const isMember = board.members.some((m) => m.userId === userId)
    if (!isMember) {
      throw new AppError('BOARD_ACCESS_DENIED', 'Você não é membro deste board', 403)
    }

    return board
  }

  static async create(data: CreateBoardInput, creatorUserId: string) {
    return prisma.board.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        workspaceId: data.workspaceId,
        members: {
          create: { userId: creatorUserId, role: 'admin' },
        },
      },
      include: {
        _count: { select: { members: true, columns: true } },
      },
    })
  }

  static async update(boardId: string, data: UpdateBoardInput, userId: string) {
    await this.assertMember(boardId, userId)

    return prisma.board.update({
      where: { id: boardId },
      data,
    })
  }

  static async remove(boardId: string, userId: string) {
    await this.assertAdmin(boardId, userId)

    return prisma.board.update({
      where: { id: boardId },
      data: { deletedAt: new Date() },
    })
  }

  // ── Board Members ──

  static async listMembers(boardId: string, userId: string) {
    await this.assertMember(boardId, userId)

    return prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })
  }

  static async addMember(boardId: string, userId: string, data: AddBoardMemberInput) {
    await this.assertAdmin(boardId, userId)

    return prisma.boardMember.create({
      data: {
        boardId,
        userId: data.userId,
        role: data.role,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })
  }

  static async removeMember(boardId: string, userId: string, targetUserId: string) {
    const member = await this.getMember(boardId, userId)

    if (userId !== targetUserId && member.role !== 'admin') {
      throw new AppError('BOARD_ACCESS_DENIED', 'Apenas admins podem remover membros', 403)
    }

    await prisma.boardMember.delete({
      where: {
        boardId_userId: { boardId, userId: targetUserId },
      },
    })
  }

  static async updateMemberRole(boardId: string, userId: string, targetUserId: string, role: string) {
    await this.assertAdmin(boardId, userId)

    return prisma.boardMember.update({
      where: {
        boardId_userId: { boardId, userId: targetUserId },
      },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })
  }

  // ── Helpers ──

  private static async getMember(boardId: string, userId: string) {
    const member = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    })

    if (!member) {
      throw new AppError('BOARD_ACCESS_DENIED', 'Você não é membro deste board', 403)
    }

    return member
  }

  private static async assertMember(boardId: string, userId: string) {
    await this.getMember(boardId, userId)
  }

  private static async assertAdmin(boardId: string, userId: string) {
    const member = await this.getMember(boardId, userId)
    if (member.role !== 'admin') {
      throw new AppError('BOARD_ACCESS_DENIED', 'Apenas admins podem executar esta ação', 403)
    }
  }
}
