import { Router } from 'express';
import * as documentController from '../controllers/document.controller';

const router = Router();

// 创建文档
router.post('/', documentController.createDocument);

// 获取文档列表
router.get('/', documentController.getDocumentList);

// 获取回收站文档
router.get('/trash', documentController.getDocumentList);

// 获取文档详情
router.get('/:id', documentController.getDocument);

// 更新文档
router.put('/:id', documentController.updateDocument);

// 删除文档（软删除）
router.delete('/:id', documentController.deleteDocument);

// 永久删除文档
router.delete('/:id/permanent', documentController.permanentlyDeleteDocument);

// 恢复文档
router.post('/:id/restore', documentController.restoreDocument);

// 获取版本历史
router.get('/:id/versions', documentController.getDocumentVersions);

// 回滚到指定版本
router.post('/:id/versions/:versionId/rollback', documentController.rollbackToVersion);

// 归档文档
router.post('/:id/archive', documentController.archiveDocument);

// 取消归档
router.post('/:id/unarchive', documentController.unarchiveDocument);

// 获取归档文档
router.get('/archive', documentController.getDocumentList);

export default router;
