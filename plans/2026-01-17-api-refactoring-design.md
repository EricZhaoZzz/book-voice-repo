# API 改造设计

## 概述

将现有的 Server Actions 架构改造为统一的 RESTful API，支持 Web、小程序、App 三端共用。

## 目标

- 所有客户端统一调用 REST API
- 废弃 Server Actions 的数据获取方式
- 支持邮箱登录和微信登录两种认证方式
- API 采用 URL 路径版本管理 (`/api/v1/`)

## 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                      客户端                              │
├─────────────┬─────────────────┬─────────────────────────┤
│   Web       │   小程序         │   App                   │
│  (Next.js)  │  (微信)          │  (React Native/Flutter) │
└──────┬──────┴────────┬────────┴────────┬────────────────┘
       │               │                 │
       └───────────────┼─────────────────┘
                       ▼
            ┌─────────────────────────┐
            │   REST API (/api/v1/*)  │
            │   统一入口，所有端共用    │
            └───────────┬─────────────┘
                        ▼
              ┌─────────────────┐
              │   Service 层    │
              │  src/services/  │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │    Supabase     │
              │  (数据库/存储)   │
              └─────────────────┘
```

## API 端点设计

### 认证相关

| 方法 | 端点                            | 说明                      |
| ---- | ------------------------------- | ------------------------- |
| POST | `/api/v1/auth/login`            | 邮箱密码登录              |
| POST | `/api/v1/auth/register`         | 邮箱注册                  |
| POST | `/api/v1/auth/logout`           | 登出                      |
| POST | `/api/v1/auth/password/forgot`  | 请求密码重置              |
| POST | `/api/v1/auth/password/reset`   | 重置密码                  |
| POST | `/api/v1/auth/wechat`           | 微信登录（code 换 token） |
| POST | `/api/v1/auth/wechat/bindEmail` | 微信账号绑定邮箱          |
| GET  | `/api/v1/auth/me`               | 获取当前用户信息          |
| POST | `/api/v1/auth/refresh`          | 刷新 token                |

### 内容相关（只读）

| 方法 | 端点                          | 说明                       |
| ---- | ----------------------------- | -------------------------- |
| GET  | `/api/v1/textbooks`           | 教材列表（支持分页、筛选） |
| GET  | `/api/v1/textbooks/:id`       | 教材详情                   |
| GET  | `/api/v1/textbooks/:id/units` | 教材下的单元列表           |
| GET  | `/api/v1/units/:id`           | 单元详情                   |
| GET  | `/api/v1/units/:id/lessons`   | 单元下的课程列表           |
| GET  | `/api/v1/lessons/:id`         | 课程详情（含音频 URL）     |
| GET  | `/api/v1/lessons/qr/:token`   | 通过二维码 token 获取课程  |

### 用户数据相关

| 方法   | 端点                               | 说明         |
| ------ | ---------------------------------- | ------------ |
| GET    | `/api/v1/user/favorites`           | 收藏列表     |
| POST   | `/api/v1/user/favorites`           | 添加收藏     |
| DELETE | `/api/v1/user/favorites/:lessonId` | 取消收藏     |
| GET    | `/api/v1/user/history`             | 播放历史     |
| POST   | `/api/v1/user/history`             | 记录播放进度 |
| GET    | `/api/v1/user/stats`               | 学习统计     |

## 目录结构

```
src/
├── app/api/v1/                    # API Routes
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   ├── logout/route.ts
│   │   ├── me/route.ts
│   │   ├── refresh/route.ts
│   │   ├── wechat/
│   │   │   ├── route.ts           # 微信登录
│   │   │   └── bindEmail/route.ts
│   │   └── password/
│   │       ├── forgot/route.ts
│   │       └── reset/route.ts
│   ├── textbooks/
│   │   ├── route.ts               # GET 列表
│   │   └── [id]/
│   │       ├── route.ts           # GET 详情
│   │       └── units/route.ts     # GET 单元列表
│   ├── units/
│   │   └── [id]/
│   │       ├── route.ts           # GET 详情
│   │       └── lessons/route.ts   # GET 课程列表
│   ├── lessons/
│   │   ├── [id]/route.ts          # GET 详情
│   │   └── qr/[token]/route.ts    # GET 二维码访问
│   └── user/
│       ├── favorites/
│       │   ├── route.ts           # GET/POST
│       │   └── [lessonId]/route.ts # DELETE
│       ├── history/route.ts       # GET/POST
│       └── stats/route.ts         # GET
│
├── services/                       # Service 层（新增）
│   ├── auth.service.ts            # 认证业务逻辑
│   ├── textbook.service.ts        # 教材业务逻辑
│   ├── unit.service.ts            # 单元业务逻辑
│   ├── lesson.service.ts          # 课程业务逻辑
│   └── user.service.ts            # 用户数据业务逻辑
│
├── lib/
│   ├── api/                        # API 客户端（新增）
│   │   ├── client.ts              # fetch 封装
│   │   ├── response.ts            # 统一响应工具
│   │   ├── auth.ts                # 认证相关 API 调用
│   │   ├── textbooks.ts           # 教材相关 API 调用
│   │   └── user.ts                # 用户数据 API 调用
│   └── middleware/                 # API 中间件（新增）
│       ├── auth.ts                # JWT 认证中间件
│       └── error-handler.ts       # 统一错误处理
│
└── types/
    └── api.ts                      # API 请求/响应类型（新增）
```

## 认证机制

### Token 策略

采用 Access Token + Refresh Token 双令牌机制：

| Token 类型    | 有效期  | 存储位置                               | 用途              |
| ------------- | ------- | -------------------------------------- | ----------------- |
| Access Token  | 15 分钟 | 内存 / Header                          | 接口认证          |
| Refresh Token | 7 天    | HttpOnly Cookie (Web) / 安全存储 (App) | 刷新 Access Token |

### 认证流程

```
┌─────────────┐     1. 登录请求          ┌─────────────┐
│   客户端     │ ────────────────────────▶│   API       │
│             │     (邮箱密码/微信code)    │             │
│             │◀──────────────────────── │             │
│             │     2. 返回双 Token       │             │
└─────────────┘                          └─────────────┘
       │
       │  3. 后续请求携带 Access Token
       │     Authorization: Bearer <token>
       ▼
┌─────────────┐                          ┌─────────────┐
│   客户端     │ ────────────────────────▶│   API       │
│             │                          │             │
│             │◀──────────────────────── │             │
│             │     4. 返回数据           │             │
└─────────────┘                          └─────────────┘
       │
       │  5. Access Token 过期时
       │     调用 /api/v1/auth/refresh
       ▼
┌─────────────┐                          ┌─────────────┐
│   客户端     │ ────────────────────────▶│   API       │
│             │     携带 Refresh Token    │             │
│             │◀──────────────────────── │             │
│             │     6. 返回新的双 Token   │             │
└─────────────┘                          └─────────────┘
```

### 与 Supabase Auth 集成

复用 Supabase 内置的 JWT 机制：

```typescript
// src/lib/middleware/auth.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function withAuth(
  request: NextRequest,
  handler: (userId: string) => Promise<NextResponse>
) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  return handler(user.id);
}
```

### 微信登录流程

```
┌─────────────┐  1. wx.login()   ┌─────────────┐
│   小程序     │ ───────────────▶ │   微信服务器  │
│             │◀─────────────── │             │
│             │  2. 返回 code    │             │
└──────┬──────┘                  └─────────────┘
       │
       │  3. POST /api/v1/auth/wechat { code }
       ▼
┌─────────────┐                  ┌─────────────┐
│   API       │  4. code2session │   微信服务器  │
│             │ ───────────────▶ │             │
│             │◀─────────────── │             │
│             │  5. openid       │             │
└──────┬──────┘                  └─────────────┘
       │
       │  6. 查找/创建用户，返回 Token
       ▼
┌─────────────┐
│   小程序     │
└─────────────┘
```

### 数据库改动

需要在 `users` 表新增字段支持微信登录：

```sql
ALTER TABLE users ADD COLUMN wechat_openid TEXT UNIQUE;
ALTER TABLE users ADD COLUMN wechat_unionid TEXT;
```

## 统一响应格式

### 成功响应

```typescript
// 单条数据
{
  "data": { "id": "xxx", "name": "xxx" }
}

// 列表数据（带分页）
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 错误响应

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

### 错误码定义

| HTTP 状态码 | 错误码              | 说明           |
| ----------- | ------------------- | -------------- |
| 400         | VALIDATION_ERROR    | 参数验证失败   |
| 400         | INVALID_CREDENTIALS | 邮箱或密码错误 |
| 401         | UNAUTHORIZED        | 未登录         |
| 401         | TOKEN_EXPIRED       | Token 已过期   |
| 403         | FORBIDDEN           | 无权限访问     |
| 403         | VIP_REQUIRED        | 需要 VIP 权限  |
| 404         | NOT_FOUND           | 资源不存在     |
| 429         | RATE_LIMITED        | 请求过于频繁   |
| 500         | INTERNAL_ERROR      | 服务器内部错误 |

### 响应工具函数

```typescript
// src/lib/api/response.ts
import { NextResponse } from "next/server";

export function success<T>(data: T) {
  return NextResponse.json({ data });
}

export function paginated<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number }
) {
  return NextResponse.json({
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
}

export function error(code: string, message: string, status: number = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}
```

## Web 端改造

### API 客户端

```typescript
// src/lib/api/client.ts
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "";

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string) {
    this.accessToken = token;
  }

  clearToken() {
    this.accessToken = null;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error?.code === "TOKEN_EXPIRED") {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.request(endpoint, options);
        }
      }
      throw new ApiError(data.error.code, data.error.message);
    }

    return data;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const { data } = await res.json();
        this.setToken(data.accessToken);
        return true;
      }
    } catch {}
    return false;
  }
}

export const apiClient = new ApiClient();
```

### 配合 TanStack Query

```typescript
// src/lib/api/textbooks.ts
import { apiClient } from "./client";
import type { Textbook } from "@/types/database";

export async function fetchTextbooks(params?: { grade?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.grade) query.set("grade", params.grade);
  if (params?.page) query.set("page", String(params.page));

  return apiClient.request<{
    data: Textbook[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`/api/v1/textbooks?${query}`);
}

// src/features/textbooks/hooks/use-textbooks.ts
import { useQuery } from "@tanstack/react-query";
import { fetchTextbooks } from "@/lib/api/textbooks";

export function useTextbooks(grade?: string) {
  return useQuery({
    queryKey: ["textbooks", { grade }],
    queryFn: () => fetchTextbooks({ grade }),
  });
}
```

## 实施计划

| 阶段       | 内容         | 涉及文件                                        |
| ---------- | ------------ | ----------------------------------------------- |
| **阶段 1** | 基础设施     | 新增 `services/`、`lib/api/`、`lib/middleware/` |
| **阶段 2** | 认证 API     | `/api/v1/auth/*` + 微信登录 + 数据库迁移        |
| **阶段 3** | 内容 API     | `/api/v1/textbooks/*`、`units/*`、`lessons/*`   |
| **阶段 4** | 用户数据 API | `/api/v1/user/*`（收藏、历史、统计）            |
| **阶段 5** | Web 端改造   | 替换 Server Actions 为 API 调用                 |
| **阶段 6** | 清理         | 删除废弃的 Server Actions                       |

## 需保留的 Server Actions

以下场景仍使用 Server Actions：

- `logout` - 需要清除 Cookie 并重定向
- 文件上传 - 现有 `/api/upload/*` 保持不变（后续可迁移到 `/api/v1/upload/*`）

## 代码示例

### Service 层

```typescript
// src/services/textbook.service.ts
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Textbook = Database["public"]["Tables"]["textbooks"]["Row"];

export async function getTextbooks(options?: {
  grade?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Textbook[]; total: number }> {
  const supabase = await createClient();
  const { page = 1, limit = 20, grade } = options || {};

  let query = supabase.from("textbooks").select("*", { count: "exact" });

  if (grade) query = query.eq("grade", grade);

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

export async function getTextbookById(id: string): Promise<Textbook | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("textbooks").select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}
```

### API Route

```typescript
// src/app/api/v1/textbooks/route.ts
import { NextRequest } from "next/server";
import { getTextbooks } from "@/services/textbook.service";
import { paginated, error } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get("grade") || undefined;
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;

  try {
    const { data, total } = await getTextbooks({ grade, page, limit });
    return paginated(data, { page, limit, total });
  } catch (err) {
    return error("INTERNAL_ERROR", "Failed to fetch textbooks", 500);
  }
}

// src/app/api/v1/textbooks/[id]/route.ts
import { NextRequest } from "next/server";
import { getTextbookById } from "@/services/textbook.service";
import { success, error } from "@/lib/api/response";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const textbook = await getTextbookById(id);

    if (!textbook) {
      return error("NOT_FOUND", "Textbook not found", 404);
    }

    return success(textbook);
  } catch (err) {
    return error("INTERNAL_ERROR", "Failed to fetch textbook", 500);
  }
}
```
