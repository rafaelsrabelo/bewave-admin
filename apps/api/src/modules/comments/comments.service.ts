import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'

export class CommentsService {
  static async list(activityId: string) {
    return prisma.activityComment.findMany({
      where: { activityId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    })
  }

  static async create(activityId: string, userId: string, content: string) {
    return prisma.activityComment.create({
      data: { activityId, userId, content },
      include: {
        user: { select: { id: true, name: true } },
      },
    })
  }

  static async update(commentId: string, userId: string, content: string) {
    const comment = await this.findById(commentId)

    if (comment.userId !== userId) {
      throw new AppError('COMMENT_ACCESS_DENIED', 'Apenas o autor pode editar este comentário', 403)
    }

    return prisma.activityComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: { select: { id: true, name: true } },
      },
    })
  }

  static async remove(commentId: string, userId: string) {
    const comment = await this.findById(commentId)

    if (comment.userId !== userId) {
      throw new AppError('COMMENT_ACCESS_DENIED', 'Apenas o autor pode deletar este comentário', 403)
    }

    await prisma.activityComment.delete({
      where: { id: commentId },
    })
  }

  private static async findById(id: string) {
    const comment = await prisma.activityComment.findUnique({
      where: { id },
    })

    if (!comment) {
      throw new AppError('COMMENT_NOT_FOUND', 'Comentário não encontrado', 404)
    }

    return comment
  }
}
