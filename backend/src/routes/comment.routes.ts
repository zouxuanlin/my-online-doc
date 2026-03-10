import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';

const router = Router();

// 创建评论
router.post('/', commentController.createComment);

// 获取文档评论列表
router.get('/documents/:documentId', commentController.getDocumentComments);

// 获取评论详情
router.get('/:id', commentController.getCommentById);

// 更新评论
router.put('/:id', commentController.updateComment);

// 删除评论
router.delete('/:id', commentController.deleteComment);

export default router;
