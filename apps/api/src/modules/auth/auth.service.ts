import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { redis } from '../../lib/redis.js'
import { AppError } from '../../shared/errors/app-error.js'
import { env } from '../../env.js'

const REFRESH_TOKEN_PREFIX = 'refresh_token:'
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 // 30 days in seconds

export class AuthService {
  static async login(email: string, password: string, app: FastifyInstance) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.isActive) {
      throw new AppError('INVALID_CREDENTIALS', 'Email ou senha incorretos', 401)
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      throw new AppError('INVALID_CREDENTIALS', 'Email ou senha incorretos', 401)
    }

    const accessToken = app.jwt.sign({
      sub: user.id,
      role: user.role,
    })

    const refreshToken = crypto.randomUUID()

    await redis.set(
      `${REFRESH_TOKEN_PREFIX}${refreshToken}`,
      user.id,
      'EX',
      REFRESH_TOKEN_TTL,
    )

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  }

  static async refresh(refreshToken: string, app: FastifyInstance) {
    const userId = await redis.get(`${REFRESH_TOKEN_PREFIX}${refreshToken}`)

    if (!userId) {
      throw new AppError('INVALID_REFRESH_TOKEN', 'Refresh token inválido ou expirado', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.isActive) {
      throw new AppError('INVALID_REFRESH_TOKEN', 'Refresh token inválido ou expirado', 401)
    }

    const accessToken = app.jwt.sign({
      sub: user.id,
      role: user.role,
    })

    // Rotate refresh token
    await redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`)
    const newRefreshToken = crypto.randomUUID()
    await redis.set(
      `${REFRESH_TOKEN_PREFIX}${newRefreshToken}`,
      user.id,
      'EX',
      REFRESH_TOKEN_TTL,
    )

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  static async logout(refreshToken: string) {
    await redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`)
  }
}
