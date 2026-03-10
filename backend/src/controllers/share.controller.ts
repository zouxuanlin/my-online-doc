import { Request, Response } from 'express';
import * as shareService from '../services/share.service';
import { AppError } from '../middleware/error.middleware';

// 创建分享
export const createShare = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId, sharedWithEmail, permission, password, expiresAt } = req.body;

    if (!documentId || !sharedWithEmail) {
      throw new AppError('INVALID_INPUT', '文档 ID 和接收邮箱为必填项', 400);
    }

    const share = await shareService.createShare(user.userId, {
      documentId,
      sharedWithEmail,
      permission,
      password,
      expiresAt,
    });

    res.status(201).json({
      code: 'SUCCESS',
      data: { share },
      message: '分享创建成功',
    });
  } catch (error) {
    throw error;
  }
};

// 获取文档的分享列表
export const getDocumentShares = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId } = req.params;

    const shares = await shareService.getDocumentShares(documentId, user.userId);

    res.json({
      code: 'SUCCESS',
      data: { shares },
    });
  } catch (error) {
    throw error;
  }
};

// 获取用户收到的分享
export const getUserReceivedShares = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const shares = await shareService.getUserReceivedShares(user.userId);

    res.json({
      code: 'SUCCESS',
      data: { shares },
    });
  } catch (error) {
    throw error;
  }
};

// 更新分享
export const updateShare = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { shareId } = req.params;
    const { permission, password, expiresAt } = req.body;

    const share = await shareService.updateShare(shareId, user.userId, {
      permission,
      password,
      expiresAt,
    });

    res.json({
      code: 'SUCCESS',
      data: { share },
      message: '分享更新成功',
    });
  } catch (error) {
    throw error;
  }
};

// 删除分享
export const deleteShare = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { shareId } = req.params;

    await shareService.deleteShare(shareId, user.userId);

    res.json({
      code: 'SUCCESS',
      message: '分享已删除',
    });
  } catch (error) {
    throw error;
  }
};

// 验证分享访问（用于前端检查是否需要密码）
export const verifyShareAccess = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId } = req.params;
    const { password } = req.body;

    const result = await shareService.verifyShareAccess(documentId, user.userId, password);

    res.json({
      code: 'SUCCESS',
      data: result,
    });
  } catch (error) {
    throw error;
  }
};
