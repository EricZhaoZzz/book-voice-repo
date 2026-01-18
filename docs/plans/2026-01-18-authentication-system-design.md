# 用户认证系统设计文档

**日期:** 2026-01-18
**状态:** 已完成
**作者:** Claude Code

## 1. 概述

Book Voice 用户认证系统提供完整的用户身份验证和授权功能，支持邮箱密码登录、微信登录、游客模式以及密码找回等功能。

## 2. 认证方式

### 2.1 邮箱密码认证 ✅

**实现位置:**

- Server Actions: `src/features/auth/actions.ts:9-22` (login)
- Server Actions: `src/features/auth/actions.ts:24-40` (register)
- API 路由: `src/app/api/v1/auth/login/route.ts`
- API 路由: `src/app/api/v1/auth/register/route.ts`
- 服务层: `src/services/auth.service.ts:27-71` (loginWithEmail)
- 服务层: `src/services/auth.service.ts:73-113` (registerWithEmail)

**功能特性:**

- 邮箱格式验证
- 密码强度要求：至少6个字符，包含字母和数字
- 注册时需要用户名
- 自动创建用户记录（通过数据库触发器）
- 更新登录次数和最后登录时间

**数据库触发器:**

```sql
-- supabase/migrations/004_auth_trigger.sql:1-17
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role, status, wechat_openid, wechat_unionid)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'student',
    'active',
    NEW.raw_user_meta_data->>'wechat_openid',
    NEW.raw_user_meta_data->>'wechat_unionid'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.2 微信登录 ✅

**实现位置:**

- API 路由: `src/app/api/v1/auth/wechat/route.ts`
- 服务层: `src/services/auth.service.ts:115-240` (loginWithWechat)

**功能特性:**

- 通过微信授权码获取 openid 和 unionid
- 自动创建或关联用户账号
- 使用占位邮箱格式：`wx_{openid}@wechat.placeholder`
- 支持首次登录自动注册

### 2.3 游客模式 ✅

**实现位置:**

- Server Actions: `src/features/auth/actions.ts:52-62` (enableGuestMode)
- Server Actions: `src/features/auth/actions.ts:64-67` (disableGuestMode)
- 中间件: `src/middleware.ts:20`

**功能特性:**

- 基于 Cookie 的游客标识
- 7天有效期
- 无需注册即可访问内容
- 不保存学习数据

### 2.4 密码找回 ✅

**实现位置:**

- 页面: `src/app/(auth)/forgot-password/page.tsx`
- 页面: `src/app/(auth)/reset-password/page.tsx`
- Server Actions: `src/features/auth/actions.ts:69-90` (requestPasswordReset)
- Server Actions: `src/features/auth/actions.ts:100-120` (resetPassword)

**流程:**

1. 用户输入邮箱地址
2. 系统发送重置链接到邮箱（通过 Supabase Auth）
3. 用户点击邮件中的链接跳转到重置密码页面
4. 用户输入新密码并确认
5. 系统更新密码并重定向到登录页面

**重置链接格式:**

```
{NEXT_PUBLIC_APP_URL}/reset-password?token=xxx
```

## 3. 表单验证

**验证规则:** `src/lib/validations/auth.ts`

### 3.1 登录验证

```typescript
loginSchema = {
  email: 有效的邮箱地址,
  password: 必填,
};
```

### 3.2 注册验证

```typescript
registerSchema = {
  username: 2-50个字符,
  email: 有效的邮箱地址,
  password: 至少6个字符 + 至少一个字母 + 至少一个数字,
  confirmPassword: 必须与密码一致
}
```

### 3.3 重置密码验证

```typescript
resetPasswordSchema = {
  password: 至少6个字符 + 至少一个字母 + 至少一个数字,
  confirmPassword: 必须与密码一致,
};
```

## 4. 会话管理

### 4.1 Token 管理

**Access Token:**

- 存储位置: Supabase Auth 自动管理
- 有效期: 由 Supabase 配置决定
- 刷新机制: 自动刷新（通过中间件）

**Refresh Token:**

- 存储位置: HttpOnly Cookie
- Cookie 名称: `refresh_token`
- 有效期: 7天
- 安全设置: httpOnly, secure (生产环境), sameSite: lax

### 4.2 中间件

**实现位置:** `src/middleware.ts`

**功能:**

- 自动刷新会话
- 保护非公开路由
- 已登录用户重定向
- 游客模式支持

**公开路由:**

```typescript
const PUBLIC_ROUTES = ["/auth", "/forgot-password", "/reset-password"];
```

### 4.3 Supabase 客户端

**客户端组件:** `src/lib/supabase/client.ts`

- 用于客户端组件
- 自动会话持久化
- 自动 Token 刷新

**服务端组件:** `src/lib/supabase/server.ts`

- 用于 Server Components 和 Server Actions
- Cookie-based 会话管理

**中间件客户端:** `src/lib/supabase/middleware.ts`

- 用于 Next.js 中间件
- 会话刷新

## 5. 用户角色与权限

### 5.1 角色定义

**数据库定义:** `supabase/migrations/001_create_tables.sql:13`

```sql
role TEXT NOT NULL DEFAULT 'student'
  CHECK (role IN ('student', 'admin', 'super_admin'))
