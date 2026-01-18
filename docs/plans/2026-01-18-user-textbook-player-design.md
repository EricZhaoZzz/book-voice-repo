# 用户端课本、单元、音频播放功能设计

**日期:** 2026-01-18
**状态:** 设计完成，待实现
**相关文档:** docs/PRD_COMPLETE.md

## 概述

实现用户端的课本浏览、单元查看、课程列表和音频播放功能。用户可以浏览课本、查看单元、播放音频、收藏课程、查看学习历史。

## 设计决策

### 首页布局

- 展示最近3-5个学习记录（带进度条和继续学习按钮）
- 按年级分类的推荐课本网格

### 课本详情页

- 单元以卡片网格形式展示（4列响应式布局）
- 点击单元卡片进入该单元的课程列表页

### 播放页面

- 简洁模式：播放器和字幕为主
- 播放列表通过侧边栏（Sheet）切换显示
- 复用已有的AudioPlayer和SubtitleDisplay组件

### 收藏功能

- 课程卡片和播放页面都有收藏按钮
- 首页和个人中心都能访问收藏列表

## 路由架构

```
src/app/(main)/
├── layout.tsx              # 主布局（导航栏、用户菜单）
├── page.tsx                # 首页（最近学习 + 推荐课本）
├── textbooks/
│   ├── page.tsx           # 课本列表页（可选）
│   └── [id]/
│       ├── page.tsx       # 课本详情（单元卡片网格）
│       └── units/[unitId]/
│           └── page.tsx   # 单元课程列表
├── play/
│   ├── page.tsx           # QR码扫描入口（/play?code=xxx）
│   └── [lessonId]/
│       └── page.tsx       # 播放页面
├── favorites/
│   └── page.tsx           # 收藏列表
└── profile/
    └── page.tsx           # 个人中心（学习统计、历史）
```

## 数据层设计

### API Hooks

**课本相关 (src/features/textbooks/hooks/):**

- `useTextbooks()` - 获取课本列表（支持年级筛选）
- `useTextbook(id)` - 获取单个课本详情
- `useUnits(textbookId)` - 获取课本的单元列表
- `useLessons(unitId)` - 获取单元的课程列表
- `useLesson(id)` - 获取单个课程详情

**用户数据 (src/features/user/hooks/):**

- `useRecentLessons()` - 获取最近学习记录
- `useFavorites()` - 获取收藏列表
- `useToggleFavorite(lessonId)` - 切换收藏状态
- `usePlayHistory(lessonId)` - 获取播放历史
- `useSaveProgress(lessonId)` - 保存播放进度

### 缓存策略

- 课本列表：5分钟 staleTime
- 课程详情：10分钟 staleTime
- 用户数据：1分钟 staleTime，实时更新

## 核心组件

### 首页组件 (src/app/(main)/page.tsx)

- `RecentLessons` - 最近学习记录卡片
- `RecommendedTextbooks` - 推荐课本网格

### 课本详情组件 (src/app/(main)/textbooks/[id]/page.tsx)

- `TextbookHeader` - 课本信息头部
- `UnitGrid` - 单元卡片网格
- `UnitCard` - 单元卡片

### 课程列表组件 (src/app/(main)/textbooks/[id]/units/[unitId]/page.tsx)

- `LessonList` - 课程列表
- `LessonItem` - 课程项（带播放和收藏按钮）

### 播放页面组件 (src/app/(main)/play/[lessonId]/page.tsx)

- `AudioPlayer` - 复用已有组件
- `SubtitleDisplay` - 复用已有组件
- `PlaylistDrawer` - 播放列表侧边栏（Sheet）
- `FavoriteButton` - 收藏按钮

## UI/UX细节

### 响应式布局

- 移动端 (<640px): 单列布局，底部导航栏
- 平板 (640-1024px): 2列网格，侧边导航
- 桌面 (>1024px): 4列网格，顶部导航栏

### 交互细节

**收藏按钮:**

- 未收藏：空心心形图标
- 收藏时：填充动画 + 放大效果
- 使用乐观更新

**播放进度:**

- 课程卡片显示进度条
- 80%以上显示"已完成"徽章
- 未开始显示"新"标签

**播放列表侧边栏:**

- 使用Shadcn Sheet组件
- 从右侧滑入
- 高亮当前播放项

**加载状态:**

- 使用Skeleton组件
- 避免内容闪烁

## 错误处理

### 网络错误

- API请求失败：Toast提示 + 重试按钮
- 音频加载失败：错误消息 + 刷新建议
- TanStack Query自动重试3次

### 数据为空状态

- 无课本：空状态插图 + 提示
- 无收藏：引导浏览课本
- 无学习记录：引导开始学习

### 权限和访问控制

- 未登录：可浏览，播放时提示登录（Guest模式）
- 订阅过期：显示提示，禁止播放
- QR码过期：显示过期消息

### 播放器边界情况

- 音频损坏：显示错误并跳过
- 网络中断：暂停播放，恢复后继续
- 播放列表为空：禁用导航按钮

## 性能优化

### 代码分割

- 播放器组件懒加载
- Next.js动态导入
- 路由级别自动分割

### 图片优化

- next/image自动优化
- blur placeholder
- 响应式图片

### 数据预取

- 悬停时预取单元数据
- 预加载下一首音频
- TanStack Query prefetch

## 实现优先级

### Phase 1 - 核心浏览和播放 (MVP)

1. 首页（最近学习 + 推荐课本）
2. 课本详情页（单元网格）
3. 单元课程列表页
4. 播放页面（播放器 + 字幕）
5. 基础导航和布局

### Phase 2 - 用户功能

1. 收藏功能（按钮 + 列表页）
2. 播放进度保存和恢复
3. 播放列表侧边栏
4. 个人中心（学习统计）

### Phase 3 - 增强体验

1. QR码扫描入口
2. 搜索功能
3. 骨架屏和加载状态
4. 错误边界和重试机制

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript 5
- TanStack Query v5
- Zustand
- Shadcn/ui
- Tailwind CSS
- Howler.js（已有）

## 依赖关系

- 依赖已实现的AudioPlayer和SubtitleDisplay组件
- 依赖Supabase数据库表（textbooks, units, lessons, favorites, play_history）
- 依赖API路由（/api/v1/textbooks, /api/v1/lessons等）
