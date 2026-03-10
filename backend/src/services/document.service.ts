import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { Permission } from '../types';
import { Document, DocumentVersion } from '@prisma/client';
import { cuid } from '@prisma/client/runtime/library';

export interface CreateDocumentInput {
  title: string;
  content?: string;
  folderId?: string;
  tagIds?: string[];
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  folderId?: string | null;
}

// 创建文档
export async function createDocument(
  ownerId: string,
  input: CreateDocumentInput
): Promise<Document & { tags: any[] }> {
  const document = await prisma.document.create({
    data: {
      title: input.title || '无标题文档',
      content: input.content,
      ownerId,
      folderId: input.folderId,
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  // 如果有关联的标签，创建关联
  if (input.tagIds && input.tagIds.length > 0) {
    await prisma.documentTag.createMany({
      data: input.tagIds.map((tagId) => ({
        documentId: document.id,
        tagId,
      })),
    });
  }

  return document;
}

export interface DocumentListOptions {
  folderId?: string | null;
  search?: string;
  page?: number;
  pageSize?: number;
  onlyDeleted?: boolean;
  onlyArchived?: boolean;
  tagId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

// 获取文档列表
export async function getDocumentList(
  userId: string,
  options?: DocumentListOptions
) {
  const {
    folderId,
    search,
    page = 1,
    pageSize = 20,
    onlyDeleted = false,
    onlyArchived = false,
    tagId,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    startDate,
    endDate,
  } = options || {};

  const where: any = {
    ownerId: userId,
    isDeleted: onlyDeleted ? true : false,
  };

  // 归档筛选
  if (onlyArchived) {
    where.isArchived = true;
  } else if (!onlyDeleted) {
    // 如果不是回收站视图，则排除已删除和已归档的文档
    where.isArchived = false;
  }

  // 文件夹筛选
  if (folderId !== undefined) {
    where.folderId = folderId;
  }

  // 标签筛选
  if (tagId) {
    where.tags = {
      some: {
        tagId,
      },
    };
  }

  // 日期范围筛选
  if (startDate || endDate) {
    where.updatedAt = {};
    if (startDate) {
      where.updatedAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.updatedAt.lte = new Date(endDate);
    }
  }

  // 全文搜索（标题 + 内容）
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  // 获取总数
  const total = await prisma.document.count({ where });

  // 排序选项
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // 获取列表
  const documents = await prisma.document.findMany({
    where,
    include: {
      folder: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      _count: { select: { versions: true } },
    },
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { list: documents, total, page, pageSize };
}

// 获取文档详情
export async function getDocumentById(
  documentId: string,
  userId: string
): Promise<Document> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId: userId,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在', 404);
  }

  return document;
}

// 更新文档
export async function updateDocument(
  documentId: string,
  userId: string,
  input: UpdateDocumentInput,
  createVersion: boolean = true
): Promise<Document> {
  const document = await getDocumentById(documentId, userId);

  // 如果需要创建版本，先保存当前内容
  if (createVersion && (input.title || input.content)) {
    const lastVersion = await prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (lastVersion?.version || 0) + 1;

    await prisma.documentVersion.create({
      data: {
        documentId,
        content: document.content || '',
        version: newVersion,
      },
    });
  }

  return prisma.document.update({
    where: { id: documentId },
    data: {
      title: input.title,
      content: input.content,
      folderId: input.folderId,
    },
  });
}

// 删除文档（软删除）
export async function deleteDocument(
  documentId: string,
  userId: string
): Promise<Document> {
  await getDocumentById(documentId, userId);

  return prisma.document.update({
    where: { id: documentId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
}

// 永久删除文档
export async function permanentlyDeleteDocument(
  documentId: string,
  userId: string
): Promise<void> {
  await getDocumentById(documentId, userId);

  await prisma.document.delete({
    where: { id: documentId },
  });
}

// 恢复已删除的文档
export async function restoreDocument(
  documentId: string,
  userId: string
): Promise<Document> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId: userId,
      isDeleted: true,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在或未被删除', 404);
  }

  return prisma.document.update({
    where: { id: documentId },
    data: {
      isDeleted: false,
      deletedAt: null,
    },
  });
}

// 获取文档版本历史
export async function getDocumentVersions(
  documentId: string,
  userId: string
): Promise<DocumentVersion[]> {
  await getDocumentById(documentId, userId);

  return prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { version: 'desc' },
  });
}

// 获取特定版本
export async function getDocumentVersion(
  documentId: string,
  versionId: string,
  userId: string
): Promise<DocumentVersion> {
  await getDocumentById(documentId, userId);

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
  });

  if (!version || version.documentId !== documentId) {
    throw new AppError('VERSION_NOT_FOUND', '版本不存在', 404);
  }

  return version;
}

// 回滚到指定版本
export async function rollbackToVersion(
  documentId: string,
  versionId: string,
  userId: string
): Promise<Document> {
  const version = await getDocumentVersion(documentId, versionId, userId);

  return prisma.document.update({
    where: { id: documentId },
    data: { content: version.content },
  });
}

// 检查文档权限
export async function checkDocumentPermission(
  documentId: string,
  userId: string,
  requiredPermission: Permission = Permission.READ
): Promise<boolean> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { shares: true },
  });

  if (!document) {
    return false;
  }

  // 文档所有者拥有所有权限
  if (document.ownerId === userId) {
    return true;
  }

  // 检查分享权限
  const share = document.shares.find((s) => s.sharedWithEmail === userId);

  if (!share) {
    return false;
  }

  // 权限等级检查
  const permissionLevels = {
    [Permission.READ]: 1,
    [Permission.WRITE]: 2,
    [Permission.ADMIN]: 3,
  };

  return (
    permissionLevels[share.permission] >=
    permissionLevels[requiredPermission]
  );
}

