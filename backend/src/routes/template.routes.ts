import { Router } from 'express';
import * as templateController from '../controllers/template.controller';

const router = Router();

// 获取模板列表
router.get('/', templateController.getTemplateList);

// 获取所有分类
router.get('/categories', templateController.getTemplateCategories);

// 创建模板
router.post('/', templateController.createTemplate);

// 获取模板详情
router.get('/:id', templateController.getTemplate);

// 更新模板
router.put('/:id', templateController.updateTemplate);

// 删除模板
router.delete('/:id', templateController.deleteTemplate);

export default router;
