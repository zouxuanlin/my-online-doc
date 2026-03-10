import { Router } from 'express';
import * as shareController from '../controllers/share.controller';

const router = Router();

// 获取用户收到的分享列表
router.get('/received', shareController.getUserReceivedShares);

// 创建分享
router.post('/', shareController.createShare);

// 获取文档的分享列表
router.get('/document/:documentId', shareController.getDocumentShares);

// 更新分享
router.put('/:shareId', shareController.updateShare);

// 删除分享
router.delete('/:shareId', shareController.deleteShare);

// 验证分享访问
router.post('/:documentId/verify', shareController.verifyShareAccess);

export default router;
