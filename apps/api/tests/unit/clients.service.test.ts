import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    client: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { ClientsService } from '../../src/modules/clients/clients.service.js'
import { prisma } from '../../src/lib/prisma.js'

const mockClient = {
  id: 'client-1',
  name: 'Empresa ABC',
  address: 'Rua X',
  phone: '123',
  email: 'abc@test.com',
  contractMonths: 12,
  paid: true,
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

describe('ClientsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should return paginated clients', async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockClient], 1])

      const result = await ClientsService.list({ page: 1, limit: 20 })

      expect(result.items).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })

    it('should filter by status', async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockClient], 1])

      await ClientsService.list({ page: 1, limit: 20, status: 'active' })

      expect(prisma.$transaction).toHaveBeenCalled()
    })

    it('should filter by paid', async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockClient], 1])

      await ClientsService.list({ page: 1, limit: 20, paid: true })

      expect(prisma.$transaction).toHaveBeenCalled()
    })
  })

  describe('findById', () => {
    it('should return client', async () => {
      vi.mocked(prisma.client.findFirst).mockResolvedValue(mockClient)

      const result = await ClientsService.findById('client-1')
      expect(result.id).toBe('client-1')
    })

    it('should throw CLIENT_NOT_FOUND if not found', async () => {
      vi.mocked(prisma.client.findFirst).mockResolvedValue(null)

      await expect(ClientsService.findById('x')).rejects.toMatchObject({
        code: 'CLIENT_NOT_FOUND',
        statusCode: 404,
      })
    })
  })

  describe('create', () => {
    it('should create client', async () => {
      vi.mocked(prisma.client.create).mockResolvedValue(mockClient)

      const result = await ClientsService.create({
        name: 'Empresa ABC',
        status: 'active',
        paid: true,
      })

      expect(result.name).toBe('Empresa ABC')
    })
  })

  describe('remove', () => {
    it('should soft delete client', async () => {
      vi.mocked(prisma.client.findFirst).mockResolvedValue(mockClient)
      vi.mocked(prisma.client.update).mockResolvedValue({
        ...mockClient,
        deletedAt: new Date(),
      })

      await ClientsService.remove('client-1')

      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: 'client-1' },
        data: { deletedAt: expect.any(Date) },
      })
    })
  })
})
