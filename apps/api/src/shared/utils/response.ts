import type { FastifyReply } from 'fastify'
import type { PaginationMeta } from '@bewave/types'

export function ok<T>(reply: FastifyReply, data: T) {
  return reply.status(200).send({ data })
}

export function created<T>(reply: FastifyReply, data: T) {
  return reply.status(201).send({ data })
}

export function paginated<T>(reply: FastifyReply, data: T[], meta: PaginationMeta) {
  return reply.status(200).send({ data, meta })
}

export function noContent(reply: FastifyReply) {
  return reply.status(204).send()
}
