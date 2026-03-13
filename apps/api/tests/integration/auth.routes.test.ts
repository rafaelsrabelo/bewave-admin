import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('../../src/lib/redis.js', () => ({
  redis: {
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn(),
    del: vi.fn().mockResolvedValue(1),
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
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'test-secret-key-that-is-at-least-32-chars',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    NODE_ENV: 'test',
    API_PORT: 0,
    API_HOST: '127.0.0.1',
  },
}))

import { buildApp } from '../../src/app.js'
import { prisma } from '../../src/lib/prisma.js'
import { redis } from '../../src/lib/redis.js'
import bcrypt from 'bcrypt'
import type { FastifyInstance } from 'fastify'

let app: FastifyInstance

beforeAll(async () => {
  app = await buildApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

describe('Auth Routes', () => {
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

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 with access token on valid login', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: { email: 'admin@test.com', password: 'password123' },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.data.accessToken).toBeDefined()
      expect(body.data.user.email).toBe('admin@test.com')
    })

    it('should return 401 on invalid credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: { email: 'wrong@test.com', password: 'wrong123' },
      })

      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.error.code).toBe('INVALID_CREDENTIALS')
    })

    it('should return 400 on invalid body', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: { email: 'not-email', password: '12' },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 401 when no cookie', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
      })

      expect(response.statusCode).toBe(401)
    })

    it('should return 200 with new access token on valid refresh', async () => {
      vi.mocked(redis.get).mockResolvedValue('user-1')
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        cookies: { refreshToken: 'valid-token' },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.data.accessToken).toBeDefined()
    })
  })
})
