import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { Tag } from '@prisma/client';

export interface CreateTagInput {
  name: string;
  parentId?: string;
  color?: string;
}

// 创建标签
export async function createTag(ownerId: string, input: CreateTagInput): Promise<Tag> {
  try {
    return await prisma.tag.create({
      data: {
        name: input.name.trim(),
        ownerId,
        parentId: input.parentId,
        color: input.color || '#3b82f6',
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new AppError('TAG_EXISTS', '标签已存在', 409);
    }
    throw error;
  }
}

// 获取用户所有标签（树形结构）
export async function getUserTags(ownerId: string): Promise<any[]> {
  const tags = await prisma.tag.findMany({
    where: { ownerId, parentId: null },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { documents: true },
      },
      children: {
        include: {
          _count: {
            select: { documents: true },
          },
        },
      },
    },
  });
  return tags;
}

// 获取所有标签（扁平列表）
export async function getAllTags(ownerId: string): Promise<any[]> {
  return await prisma.tag.findMany({
    where: { ownerId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { documents: true },
      },
    },
  });
}

// 更新标签
export async function updateTag(
  tagId: string,
  ownerId: string,
  input: { name?: string; color?: string; parentId?: string | null }
): Promise<Tag> {
  const tag = await getTagById(tagId, ownerId);

  const updateData: any = {};
  if (input.name) updateData.name = input.name.trim();
  if (input.color) updateData.color = input.color;
  if (input.parentId !== undefined) updateData.parentId = input.parentId;

  if (Object.keys(updateData).length > 0) {
    try {
      return await prisma.tag.update({
        where: { id: tagId },
        data: updateData,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('TAG_EXISTS', '标签已存在', 409);
      }
      throw error;
    }
  }

  return tag;
}

// 删除标签
export async function deleteTag(tagId: string, ownerId: string): Promise<void> {
  await getTagById(tagId, ownerId);
  await prisma.tag.delete({
    where: { id: tagId },
  });
}

// 获取标签详情
export async function getTagById(tagId: string, ownerId: string): Promise<Tag> {
  const tag = await prisma.tag.findFirst({
    where: {
      id: tagId,
      ownerId,
    },
  });

  if (!tag) {
    throw new AppError('TAG_NOT_FOUND', '标签不存在', 404);
  }

  return tag;
}

// 为文档添加标签
export async function addTagToDocument(
  documentId: string,
  ownerId: string,
  tagId: string
): Promise<void> {
  // 验证文档存在且属于用户
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在', 404);
  }

  // 验证标签存在且属于用户
  await getTagById(tagId, ownerId);

  // 检查是否已关联
  const existing = await prisma.documentTag.findUnique({
    where: {
      documentId_tagId: {
        documentId,
        tagId,
      },
    },
  });

  if (existing) {
    throw new AppError('TAG_ALREADY_ADDED', '标签已添加', 409);
  }

  await prisma.documentTag.create({
    data: {
      documentId,
      tagId,
    },
  });
}

// 从文档移除标签
export async function removeTagFromDocument(
  documentId: string,
  ownerId: string,
  tagId: string
): Promise<void> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在', 404);
  }

  await prisma.documentTag.deleteMany({
    where: {
      documentId,
      tagId,
    },
  });
}

// 更新文档的标签（替换所有标签）
export async function updateDocumentTags(
  documentId: string,
  ownerId: string,
  tagIds: string[]
): Promise<void> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在', 404);
  }

  // 删除现有标签
  await prisma.documentTag.deleteMany({
    where: { documentId },
  });

  // 添加新标签
  if (tagIds.length > 0) {
    await prisma.documentTag.createMany({
      data: tagIds.map((tagId) => ({
        documentId,
        tagId,
      })),
    });
  }
}

// 获取文档的所有标签
export async function getDocumentTags(documentId: string, ownerId: string): Promise<Tag[]> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在', 404);
  }

  const documentTags = await prisma.documentTag.findMany({
    where: { documentId },
    include: { tag: true },
  });

  return documentTags.map((dt) => dt.tag);
}

// 按标签筛选文档
export async function getDocumentsByTag(
  ownerId: string,
  tagId: string
): Promise<any[]> {
  const documentTags = await prisma.documentTag.findMany({
    where: { tagId },
    include: {
      document: {
        include: {
          folder: { select: { id: true, name: true } },
          _count: { select: { versions: true } },
        },
      },
    },
  });

  return documentTags.map((dt) => dt.document);
}
