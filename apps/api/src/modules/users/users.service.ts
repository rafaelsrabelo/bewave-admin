import bcrypt from 'bcrypt'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import { getPagination, buildMeta } from '../../shared/utils/pagination.js'
import type { CreateUserInput, UpdateUserInput, ListUsersInput, UpdateProfileInput, ChangePasswordInput } from './users.schema.js'

const USER_SELECT = {
  id: true,
  name: true,
  role: true,
  phone: true,
  email: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

export class UsersService {
  static async list(filters: ListUsersInput) {
    const { skip, take } = getPagination(filters)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20

    const where = {
      ...(filters.role && { role: filters.role }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    }

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return { items, meta: buildMeta(page, limit, total) }
  }

  static async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    })

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404)
    }

    return user
  }

  static async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      throw new AppError('EMAIL_ALREADY_EXISTS', 'Email já cadastrado', 409)
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    return prisma.user.create({
      data: {
        name: data.name,
        role: data.role,
        phone: data.phone,
        email: data.email,
        passwordHash,
      },
      select: USER_SELECT,
    })
  }

  static async update(id: string, data: UpdateUserInput) {
    await this.findById(id)

    return prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    })
  }

  static async deactivate(id: string) {
    await this.findById(id)

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })
  }

  static async remove(id: string) {
    await this.findById(id)

    await prisma.user.delete({
      where: { id },
    })
  }

  static async updateProfile(userId: string, data: UpdateProfileInput) {
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, id: { not: userId } },
      })
      if (existing) {
        throw new AppError('EMAIL_ALREADY_EXISTS', 'Email já cadastrado', 409)
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: USER_SELECT,
    })
  }

  static async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404)
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash)
    if (!isValid) {
      throw new AppError('INVALID_PASSWORD', 'Senha atual incorreta', 400)
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })
  }
}
