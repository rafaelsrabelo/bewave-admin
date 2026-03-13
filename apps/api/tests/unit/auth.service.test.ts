import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('../../src/lib/redis.js', () => ({
  redis: {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  },
}))

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

vi.mock('../../src/env.js', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-min-32-characters-long',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}))

import { AuthService } from '../../src/modules/auth/auth.service.js'
import { prisma } from '../../src/lib/prisma.js'
import { redis } from '../../src/lib/redis.js'
import bcrypt from 'bcrypt'
import { AppError } from '../../src/shared/errors/app-error.js'

const mockApp = {
  jwt: {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
  },
} as unknown as Parameters<typeof AuthService.login>[2]

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin' as const,
      passwordHash: 'hashed-password',
      isActive: true,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }

    it('should login successfully with valid credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(redis.set).mockResolvedValue('OK')

      const result = await AuthService.login('admin@test.com', 'password123', mockApp)

      expect(result.accessToken).toBe('mock-jwt-token')
      expect(result.refreshToken).toBeDefined()
      expect(result.user.email).toBe('admin@test.com')
      expect(redis.set).toHaveBeenCalled()
    })

    it('should throw INVALID_CREDENTIALS if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      await expect(
        AuthService.login('wrong@test.com', 'password', mockApp),
      ).rejects.toThrow(AppError)

      await expect(
        AuthService.login('wrong@test.com', 'password', mockApp),
      ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    })

    it('should throw INVALID_CREDENTIALS if user is inactive', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        isActive: false,
      })

      await expect(
        AuthService.login('admin@test.com', 'password', mockApp),
      ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    })

    it('should throw INVALID_CREDENTIALS if password is wrong', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(
        AuthService.login('admin@test.com', 'wrong', mockApp),
      ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    })
  })

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      vi.mocked(redis.get).mockResolvedValue('user-1')
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        name: 'Admin',
        email: 'admin@test.com',
        role: 'admin' as const,
        passwordHash: 'hash',
        isActive: true,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
      vi.mocked(redis.del).mockResolvedValue(1)
      vi.mocked(redis.set).mockResolvedValue('OK')

      const result = await AuthService.refresh('old-refresh-token', mockApp)

      expect(result.accessToken).toBe('mock-jwt-token')
      expect(result.refreshToken).toBeDefined()
      expect(redis.del).toHaveBeenCalled()
    })

    it('should throw INVALID_REFRESH_TOKEN if token not in redis', async () => {
      vi.mocked(redis.get).mockResolvedValue(null)

      await expect(
        AuthService.refresh('invalid-token', mockApp),
      ).rejects.toMatchObject({ code: 'INVALID_REFRESH_TOKEN' })
    })
  })

  describe('logout', () => {
    it('should delete refresh token from redis', async () => {
      vi.mocked(redis.del).mockResolvedValue(1)

      await AuthService.logout('some-token')

      expect(redis.del).toHaveBeenCalledWith('refresh_token:some-token')
    })
  })
})
