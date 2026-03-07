# 在线文档管理系统 - CLAUDE.md

## 项目状态：已完成基础功能

一个现代化的在线文档管理平台，支持文档的创建、编辑、存储、分类功能。

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

## 项目结构

```
my-online-doc/
├── backend/                 # 后端项目
│   ├── prisma/
│   │   ├── schema.prisma    # Prisma 数据模型
│   │   └── migrations/      # 数据库迁移
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
│   │   ├── utils/           # 工具函数
│   │   ├── App.tsx          # 应用入口
│   │   └── main.tsx         # React 入口
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json             # 根目录配置
├── .env                     # 环境变量
├── .env.example             # 环境变量示例
├── README.md                # 项目说明
├── GETTING_STARTED.md       # 快速开始指南
└── CLAUDE.md                # 本文件
```

## 已完成功能

### 1. 用户认证模块
- [x] 用户注册
- [x] 用户登录
- [x] JWT Token 认证
- [x] Refresh Token 自动刷新
- [x] 密码加密存储（bcrypt）
- [x] 登出功能

### 2. 文档管理模块
- [x] 创建文档
- [x] 编辑文档
- [x] 查看文档详情
- [x] 删除文档（软删除）
- [x] 永久删除文档
- [x] 恢复已删除文档
- [x] 文档列表
- [x] 文档搜索
- [x] 回收站功能
- [x] 版本控制

### 3. 文件夹管理模块
- [x] 创建文件夹
- [x] 文件夹树形结构
- [x] 重命名文件夹
- [x] 删除文件夹
- [x] 文件夹文档关联

### 4. 文件上传模块
- [x] 文件上传
- [x] 文件列表
- [x] 文件删除
- [x] 文件类型验证

### 5. 前端页面
- [x] 登录页面
- [x] 注册页面
- [x] 文档列表页
- [x] 文档详情页
- [x] 文档编辑页
- [x] 文件夹管理页
- [x] 主布局（带侧边栏）

## 数据库设计

### User (用户)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Document (文档)
```prisma
model Document {
  id        String   @id @default(cuid())
  title     String   @default("无标题文档")
  content   String?  @db.Text
  ownerId   String
  folderId  String?
  isDeleted Boolean  @default(false)
  deletedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### DocumentVersion (文档版本)
```prisma
model DocumentVersion {
  id         String   @id @default(cuid())
  documentId String
  content    String   @db.Text
  version    Int
  createdAt  DateTime @default(now())
}
```

### Folder (文件夹)
```prisma
model Folder {
  id        String   @id @default(cuid())
  name      String
  ownerId   String
  parentId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### RefreshToken (刷新令牌)
```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

## 快速开始

### 1. 环境准备
- Node.js >= 20
- PostgreSQL >= 14
- npm >= 9

### 2. 安装依赖
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. 配置数据库
```bash
# 创建数据库
createdb my_online_doc

# 或者使用 Docker
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=my_online_doc -p 5432:5432 postgres:15
```

### 4. 运行迁移
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### 5. 启动服务
```bash
# 根目录执行
npm run dev
```

访问 http://localhost:5173

## API 接口

### 认证
- `POST /api/v1/auth/register` - 注册
- `POST /api/v1/auth/login` - 登录
- `POST /api/v1/auth/refresh` - 刷新 Token
- `POST /api/v1/auth/logout` - 登出
- `GET /api/v1/auth/me` - 获取当前用户

### 文档
- `GET /api/v1/documents` - 获取列表
- `POST /api/v1/documents` - 创建
- `GET /api/v1/documents/:id` - 获取详情
- `PUT /api/v1/documents/:id` - 更新
- `DELETE /api/v1/documents/:id` - 删除
- `POST /api/v1/documents/:id/restore` - 恢复
- `GET /api/v1/documents/:id/versions` - 版本历史

### 文件夹
- `GET /api/v1/folders` - 获取所有
- `POST /api/v1/folders` - 创建
- `GET /api/v1/folders/:id` - 获取详情
- `PUT /api/v1/folders/:id` - 更新
- `DELETE /api/v1/folders/:id` - 删除

### 上传
- `POST /api/v1/upload` - 上传文件
- `GET /api/v1/upload` - 获取列表
- `DELETE /api/v1/upload/:filename` - 删除

## 待开发功能

- [ ] Markdown 编辑器
- [ ] 文档导出（PDF/Word）
- [ ] 全文搜索
- [ ] 文档协作（实时编辑）
- [ ] 文档分享功能
- [ ] 暗色模式
- [ ] 移动端优化
- [ ] 文件预览

## 开发注意事项

1. 所有 API 响应格式：`{ code, data, message }`
2. 错误处理使用统一的 `AppError` 类
3. 前端使用 Axios 拦截器处理 Token
4. 数据库操作使用 Prisma 事务保证一致性
5. 密码使用 bcrypt 加密（cost=12）

## 常用命令

```bash
# 开发
npm run dev              # 同时启动前后端
npm run dev:backend      # 仅后端
npm run dev:frontend     # 仅前端

# 数据库
cd backend
npx prisma generate      # 生成客户端
npx prisma migrate dev   # 开发迁移
npx prisma migrate deploy # 生产部署
npx prisma studio        # 数据库 GUI

# 构建
npm run build            # 构建全部
npm run start            # 启动生产服务
```
