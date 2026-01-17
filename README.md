# Book Voice - 英语听力音频平台

面向中小学生的英语听力资源平台，通过扫描二维码快速访问听力内容。

## 技术栈

### 前端

- **Next.js 16** - React 框架，支持 App Router 和 Turbopack
- **React 19** - 最新版 React，性能优化
- **TypeScript 5** - 类型安全
- **Tailwind CSS 3** - 原子化 CSS 框架
- **Shadcn/ui** - 基于 Radix UI 的无障碍组件库
- **TanStack Query v5** - 服务端状态管理
- **Zustand** - 客户端状态管理
- **React Hook Form + Zod** - 表单处理和验证
- **Howler.js** - 音频播放

### 后端

- **Supabase** - 后端即服务
  - PostgreSQL 数据库
  - 身份认证
  - 文件存储 + CDN
  - 行级安全策略 (RLS)

### 开发工具

- **ESLint 9** - 代码检查，使用 flat config
- **Prettier 3** - 代码格式化
- **Husky + lint-staged** - Git hooks 代码质量保障

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
│   │   ├── (auth)/            # 认证路由 (登录、注册)
│   │   ├── (main)/            # 主应用路由
│   │   ├── admin/             # 管理后台 (用户、内容、媒体、设置、日志)
│   │   └── api/               # API 路由
│   ├── features/              # 功能模块
│   │   ├── auth/              # 身份认证
│   │   ├── player/            # 音频播放器
│   │   ├── textbooks/         # 教材管理
│   │   ├── lessons/           # 课程管理
│   │   └── analytics/         # 数据分析
│   ├── components/            # 共享组件
│   │   ├── ui/                # UI 组件 (shadcn)
│   │   └── layout/            # 布局组件
│   ├── lib/                   # 工具库
│   │   ├── supabase/          # Supabase 客户端
│   │   ├── utils/             # 辅助函数
│   │   └── hooks/             # 自定义 hooks
│   ├── types/                 # TypeScript 类型
│   └── styles/                # 全局样式
├── public/                    # 静态文件
├── docs/                      # 文档
└── tests/                     # 测试 (待完善)
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 生产环境构建
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint
- `npm run format` - 使用 Prettier 格式化代码

## 功能特性

### 最近更新

- ✅ **2026-01-17**：管理后台 (Admin Panel) 功能
  - 用户管理：列表、详情、学习统计、过滤分页
  - 内容管理：教科书 → 单元 → 课时 → 音频层级管理
  - Analytics 仪表板：用户统计、学习时长、活跃度
  - 媒体库管理：音频文件浏览和删除
  - 系统设置：站点信息、功能开关、播放设置、安全设置
  - 审计日志：记录所有管理员操作

### 第二阶段

- [ ] 用户认证 (邮箱 + 密码)
- [ ] 游客模式
- [ ] 基础音频播放器
- [ ] 二维码生成和扫描

### 第三阶段

- [ ] 学习统计和报告
- [ ] 批量导出二维码
- [ ] 数据分析仪表盘
- [ ] 用户管理

## 数据库设计

详见 [TECHNICAL_ARCHITECTURE.md](./docs/TECHNICAL_ARCHITECTURE.md)。

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
