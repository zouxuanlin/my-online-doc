import { Request, Response } from 'express';
import * as commentService from '../services/comment.service';

// 创建评论
export const createComment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { content, documentId, parentId } = req.body;

    if (!content || !documentId) {
      throw new Error('内容不能为空');
    }

    const comment = await commentService.createComment({
      content,
      documentId,
      userId: user.userId,
      parentId,
    });

    res.status(201).json({
      code: 'SUCCESS',
      data: { comment },
      message: '评论成功',
    });
  } catch (error: any) {
    throw error;
  }
};

// 获取文档评论列表
export const getDocumentComments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId } = req.params;

    const result = await commentService.getDocumentComments(documentId, user.userId);

    res.json({
      code: 'SUCCESS',
      data: result,
    });
  } catch (error: any) {
    throw error;
  }
};

// 获取评论详情
export const getCommentById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const comment = await commentService.getCommentById(id, user.userId);

    res.json({
      code: 'SUCCESS',
      data: { comment },
    });
  } catch (error: any) {
    throw error;
  }
};

// 更新评论
export const updateComment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new Error('内容不能为空');
    }

    const comment = await commentService.updateComment(id, user.userId, { content });

    res.json({
      code: 'SUCCESS',
      data: { comment },
      message: '评论更新成功',
    });
  } catch (error: any) {
    throw error;
  }
};

// 删除评论
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    await commentService.deleteComment(id, user.userId);

    res.json({
      code: 'SUCCESS',
      message: '评论已删除',
    });
  } catch (error: any) {
    throw error;
  }
};
