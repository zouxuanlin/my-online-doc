import { Router } from 'express';
import * as folderController from '../controllers/folder.controller';

const router = Router();

// 创建文件夹
router.post('/', folderController.createFolder);

// 获取所有文件夹
router.get('/', folderController.getAllFolders);

// 获取文件夹详情
router.get('/:id', folderController.getFolder);

// 更新文件夹
router.put('/:id', folderController.updateFolder);

// 删除文件夹
router.delete('/:id', folderController.deleteFolder);

export default router;