```

**角色说明:**

- `student`: 普通学生用户（默认）
- `admin`: 管理员
- `super_admin`: 超级管理员

### 5.2 用户状态

**数据库定义:** `supabase/migrations/001_create_tables.sql:14`

```sql
status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'suspended', 'banned'))
```

**状态说明:**

- `active`: 正常状态（默认）
- `suspended`: 暂停使用
- `banned`: 永久封禁

### 5.3 Row Level Security (RLS)

**实现位置:** `supabase/migrations/002_rls_policies.sql`

**用户表策略:**

- 用户可以读取和更新自己的数据
- 管理员可以读取和管理所有用户数据

**内容表策略:**

- 所有人可以读取教材、单元、课程
- 仅管理员可以管理内容

**用户数据表策略:**

- 用户只能访问自己的收藏、播放历史、学习统计
- 管理员可以查看所有数据

## 6. API 端点

### 6.1 认证 API

| 端点                    | 方法 | 描述         | 实现位置                                |
| ----------------------- | ---- | ------------ | --------------------------------------- |
| `/api/v1/auth/login`    | POST | 邮箱密码登录 | `src/app/api/v1/auth/login/route.ts`    |
| `/api/v1/auth/register` | POST | 用户注册     | `src/app/api/v1/auth/register/route.ts` |
| `/api/v1/auth/logout`   | POST | 用户登出     | `src/app/api/v1/auth/logout/route.ts`   |
| `/api/v1/auth/refresh`  | POST | 刷新 Token   | `src/app/api/v1/auth/refresh/route.ts`  |
| `/api/v1/auth/me`       | GET  | 获取当前用户 | `src/app/api/v1/auth/me/route.ts`       |
| `/api/v1/auth/wechat`   | POST | 微信登录     | `src/app/api/v1/auth/wechat/route.ts`   |

### 6.2 请求/响应格式

**登录请求:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**登录响应:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "role": "student"
    },
    "accessToken": "jwt-token",
    "expiresIn": 3600
  }
}
```

## 7. 数据库结构

### 7.1 用户表

**表名:** `users`
**定义位置:** `supabase/migrations/001_create_tables.sql:5-21`

**字段:**

