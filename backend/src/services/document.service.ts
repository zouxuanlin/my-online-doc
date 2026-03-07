import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { Permission } from '../types';
import { Document, DocumentVersion } from '@prisma/client';

export interface CreateDocumentInput {
  title: string;
  content?: string;
  folderId?: string;
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
): Promise<Document> {
  return prisma.document.create({
    data: {
      title: input.title || '无标题文档',
      content: input.content,
      ownerId,
      folderId: input.folderId,
    },
  });
}

// 获取文档列表
export async function getDocumentList(
  userId: string,
  options?: {
    folderId?: string | null;
    search?: string;
    page?: number;
    pageSize?: number;
    includeDeleted?: boolean;
  }
) {
  const {
    folderId,
    search,
    page = 1,
    pageSize = 20,
    includeDeleted = false,
  } = options || {};

  const where: any = {
    ownerId: userId,
    isDeleted: includeDeleted ? undefined : false,
  };

  // 文件夹筛选
  if (folderId !== undefined) {
    where.folderId = folderId;
  }

  // 搜索
  if (search) {
    where.title = { contains: search };
  }

  // 获取总数
  const total = await prisma.document.count({ where });

  // 获取列表
  const documents = await prisma.document.findMany({
    where,
    include: {
      folder: { select: { id: true, name: true } },
      _count: { select: { versions: true } },
    },
    orderBy: { updatedAt: 'desc' },
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
