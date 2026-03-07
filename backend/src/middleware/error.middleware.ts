import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number = 400) {
    super(message);
    this.code = code;
    this.status = status;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('错误:', err);

  if (err instanceof AppError) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
    });
    return;
  }

  // Prisma 错误处理
  if (err.name === 'Prisma' && (err as any).code) {
    const prismaError = (err as any).code;
    switch (prismaError) {
      case 'P2002':
        res.status(409).json({ code: 'CONFLICT', message: '资源已存在' });
        return;
      case 'P2025':
        res.status(404).json({ code: 'NOT_FOUND', message: '资源未找到' });
        return;
    }
  }

  // 默认错误处理
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? '服务器内部错误'
      : err.message,
  });
};
