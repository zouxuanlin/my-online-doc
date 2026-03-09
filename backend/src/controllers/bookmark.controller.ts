import { Request, Response } from 'express';
import * as bookmarkService from '../services/bookmark.service';

// 获取收藏列表
export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const documents = await bookmarkService.getUserBookmarks(user.userId);

    res.json({
      code: 'SUCCESS',
      data: { documents },
    });
  } catch (error) {
    throw error;
  }
};

// 添加收藏
export const addBookmark = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId } = req.body;

    if (!documentId) {
      throw new Error('文档 ID 不能为空');
    }

    await bookmarkService.addBookmark(user.userId, documentId);

    res.json({
      code: 'SUCCESS',
      message: '已添加收藏',
    });
  } catch (error) {
    throw error;
  }
};

// 移除收藏
export const removeBookmark = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId } = req.params;

    await bookmarkService.removeBookmark(user.userId, documentId);

    res.json({
      code: 'SUCCESS',
      message: '已取消收藏',
    });
  } catch (error) {
    throw error;
  }
};

// 检查收藏状态
export const checkBookmarkStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId } = req.params;

    const isBookmarked = await bookmarkService.isBookmarked(user.userId, documentId);

    res.json({
      code: 'SUCCESS',
      data: { isBookmarked },
    });
  } catch (error) {
    throw error;
  }
};
