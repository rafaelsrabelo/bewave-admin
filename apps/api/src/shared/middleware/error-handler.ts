import type { FastifyInstance } from 'fastify'
import { AppError } from '../errors/app-error.js'
import { ZodError } from 'zod'

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          details: error.details,
        },
      })
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          statusCode: 400,
          details: error.flatten(),
        },
      })
    }

    app.log.error(error)

    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
        statusCode: 500,
      },
    })
  })
}
