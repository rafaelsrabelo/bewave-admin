import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type {
  CreateColumnInput,
  UpdateColumnInput,
  ReorderColumnsInput,
} from './columns.schema.js'

export class ColumnsService {
  static async list(boardId: string) {
    return prisma.column.findMany({
      where: { boardId, deletedAt: null },
      orderBy: { position: 'asc' },
      include: {
        _count: {
          select: {
            activities: { where: { deletedAt: null } },
          },
        },
      },
    })
  }

  static async create(data: CreateColumnInput) {
    const lastColumn = await prisma.column.findFirst({
      where: { boardId: data.boardId, deletedAt: null },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const position = data.position ?? (lastColumn ? lastColumn.position + 1 : 0)

    return prisma.column.create({
      data: {
        title: data.title,
        color: data.color,
        position,
        boardId: data.boardId,
      },
    })
  }

  static async update(columnId: string, data: UpdateColumnInput) {
    const column = await prisma.column.findFirst({
      where: { id: columnId, deletedAt: null },
    })

    if (!column) {
      throw new AppError('COLUMN_NOT_FOUND', 'Coluna não encontrada', 404)
    }

    return prisma.column.update({
      where: { id: columnId },
      data,
    })
  }

  static async reorder(boardId: string, input: ReorderColumnsInput) {
    await prisma.$transaction(
      input.columns.map((col) =>
        prisma.column.update({
          where: { id: col.id },
          data: { position: col.position },
        }),
      ),
    )
  }

  static async remove(columnId: string) {
    const column = await prisma.column.findFirst({
      where: { id: columnId, deletedAt: null },
    })

    if (!column) {
      throw new AppError('COLUMN_NOT_FOUND', 'Coluna não encontrada', 404)
    }

    const now = new Date()

    await prisma.$transaction([
      prisma.activity.updateMany({
        where: { columnId, deletedAt: null },
        data: { deletedAt: now },
      }),
      prisma.column.update({
        where: { id: columnId },
        data: { deletedAt: now },
      }),
    ])
  }
}
