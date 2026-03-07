# 快速启动指南

## 第一步：安装依赖

```bash
# 在项目根目录执行
npm install

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

## 第二步：配置数据库

确保 PostgreSQL 已启动，然后创建数据库：

```bash
# 使用 psql 创建数据库
psql -U postgres
CREATE DATABASE my_online_doc;
\q

# 或者使用 Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=my_online_doc \
  -p 5432:5432 \
  postgres:15
```

## 第三步：运行数据库迁移

```bash
cd backend

# 生成 Prisma 客户端
npx prisma generate

# 运行迁移
npx prisma migrate dev --name init
```

## 第四步：启动开发服务器

```bash
# 方式一：同时启动前后端（在项目根目录）
npm run dev

# 方式二：分别启动
# 后端 (端口 3001)
cd backend && npm run dev

# 前端 (端口 5173)
cd frontend && npm run dev
```

## 访问应用

- 前端：http://localhost:5173
- 后端 API: http://localhost:3001
- API 健康检查：http://localhost:3001/health

## 常见问题

### 1. 端口被占用
修改 `.env` 中的 `PORT` 值

### 2. 数据库连接失败
检查 PostgreSQL 是否运行，`DATABASE_URL` 是否正确

### 3. Prisma 迁移失败
```bash
npx prisma migrate reset
```

## 测试账户

注册一个新账户即可开始使用。
