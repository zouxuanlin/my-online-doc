import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { Template } from '@prisma/client';

export interface CreateTemplateInput {
  title: string;
  content?: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
}

export interface UpdateTemplateInput {
  title?: string;
  content?: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
}

// 创建模板
export async function createTemplate(
  ownerId: string,
  input: CreateTemplateInput
): Promise<Template> {
  return prisma.template.create({
    data: {
      title: input.title,
      content: input.content,
      description: input.description,
      category: input.category,
      isPublic: input.isPublic || false,
      ownerId,
    },
  });
}

// 获取模板列表
export async function getTemplateList(
  userId: string,
  options?: {
    search?: string;
    category?: string;
    onlyPublic?: boolean;
    page?: number;
    pageSize?: number;
  }
) {
  const {
    search,
    category,
    onlyPublic = false,
    page = 1,
    pageSize = 20,
  } = options || {};

  const where: any = {};

  if (!onlyPublic) {
    // 如果不是只获取公开的，则获取用户的模板和公开模板
    where.OR = [
      { ownerId: userId },
      { isPublic: true },
    ];
  } else {
    where.isPublic = true;
  }

  // 搜索
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // 分类筛选
  if (category) {
    where.category = category;
  }

  const total = await prisma.template.count({ where });

  const templates = await prisma.template.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { list: templates, total, page, pageSize };
}

// 获取模板详情
export async function getTemplateById(
  templateId: string,
  userId: string
): Promise<Template> {
  const template = await prisma.template.findFirst({
    where: {
      OR: [
        { id: templateId, ownerId: userId },
        { id: templateId, isPublic: true },
      ],
    },
  });

  if (!template) {
    throw new AppError('TEMPLATE_NOT_FOUND', '模板不存在或无权访问', 404);
  }

  return template;
}

// 更新模板
export async function updateTemplate(
  templateId: string,
  userId: string,
  input: UpdateTemplateInput
): Promise<Template> {
  const template = await prisma.template.findFirst({
    where: {
      id: templateId,
      ownerId: userId,
    },
  });

  if (!template) {
    throw new AppError('TEMPLATE_NOT_FOUND', '模板不存在', 404);
  }

  return prisma.template.update({
    where: { id: templateId },
    data: input,
  });
}

// 删除模板
export async function deleteTemplate(
  templateId: string,
  userId: string
): Promise<void> {
  const template = await prisma.template.findFirst({
    where: {
      id: templateId,
      ownerId: userId,
    },
  });

  if (!template) {
    throw new AppError('TEMPLATE_NOT_FOUND', '模板不存在', 404);
  }

  await prisma.template.delete({
    where: { id: templateId },
  });
}

// 获取所有分类
export async function getTemplateCategories(userId: string): Promise<string[]> {
  const templates = await prisma.template.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { isPublic: true },
      ],
    },
    select: { category: true },
  });

  const categories = templates
    .map(t => t.category)
    .filter((c): c is string => c !== null);

  return [...new Set(categories)];
}
