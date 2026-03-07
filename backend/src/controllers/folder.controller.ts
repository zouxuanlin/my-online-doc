import { Request, Response } from 'express';
import * as folderService from '../services/folder.service';
import { AppError } from '../middleware/error.middleware';

// 创建文件夹
export const createFolder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, parentId } = req.body;

    if (!name) {
      throw new AppError('INVALID_INPUT', '文件夹名称不能为空', 400);
    }

    const folder = await folderService.createFolder(user.userId, {
      name,
      parentId,
    });

    res.status(201).json({
      code: 'SUCCESS',
      data: { folder },
      message: '文件夹创建成功',
    });
  } catch (error) {
    throw error;
  }
};

// 获取所有文件夹
export const getAllFolders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const folders = await folderService.getAllFolders(user.userId);

    res.json({
      code: 'SUCCESS',
      data: { folders },
    });
  } catch (error) {
    throw error;
  }
};

// 获取文件夹详情
export const getFolder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const folder = await folderService.getFolderWithChildren(id, user.userId);

    res.json({
      code: 'SUCCESS',
      data: { folder },
    });
  } catch (error) {
    throw error;
  }
};

// 更新文件夹
export const updateFolder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { name, parentId } = req.body;

    const folder = await folderService.updateFolder(id, user.userId, {
      name,
      parentId,
    });

    res.json({
      code: 'SUCCESS',
      data: { folder },
      message: '文件夹更新成功',
    });
  } catch (error) {
    throw error;
  }
};

// 删除文件夹
export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    await folderService.deleteFolder(id, user.userId);

    res.json({
      code: 'SUCCESS',
      message: '文件夹已删除',
    });
  } catch (error) {
    throw error;
  }
};
