import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import * as authService from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';

// 用户注册
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    // 验证输入
    if (!email || !password) {
      throw new AppError('INVALID_INPUT', '邮箱和密码不能为空', 400);
    }

    if (password.length < 6) {
      throw new AppError('WEAK_PASSWORD', '密码长度至少为 6 位', 400);
    }

    const result = await authService.register({ email, password, name });

    res.status(201).json({
      code: 'SUCCESS',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          avatar: result.user.avatar,
        },
        tokens: result.tokens,
      },
      message: '注册成功',
    });
  } catch (error) {
    next(error);
  }
};

// 用户登录
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('INVALID_INPUT', '邮箱和密码不能为空', 400);
    }

    const result = await authService.login({ email, password });

    res.json({
      code: 'SUCCESS',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          avatar: result.user.avatar,
        },
        tokens: result.tokens,
      },
      message: '登录成功',
    });
  } catch (error) {
    next(error);
  }
};

// 刷新令牌
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('INVALID_INPUT', '刷新令牌不能为空', 400);
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      code: 'SUCCESS',
      data: { tokens },
      message: '令牌刷新成功',
    });
  } catch (error) {
    next(error);
  }
};

// 登出
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('INVALID_INPUT', '刷新令牌不能为空', 400);
    }

    await authService.logout(refreshToken);

    res.json({
      code: 'SUCCESS',
      message: '登出成功',
    });
  } catch (error) {
    next(error);
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    const userData = await authService.getUserById(user.userId);

    res.json({
      code: 'SUCCESS',
      data: { user: userData },
    });
  } catch (error) {
    next(error);
  }
};
