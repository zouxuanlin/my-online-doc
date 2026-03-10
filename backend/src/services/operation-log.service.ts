import prisma from '../utils/prisma';

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ARCHIVE = 'ARCHIVE',
  UNARCHIVE = 'UNARCHIVE',
  RESTORE = 'RESTORE',
  EXPORT = 'EXPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  UPLOAD = 'UPLOAD',
  SHARE = 'SHARE',
}

export enum EntityType {
  DOCUMENT = 'DOCUMENT',
  FOLDER = 'FOLDER',
  TAG = 'TAG',
  USER = 'USER',
  FILE = 'FILE',
}

export interface CreateLogInput {
  userId: string;
  action: ActionType;
  entityType: EntityType;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

// 创建操作日志
export async function createLog(input: CreateLogInput) {
  return prisma.operationLog.create({
    data: input,
  });
}

// 获取用户的操作日志
export async function getUserLogs(
  userId: string,
  options?: {
    page?: number;
    pageSize?: number;
    action?: ActionType;
    entityType?: EntityType;
    entityId?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const {
    page = 1,
    pageSize = 20,
    action,
    entityType,
    entityId,
    startDate,
    endDate,
  } = options || {};

  const where: any = { userId };

  if (action) {
    where.action = action;
  }

  if (entityType) {
    where.entityType = entityType;
  }

  if (entityId) {
    where.entityId = entityId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  const total = await prisma.operationLog.count({ where });

  const logs = await prisma.operationLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { list: logs, total, page, pageSize };
}

// 获取实体操作日志
export async function getEntityLogs(
  entityType: EntityType,
  entityId: string,
  limit: number = 10
) {
  return prisma.operationLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// 文档操作日志中间件
export function createDocumentLog(
  userId: string,
  action: ActionType,
  documentId: string,
  details?: string,
  ipAddress?: string,
  userAgent?: string
) {
  return createLog({
    userId,
    action,
    entityType: EntityType.DOCUMENT,
    entityId: documentId,
    details,
    ipAddress,
    userAgent,
  });
}
