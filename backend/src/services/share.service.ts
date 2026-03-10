import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { Share } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface CreateShareInput {
  documentId: string;
  sharedWithEmail: string;
  permission?: string;
  password?: string;
  expiresAt?: string;
}

export interface UpdateShareInput {
  permission?: string;
  password?: string;
  expiresAt?: string;
}

// 创建分享
export async function createShare(
  sharedById: string,
  input: CreateShareInput
): Promise<Share> {
  // 验证文档所有权
  const document = await prisma.document.findFirst({
    where: {
      id: input.documentId,
      ownerId: sharedById,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在或无权分享', 404);
  }

  // 验证接收用户是否存在
  const targetUser = await prisma.user.findUnique({
    where: { email: input.sharedWithEmail },
  });

  if (!targetUser) {
    throw new AppError('USER_NOT_FOUND', '目标用户不存在', 404);
  }

  // 检查是否已存在分享
  const existingShare = await prisma.share.findFirst({
    where: {
      documentId: input.documentId,
      sharedWithEmail: input.sharedWithEmail,
    },
  });

  if (existingShare) {
    throw new AppError('SHARE_EXISTS', '该文档已分享给此用户', 409);
  }

  // 加密密码（如果提供）
  let hashedPassword: string | undefined;
  if (input.password) {
    hashedPassword = await bcrypt.hash(input.password, 12);
  }

  // 创建分享
  return prisma.share.create({
    data: {
      documentId: input.documentId,
      sharedById,
      sharedWithEmail: input.sharedWithEmail,
      permission: input.permission || 'READ',
      password: hashedPassword,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
    include: {
      document: { select: { id: true, title: true } },
      sharedWith: { select: { id: true, email: true, name: true } },
    },
  });
}

// 获取文档的分享列表
export async function getDocumentShares(
  documentId: string,
  userId: string
): Promise<Share[]> {
  // 验证文档所有权
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId: userId,
    },
  });

  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', '文档不存在或无权访问', 404);
  }

  return prisma.share.findMany({
    where: { documentId },
    include: {
      sharedWith: { select: { id: true, email: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// 获取用户收到的分享
export async function getUserReceivedShares(userId: string): Promise<Share[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
  }

  return prisma.share.findMany({
    where: { sharedWithEmail: user.email },
    include: {
      document: { select: { id: true, title: true } },
      sharedBy: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// 更新分享
export async function updateShare(
  shareId: string,
  userId: string,
  input: UpdateShareInput
): Promise<Share> {
  // 获取分享并验证权限
  const share = await prisma.share.findUnique({
    where: { id: shareId },
    include: { document: true },
  });

  if (!share) {
    throw new AppError('SHARE_NOT_FOUND', '分享不存在', 404);
  }

  if (share.document.ownerId !== userId) {
    throw new AppError('FORBIDDEN', '无权修改此分享', 403);
  }

  const updateData: any = {};

  if (input.permission !== undefined) {
    updateData.permission = input.permission;
  }

  if (input.password !== undefined) {
    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 12);
    } else {
      updateData.password = null;
    }
  }

  if (input.expiresAt !== undefined) {
    updateData.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  }

  return prisma.share.update({
    where: { id: shareId },
    data: updateData,
    include: {
      document: { select: { id: true, title: true } },
      sharedWith: { select: { id: true, email: true, name: true } },
    },
  });
}

// 删除分享
export async function deleteShare(
  shareId: string,
  userId: string
): Promise<void> {
  const share = await prisma.share.findUnique({
    where: { id: shareId },
    include: { document: true },
  });

  if (!share) {
    throw new AppError('SHARE_NOT_FOUND', '分享不存在', 404);
  }

  if (share.document.ownerId !== userId) {
    throw new AppError('FORBIDDEN', '无权删除此分享', 403);
  }

  await prisma.share.delete({
    where: { id: shareId },
  });
}

// 验证分享访问权限
export async function verifyShareAccess(
  documentId: string,
  userId: string,
  password?: string
): Promise<{ allowed: boolean; share?: Share; message?: string }> {
  const share = await prisma.share.findFirst({
    where: {
      documentId,
      sharedWithEmail: userId,
    },
  });

  if (!share) {
    return { allowed: false, message: '无访问权限' };
  }

  // 检查是否过期
  if (share.expiresAt && new Date() > share.expiresAt) {
    return { allowed: false, message: '分享已过期' };
  }

  // 验证密码（如果有）
  if (share.password) {
    if (!password) {
      return { allowed: false, message: '需要密码', share };
    }

    const isPasswordCorrect = await bcrypt.compare(password, share.password);
    if (!isPasswordCorrect) {
      return { allowed: false, message: '密码错误', share };
    }
  }

  return { allowed: true, share };
}

// 通过分享 ID 获取分享详情
export async function getShareById(
  shareId: string
): Promise<Share | null> {
  return prisma.share.findUnique({
    where: { id: shareId },
    include: {
      document: { select: { id: true, title: true, content: true } },
      sharedBy: { select: { id: true, email: true, name: true } },
      sharedWith: { select: { id: true, email: true, name: true } },
    },
  });
}
