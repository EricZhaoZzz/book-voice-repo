# Book Voice - 英语听力音频平台

面向 K-12 学生（6-18 岁）的英语听力资源平台，通过扫描二维码快速访问教材配套音频内容，支持课堂教学、家庭学习和课后复习等多种学习场景。

## 核心特性

- 通过二维码扫描快速访问特定课程音频
- 高级音频播放器（变速播放、AB 循环、断点续播）
- 多语言字幕显示（英文/中文/双语）
- 学习进度跟踪和数据分析
- 学校批量订阅管理
- 完整的管理后台系统

## 技术栈

### 前端

- **Next.js 16.1.1** - React 框架，支持 App Router 和 Turbopack
- **React 19** - 最新版 React，性能优化
- **TypeScript 5** - 严格类型检查
- **Tailwind CSS 3.4** - 原子化 CSS 框架
- **Shadcn/ui** - 基于 Radix UI 的无障碍组件库
- **TanStack Query v5** - 服务端状态管理
- **Zustand** - 客户端状态管理
- **React Hook Form + Zod** - 表单处理和验证
- **Howler.js** - 音频播放引擎

### 后端

- **Supabase** - 后端即服务平台
  - PostgreSQL 数据库
  - 身份认证（Email/Password + WeChat OAuth）
  - 文件存储 + CDN
  - 行级安全策略 (RLS)

### 开发工具

- **ESLint 9** - 代码检查（flat config）
- **Prettier 3** - 代码格式化
- **Husky + lint-staged** - Git hooks 自动化

## 快速开始

### 环境要求

- Node.js 18.18+ 或 20+
- npm、yarn 或 pnpm
- Supabase 账号

### 安装步骤

1. 克隆仓库：

```bash
git clone <repository-url>
cd book-voice-repo
```

2. 安装依赖：

```bash
npm install
```

3. 配置环境变量：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入 Supabase 凭证：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. 启动开发服务器：

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 项目结构

```
book-voice-repo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 认证路由组 (登录、注册、密码重置)
│   │   ├── (main)/            # 主应用路由组
│   │   ├── (marketing)/       # 营销页面 (落地页)
│   │   ├── admin/             # 管理后台路由
│   │   │   ├── textbooks/     # 教材管理
│   │   │   ├── users/         # 用户管理
│   │   │   ├── media/         # 媒体库
│   │   │   ├── analytics/     # 数据分析仪表盘
│   │   │   ├── logs/          # 审计日志
│   │   │   └── settings/      # 系统设置
│   │   └── api/v1/            # RESTful API 路由
│   ├── features/              # 功能模块
│   │   ├── auth/              # 身份认证
│   │   ├── player/            # 音频播放器
│   │   ├── textbooks/         # 教材管理
│   │   ├── lessons/           # 课程管理
│   │   ├── user/              # 用户功能
│   │   └── analytics/         # 学习数据分析
│   ├── services/              # 后端服务层
│   │   ├── auth.service.ts    # 认证服务
│   │   ├── textbook.service.ts # 教材服务
│   │   ├── unit.service.ts    # 单元服务
│   │   ├── lesson.service.ts  # 课程服务
│   │   └── user.service.ts    # 用户服务
│   ├── components/            # 共享组件
│   │   ├── ui/                # Shadcn/ui 组件
│   │   ├── admin/             # 管理后台专用组件
│   │   ├── analytics/         # 数据分析组件
│   │   └── providers/         # Context 提供者
│   ├── lib/
│   │   ├── supabase/          # Supabase 客户端
│   │   ├── api/               # API 客户端和辅助函数
│   │   ├── middleware/        # 中间件工具
│   │   ├── utils/             # 辅助函数
│   │   ├── hooks/             # 自定义 React hooks
│   │   └── validations/       # Zod 验证模式
│   ├── types/
│   │   ├── database.ts        # Supabase 数据库类型
│   │   ├── api.ts             # API 类型
│   │   └── index.ts           # 共享类型
│   └── styles/                # 全局样式
├── public/                    # 静态文件
├── docs/                      # 文档
│   └── PRD_COMPLETE.md        # 完整产品需求文档
└── tests/                     # 测试 (未来)
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 生产环境构建
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint
- `npm run format` - 使用 Prettier 格式化代码

## 功能特性

### 已完成功能 ✅

**用户认证系统**

- Email + Password 登录/注册
- WeChat OAuth 登录
- 游客模式（临时访问）
- 密码重置功能

**音频播放器**

- 基础播放控制（播放/暂停、进度条、音量）
- 变速播放（0.5x - 2.0x）
- AB 循环重复
- 断点续播
- 字幕显示（英文/中文/双语）
- 播放列表管理

**内容管理**

- 三层内容结构（教材 → 单元 → 课程）
- 多音频支持（每课程可包含多个音频文件）
- 音频/图片上传
- 批量上传功能

**二维码系统**

- 自动生成唯一二维码
- 可选过期时间设置
- 批量导出为 PDF
- 扫码快速访问课程

**用户功能**

- 收藏课程
- 播放历史记录
- 学习统计数据
- 学习日历和连续学习天数

**管理后台**

- 用户管理（查看、暂停、封禁）
- 内容管理（教材、单元、课程、音频）
- 媒体库管理
- 数据分析仪表盘
- 审计日志
- 系统设置

**API 接口**

- RESTful API 设计
- JWT 认证
- 分页支持
- 完整的错误处理

### 计划中功能 🔄

**第二阶段**

- 手机号 + 短信验证登录
- 学习报告（周报/月报）
- 成就徽章系统
- 报告分享（图片/PDF 导出）

**第三阶段**

- PWA 支持（离线播放）
- 高级数据分析
- 社交功能（评论、讨论）
- 游戏化元素（排行榜）

**第四阶段**

- 移动原生应用
- AI 语音评测
- 个性化学习路径
- 家长/教师角色

## 系统架构

### 三层内容结构

```
教材 (Textbook)
├── 单元 1 (Unit)
│   ├── 课程 1 (Lesson)
│   │   ├── 音频文件 (Audios)
│   │   ├── 字幕
│   │   └── 二维码
│   ├── 课程 2
│   └── ...
├── 单元 2
└── ...
```

### 数据库设计

核心数据表：

- **users** - 用户信息（学生、管理员）
- **textbooks** - 教材信息
- **units** - 单元信息
- **lessons** - 课程信息
- **audios** - 音频文件（支持多音频）
- **favorites** - 用户收藏
- **play_history** - 播放历史
- **learning_stats** - 学习统计
- **operation_logs** - 审计日志

详细设计请参考 [PRD_COMPLETE.md](./docs/PRD_COMPLETE.md)。

## 安全特性

- JWT 令牌认证
- 行级安全策略 (RLS)
- HTTPS 加密传输
- bcrypt 密码哈希
- CORS 和速率限制
- XSS 和 CSRF 防护
- 输入验证（Zod schemas）

## 性能优化

- TanStack Query 客户端缓存
- Redis 服务端缓存
- CDN 加速（音频文件）
- 代码分割和懒加载
- 图片优化（Next.js Image）
- 数据库索引优化

## 贡献指南

1. 创建功能分支：`git checkout -b feature/your-feature`
2. 提交更改：`git commit -m 'feat: add some feature'`
3. 推送分支：`git push origin feature/your-feature`
4. 提交 Pull Request

### 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式化
refactor: 代码重构
test: 添加测试
chore: 更新依赖
```

## 许可证

私有项目 - 保留所有权利

## 支持

如有问题，请联系开发团队。