// 归档文档
export async function archiveDocument(
  documentId: string,
  userId: string
): Promise<Document> {
  await getDocumentById(documentId, userId);

  return prisma.document.update({
    where: { id: documentId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
    },
  });
}

// 取消归档
export async function unarchiveDocument(
  documentId: string,
  userId: string
): Promise<Document> {
  await getDocumentById(documentId, userId);

  return prisma.document.update({
    where: { id: documentId },
    data: {
      isArchived: false,
      archivedAt: null,
    },
  });
}

// 获取相关文档（基于标签和内容相似度）
export async function getRelatedDocuments(
  documentId: string,
  userId: string,
  limit: number = 5
): Promise<Document[]> {
  const currentDoc = await getDocumentById(documentId, userId);

  // 获取当前文档的标签
  const currentTags = await prisma.documentTag.findMany({
    where: { documentId },
    include: { tag: true },
  });

  if (currentTags.length === 0) {
    // 如果没有标签，返回同文件夹的文档
    return prisma.document.findMany({
      where: {
        ownerId: userId,
        id: { not: documentId },
        folderId: currentDoc.folderId,
        isDeleted: false,
        isArchived: false,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  // 获取标签 ID 列表
  const tagIds = currentTags.map((t) => t.tagId);

  // 查找有相同标签的文档
  const relatedDocs = await prisma.document.findMany({
    where: {
      ownerId: userId,
      id: { not: documentId },
      isDeleted: false,
      isArchived: false,
      tags: {
        some: {
          tagId: { in: tagIds },
        },
      },
    },
    include: {
      tags: { include: { tag: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit * 2,
  });

  // 计算相似度分数并排序
  const scoredDocs = relatedDocs.map((doc) => {
    const docTagIds = doc.tags.map((t) => t.tagId);
    const commonTags = tagIds.filter((id) => docTagIds.includes(id));
    const score = commonTags.length;

    return { doc, score };
  });

  // 按相似度排序并返回
  return scoredDocs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.doc);
}

// 发布文档（公开访问）
export async function publishDocument(
  documentId: string,
  userId: string,
  slug?: string
): Promise<Document> {
  await getDocumentById(documentId, userId);

  // 检查 slug 是否已存在
  if (slug) {
    const existing = await prisma.document.findFirst({
      where: { publicSlug: slug },
    });
    if (existing && existing.id !== documentId) {
      throw new AppError('SLUG_EXISTS', '自定义链接已存在', 409);
    }
  }

  return prisma.document.update({
    where: { id: documentId },
    data: {
      isPublic: true,
      publicSlug: slug || cuid(),
      publishedAt: new Date(),
    },
  });
}

// 取消发布文档
export async function unpublishDocument(
  documentId: string,
  userId: string
): Promise<Document> {
  await getDocumentById(documentId, userId);

  return prisma.document.update({
    where: { id: documentId },
    data: {
      isPublic: false,
      publicSlug: null,
      publishedAt: null,
    },
  });
}

// 通过 slug 获取公开文档
export async function getDocumentBySlug(slug: string): Promise<Document | null> {
  return prisma.document.findFirst({
    where: {
      publicSlug: slug,
      isPublic: true,
      isDeleted: false,
    },
  });
}

// 获取用户的已发布文档
export async function getUserPublishedDocuments(userId: string): Promise<Document[]> {
  return prisma.document.findMany({
    where: {
      ownerId: userId,
      isPublic: true,
      isDeleted: false,
    },
    orderBy: { publishedAt: 'desc' },
  });
}

// 提取文档中的双向链接（[[文档名]] 格式）
export async function extractBacklinks(content: string): Promise<string[]> {
  if (!content) return [];

  // 匹配 [[文档名]] 格式
  const regex = /\[\[(.*?)\]\]/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  return [...new Set(matches)]; // 去重
}

// 获取文档的双向链接（哪些文档链接到当前文档）
export async function getBacklinks(documentId: string, userId: string) {
  // 获取当前文档
  const currentDoc = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId: userId,
    },
    select: { title: true },
  });

  if (!currentDoc) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在', 404);
  }

  // 查找链接到当前文档的其他文档
  const linkingDocs = await prisma.document.findMany({
    where: {
      ownerId: userId,
      id: { not: documentId },
      isDeleted: false,
      content: {
        contains: `[[${currentDoc.title}]]`,
      },
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  return linkingDocs;
}

// 获取文档链接到的其他文档（出链）
export async function getOutgoingLinks(documentId: string, userId: string) {
  const currentDoc = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId: userId,
    },
    select: { content: true },
  });

  if (!currentDoc) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在', 404);
  }

  // 提取文档中的所有链接
  const linkTitles = await extractBacklinks(currentDoc.content || '');

  if (linkTitles.length === 0) {
    return [];
  }

  // 查找这些标题对应的文档
  const outgoingLinks = await prisma.document.findMany({
    where: {
      ownerId: userId,
      title: {
        in: linkTitles,
      },
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  return outgoingLinks;
}
