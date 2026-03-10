import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import fs from 'fs';
import path from 'path';

export interface ImportResult {
  success: number;
  failed: number;
  documents: any[];
  errors: string[];
}

// 导入 Markdown 文件
export async function importMarkdownFile(
  filePath: string,
  userId: string,
  folderId?: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    documents: [],
    errors: [],
  };

  try {
    const fileName = path.basename(filePath, '.md');
    const content = fs.readFileSync(filePath, 'utf-8');

    // 尝试从内容中提取标题
    const titleMatch = content.match(/^#\s+(.*)$/m);
    const title = titleMatch ? titleMatch[1].trim() : fileName;

    const document = await prisma.document.create({
      data: {
        title,
        content,
        ownerId: userId,
        folderId,
      },
    });

    result.success++;
    result.documents.push(document);
  } catch (error: any) {
    result.failed++;
    result.errors.push(`导入 ${filePath} 失败：${error.message}`);
  }

  return result;
}

// 批量导入 Markdown 文件
export async function importMarkdownFiles(
  folderPath: string,
  userId: string,
  folderId?: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    documents: [],
    errors: [],
  };

  try {
    const files = fs.readdirSync(folderPath);
    const mdFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.markdown'));

    for (const file of mdFiles) {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        const fileResult = await importMarkdownFile(filePath, userId, folderId);
        result.success += fileResult.success;
        result.failed += fileResult.failed;
        result.documents.push(...fileResult.documents);
        result.errors.push(...fileResult.errors);
      }
    }
  } catch (error: any) {
    result.errors.push(`导入文件夹失败：${error.message}`);
  }

  return result;
}

// 解析 Word 文档（需要额外的库）
export async function importWordDocument(
  filePath: string,
  userId: string,
  folderId?: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    documents: [],
    errors: [],
  };

  try {
    // 由于 mammoth 库需要在 Node.js 环境中使用，这里提供一个基础实现
    // 实际项目中需要安装 mammoth 库：npm install mammoth
    const mammoth = require('mammoth');
    const fileName = path.basename(filePath, '.docx');

    const extractResult = await mammoth.extractRawText({ path: filePath });
    const content = extractResult.value;

    const document = await prisma.document.create({
      data: {
        title: fileName,
        content,
        ownerId: userId,
        folderId,
      },
    });

    result.success++;
    result.documents.push(document);
  } catch (error: any) {
    result.failed++;
    result.errors.push(`导入 Word 文档 ${filePath} 失败：${error.message}`);
  }

  return result;
}

// 导入文件夹中的所有支持的文件
export async function importFolder(
  folderPath: string,
  userId: string,
  folderId?: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    documents: [],
    errors: [],
  };

  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        let fileResult: ImportResult;

        if (file.endsWith('.md') || file.endsWith('.markdown')) {
          fileResult = await importMarkdownFile(filePath, userId, folderId);
        } else if (file.endsWith('.docx')) {
          fileResult = await importWordDocument(filePath, userId, folderId);
        } else {
          result.errors.push(`不支持的文件类型：${file}`);
          continue;
        }

        result.success += fileResult.success;
        result.failed += fileResult.failed;
        result.documents.push(...fileResult.documents);
        result.errors.push(...fileResult.errors);
      }
    }
  } catch (error: any) {
    result.errors.push(`导入文件夹失败：${error.message}`);
  }

  return result;
}
