import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    activity: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    activityAssignee: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { ActivitiesService } from '../../src/modules/activities/activities.service.js'
import { prisma } from '../../src/lib/prisma.js'

const mockActivity = {
  id: 'act-1',
  title: 'Test Activity',
  description: null,
  priority: 'medium' as const,
  category: null,
  position: 0,
  columnId: 'col-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  assignees: [],
}

describe('ActivitiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create activity at position 0 when column is empty', async () => {
      vi.mocked(prisma.activity.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.activity.create).mockResolvedValue(mockActivity as never)

      const result = await ActivitiesService.create({
        columnId: 'col-1',
        title: 'Test Activity',
      })

      expect(result.title).toBe('Test Activity')
      expect(prisma.activity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ position: 0 }),
        }),
      )
    })

    it('should create activity at next position', async () => {
      vi.mocked(prisma.activity.findFirst).mockResolvedValue({
        ...mockActivity,
        position: 2,
      })
      vi.mocked(prisma.activity.create).mockResolvedValue({
        ...mockActivity,
        position: 3,
      } as never)

      await ActivitiesService.create({
        columnId: 'col-1',
        title: 'New',
      })

      expect(prisma.activity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ position: 3 }),
        }),
      )
    })
  })

  describe('move', () => {
    it('should move activity to new column and position', async () => {
      vi.mocked(prisma.activity.findFirst).mockResolvedValue(mockActivity)
      vi.mocked(prisma.activity.update).mockResolvedValue({
        ...mockActivity,
        columnId: 'col-2',
        position: 1,
      } as never)

      const result = await ActivitiesService.move('act-1', {
        columnId: 'col-2',
        position: 1,
      })

      expect(prisma.activity.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { columnId: 'col-2', position: 1 },
        }),
      )
    })
  })

  describe('addAssignee', () => {
    it('should create assignee record', async () => {
      vi.mocked(prisma.activityAssignee.create).mockResolvedValue({
        activityId: 'act-1',
        userId: 'user-1',
      })

      await ActivitiesService.addAssignee('act-1', 'user-1')

      expect(prisma.activityAssignee.create).toHaveBeenCalledWith({
        data: { activityId: 'act-1', userId: 'user-1' },
      })
    })
  })

  describe('removeAssignee', () => {
    it('should delete assignee record', async () => {
      vi.mocked(prisma.activityAssignee.delete).mockResolvedValue({
        activityId: 'act-1',
        userId: 'user-1',
      })

      await ActivitiesService.removeAssignee('act-1', 'user-1')

      expect(prisma.activityAssignee.delete).toHaveBeenCalledWith({
        where: { activityId_userId: { activityId: 'act-1', userId: 'user-1' } },
      })
    })
  })

  describe('remove', () => {
    it('should soft delete activity', async () => {
      vi.mocked(prisma.activity.findFirst).mockResolvedValue(mockActivity)
      vi.mocked(prisma.activity.update).mockResolvedValue({
        ...mockActivity,
        deletedAt: new Date(),
      })

      await ActivitiesService.remove('act-1')

      expect(prisma.activity.update).toHaveBeenCalledWith({
        where: { id: 'act-1' },
        data: { deletedAt: expect.any(Date) },
      })
    })

    it('should throw if activity not found', async () => {
      vi.mocked(prisma.activity.findFirst).mockResolvedValue(null)

      await expect(ActivitiesService.remove('x')).rejects.toMatchObject({
        code: 'ACTIVITY_NOT_FOUND',
      })
    })
  })
})
