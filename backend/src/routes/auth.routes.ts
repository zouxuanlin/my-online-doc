import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

// 注册
router.post('/register', authController.register);

// 登录
router.post('/login', authController.login);

// 刷新令牌
router.post('/refresh', authController.refreshToken);

// 登出
router.post('/logout', authController.logout);

// 获取当前用户
router.get('/me', authController.getCurrentUser);

export default router;
