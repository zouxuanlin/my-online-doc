import { Router } from 'express';
import * as bookmarkController from '../controllers/bookmark.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 获取收藏列表
router.get('/', bookmarkController.getBookmarks);

// 添加收藏
router.post('/', bookmarkController.addBookmark);

// 移除收藏
router.delete('/:documentId', bookmarkController.removeBookmark);

// 检查收藏状态
router.get('/check/:documentId', bookmarkController.checkBookmarkStatus);

export default router;
