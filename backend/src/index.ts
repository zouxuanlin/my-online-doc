import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import path from 'path';

import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import folderRoutes from './routes/folder.routes';
import uploadRoutes from './routes/upload.routes';
import tagRoutes from './routes/tag.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') }
}));

// 静态文件目录（上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', authMiddleware, documentRoutes);
app.use('/api/v1/folders', authMiddleware, folderRoutes);
app.use('/api/v1/upload', authMiddleware, uploadRoutes);
app.use('/api/v1/tags', authMiddleware, tagRoutes);
app.use('/api/v1/bookmarks', authMiddleware, bookmarkRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use(errorHandler);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: '接口不存在' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器启动成功：http://localhost:${PORT}`);
  console.log(`📝 环境：${process.env.NODE_ENV || 'development'}`);
});

// 处理未捕获的异常和拒绝
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
