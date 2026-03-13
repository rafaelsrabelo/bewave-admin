import type { FastifyRequest, FastifyReply } from 'fastify'
import { loginSchema } from './auth.schema.js'
import { AuthService } from './auth.service.js'

export class AuthController {
  static async login(req: FastifyRequest, reply: FastifyReply) {
    const { email, password } = loginSchema.parse(req.body)

    const result = await AuthService.login(email, password, req.server)

    reply.setCookie('refreshToken', result.refreshToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return reply.status(200).send({
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    })
  }

  static async refresh(req: FastifyRequest, reply: FastifyReply) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token não encontrado',
          statusCode: 401,
        },
      })
    }

    const result = await AuthService.refresh(refreshToken, req.server)

    reply.setCookie('refreshToken', result.refreshToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    })

    return reply.status(200).send({
      data: { accessToken: result.accessToken },
    })
  }

  static async logout(req: FastifyRequest, reply: FastifyReply) {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken) {
      await AuthService.logout(refreshToken)
    }

    reply.clearCookie('refreshToken', { path: '/' })

    return reply.status(204).send()
  }
}
