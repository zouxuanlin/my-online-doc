import { Router } from 'express';
import * as operationLogController from '../controllers/operation-log.controller';

const router = Router();

// 获取用户的操作日志
router.get('/', operationLogController.getUserLogs);

// 获取文档的操作日志
router.get('/documents/:id', operationLogController.getDocumentLogs);

export default router;
