import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, ApiResponse } from '../types';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: '未提供认证令牌' });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'secret';

    const decoded = jwt.verify(token, secret) as JwtPayload;

    // 将用户信息附加到请求对象
    (req as any).user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ code: 'TOKEN_EXPIRED', message: '令牌已过期' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ code: 'INVALID_TOKEN', message: '无效的令牌' });
      return;
    }
    next(error);
  }
};
