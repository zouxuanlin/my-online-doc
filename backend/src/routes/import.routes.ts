import { Router } from 'express';
import * as importController from '../controllers/import.controller';

const router = Router();

// 上传并导入文件
router.post('/upload', importController.uploadAndImport);

// 导入 Markdown 文件
router.post('/markdown', importController.importMarkdown);

// 批量导入文件
router.post('/files', importController.importFiles);

export default router;
