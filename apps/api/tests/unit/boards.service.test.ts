import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    workspace: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    workspaceMember: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    board: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    column: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { BoardsService } from '../../src/modules/boards/boards.service.js'
import { prisma } from '../../src/lib/prisma.js'

describe('BoardsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listWorkspaces', () => {
    it('should list workspaces for user', async () => {
      vi.mocked(prisma.workspace.findMany).mockResolvedValue([
        { id: 'ws-1', name: 'Marketing', createdAt: new Date(), members: [], boards: [] } as never,
      ])

      const result = await BoardsService.listWorkspaces('user-1')
      expect(result).toHaveLength(1)
      expect(prisma.workspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { members: { some: { userId: 'user-1' } } },
        }),
      )
    })
  })

  describe('createWorkspace', () => {
    it('should create workspace and add creator as admin', async () => {
      vi.mocked(prisma.workspace.create).mockResolvedValue({
        id: 'ws-1',
        name: 'Dev',
        createdAt: new Date(),
        members: [{ workspaceId: 'ws-1', userId: 'user-1', role: 'admin', user: { id: 'user-1', name: 'Admin' } }],
      } as never)

      const result = await BoardsService.createWorkspace({ name: 'Dev' }, 'user-1')

      expect(prisma.workspace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            members: { create: { userId: 'user-1', role: 'admin' } },
          }),
        }),
      )
    })
  })

  describe('addMember', () => {
    it('should add member to workspace', async () => {
      vi.mocked(prisma.workspaceMember.create).mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'user-2',
        role: 'member',
      })

      await BoardsService.addMember('ws-1', { userId: 'user-2', role: 'member' })

      expect(prisma.workspaceMember.create).toHaveBeenCalledWith({
        data: { workspaceId: 'ws-1', userId: 'user-2', role: 'member' },
      })
    })
  })

  describe('removeMember', () => {
    it('should remove member from workspace', async () => {
      vi.mocked(prisma.workspaceMember.delete).mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'user-2',
        role: 'member',
      })

      await BoardsService.removeMember('ws-1', 'user-2')

      expect(prisma.workspaceMember.delete).toHaveBeenCalledWith({
        where: { workspaceId_userId: { workspaceId: 'ws-1', userId: 'user-2' } },
      })
    })
  })

  describe('listBoards', () => {
    it('should list boards for workspace', async () => {
      vi.mocked(prisma.board.findMany).mockResolvedValue([
        { id: 'b-1', name: 'Sprint 1', workspaceId: 'ws-1', createdAt: new Date() } as never,
      ])

      const result = await BoardsService.listBoards('ws-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('createBoard', () => {
    it('should create board in workspace', async () => {
      vi.mocked(prisma.board.create).mockResolvedValue({
        id: 'b-1',
        name: 'Sprint 1',
        workspaceId: 'ws-1',
        createdAt: new Date(),
      } as never)

      const result = await BoardsService.createBoard('ws-1', { name: 'Sprint 1' })
      expect(result.name).toBe('Sprint 1')
    })
  })

  describe('getBoardWithColumns', () => {
    it('should return board with columns and activities', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue({
        id: 'b-1',
        name: 'Sprint 1',
        columns: [
          { id: 'col-1', title: 'A Fazer', position: 0, activities: [] },
        ],
      } as never)

      const result = await BoardsService.getBoardWithColumns('b-1')
      expect(result.columns).toHaveLength(1)
    })

    it('should throw BOARD_NOT_FOUND if not found', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue(null)

      await expect(BoardsService.getBoardWithColumns('x')).rejects.toMatchObject({
        code: 'BOARD_NOT_FOUND',
      })
    })
  })

  describe('createColumn', () => {
    it('should create column in board', async () => {
      vi.mocked(prisma.column.create).mockResolvedValue({
        id: 'col-1',
        title: 'A Fazer',
        position: 0,
        boardId: 'b-1',
        createdAt: new Date(),
      })

      const result = await BoardsService.createColumn('b-1', { title: 'A Fazer', position: 0 })
      expect(result.title).toBe('A Fazer')
    })
  })

  describe('updateColumn', () => {
    it('should update column', async () => {
      vi.mocked(prisma.column.update).mockResolvedValue({
        id: 'col-1',
        title: 'Done',
        position: 2,
        boardId: 'b-1',
        createdAt: new Date(),
      })

      const result = await BoardsService.updateColumn('col-1', { title: 'Done', position: 2 })
      expect(result.title).toBe('Done')
    })
  })

  describe('deleteColumn', () => {
    it('should delete column', async () => {
      vi.mocked(prisma.column.delete).mockResolvedValue({
        id: 'col-1',
        title: 'A Fazer',
        position: 0,
        boardId: 'b-1',
        createdAt: new Date(),
      })

      await BoardsService.deleteColumn('col-1')
      expect(prisma.column.delete).toHaveBeenCalledWith({ where: { id: 'col-1' } })
    })
  })
})
