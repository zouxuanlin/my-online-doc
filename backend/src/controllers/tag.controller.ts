import { Request, Response } from 'express';
import * as tagService from '../services/tag.service';
import { AppError } from '../middleware/error.middleware';

// 创建标签
export const createTag = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name } = req.body;

    if (!name || !name.trim()) {
      throw new AppError('INVALID_INPUT', '标签名称不能为空', 400);
    }

    const tag = await tagService.createTag(user.userId, { name });

    res.status(201).json({
      code: 'SUCCESS',
      data: { tag },
      message: '标签创建成功',
    });
  } catch (error) {
    throw error;
  }
};

// 获取所有标签
export const getTags = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const tags = await tagService.getUserTags(user.userId);

    res.json({
      code: 'SUCCESS',
      data: { tags },
    });
  } catch (error) {
    throw error;
  }
};

// 更新标签
export const updateTag = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { name } = req.body;

    const tag = await tagService.updateTag(id, user.userId, { name });

    res.json({
      code: 'SUCCESS',
      data: { tag },
      message: '标签更新成功',
    });
  } catch (error) {
    throw error;
  }
};

// 删除标签
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    await tagService.deleteTag(id, user.userId);

    res.json({
      code: 'SUCCESS',
      message: '标签已删除',
    });
  } catch (error) {
    throw error;
  }
};

// 为文档添加标签
export const addTagToDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId, tagId } = req.body;

    if (!documentId || !tagId) {
      throw new AppError('INVALID_INPUT', '文档 ID 和标签 ID 不能为空', 400);
    }

    await tagService.addTagToDocument(documentId, user.userId, tagId);

    res.json({
      code: 'SUCCESS',
      message: '标签已添加',
    });
  } catch (error) {
    throw error;
  }
};

// 从文档移除标签
export const removeTagFromDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId, tagId } = req.body;

    if (!documentId || !tagId) {
      throw new AppError('INVALID_INPUT', '文档 ID 和标签 ID 不能为空', 400);
    }

    await tagService.removeTagFromDocument(documentId, user.userId, tagId);

    res.json({
      code: 'SUCCESS',
      message: '标签已移除',
    });
  } catch (error) {
    throw error;
  }
};

// 更新文档的所有标签
export const updateDocumentTags = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId } = req.params;
    const { tagIds } = req.body;

    await tagService.updateDocumentTags(documentId, user.userId, tagIds || []);

    res.json({
      code: 'SUCCESS',
      message: '标签已更新',
    });
  } catch (error) {
    throw error;
  }
};

// 获取文档的标签
export const getDocumentTags = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId } = req.params;

    const tags = await tagService.getDocumentTags(documentId, user.userId);

    res.json({
      code: 'SUCCESS',
      data: { tags },
    });
  } catch (error) {
    throw error;
  }
};

// 按标签获取文档
export const getDocumentsByTag = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { tagId } = req.params;

    const documents = await tagService.getDocumentsByTag(user.userId, tagId);

    res.json({
      code: 'SUCCESS',
      data: { documents },
    });
  } catch (error) {
    throw error;
  }
};
