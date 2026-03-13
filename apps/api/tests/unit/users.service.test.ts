import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
  },
}))

import { UsersService } from '../../src/modules/users/users.service.js'
import { prisma } from '../../src/lib/prisma.js'
import { AppError } from '../../src/shared/errors/app-error.js'

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  role: 'member' as const,
  phone: '123456',
  email: 'test@test.com',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('UsersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should return paginated users', async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockUser], 1])

      const result = await UsersService.list({ page: 1, limit: 20 })

      expect(result.items).toHaveLength(1)
      expect(result.meta.total).toBe(1)
      expect(result.meta.totalPages).toBe(1)
    })
  })

  describe('findById', () => {
    it('should return user by id', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const result = await UsersService.findById('user-1')
      expect(result.id).toBe('user-1')
    })

    it('should throw USER_NOT_FOUND if not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      await expect(UsersService.findById('x')).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        statusCode: 404,
      })
    })
  })

  describe('create', () => {
    it('should create user with hashed password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never)

      const result = await UsersService.create({
        name: 'Test',
        email: 'test@test.com',
        password: 'Pass@123',
        role: 'member',
      })

      expect(result.id).toBe('user-1')
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ passwordHash: 'hashed-password' }),
        }),
      )
    })

    it('should throw EMAIL_ALREADY_EXISTS if email taken', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      await expect(
        UsersService.create({
          name: 'Test',
          email: 'test@test.com',
          password: 'Pass@123',
        }),
      ).rejects.toMatchObject({ code: 'EMAIL_ALREADY_EXISTS' })
    })
  })

  describe('deactivate', () => {
    it('should set isActive to false', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, isActive: false } as never)

      await UsersService.deactivate('user-1')

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { isActive: false },
      })
    })
  })
})
