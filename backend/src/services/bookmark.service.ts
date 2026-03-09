import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';

// 获取用户的收藏列表
export async function getUserBookmarks(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      document: {
        include: {
          folder: { select: { id: true, name: true } },
          tags: { include: { tag: true } },
          _count: { select: { versions: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookmarks.map((b) => b.document);
}

// 添加收藏
export async function addBookmark(userId: string, documentId: string) {
  // 验证文档存在且属于用户
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId: userId,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在', 404);
  }

  // 检查是否已收藏
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_documentId: {
        userId,
        documentId,
      },
    },
  });

  if (existing) {
    throw new AppError('ALREADY_BOOKMARKED', '已收藏该文档', 409);
  }

  await prisma.bookmark.create({
    data: {
      userId,
      documentId,
    },
  });

  return { success: true };
}

// 移除收藏
export async function removeBookmark(userId: string, documentId: string) {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_documentId: {
        userId,
        documentId,
      },
    },
  });

  if (!bookmark) {
    throw new AppError('NOT_BOOKMARKED', '未收藏该文档', 404);
  }

  await prisma.bookmark.delete({
    where: {
      id: bookmark.id,
    },
  });

  return { success: true };
}

// 检查文档是否已收藏
export async function isBookmarked(userId: string, documentId: string) {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_documentId: {
        userId,
        documentId,
      },
    },
  });

  return !!bookmark;
}
