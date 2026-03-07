import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';

const router = Router();

// 上传文件
router.post('/', uploadController.uploadFile);

// 获取文件列表
router.get('/', uploadController.getFiles);

// 删除文件
router.delete('/:filename', uploadController.deleteFile);

export default router;