```sql
id UUID PRIMARY KEY
email TEXT UNIQUE
phone TEXT UNIQUE
username TEXT NOT NULL
avatar_url TEXT
grade TEXT
school TEXT
role TEXT NOT NULL DEFAULT 'student'
status TEXT NOT NULL DEFAULT 'active'
last_login_at TIMESTAMPTZ
login_count INTEGER DEFAULT 0
wechat_openid TEXT
wechat_unionid TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

**索引:**

- `idx_users_email` ON email
- `idx_users_phone` ON phone
- `idx_users_role` ON role
- `idx_users_status` ON status

## 8. 安全措施

### 8.1 密码安全

- 使用 bcrypt 加密（通过 Supabase Auth）
- 密码强度要求：至少6个字符，包含字母和数字
- 密码重置通过邮件验证链接

### 8.2 会话安全

- HttpOnly Cookie 防止 XSS 攻击
- Secure Cookie（生产环境）
- SameSite: lax 防止 CSRF 攻击
- 自动 Token 刷新

### 8.3 API 安全

- Bearer Token 验证
- 用户状态检查（active/suspended/banned）
- Row Level Security (RLS)
- 输入验证（Zod schemas）

### 8.4 中间件保护

- 自动重定向未认证用户
- 保护非公开路由
- 会话自动刷新

## 9. 错误处理

### 9.1 验证错误

- 客户端验证：实时表单验证
- 服务端验证：Zod schema 验证
- 错误消息：中文本地化

### 9.2 认证错误

- 无效凭证：返回 401 Unauthorized
- Token 过期：自动刷新或重定向登录
- 账号被封禁：返回错误消息

### 9.3 网络错误

- 超时处理
- 重试机制（由 Supabase 客户端处理）
- 友好的错误提示

## 10. 用户界面

### 10.1 登录/注册页面

**位置:** `src/app/(auth)/auth/page.tsx`

**功能:**

- Tab 切换登录/注册表单
- 表单验证和错误提示
- 游客模式入口
- 忘记密码链接
- 响应式设计

### 10.2 忘记密码页面

**位置:** `src/app/(auth)/forgot-password/page.tsx`

**功能:**

- 邮箱输入
- 发送重置链接
- 成功提示

### 10.3 重置密码页面

**位置:** `src/app/(auth)/reset-password/page.tsx`

**功能:**

- 新密码输入
- 密码确认
- 密码强度提示
- 重置成功后重定向

## 11. 环境配置

**必需环境变量:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WeChat (可选)
WECHAT_APP_ID=your-app-id
WECHAT_APP_SECRET=your-app-secret
```

## 12. 已修复的问题

### 12.1 路由配置

- ✅ 修复重置密码路由：从 `/auth/reset-password` 改为 `/reset-password`
- ✅ 更新中间件公开路由配置

### 12.2 验证消息本地化

- ✅ 所有验证错误消息改为中文
- ✅ 统一错误提示风格

### 12.3 数据库迁移

- ✅ 修复 role 字段定义冲突
- ✅ 修复 status 字段定义冲突
- ✅ 更新 auth trigger 支持 WeChat 字段
- ✅ 移除重复的索引定义

## 13. 测试建议

### 13.1 单元测试

- [ ] 验证 schema 测试
- [ ] Server Actions 测试
- [ ] API 路由测试
- [ ] 服务层测试

### 13.2 集成测试

- [ ] 完整登录流程
- [ ] 完整注册流程
- [ ] 密码重置流程
- [ ] Token 刷新流程
- [ ] 游客模式流程

### 13.3 E2E 测试

- [ ] 用户注册并登录
- [ ] 密码找回流程
- [ ] 游客模式转正式用户
- [ ] 会话过期处理

## 14. 未来改进

### 14.1 计划中的功能

- 手机号 + 短信验证登录
- 两步验证（2FA）
- 社交账号绑定
- 登录异常检测

### 14.2 性能优化

- Token 缓存策略
- 会话状态优化
- API 响应缓存

### 14.3 安全增强

- 登录频率限制
- IP 白名单
- 设备指纹识别
- 异常登录通知

## 15. 总结

Book Voice 用户认证系统已完整实现以下功能：

✅ **核心功能:**

- 邮箱密码登录/注册
- 微信登录
- 游客模式
- 密码找回

✅ **安全特性:**

- 密码加密
- Token 管理
- RLS 权限控制
- 中间件保护

✅ **用户体验:**

- 表单验证
- 错误提示
- 响应式设计
- 中文本地化

系统已准备好投入使用，所有核心认证功能均已实现并经过代码审查。
