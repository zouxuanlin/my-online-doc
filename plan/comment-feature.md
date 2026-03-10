# 评论和批注功能实现计划

## 上下文

用户要求实现"评论和批注功能"，这是 CLAUDE.md 中待开发功能列表里的核心功能之一。该功能允许用户对文档进行评论和添加批注，支持团队协作场景。

## 需求分析

### 功能需求
1. **评论功能**
   - 在文档详情页显示评论列表
   - 支持添加新评论
   - 支持回复评论（嵌套评论）
   - 支持编辑/删除自己的评论
   - 显示评论者信息和时间

2. **批注功能**
   - 支持选中文本添加批注
   - 批注与文档内容关联
   - 支持查看/回复/删除批注

3. **权限控制**
   - 仅文档所有者/有权限用户可查看评论
   - 仅评论作者可编辑/删除自己的评论

### 技术需求
- 后端：新增 Comment 数据模型、API 路由、服务层
- 前端：评论组件、评论页面、与文档详情页集成
- 数据库：SQLite（现有项目使用）

## 实现方案

### 1. 数据库设计

在 `backend/prisma/schema.prisma` 中添加：

```prisma
// 评论模型
model Comment {
  id         String   @id @default(cuid())
  content    String   @db.Text
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  parentId   String?
  parent     Comment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies    Comment[] @relation("CommentReplies")
  isDeleted  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([documentId])
  @@index([userId])
  @@index([parentId])
}
```

### 2. 后端实现

#### 新增文件结构
```
backend/
├── prisma/
│   └── schema.prisma (修改)
├── src/
│   ├── services/
│   │   └── comment.service.ts (新增)
│   ├── controllers/
│   │   └── comment.controller.ts (新增)
│   └── routes/
│       └── comment.routes.ts (新增)
└── index.ts (修改，添加路由)
```

#### Service 层 (`comment.service.ts`)
- `createComment` - 创建评论
- `getDocumentComments` - 获取文档评论列表（含回复）
- `updateComment` - 更新评论
- `deleteComment` - 删除评论
- `getCommentById` - 获取评论详情

#### Controller 层 (`comment.controller.ts`)
- `createComment` - POST /api/v1/comments
- `getDocumentComments` - GET /api/v1/documents/:id/comments
- `updateComment` - PUT /api/v1/comments/:id
- `deleteComment` - DELETE /api/v1/comments/:id

#### 路由 (`comment.routes.ts`)
```typescript
router.post('/', createComment);
router.get('/documents/:documentId', getDocumentComments);
router.get('/:id', getCommentById);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
```

### 3. 前端实现

#### 新增文件结构
```
frontend/
├── src/
│   ├── services/
│   │   └── comment.service.ts (新增)
│   ├── components/
│   │   └── CommentSection.tsx (新增)
│   │   └── CommentItem.tsx (新增)
│   └── pages/
│       └── DocumentDetailPage.tsx (修改，集成评论组件)
```

#### Service 层 (`comment.service.ts`)
- `getComments(documentId)` - 获取评论列表
- `createComment(documentId, content, parentId?)` - 创建评论
- `updateComment(commentId, content)` - 更新评论
- `deleteComment(commentId)` - 删除评论

#### 组件设计
1. **CommentSection** - 评论区主组件
   - 显示评论列表
   - 显示评论输入框
   - 处理分页/加载更多

2. **CommentItem** - 单条评论组件
   - 显示评论内容、作者、时间
   - 回复功能
   - 编辑/删除（仅作者可见）
   - 嵌套回复显示

### 4. API 响应格式

遵循项目现有规范：`{ code, data, message }`

```typescript
// 获取评论列表
{
  code: 'SUCCESS',
  data: {
    comments: Comment[],
    total: number
  }
}

// 创建评论
{
  code: 'SUCCESS',
  data: { comment: Comment },
  message: '评论成功'
}
```

### 5. 测试用例（补充到 frontend-test skill）

```markdown
#### 3.7 评论功能测试
1. 打开文档详情页
2. 滚动到评论区
3. 输入评论内容并点击"发布"
4. 验证评论显示在列表中
5. 测试回复评论功能
6. 测试编辑/删除自己的评论
```

## 关键文件路径

### 需要修改的文件
- `backend/prisma/schema.prisma` - 添加 Comment 模型
- `backend/src/index.ts` - 注册评论路由
- `frontend/src/pages/DocumentDetailPage.tsx` - 集成评论组件

### 需要新增的文件
- `backend/src/services/comment.service.ts`
- `backend/src/controllers/comment.controller.ts`
- `backend/src/routes/comment.routes.ts`
- `backend/prisma/migrations/` - 数据库迁移文件
- `frontend/src/services/comment.service.ts`
- `frontend/src/components/CommentSection.tsx`
- `frontend/src/components/CommentItem.tsx`

## 实现步骤

1. **第一步：数据库迁移**
   - 修改 schema.prisma 添加 Comment 模型
   - 运行 `npx prisma migrate dev --name add_comment`

2. **第二步：后端实现**
   - 创建 comment.service.ts
   - 创建 comment.controller.ts
   - 创建 comment.routes.ts
   - 在 index.ts 注册路由

3. **第三步：前端实现**
   - 创建 comment.service.ts（前端 API 调用）
   - 创建 CommentItem.tsx 组件
   - 创建 CommentSection.tsx 组件
   - 在 DocumentDetailPage.tsx 集成评论组件

4. **第四步：测试验证**
   - 手动测试评论功能
   - 更新 frontend-test skill 添加测试用例

## 注意事项

1. **权限验证**：评论操作需要验证用户登录状态
2. **软删除**：评论使用 isDeleted 标记，不真正删除
3. **嵌套回复**：支持无限层级回复，前端显示时限制最大层级
4. **XSS 防护**：评论内容需要转义处理
5. **分页**：评论列表需要考虑分页性能
