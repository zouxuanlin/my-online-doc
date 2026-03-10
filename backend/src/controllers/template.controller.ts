import { Request, Response } from 'express';
import * as templateService from '../services/template.service';
import { AppError } from '../middleware/error.middleware';

// 创建模板
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, content, description, category, isPublic } = req.body;

    if (!title) {
      throw new AppError('INVALID_INPUT', '模板标题为必填项', 400);
    }

    const template = await templateService.createTemplate(user.userId, {
      title,
      content,
      description,
      category,
      isPublic,
    });

    res.status(201).json({
      code: 'SUCCESS',
      data: { template },
      message: '模板创建成功',
    });
  } catch (error) {
    throw error;
  }
};

// 获取模板列表
export const getTemplateList = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { search, category, onlyPublic, page, pageSize } = req.query;

    const result = await templateService.getTemplateList(user.userId, {
      search: search as string | undefined,
      category: category as string | undefined,
      onlyPublic: onlyPublic === 'true',
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
    });

    res.json({
      code: 'SUCCESS',
      data: result,
    });
  } catch (error) {
    throw error;
  }
};

// 获取模板详情
export const getTemplate = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const template = await templateService.getTemplateById(id, user.userId);

    res.json({
      code: 'SUCCESS',
      data: { template },
    });
  } catch (error) {
    throw error;
  }
};

// 更新模板
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { title, content, description, category, isPublic } = req.body;

    const template = await templateService.updateTemplate(id, user.userId, {
      title,
      content,
      description,
      category,
      isPublic,
    });

    res.json({
      code: 'SUCCESS',
      data: { template },
      message: '模板更新成功',
    });
  } catch (error) {
    throw error;
  }
};

// 删除模板
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    await templateService.deleteTemplate(id, user.userId);

    res.json({
      code: 'SUCCESS',
      message: '模板已删除',
    });
  } catch (error) {
    throw error;
  }
};

// 获取所有分类
export const getTemplateCategories = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const categories = await templateService.getTemplateCategories(user.userId);

    res.json({
      code: 'SUCCESS',
      data: { categories },
    });
  } catch (error) {
    throw error;
  }
};
