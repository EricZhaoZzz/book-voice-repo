# RESTful API 迁移设计方案

## 概述

将 Book Voice 系统从 Server Actions 完全迁移到 RESTful API 架构，为移动端 App 开发提供统一的 API 接口。

## 迁移策略

- **范围**: 完全替换所有 Server Actions
- **认证**: JWT Token 认证
- **客户端**: 创建统一的 API 客户端层
- **目标**: 支持 Web 和移动端统一访问

## API 架构设计

### 1. 认证系统 (Authentication)

#### JWT Token 流程

```
Client -> POST /api/v1/auth/login -> Server
Server -> Verify credentials -> Generate JWT
Server -> Response { accessToken, refreshToken, user }
Client -> Store tokens -> Use in subsequent requests
```

#### Token 管理

- **Access Token**: 短期有效 (15分钟), 存储在内存/state
- **Refresh Token**: 长期有效 (7天), 存储在 httpOnly cookie
- **Token 刷新**: 自动刷新机制，在 access token 过期前刷新

#### API 端点映射

| Server Action            | RESTful API                           | Method | 说明           |
| ------------------------ | ------------------------------------- | ------ | -------------- |
| `login()`                | `/api/v1/auth/login`                  | POST   | 登录获取 JWT   |
| `register()`             | `/api/v1/auth/register`               | POST   | 注册新用户     |
| `logout()`               | `/api/v1/auth/logout`                 | POST   | 登出清除 token |
| `enableGuestMode()`      | `/api/v1/auth/guest`                  | POST   | 启用游客模式   |
| `requestPasswordReset()` | `/api/v1/auth/password/reset-request` | POST   | 请求重置密码   |
| `resetPassword()`        | `/api/v1/auth/password/reset`         | POST   | 重置密码       |

### 2. 管理后台 API (Admin)

#### 教材管理 (Textbooks)

| Server Action        | RESTful API                   | Method |
| -------------------- | ----------------------------- | ------ |
| `getTextbooks()`     | `/api/v1/admin/textbooks`     | GET    |
| `getTextbook(id)`    | `/api/v1/admin/textbooks/:id` | GET    |
| `createTextbook()`   | `/api/v1/admin/textbooks`     | POST   |
| `updateTextbook(id)` | `/api/v1/admin/textbooks/:id` | PUT    |
| `deleteTextbook(id)` | `/api/v1/admin/textbooks/:id` | DELETE |

#### 单元管理 (Units)

| Server Action          | RESTful API                                 | Method |
| ---------------------- | ------------------------------------------- | ------ |
| `getUnits(textbookId)` | `/api/v1/admin/textbooks/:textbookId/units` | GET    |
| `createUnit()`         | `/api/v1/admin/units`                       | POST   |
| `updateUnit(id)`       | `/api/v1/admin/units/:id`                   | PUT    |
| `deleteUnit(id)`       | `/api/v1/admin/units/:id`                   | DELETE |

#### 课程管理 (Lessons)

| Server Action        | RESTful API                           | Method |
| -------------------- | ------------------------------------- | ------ |
| `getLessons(unitId)` | `/api/v1/admin/units/:unitId/lessons` | GET    |
| `createLesson()`     | `/api/v1/admin/lessons`               | POST   |
| `updateLesson(id)`   | `/api/v1/admin/lessons/:id`           | PUT    |
| `deleteLesson(id)`   | `/api/v1/admin/lessons/:id`           | DELETE |

#### 音频管理 (Audios)

| Server Action         | RESTful API                              | Method |
| --------------------- | ---------------------------------------- | ------ |
| `getAudios(lessonId)` | `/api/v1/admin/lessons/:lessonId/audios` | GET    |
| `getAudio(id)`        | `/api/v1/admin/audios/:id`               | GET    |
| `createAudio()`       | `/api/v1/admin/audios`                   | POST   |
| `updateAudio(id)`     | `/api/v1/admin/audios/:id`               | PUT    |
| `deleteAudio(id)`     | `/api/v1/admin/audios/:id`               | DELETE |
| `setDefaultAudio(id)` | `/api/v1/admin/audios/:id/set-default`   | PATCH  |

#### 用户管理 (Users)

| Server Action       | RESTful API               | Method |
| ------------------- | ------------------------- | ------ |
| `getUsers(options)` | `/api/v1/admin/users`     | GET    |
| `getUser(id)`       | `/api/v1/admin/users/:id` | GET    |

#### 分析数据 (Analytics)

| Server Action        | RESTful API               | Method |
| -------------------- | ------------------------- | ------ |
| `getAnalyticsData()` | `/api/v1/admin/analytics` | GET    |

#### 媒体管理 (Media)

| Server Action            | RESTful API           | Method |
| ------------------------ | --------------------- | ------ |
| `getMediaFiles(options)` | `/api/v1/admin/media` | GET    |
| `deleteMediaFile(path)`  | `/api/v1/admin/media` | DELETE |

#### 系统设置 (Settings)

| Server Action      | RESTful API              | Method |
| ------------------ | ------------------------ | ------ |
| `getSettings()`    | `/api/v1/admin/settings` | GET    |
| `updateSettings()` | `/api/v1/admin/settings` | PUT    |

#### 操作日志 (Logs)

| Server Action               | RESTful API          | Method |
| --------------------------- | -------------------- | ------ |
| `getOperationLogs(options)` | `/api/v1/admin/logs` | GET    |

## API 客户端层设计

### 目录结构

