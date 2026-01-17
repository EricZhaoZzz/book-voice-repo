# API 改造实施计划

## 概述

将现有的 Server Actions 架构改造为统一的 RESTful API，支持 Web、小程序、App 三端共用。

**设计文档**: `docs/plans/2026-01-17-api-refactoring-design.md`

## 现状分析

### 当前架构

- **数据获取**: 100% 使用 Server Actions
  - `src/app/admin/actions.ts` - 管理端所有 CRUD 操作
  - `src/features/auth/actions.ts` - 认证相关操作
- **API Routes**: 仅有 2 个文件上传端点
  - `/api/upload/audio` 和 `/api/upload/images`
- **TanStack Query**: 已安装但未使用
- **认证**: 使用 Supabase Auth，JWT 存储在 httpOnly cookies

### 目标架构

```
客户端 (Web/小程序/App)
    ↓ REST API with JWT
API Routes (/api/v1/*)
    ↓ 认证中间件
Service 层 (业务逻辑)
    ↓
Supabase (数据库/存储)
```

## 实施阶段

### 阶段 1: 基础设施搭建 (1-2 天)

#### 1.1 创建统一响应工具

**文件**: `src/lib/api/response.ts`

提供:

- `success(data)` - 成功响应
- `paginated(data, pagination)` - 分页响应
- `error(code, message, status)` - 错误响应
- `errors.*` - 常用错误快捷函数

**响应格式**:

```typescript
// 成功
{ data: T }

// 分页
{ data: T[], pagination: { page, limit, total, totalPages } }

// 错误
{ error: { code: string, message: string } }
```

#### 1.2 创建认证中间件

**文件**: `src/lib/middleware/auth.ts`

提供:

- `withAuth(request, handler)` - 普通用户认证
- `withAdminAuth(request, handler)` - 管理员认证

**机制**:

- 从 Authorization header 提取 Bearer token
- 使用 Supabase Auth 的 `getUser(token)` 验证
- 复用现有的 JWT 机制，无需自己实现

#### 1.3 创建 API 客户端

**文件**: `src/lib/api/client.ts`

**核心功能**:

- 单例模式的 ApiClient 类
- 自动携带 Authorization header
- 自动 token 刷新（检测 TOKEN_EXPIRED 错误）
- 提供 `get/post/put/delete` 快捷方法

**关键决策**: Access Token 存储在内存，Refresh Token 存储在 httpOnly cookie

#### 1.4 创建 Service 层

**目录结构**:

```
src/services/
├── auth.service.ts       # 认证业务逻辑
├── textbook.service.ts   # 教材
├── unit.service.ts       # 单元
├── lesson.service.ts     # 课程
└── user.service.ts       # 用户数据
```

**设计模式**: 使用静态方法，无需实例化，符合 Next.js 服务端风格

**参考**: 现有的 `src/app/admin/actions.ts` 中的业务逻辑

#### 1.5 创建类型定义

**文件**: `src/types/api.ts`

定义:

- API 请求/响应类型
- 认证相关类型 (LoginRequest, RegisterRequest, AuthTokens)
- 分页参数类型
- 筛选参数类型

---

### 阶段 2: 认证 API 实现 (2-3 天)

#### 2.1 数据库迁移

