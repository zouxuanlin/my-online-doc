import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';

export interface CreateCommentInput {
  content: string;
  documentId: string;
  userId: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  content: string;
}

// 创建评论
export async function createComment(input: CreateCommentInput) {
  const { content, documentId, userId, parentId } = input;

  // 如果是回复评论，检查父评论是否存在
  if (parentId) {
    const parentComment = await prisma.comment.findFirst({
      where: {
        id: parentId,
        documentId,
        isDeleted: false,
      },
    });

    if (!parentComment) {
      throw new AppError('PARENT_COMMENT_NOT_FOUND', '父评论不存在', 404);
    }
  }

  // 检查文档是否存在
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      isDeleted: false,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在', 404);
  }

  return prisma.comment.create({
    data: {
      content,
      documentId,
      userId,
      parentId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      },
      parent: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });
}

// 获取文档评论列表（含回复）
export async function getDocumentComments(documentId: string, userId: string) {
  // 检查文档是否存在且用户有权限查看
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      OR: [
        { ownerId: userId },
        { isPublic: true },
      ],
      isDeleted: false,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在或无权限查看', 404);
  }

  // 获取所有非删除的评论（包括回复）
  const comments = await prisma.comment.findMany({
    where: {
      documentId,
      isDeleted: false,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      },
      parent: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 过滤出顶级评论（没有父评论的）
  const topLevelComments = comments.filter((c) => !c.parentId);

  // 将回复关联到父评论
  const commentsWithReplies = topLevelComments.map((comment) => ({
    ...comment,
    replies: comments.filter((c) => c.parentId === comment.id),
  }));

  return {
    comments: commentsWithReplies,
    total: topLevelComments.length,
  };
}

// 获取评论详情
export async function getCommentById(commentId: string, userId: string) {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      isDeleted: false,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      },
      document: {
        select: {
          id: true,
          ownerId: true,
        },
      },
    },
  });

  if (!comment) {
    throw new AppError('COMMENT_NOT_FOUND', '评论不存在', 404);
  }

  // 检查权限：只有文档所有者或评论作者可以查看
  const isDocumentOwner = comment.document.ownerId === userId;
  const isCommentAuthor = comment.userId === userId;

  if (!isDocumentOwner && !isCommentAuthor) {
    throw new AppError('NO_PERMISSION', '无权限查看此评论', 403);
  }

  return comment;
}

// 更新评论
export async function updateComment(
  commentId: string,
  userId: string,
  input: UpdateCommentInput
) {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      isDeleted: false,
    },
  });

  if (!comment) {
    throw new AppError('COMMENT_NOT_FOUND', '评论不存在', 404);
  }

  // 只有评论作者可以编辑
  if (comment.userId !== userId) {
    throw new AppError('NO_PERMISSION', '只有评论作者可以编辑评论', 403);
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: {
      content: input.content,
    },
  });
}

// 删除评论（软删除）
export async function deleteComment(commentId: string, userId: string) {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      isDeleted: false,
    },
    include: {
      document: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!comment) {
    throw new AppError('COMMENT_NOT_FOUND', '评论不存在', 404);
  }

  // 只有评论作者或文档所有者可以删除
  const isDocumentOwner = comment.document.ownerId === userId;
  const isCommentAuthor = comment.userId === userId;

  if (!isDocumentOwner && !isCommentAuthor) {
    throw new AppError('NO_PERMISSION', '只有评论作者或文档所有者可以删除评论', 403);
  }

  // 软删除：同时删除所有子评论
  async function deleteCommentAndReplies(id: string) {
    await prisma.comment.update({
      where: { id },
      data: { isDeleted: true },
    });

    // 递归删除所有回复
    const replies = await prisma.comment.findMany({
      where: { parentId: id },
    });

    for (const reply of replies) {
      await deleteCommentAndReplies(reply.id);
    }
  }

  await deleteCommentAndReplies(commentId);

  return { success: true };
}
