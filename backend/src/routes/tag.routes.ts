import { Router } from 'express';
import * as tagController from '../controllers/tag.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 获取所有标签
router.get('/', tagController.getTags);

// 创建标签
router.post('/', tagController.createTag);

// 更新标签
router.put('/:id', tagController.updateTag);

// 删除标签
router.delete('/:id', tagController.deleteTag);

// 获取文档的标签
router.get('/document/:documentId', tagController.getDocumentTags);

// 按标签获取文档
router.get('/tag/:tagId/documents', tagController.getDocumentsByTag);

// 为文档添加标签
router.post('/document/add', tagController.addTagToDocument);

// 从文档移除标签
router.post('/document/remove', tagController.removeTagFromDocument);

// 更新文档的所有标签
router.put('/document/:documentId/tags', tagController.updateDocumentTags);

export default router;
