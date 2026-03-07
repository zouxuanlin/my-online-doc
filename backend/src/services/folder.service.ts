import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { Folder } from '@prisma/client';

export interface CreateFolderInput {
  name: string;
  parentId?: string;
}

// 创建文件夹
export async function createFolder(
  ownerId: string,
  input: CreateFolderInput
): Promise<Folder> {
  // 如果指定了父文件夹，验证其存在且属于当前用户
  if (input.parentId) {
    const parentFolder = await prisma.folder.findFirst({
      where: {
        id: input.parentId,
        ownerId,
      },
    });

    if (!parentFolder) {
      throw new AppError('FOLDER_NOT_FOUND', '父文件夹不存在', 404);
    }
  }

  return prisma.folder.create({
    data: {
      name: input.name,
      ownerId,
      parentId: input.parentId,
    },
  });
}

// 获取文件夹树
export async function getFolderTree(ownerId: string): Promise<Folder[]> {
  return prisma.folder.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'asc' },
  });
}

// 获取文件夹详情
export async function getFolderById(
  folderId: string,
  ownerId: string
): Promise<Folder> {
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId,
    },
  });

  if (!folder) {
    throw new AppError('FOLDER_NOT_FOUND', '文件夹不存在', 404);
  }

  return folder;
}

// 获取文件夹及其子文件夹
export async function getFolderWithChildren(
  folderId: string,
  ownerId: string
): Promise<Folder & { children: Folder[]; documents: any[] }> {
  await getFolderById(folderId, ownerId);

  return prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      children: {
        orderBy: { createdAt: 'asc' },
      },
      documents: {
        where: { isDeleted: false },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

// 更新文件夹
export async function updateFolder(
  folderId: string,
  ownerId: string,
  input: { name?: string; parentId?: string | null }
): Promise<Folder> {
  await getFolderById(folderId, ownerId);

  // 如果要移动到其他父文件夹，验证目标文件夹存在
  if (input.parentId) {
    const targetFolder = await prisma.folder.findFirst({
      where: {
        id: input.parentId,
        ownerId,
      },
    });

    if (!targetFolder) {
      throw new AppError('FOLDER_NOT_FOUND', '目标文件夹不存在', 404);
    }

    // 防止循环引用
    if (input.parentId === folderId) {
      throw new AppError('INVALID_OPERATION', '不能将文件夹移动到自己内部', 400);
    }
  }

  return prisma.folder.update({
    where: { id: folderId },
    data: {
      name: input.name,
      parentId: input.parentId,
    },
  });
}

// 删除文件夹
export async function deleteFolder(
  folderId: string,
  ownerId: string
): Promise<void> {
  await getFolderById(folderId, ownerId);

  // 检查是否有子文件夹
  const children = await prisma.folder.count({
    where: { parentId: folderId },
  });

  if (children > 0) {
    throw new AppError(
      'FOLDER_NOT_EMPTY',
      '文件夹包含子文件夹，请先删除子文件夹',
      400
    );
  }

  // 检查是否有文档
  const documents = await prisma.document.count({
    where: { folderId },
  });

  if (documents > 0) {
    throw new AppError(
      'FOLDER_NOT_EMPTY',
      '文件夹包含文档，请先移走或删除文档',
      400
    );
  }

  await prisma.folder.delete({
    where: { id: folderId },
  });
}

// 获取用户所有文件夹（扁平化）
export async function getAllFolders(
  ownerId: string
): Promise<(Folder & { _count: { documents: number } })[]> {
  return prisma.folder.findMany({
    where: { ownerId },
    include: {
      _count: {
        select: { documents: true },
      },
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}