**需要使用 Supabase MCP 工具执行**:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_openid TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_unionid TEXT;
CREATE INDEX IF NOT EXISTS idx_users_wechat_openid ON users(wechat_openid);
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
```

#### 2.2 创建认证 Service

**文件**: `src/services/auth.service.ts`

实现:

- `loginWithEmail(email, password)` - 邮箱登录
- `registerWithEmail(email, password, username)` - 邮箱注册
- `loginWithWechat(code, appId, appSecret)` - 微信登录
  - 调用微信 API: `jscode2session`
  - 查找或创建用户
  - 使用 Supabase Admin API 生成 JWT
- `refreshAccessToken(refreshToken)` - 刷新 token
- `getCurrentUser(userId)` - 获取当前用户信息

**微信登录流程**:

1. 客户端通过 `wx.login()` 获取 code
2. 调用 `/api/v1/auth/wechat` 并传递 code
3. 后端调用微信 `code2session` API 获取 openid
4. 查找或创建用户记录
5. 生成 JWT token 并返回

#### 2.3 实现认证 API Routes

**端点**:

- `POST /api/v1/auth/login` - 邮箱登录
- `POST /api/v1/auth/register` - 邮箱注册
- `POST /api/v1/auth/logout` - 登出
- `POST /api/v1/auth/wechat` - 微信登录
- `POST /api/v1/auth/refresh` - 刷新 token
- `GET /api/v1/auth/me` - 获取当前用户（需认证）

**Cookie 管理**:

- 登录/注册成功后设置 `refresh_token` cookie (httpOnly, 7天有效)
- 登出时删除 cookie
- 刷新时更新 cookie

**环境变量**:

```env
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=1234567890abcdef1234567890abcdef
```

---

### 阶段 3: 内容 API 实现 (2-3 天)

#### 3.1 创建内容 Services

**文件**:

- `src/services/textbook.service.ts`
- `src/services/unit.service.ts`
- `src/services/lesson.service.ts`

**参考**: `src/app/admin/actions.ts` 中的数据获取逻辑

**关键方法**:

- `getTextbooks({ grade, page, limit })` - 支持分页和筛选
- `getTextbookById(id)`
- `getUnitsByTextbookId(textbookId)`
- `getUnitById(id)`
- `getLessonsByUnitId(unitId)`
- `getLessonById(id)`
- `getLessonByQrToken(token)` - 二维码访问（检查过期时间）

#### 3.2 实现内容 API Routes

**教材相关**:

- `GET /api/v1/textbooks` - 列表（支持 ?grade=&page=&limit=）
- `GET /api/v1/textbooks/:id` - 详情
- `GET /api/v1/textbooks/:id/units` - 教材的单元列表

**单元相关**:

- `GET /api/v1/units/:id` - 详情
- `GET /api/v1/units/:id/lessons` - 单元的课程列表

**课程相关**:

- `GET /api/v1/lessons/:id` - 详情（含音频 URL）
- `GET /api/v1/lessons/qr/:token` - 二维码访问

**特点**: 所有端点都是只读，不需要认证（公开内容）

---

### 阶段 4: 用户数据 API 实现 (1-2 天)

#### 4.1 创建用户数据 Service

**文件**: `src/services/user.service.ts`

**收藏相关**:

- `getFavorites(userId)` - 获取收藏列表（包含关联的课程、单元、教材信息）
- `addFavorite(userId, lessonId)` - 添加收藏（检查重复）
- `removeFavorite(userId, lessonId)` - 取消收藏

**播放历史**:

- `getPlayHistory(userId, limit)` - 获取播放历史
- `updatePlayHistory(userId, lessonId, position)` - 更新播放进度
  - 如果存在记录则更新 `last_position` 和 `play_count`
  - 否则创建新记录

**学习统计**:

- `getLearningStats(userId)` - 获取最近 30 天的学习统计

#### 4.2 实现用户数据 API Routes

**端点**:

- `GET /api/v1/user/favorites` - 获取收藏列表
- `POST /api/v1/user/favorites` - 添加收藏 `{ lessonId }`
- `DELETE /api/v1/user/favorites/:lessonId` - 取消收藏
- `GET /api/v1/user/history` - 获取播放历史
- `POST /api/v1/user/history` - 记录播放进度 `{ lessonId, position }`
- `GET /api/v1/user/stats` - 获取学习统计

**特点**: 所有端点都使用 `withAuth` 中间件保护

---

### 阶段 5: Web 端改造 (3-4 天)

#### 5.1 配置 TanStack Query

**文件**: `src/app/layout.tsx`

添加 `QueryClientProvider` 包裹整个应用，配置:

- `staleTime: 60 * 1000` (1 分钟)
- `retry: 1`

在开发环境启用 `ReactQueryDevtools`

#### 5.2 创建 API 调用函数

**文件**:

- `src/lib/api/textbooks.ts` - 教材相关 API 调用
- `src/lib/api/auth.ts` - 认证相关 API 调用
- `src/lib/api/user.ts` - 用户数据 API 调用

**模式**:

```typescript
export const textbooksApi = {
  getTextbooks: (params) => apiClient.get(...),
  getTextbookById: (id) => apiClient.get(...),
};
```

#### 5.3 创建 React Query Hooks

**文件**:

- `src/features/textbooks/hooks/use-textbooks.ts`
- `src/features/user/hooks/use-favorites.ts`
- 等等

**模式**:

```typescript
export function useTextbooks(grade?, page?) {
  return useQuery({
    queryKey: ["textbooks", { grade, page }],
    queryFn: () => textbooksApi.getTextbooks({ grade, page }),
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId) => userApi.addFavorite(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
```

#### 5.4 重构认证 Hook

**文件**: `src/features/auth/hooks/use-auth.ts`

**变更**:

- 监听 Supabase Auth 状态变化，自动同步 token 到 `apiClient`
- 使用 TanStack Query 的 `useQuery` 获取当前用户
- 提供 `useMutation` 封装的 login/logout 方法

#### 5.5 迁移组件

**迁移策略**:

1. 将 Server Components 改为 Client Components (`"use client"`)
2. 用 React Query hooks 替换 Server Actions 调用
3. 处理 loading 和 error 状态
4. 使用 mutations 处理数据修改操作

**示例**:

```typescript
// 旧代码 (Server Component)
import { getTextbooks } from "@/app/admin/actions";
const textbooks = await getTextbooks();

// 新代码 (Client Component)
("use client");
import { useTextbooks } from "@/features/textbooks/hooks/use-textbooks";
const { data, isLoading, error } = useTextbooks();
const textbooks = data?.data || [];
```

---

### 阶段 6: 清理与验证 (1 天)

#### 6.1 废弃 Server Actions

**保留**:

- `src/features/auth/actions.ts` 中的 `logout()` - 需要删除 cookies 并重定向
- 文件上传相关 API（现有的 `/api/upload/*`）

**删除或标记废弃**:

- `src/app/admin/actions.ts` 中的所有只读数据获取函数
- `src/features/auth/actions.ts` 中的 `login()` 和 `register()`

**注意**: 管理端的创建/更新/删除操作可以保留 Server Actions，因为只有管理员使用，不需要跨平台

#### 6.2 验证测试

**认证流程**:

```bash
# 邮箱登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 获取当前用户
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"

# 刷新 token
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  --cookie "refresh_token=<refresh_token>"
```

**内容 API**:

```bash
# 教材列表
curl http://localhost:3000/api/v1/textbooks?grade=1

# 教材详情
curl http://localhost:3000/api/v1/textbooks/<id>

# 二维码访问
curl http://localhost:3000/api/v1/lessons/qr/<token>
```

**用户数据 API**:

```bash
# 添加收藏
curl -X POST http://localhost:3000/api/v1/user/favorites \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"lessonId":"<lesson-id>"}'

# 获取收藏列表
curl http://localhost:3000/api/v1/user/favorites \
  -H "Authorization: Bearer <token>"
```

**Web 端测试**:

1. 在浏览器中测试完整用户流程
2. 检查 Network 面板，确认调用 API 而非 Server Actions
3. 检查 React Query DevTools，确认缓存正常工作
4. 测试 token 过期和自动刷新

**生产构建**:

```bash
npm run build
npm run start
```

#### 6.3 性能优化

**TanStack Query 缓存配置**:

- 教材列表: `staleTime: 5 * 60 * 1000` (5 分钟) - 内容更新不频繁
- 用户收藏: `staleTime: 30 * 1000` (30 秒) - 需要相对实时
- 播放历史: `staleTime: 0` - 实时更新

**数据库优化**:

- 确保 `wechat_openid`, `qr_code_token` 有索引
- 使用 Supabase 的嵌套 select 避免 N+1 查询

---

## 关键文件清单

**阶段 1**:

- `src/lib/api/response.ts` ⭐ 核心基础
- `src/lib/middleware/auth.ts` ⭐ 认证中间件
- `src/lib/api/client.ts` ⭐ 客户端核心
- `src/types/api.ts` - 类型定义

**阶段 2**:

- `src/services/auth.service.ts` ⭐ 认证业务逻辑
- `src/app/api/v1/auth/login/route.ts`
- `src/app/api/v1/auth/register/route.ts`
- `src/app/api/v1/auth/wechat/route.ts` - 微信登录
- `src/app/api/v1/auth/refresh/route.ts` - Token 刷新
- `src/app/api/v1/auth/me/route.ts`
- `src/app/api/v1/auth/logout/route.ts`

**阶段 3**:

- `src/services/textbook.service.ts` - 参考 `src/app/admin/actions.ts`
- `src/services/unit.service.ts`
- `src/services/lesson.service.ts`
- `src/app/api/v1/textbooks/*` (route.ts, [id]/route.ts, [id]/units/route.ts)
- `src/app/api/v1/units/*`
- `src/app/api/v1/lessons/*`

**阶段 4**:

- `src/services/user.service.ts`
- `src/app/api/v1/user/favorites/*`
- `src/app/api/v1/user/history/route.ts`
- `src/app/api/v1/user/stats/route.ts`

**阶段 5**:

- `src/app/layout.tsx` - 添加 QueryClientProvider
- `src/lib/api/textbooks.ts`, `auth.ts`, `user.ts`
- `src/features/*/hooks/use-*.ts` - 各个 feature 的 hooks
- `src/features/auth/hooks/use-auth.ts` ⭐ 重构认证 hook

**参考文件**:

- `src/app/admin/actions.ts` ⭐ 业务逻辑参考
- `src/lib/supabase/server.ts` - Supabase 客户端创建
- `src/types/database.ts` - 数据库类型定义

---

## 技术决策

### 1. 为什么使用 Supabase Auth 而不是自己实现 JWT?

- Supabase 已提供完整的 JWT 生成和验证
- 自动处理 token 刷新、过期检测
- 与现有认证系统兼容
- 减少维护成本

### 2. Token 存储策略

- **Access Token**: 存储在内存 (apiClient 实例)
  - 安全，XSS 无法窃取
  - 有效期短 (15 分钟)
- **Refresh Token**: httpOnly Cookie (Web) / 安全存储 (App)
  - 自动携带到刷新端点
  - 防止 XSS 攻击
  - 有效期长 (7 天)

### 3. Service 层设计

- 使用静态方法而非实例方法
- 符合 Next.js App Router 服务端风格
- 无状态，每次请求创建新的 Supabase 客户端

### 4. 保留哪些 Server Actions?

- **保留**: `logout` (需要重定向), 文件上传, 管理端 CRUD
- **废弃**: 所有只读数据获取, 用户数据操作

---

## 注意事项

### 1. CORS 配置

小程序/App 可能需要配置 CORS headers

### 2. Rate Limiting

建议为 API 添加速率限制（每 IP 每分钟 100 次请求）

### 3. 数据库查询优化

- 使用 `.range()` 而非 `.limit()` 进行分页
- 使用嵌套 select 避免 N+1 查询
- 确保常用字段有索引

### 4. 错误处理

- 统一错误格式: `{ error: { code, message } }`
- 区分客户端错误 (4xx) 和服务端错误 (5xx)
- 不泄露敏感信息

### 5. 环境变量

新增:

```env
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=1234567890abcdef1234567890abcdef
```

---

## 时间线

| 阶段   | 工作量 | 依赖                |
| ------ | ------ | ------------------- |
| 阶段 1 | 1-2 天 | 无                  |
| 阶段 2 | 2-3 天 | 阶段 1 + 数据库迁移 |
| 阶段 3 | 2-3 天 | 阶段 1              |
| 阶段 4 | 1-2 天 | 阶段 1 + 阶段 2     |
| 阶段 5 | 3-4 天 | 阶段 2-4            |
| 阶段 6 | 1 天   | 阶段 5              |

**总计**: 10-15 个工作日

**建议**: 每个阶段完成后进行独立测试和验证，确保可以正常运行后再进入下一阶段。

---

## 验证完成标准

- [ ] 所有 API endpoints 已实现并通过测试
- [ ] 认证流程正常（邮箱 + 微信登录）
- [ ] Token 刷新机制工作正常
- [ ] 客户端组件已迁移到 TanStack Query
- [ ] React Query 缓存策略配置合理
- [ ] 错误处理统一且友好
- [ ] 数据库迁移已应用
- [ ] 环境变量已配置
- [ ] 废弃代码已清理
- [ ] 生产构建成功
- [ ] 无 ESLint 错误
