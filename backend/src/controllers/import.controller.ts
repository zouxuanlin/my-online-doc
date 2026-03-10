import { Request, Response } from 'express';
import * as importService from '../services/import.service';
import { AppError } from '../middleware/error.middleware';
import path from 'path';
import fs from 'fs';

// 导入 Markdown 文件
export const importMarkdown = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { filePath, folderId } = req.body;

    if (!filePath) {
      throw new AppError('INVALID_INPUT', '文件路径为必填项', 400);
    }

    const result = await importService.importMarkdownFile(filePath, user.userId, folderId);

    res.json({
      code: 'SUCCESS',
      data: result,
      message: `成功导入 ${result.success} 个文档`,
    });
  } catch (error) {
    throw error;
  }
};

// 批量导入文件
export const importFiles = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { folderPath } = req.body;

    if (!folderPath) {
      throw new AppError('INVALID_INPUT', '文件夹路径为必填项', 400);
    }

    const result = await importService.importFolder(folderPath, user.userId);

    res.json({
      code: 'SUCCESS',
      data: result,
      message: `成功导入 ${result.success} 个文档，失败 ${result.failed} 个`,
    });
  } catch (error) {
    throw error;
  }
};

// 上传并导入文件
export const uploadAndImport = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { folderId } = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
      throw new AppError('INVALID_INPUT', '请选择要导入的文件', 400);
    }

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const result = {
      success: 0,
      failed: 0,
      documents: [] as any[],
      errors: [] as string[],
    };

    const uploadDir = path.join(__dirname, '../../uploads/import');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const file of files) {
      const fileName = file.name || file.filename;
      const ext = path.extname(fileName).toLowerCase();

      if (!['.md', '.markdown', '.txt'].includes(ext)) {
        result.errors.push(`不支持的文件类型：${fileName}`);
        result.failed++;
        continue;
      }

      const filePath = path.join(uploadDir, `${Date.now()}-${fileName}`);

      // 移动文件
      await new Promise<void>((resolve, reject) => {
        file.mv(filePath, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // 导入文件
      try {
        const fileResult = await importService.importMarkdownFile(filePath, user.userId, folderId);
        result.success += fileResult.success;
        result.failed += fileResult.failed;
        result.documents.push(...fileResult.documents);
        result.errors.push(...fileResult.errors);

        // 清理临时文件
        fs.unlinkSync(filePath);
      } catch (error: any) {
        result.errors.push(`导入 ${fileName} 失败：${error.message}`);
        result.failed++;
      }
    }

    res.json({
      code: 'SUCCESS',
      data: result,
      message: `成功导入 ${result.success} 个文档`,
    });
  } catch (error) {
    throw error;
  }
};
