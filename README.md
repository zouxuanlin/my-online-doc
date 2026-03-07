# 在线文档管理系统

一个现代化的在线文档管理平台，支持文档的创建、编辑、存储、分类和协作功能。

## 技术栈

### 前端
- **框架**: React 18+ with TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui (Radix UI)
- **状态管理**: Zustand
- **路由**: React Router v6
- **HTTP 客户端**: Axios

### 后端
- **运行时**: Node.js 20+
- **框架**: Express
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + Refresh Token
- **文件上传**: express-fileupload

## 快速开始

### 环境要求
- Node.js >= 20
- PostgreSQL >= 14
- npm >= 9

### 1. 安装依赖

```bash
# 安装根依赖
npm install

# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd ../frontend && npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 数据库配置
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my_online_doc"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# 服务器配置
PORT=3001
NODE_ENV=development
```

### 3. 初始化数据库

```bash
cd backend

# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init
```

### 4. 启动开发服务器

```bash
# 在项目根目录
npm run dev
```

这将同时启动：
- 前端开发服务器：http://localhost:5173
- 后端 API 服务器：http://localhost:3001

## 项目结构

```
my-online-doc/
├── backend/                 # 后端项目
│   ├── prisma/
│   │   └── schema.prisma    # Prisma 数据模型
│   ├── src/
│   │   ├── controllers/     # 控制器层
│   │   ├── services/        # 业务逻辑层
│   │   ├── middleware/      # 中间件
│   │   ├── routes/          # 路由定义
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # 类型定义
│   │   └── index.ts         # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   │   └── ui/          # shadcn/ui 组件
│   │   ├── layouts/         # 布局组件
│   │   ├── pages/           # 页面组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── stores/          # Zustand 状态管理
│   │   ├── services/        # API 服务
│   │   ├── types/           # TypeScript 类型
│   │   ├── utils/           # 工具函数
│   │   ├── App.tsx          # 应用入口
│   │   └── main.tsx         # React 入口
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json             # 根目录配置
├── .env.example             # 环境变量示例
└── CLAUDE.md                # 项目说明文档
```

## 功能特性

### 用户认证
- [x] 用户注册
- [x] 用户登录
- [x] JWT Token 认证
- [x] Refresh Token 自动刷新
- [x] 密码加密存储

### 文档管理
- [x] 创建/编辑/删除文档
- [x] 文档版本控制
- [x] 文档搜索
- [x] 回收站功能
- [x] 文档恢复

### 文件夹管理
- [x] 创建文件夹
- [x] 文件夹树形结构
- [x] 文件夹重命名
- [x] 文件夹删除

### 文件上传
- [x] 图片上传
- [x] 文件列表
- [x] 文件删除

## API 接口

### 认证接口
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新 Token
- `POST /api/v1/auth/logout` - 登出
- `GET /api/v1/auth/me` - 获取当前用户

### 文档接口
- `GET /api/v1/documents` - 获取文档列表
- `POST /api/v1/documents` - 创建文档
- `GET /api/v1/documents/:id` - 获取文档详情
- `PUT /api/v1/documents/:id` - 更新文档
- `DELETE /api/v1/documents/:id` - 删除文档
- `POST /api/v1/documents/:id/restore` - 恢复文档
- `GET /api/v1/documents/:id/versions` - 获取版本历史

### 文件夹接口
- `GET /api/v1/folders` - 获取所有文件夹
- `POST /api/v1/folders` - 创建文件夹
- `GET /api/v1/folders/:id` - 获取文件夹详情
- `PUT /api/v1/folders/:id` - 更新文件夹
- `DELETE /api/v1/folders/:id` - 删除文件夹

### 上传接口
- `POST /api/v1/upload` - 上传文件
- `GET /api/v1/upload` - 获取文件列表
- `DELETE /api/v1/upload/:filename` - 删除文件

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 后端专用
cd backend
npm run dev              # 开发模式
npm run build            # 编译
npm run start            # 启动生产服务器
npm run prisma:generate  # 生成 Prisma 客户端
npm run prisma:migrate   # 运行迁移
npm run prisma:studio    # 打开 Prisma Studio

# 前端专用
cd frontend
npm run dev              # 开发模式
npm run build            # 构建
npm run preview          # 预览生产构建
```

## 数据库设计

### User (用户)
- id, email, password, name, avatar, createdAt, updatedAt

### Document (文档)
- id, title, content, ownerId, folderId, isDeleted, deletedAt, createdAt, updatedAt

### DocumentVersion (文档版本)
- id, documentId, content, version, createdAt

### Folder (文件夹)
- id, name, ownerId, parentId, createdAt, updatedAt

### Share (分享)
- id, documentId, sharedById, sharedWithEmail, permission, createdAt, updatedAt

### RefreshToken (刷新令牌)
- id, token, userId, expiresAt, createdAt

## 后续计划

- [ ] Markdown 编辑器支持
- [ ] 文档协作（实时编辑）
- [ ] 文档导出（PDF/Word）
- [ ] 全文搜索
- [ ] 暗色模式
- [ ] 移动端适配优化
- [ ] 文件预览

## 安全注意事项

1. 生产环境请务必修改 `JWT_SECRET`
2. 使用 HTTPS 加密传输
3. 配置合适的 CORS 策略
4. 实施请求限流
5. 定期备份数据库

## License

MIT
