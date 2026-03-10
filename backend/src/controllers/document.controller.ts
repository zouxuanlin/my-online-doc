import { Request, Response } from 'express';
import * as documentService from '../services/document.service';
import { AppError } from '../middleware/error.middleware';

// 创建文档
export const createDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, content, folderId, tagIds } = req.body;

    const document = await documentService.createDocument(user.userId, {
      title: title || '无标题文档',
      content,
      folderId,
      tagIds,
    });

    res.status(201).json({
      code: 'SUCCESS',
      data: { document },
      message: '文档创建成功',
    });
  } catch (error) {
    throw error;
  }
};

// 获取文档列表
export const getDocumentList = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { folderId, search, page, pageSize, onlyDeleted, onlyArchived, tagId, sortBy, sortOrder, startDate, endDate } = req.query;

    const result = await documentService.getDocumentList(user.userId, {
      folderId: folderId as string | undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
      onlyDeleted: onlyDeleted === 'true',
      onlyArchived: onlyArchived === 'true',
      tagId: tagId as string | undefined,
      sortBy: (sortBy as string) || 'updatedAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    res.json({
      code: 'SUCCESS',
      data: result,
    });
  } catch (error) {
    throw error;
  }
};

// 获取文档详情
export const getDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const document = await documentService.getDocumentById(id, user.userId);

    res.json({
      code: 'SUCCESS',
      data: { document },
    });
  } catch (error) {
    throw error;
  }
};

// 更新文档
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { title, content, folderId, createVersion = true } = req.body;

    const document = await documentService.updateDocument(
      id,
      user.userId,
      { title, content, folderId },
      createVersion
    );

    res.json({
      code: 'SUCCESS',
      data: { document },
      message: '文档更新成功',
    });
  } catch (error) {
    throw error;
  }
};

// 删除文档（软删除）
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    await documentService.deleteDocument(id, user.userId);

    res.json({
      code: 'SUCCESS',
      message: '文档已删除',
    });
  } catch (error) {
    throw error;
  }
};

// 永久删除文档
export const permanentlyDeleteDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    await documentService.permanentlyDeleteDocument(id, user.userId);

    res.json({
      code: 'SUCCESS',
      message: '文档已永久删除',
    });
  } catch (error) {
    throw error;
  }
};

// 恢复文档
export const restoreDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const document = await documentService.restoreDocument(id, user.userId);

    res.json({
      code: 'SUCCESS',
      data: { document },
      message: '文档已恢复',
    });
  } catch (error) {
    throw error;
  }
};

// 获取版本历史
export const getDocumentVersions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const versions = await documentService.getDocumentVersions(id, user.userId);

    res.json({
      code: 'SUCCESS',
      data: { versions },
    });
  } catch (error) {
    throw error;
  }
};

// 回滚到指定版本
export const rollbackToVersion = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id, versionId } = req.params;

    const document = await documentService.rollbackToVersion(
      id,
      versionId,
      user.userId
    );

    res.json({
      code: 'SUCCESS',
      data: { document },
      message: '已回滚到指定版本',
    });
  } catch (error) {
    throw error;
  }
};

// 归档文档
export const archiveDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const document = await documentService.archiveDocument(id, user.userId);

    res.json({
      code: 'SUCCESS',
      data: { document },
      message: '文档已归档',
    });
  } catch (error) {
    throw error;
  }
};

// 取消归档
export const unarchiveDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const document = await documentService.unarchiveDocument(id, user.userId);

    res.json({
      code: 'SUCCESS',
      data: { document },
      message: '已取消归档',
    });
  } catch (error) {
    throw error;
  }
};
