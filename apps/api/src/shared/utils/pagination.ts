import type { PaginationMeta } from '@bewave/types'

type PaginationInput = {
  page?: number
  limit?: number
}

type PaginationResult = {
  skip: number
  take: number
}

export function getPagination(input: PaginationInput): PaginationResult {
  const page = input.page ?? 1
  const limit = input.limit ?? 20

  return {
    skip: (page - 1) * limit,
    take: limit,
  }
}

export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}