```
src/lib/api/
├── client.ts           # API 客户端核心
├── auth.ts             # 认证相关 API
├── admin/
│   ├── textbooks.ts    # 教材管理 API
│   ├── units.ts        # 单元管理 API
│   ├── lessons.ts      # 课程管理 API
│   ├── audios.ts       # 音频管理 API
│   ├── users.ts        # 用户管理 API
│   ├── analytics.ts    # 分析数据 API
│   ├── media.ts        # 媒体管理 API
│   ├── settings.ts     # 系统设置 API
│   └── logs.ts         # 操作日志 API
├── interceptors.ts     # 请求/响应拦截器
├── types.ts            # API 类型定义
└── index.ts            # 统一导出
```

### API 客户端核心功能

```typescript
// src/lib/api/client.ts
class ApiClient {
  private baseURL: string;
  private accessToken: string | null;

  // 请求拦截器: 添加 JWT token
  // 响应拦截器: 处理 401 自动刷新 token
  // 错误处理: 统一错误格式
  // 重试机制: 网络错误自动重试
}
```

### 认证拦截器

```typescript
// 请求拦截
request.headers.Authorization = `Bearer ${accessToken}`;

// 响应拦截
if (response.status === 401) {
  // 尝试刷新 token
  const newToken = await refreshAccessToken();
  // 重试原请求
  return retryRequest(originalRequest, newToken);
}
```

## 数据流对比

### 迁移前 (Server Actions)

```
Component -> Server Action -> Supabase -> Response
```

### 迁移后 (RESTful API)

```
Component -> API Client -> API Route -> Service Layer -> Supabase -> Response
```

## 权限控制

### 中间件层

```typescript
// src/lib/api/middleware/auth.ts
export async function requireAuth(request: NextRequest) {
  const token = extractToken(request);
  const payload = verifyJWT(token);
  return payload.userId;
}

export async function requireAdmin(request: NextRequest) {
  const userId = await requireAuth(request);
  const user = await getUserRole(userId);
  if (user.role !== "admin") throw new ForbiddenError();
}
```

### API 路由使用

```typescript
// src/app/api/v1/admin/textbooks/route.ts
export async function GET(request: NextRequest) {
  await requireAdmin(request);
  // ... 业务逻辑
}
```

## 错误处理

### 统一错误格式

```typescript
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {}
  }
}
```

### 错误码定义

- `UNAUTHORIZED` (401): 未认证或 token 无效
- `FORBIDDEN` (403): 无权限访问
- `NOT_FOUND` (404): 资源不存在
- `VALIDATION_ERROR` (422): 请求参数验证失败
- `INTERNAL_ERROR` (500): 服务器内部错误

## 迁移步骤

### Phase 1: 基础设施

1. 创建 JWT 工具函数 (生成、验证、刷新)
2. 创建 API 客户端核心类
3. 创建认证中间件
4. 创建统一错误处理

### Phase 2: 认证系统

1. 实现认证 API 路由
2. 更新登录/注册页面使用 API
3. 实现 token 刷新机制
4. 测试认证流程

### Phase 3: 管理后台 API

1. 实现教材管理 API
2. 实现单元管理 API
3. 实现课程管理 API
4. 实现音频管理 API
5. 实现用户管理 API
6. 实现分析数据 API
7. 实现媒体管理 API
8. 实现系统设置 API
9. 实现操作日志 API

### Phase 4: 前端迁移

1. 更新所有管理后台页面使用 API 客户端
2. 移除 Server Actions 文件
3. 更新相关组件

### Phase 5: 测试与优化

1. 端到端测试
2. 性能优化
3. 错误处理完善
4. 文档更新

## 兼容性考虑

### 现有 API 保留

项目中已有的用户端 API 保持不变:

- `/api/v1/textbooks` - 教材列表
- `/api/v1/user/favorites` - 收藏管理
- `/api/v1/user/history` - 学习历史
- `/api/v1/user/stats` - 学习统计

### 新增管理端 API

所有管理后台功能使用新的 `/api/v1/admin/*` 路由。

## 安全考虑

1. **JWT Secret**: 使用环境变量存储，定期轮换
2. **Token 过期**: Access token 短期，Refresh token 长期
3. **HTTPS Only**: 生产环境强制 HTTPS
4. **Rate Limiting**: API 请求频率限制
5. **CORS**: 配置允许的域名
6. **Input Validation**: 所有输入使用 Zod 验证
7. **SQL Injection**: 使用 Supabase 参数化查询
8. **XSS**: 前端输出转义

## 性能优化

1. **缓存策略**: 使用 TanStack Query 缓存
2. **分页**: 所有列表接口支持分页
3. **压缩**: 启用 gzip/brotli 压缩
4. **CDN**: 静态资源使用 CDN
5. **数据库索引**: 优化查询性能

## 移动端支持

### API 特性

- RESTful 标准接口
- JWT 认证机制
- JSON 数据格式
- 完整的错误处理
- 分页和过滤支持

### 移动端集成

```typescript
// React Native / Flutter 示例
const api = new ApiClient({
  baseURL: "https://api.bookvoice.com",
  platform: "mobile",
});

await api.auth.login(email, password);
const textbooks = await api.textbooks.list();
```

## 监控与日志

1. **API 日志**: 记录所有 API 请求
2. **错误追踪**: 集成 Sentry 等工具
3. **性能监控**: 响应时间、成功率
4. **用户行为**: 操作日志记录

## 文档

1. **API 文档**: 使用 OpenAPI/Swagger
2. **集成指南**: 移动端接入文档
3. **错误码表**: 完整的错误码说明
4. **示例代码**: 各平台示例

## 总结

本方案将 Book Voice 从 Server Actions 完全迁移到 RESTful API 架构，提供:

- 统一的 API 接口供 Web 和移动端使用
- JWT 认证机制保证安全性
- 完善的错误处理和日志记录
- 良好的扩展性和维护性
- 标准的 RESTful 设计便于第三方集成
