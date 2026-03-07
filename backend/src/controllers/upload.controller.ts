import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/error.middleware';

// 允许的文件类型
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

// 上传文件
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!req.files || Object.keys(req.files).length === 0) {
      throw new AppError('NO_FILE', '没有上传文件', 400);
    }

    const file = req.files.file as any;

    if (!file) {
      throw new AppError('INVALID_FILE', '文件字段不存在', 400);
    }

    // 验证文件类型
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new AppError('INVALID_FILE_TYPE', '不支持的文件类型', 400);
    }

    // 创建上传目录
    const uploadDir = path.join(__dirname, '../../uploads');
    const userDir = path.join(uploadDir, user.userId);

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // 生成唯一文件名
    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(userDir, fileName);

    // 移动文件
    await file.mv(filePath);

    // 获取文件信息
    const stats = fs.statSync(filePath);
    const url = `/uploads/${user.userId}/${fileName}`;

    res.status(201).json({
      code: 'SUCCESS',
      data: {
        file: {
          name: file.name,
          url,
          size: stats.size,
          mimetype: file.mimetype,
          createdAt: new Date().toISOString(),
        },
      },
      message: '文件上传成功',
    });
  } catch (error) {
    throw error;
  }
};

// 删除文件
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { filename } = req.params;

    const filePath = path.join(__dirname, '../../uploads', user.userId, filename);

    if (!fs.existsSync(filePath)) {
      throw new AppError('FILE_NOT_FOUND', '文件不存在', 404);
    }

    fs.unlinkSync(filePath);

    res.json({
      code: 'SUCCESS',
      message: '文件已删除',
    });
  } catch (error) {
    throw error;
  }
};

// 获取用户所有文件
export const getFiles = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const uploadDir = path.join(__dirname, '../../uploads', user.userId);

    if (!fs.existsSync(uploadDir)) {
      return res.json({
        code: 'SUCCESS',
        data: { files: [], total: 0 },
      });
    }

    const files = fs.readdirSync(uploadDir).map((filename) => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      return {
        name: filename,
        url: `/uploads/${user.userId}/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime.toISOString(),
      };
    });

    res.json({
      code: 'SUCCESS',
      data: { files, total: files.length },
    });
  } catch (error) {
    throw error;
  }
};
