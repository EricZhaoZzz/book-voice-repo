# 英语听力音频播放平台 - 产品需求文档 (PRD)

## 1. 项目概述

### 1.1 项目背景

为中小学生提供一个便捷的英语听力学习平台，通过扫码快速访问课本配套音频，支持多种学习场景（课堂教学、家庭自学、课后复习）。

### 1.2 产品定位

- **核心价值**：让学生随时随地通过扫码访问英语听力资源
- **目标用户**：小学生（6-12岁）、中学生（13-18岁）
- **使用场景**：纸质课本配套、课堂教学、分享学习、快速访问

### 1.3 产品目标

- 提供简单易用的音频播放体验
- 支持扫码快速定位到具体章节
- 记录学习进度，生成学习报告
- 支持内容持续增长和扩展

---

## 2. 用户角色与权限

### 2.1 学生角色

**权限范围：**

- 浏览和播放已授权的音频内容
- 使用播放器功能（变速、AB循环、断点续播）
- 查看字幕/文本内容
- 收藏喜欢的音频
- 查看个人学习进度和报告
- 通过扫码快速访问章节

**数据访问：**

- 只能访问已授权的课本和章节
- 可以查看自己的学习数据

### 2.2 管理员角色

**权限范围：**

- 管理所有音频内容（上传、编辑、删除）
- 管理课本、单元、课程的组织结构
- 生成和管理二维码
- 批量导出二维码图片
- 管理用户账号
- 查看全局数据统计
- 配置系统设置

**数据访问：**

- 完整的内容管理权限
- 全局用户数据和统计报告

---

## 3. 功能需求

### 3.1 用户系统

#### 3.1.1 注册登录

**学生注册：**

- 手机号/邮箱注册
- 设置用户名和密码
- 填写基本信息（年级、学校可选）
- 验证码验证

**登录方式：**

- 账号密码登录
- 手机验证码登录
- 记住登录状态（7天/30天）

**密码管理：**

- 忘记密码找回
- 修改密码
- 密码强度要求：至少6位，包含字母和数字

#### 3.1.2 个人中心

- 查看和编辑个人信息
- 查看学习统计数据
- 管理收藏列表
- 查看学习历史
- 退出登录

### 3.2 内容组织结构

#### 3.2.1 三层结构设计

```
课本（Textbook）
├── 单元1（Unit）
│   ├── 课程1（Lesson）
│   │   ├── 音频文件
│   │   ├── 字幕文本
│   │   └── 二维码
│   ├── 课程2
│   └── ...
├── 单元2
└── ...
```

**课本属性：**

- 课本名称（如：人教版小学英语三年级上册）
- 封面图片
- 年级标签
- 出版社
- 版本号
- 创建时间

**单元属性：**

- 单元名称（如：Unit 1 - Hello）
- 单元序号
- 单元描述
- 所属课本

**课程属性：**

- 课程名称（如：Lesson 1 - Greetings）
- 课程序号
- 音频文件URL
- 音频时长
- 字幕文本
- 二维码URL
- 所属单元

### 3.3 音频播放器

#### 3.3.1 基础播放功能

- 播放/暂停
- 进度条拖动
- 音量调节
- 显示当前播放时间和总时长
- 上一曲/下一曲（单元内切换）

#### 3.3.2 高级播放功能

**变速播放：**

- 支持速度：0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x
- 保持音调不变
- 记住用户偏好设置

**AB循环：**

- 设置A点（起始点）
- 设置B点（结束点）
- 循环播放AB区间
- 显示循环次数
- 清除AB点重新设置

**断点续播：**

- 自动记录播放位置
- 下次打开继续播放
- 支持多个音频独立记录
- 播放完成后清除断点

**字幕/文本显示：**

- 同步显示当前播放内容的文本
- 支持中英文对照
- 点击文本跳转到对应位置
- 字体大小调节

#### 3.3.3 播放列表

- 显示当前单元的所有课程
- 高亮当前播放项
- 点击切换播放
- 显示播放状态图标

### 3.4 扫码功能

#### 3.4.1 二维码生成

**自动生成：**

- 每个课程创建时自动生成唯一二维码
- 二维码包含课程ID和访问令牌
- URL格式：`https://domain.com/play?code=XXXXXX`

**批量生成导出：**

- 管理员可选择课本/单元批量生成
- 导出为PDF文件（A4纸，每页6个二维码）
- 包含课程名称和二维码
- 支持自定义布局模板

**自定义样式：**

- 添加Logo（中心位置）
- 自定义颜色
- 调整大小
- 添加边框和标题

#### 3.4.2 扫码访问流程

1. 用户扫描二维码
2. 跳转到播放页面
3. 如未登录，提示登录（可选择游客模式）
4. 验证访问权限
5. 直接播放对应音频

#### 3.4.3 分享功能

- 生成课程分享链接
- 生成分享二维码
- 设置分享有效期（可选）
- 分享到微信、QQ等社交平台

### 3.5 收藏功能

- 收藏喜欢的课程
- 收藏列表管理
- 快速访问收藏内容
- 取消收藏

### 3.6 学习数据统计

#### 3.6.1 学生端数据

**学习进度追踪：**

- 已学习课程数量
- 学习总时长
- 连续学习天数
- 本周学习时长
- 学习日历热力图

**学习报告：**

- 每周学习报告
- 每月学习报告
- 学习趋势图表
- 课程完成度统计

#### 3.6.2 管理员端数据

**播放数据统计：**

- 每个音频的播放次数
- 热门音频排行
- 用户活跃度统计
- 新增用户趋势

**数据导出：**

- 导出用户学习数据
- 导出播放统计报表
- 支持Excel和CSV格式

### 3.7 后台管理系统

#### 3.7.1 内容管理

**课本管理：**

- 创建/编辑/删除课本
- 上传封面图片
- 设置课本属性
- 课本列表查看

**单元管理：**

- 在课本下创建单元
- 编辑单元信息
- 调整单元顺序
- 删除单元

**课程管理：**

- 在单元下创建课程
- 上传音频文件
- 上传字幕文本（SRT/VTT格式）
- 编辑课程信息
- 调整课程顺序
- 删除课程

#### 3.7.2 音频文件管理

**上传功能：**

- 支持MP3、M4A、WAV格式
- 单个文件最大100MB
- 批量上传（最多20个）
- 上传进度显示
- 自动转码为统一格式

**存储管理：**

- 云存储（Supabase Storage）
- CDN加速
- 自动备份
- 存储空间统计

#### 3.7.3 二维码管理

- 查看所有二维码
- 批量生成二维码
- 自定义二维码样式
- 导出二维码PDF
- 二维码使用统计

#### 3.7.4 用户管理

- 用户列表查看
- 用户详情查看
- 禁用/启用用户
- 重置用户密码
- 用户学习数据查看

#### 3.7.5 系统设置

- 网站基本信息
- 上传文件限制
- 访问控制设置
- 邮件通知配置

---

## 4. 技术架构

### 4.1 技术栈选型

#### 4.1.1 前端技术

**框架：Next.js 14+**

- 使用App Router
- 服务端渲染（SSR）
- 静态生成（SSG）
- API Routes

**UI框架：**

- React 18+
- TypeScript
- Tailwind CSS
- Shadcn/ui组件库

**状态管理：**

- Zustand（轻量级状态管理）
- React Query（服务端状态）

**音频播放：**

- Howler.js（音频播放库）
- WaveSurfer.js（波形显示，可选）

**二维码：**

- qrcode.react（生成二维码）
- html2canvas + jsPDF（导出PDF）

#### 4.1.2 后端技术

**BaaS平台：Supabase**

- PostgreSQL数据库
- 实时订阅
- 身份认证
- 文件存储
- Edge Functions

**优势：**

- 开箱即用的认证系统
- 实时数据同步
- 自动生成RESTful API
- 内置文件存储和CDN
- Row Level Security（行级安全）

#### 4.1.3 部署方案

**前端部署：**

- Vercel（推荐）或自建服务器
- 自动CI/CD
- 全球CDN加速

**后端部署：**

- Supabase Cloud（托管服务）
- 或自托管Supabase

**文件存储：**

- Supabase Storage
- CDN加速

### 4.2 数据库设计

#### 4.2.1 核心表结构

**users（用户表）**

```sql
- id: uuid (PK)
- email: string (unique)
- phone: string (unique, nullable)
- username: string
- avatar_url: string (nullable)
- grade: string (nullable)
- school: string (nullable)
- role: enum ('student', 'admin')
- created_at: timestamp
- updated_at: timestamp
```

**textbooks（课本表）**

```sql
- id: uuid (PK)
- name: string
- cover_url: string (nullable)
- grade: string
- publisher: string
- version: string
- description: text (nullable)
- created_by: uuid (FK -> users.id)
- created_at: timestamp
- updated_at: timestamp
```

**units（单元表）**

```sql
- id: uuid (PK)
- textbook_id: uuid (FK -> textbooks.id)
- name: string
- order: integer
- description: text (nullable)
- created_at: timestamp
- updated_at: timestamp
```

**lessons（课程表）**

```sql
- id: uuid (PK)
- unit_id: uuid (FK -> units.id)
- name: string
- order: integer
- audio_url: string
- audio_duration: integer (秒)
- subtitle_url: string (nullable)
- qr_code_url: string
- qr_code_token: string (unique)
- created_at: timestamp
- updated_at: timestamp
```

**favorites（收藏表）**

```sql
- id: uuid (PK)
- user_id: uuid (FK -> users.id)
- lesson_id: uuid (FK -> lessons.id)
- created_at: timestamp
- UNIQUE(user_id, lesson_id)
```

**play_history（播放历史表）**

```sql
- id: uuid (PK)
- user_id: uuid (FK -> users.id)
- lesson_id: uuid (FK -> lessons.id)
- last_position: integer (秒)
- play_count: integer
- total_duration: integer (累计播放时长)
- last_played_at: timestamp
- created_at: timestamp
- updated_at: timestamp
- UNIQUE(user_id, lesson_id)
```

**learning_stats（学习统计表）**

```sql
- id: uuid (PK)
- user_id: uuid (FK -> users.id)
- date: date
- total_duration: integer (当天学习时长)
- lessons_completed: integer (完成课程数)
- created_at: timestamp
- UNIQUE(user_id, date)
```

**play_logs（播放日志表）**

```sql
- id: uuid (PK)
- user_id: uuid (FK -> users.id, nullable)
- lesson_id: uuid (FK -> lessons.id)
- duration: integer (本次播放时长)
- speed: float (播放速度)
- completed: boolean (是否播放完成)
- created_at: timestamp
```

#### 4.2.2 索引设计

- users: email, phone
- textbooks: created_by
- units: textbook_id, order
- lessons: unit_id, order, qr_code_token
- favorites: user_id, lesson_id
- play_history: user_id, lesson_id, last_played_at
- learning_stats: user_id, date
- play_logs: user_id, lesson_id, created_at

### 4.3 API设计

#### 4.3.1 认证相关

```
POST /api/auth/register - 用户注册
POST /api/auth/login - 用户登录
POST /api/auth/logout - 用户登出
POST /api/auth/reset-password - 重置密码
GET /api/auth/me - 获取当前用户信息
```

#### 4.3.2 课本管理

```
GET /api/textbooks - 获取课本列表
GET /api/textbooks/:id - 获取课本详情
POST /api/textbooks - 创建课本（管理员）
PUT /api/textbooks/:id - 更新课本（管理员）
DELETE /api/textbooks/:id - 删除课本（管理员）
```

#### 4.3.3 单元管理

```
GET /api/textbooks/:id/units - 获取课本的单元列表
POST /api/units - 创建单元（管理员）
PUT /api/units/:id - 更新单元（管理员）
DELETE /api/units/:id - 删除单元（管理员）
PUT /api/units/:id/reorder - 调整单元顺序（管理员）
```

#### 4.3.4 课程管理

```
GET /api/units/:id/lessons - 获取单元的课程列表
GET /api/lessons/:id - 获取课程详情
POST /api/lessons - 创建课程（管理员）
PUT /api/lessons/:id - 更新课程（管理员）
DELETE /api/lessons/:id - 删除课程（管理员）
PUT /api/lessons/:id/reorder - 调整课程顺序（管理员）
```

#### 4.3.5 播放相关

```
GET /api/play?code=xxx - 通过二维码token获取课程
POST /api/play/history - 更新播放历史
GET /api/play/history - 获取播放历史
POST /api/play/log - 记录播放日志
```

#### 4.3.6 收藏相关

```
GET /api/favorites - 获取收藏列表
POST /api/favorites - 添加收藏
DELETE /api/favorites/:id - 取消收藏
```

#### 4.3.7 统计相关

```
GET /api/stats/user - 获取用户学习统计
GET /api/stats/lessons - 获取课程播放统计（管理员）
GET /api/stats/users - 获取用户活跃统计（管理员）
```

#### 4.3.8 二维码相关

```
POST /api/qrcode/generate - 生成二维码
POST /api/qrcode/batch - 批量生成二维码
POST /api/qrcode/export - 导出二维码PDF
```

#### 4.3.9 文件上传

```
POST /api/upload/audio - 上传音频文件
POST /api/upload/image - 上传图片
POST /api/upload/subtitle - 上传字幕文件
```

### 4.4 安全设计

#### 4.4.1 认证与授权

**认证方式：**

- JWT Token认证
- Supabase Auth
- Session管理

**授权策略：**

- Row Level Security（RLS）
- 基于角色的访问控制（RBAC）
- API级别权限验证

#### 4.4.2 数据安全

**传输安全：**

- HTTPS强制加密
- API请求签名
- CORS配置

**存储安全：**

- 密码加密存储（bcrypt）
- 敏感数据加密
- 定期数据备份

**访问控制：**

- 内容访问权限验证
- 防止未授权访问
- 请求频率限制

#### 4.4.3 防护措施

- SQL注入防护
- XSS防护
- CSRF防护
- 文件上传安全检查
- 请求频率限制（Rate Limiting）

### 4.5 性能优化

#### 4.5.1 前端优化

- 代码分割（Code Splitting）
- 懒加载（Lazy Loading）
- 图片优化（Next.js Image）
- 缓存策略（SWR）
- CDN加速

#### 4.5.2 后端优化

- 数据库查询优化
- 索引优化
- 连接池管理
- 缓存策略（Redis可选）

#### 4.5.3 音频优化

- 音频文件压缩
- 流式传输
- CDN分发
- 预加载策略

---

## 5. UI/UX设计

### 5.1 设计风格

#### 5.1.1 卡通/儿童风格

**色彩方案：**

- 主色：明亮的蓝色（#4A90E2）
- 辅助色：温暖的橙色（#F5A623）
- 成功色：清新的绿色（#7ED321）
- 警告色：柔和的黄色（#F8E71C）
- 错误色：友好的红色（#D0021B）

**字体：**

- 标题：圆润的无衬线字体
- 正文：易读的黑体
- 字号：较大，适合儿童阅读

**图标：**

- 圆润可爱的图标风格
- 使用插画元素
- 动画效果

**布局：**

- 大按钮，易于点击
- 清晰的视觉层次
- 充足的留白
- 卡片式设计

### 5.2 页面设计

#### 5.2.1 首页

**布局：**

- 顶部导航栏（Logo、搜索、用户头像）
- 课本列表（网格布局）
- 每个课本显示封面、名称、年级

**交互：**

- 点击课本进入单元列表
- 搜索课本
- 筛选（年级、出版社）

#### 5.2.2 课本详情页

**布局：**

- 课本信息（封面、名称、描述）
- 单元列表（手风琴或卡片）
- 每个单元显示课程列表

**交互：**

- 展开/收起单元
- 点击课程进入播放页

#### 5.2.3 播放页

**布局：**

- 顶部：课程信息（名称、所属单元）
- 中部：播放器
  - 播放/暂停按钮（大）
  - 进度条
  - 时间显示
  - 音量控制
  - 速度选择
  - AB循环按钮
- 底部：字幕/文本显示区域
- 侧边栏：播放列表

**交互：**

- 播放控制
- 进度拖动
- 速度调节
- AB循环设置
- 收藏按钮
- 分享按钮

#### 5.2.4 个人中心

**布局：**

- 用户信息卡片
- 学习统计卡片
  - 学习时长
  - 学习天数
  - 完成课程数
- 功能入口
  - 收藏列表
  - 学习历史
  - 学习报告
  - 设置

#### 5.2.5 后台管理

**布局：**

- 侧边栏导航
  - 仪表盘
  - 内容管理
  - 用户管理
  - 数据统计
  - 系统设置
- 主内容区
  - 表格列表
  - 表单编辑
  - 数据图表

### 5.3 响应式设计

#### 5.3.1 断点设置

- 移动端：< 768px
- 平板：768px - 1024px
- 桌面：> 1024px

#### 5.3.2 适配策略

**移动端：**

- 单列布局
- 底部导航栏
- 全屏播放器
- 手势操作

**平板：**

- 两列布局
- 侧边栏导航
- 优化的播放器

**桌面：**

- 多列布局
- 完整功能
- 键盘快捷键

---

## 6. 开发计划

### 6.1 MVP阶段（第一阶段）

**核心功能：**

- 用户注册登录
- 课本、单元、课程的三层结构
- 基础音频播放（播放/暂停、进度条）
- 扫码访问功能
- 简单的后台管理（内容上传）

**技术实现：**

- Next.js项目搭建
- Supabase配置
- 基础数据库表
- 简单的UI界面

**目标：**

- 验证核心功能可行性
- 收集用户反馈

### 6.2 第二阶段

**新增功能：**

- 变速播放
- AB循环
- 断点续播
- 字幕显示
- 收藏功能
- 播放历史

**优化：**

- UI/UX优化
- 性能优化
- 移动端适配

### 6.3 第三阶段

**新增功能：**

- 学习进度追踪
- 学习报告
- 数据统计
- 二维码批量生成和导出
- 完善的后台管理

**优化：**

- 安全加固
- 性能优化
- 用户体验优化

### 6.4 后续迭代

**可能的功能：**

- 社交功能（评论、讨论）
- 离线播放
- 家长角色
- 教师角色
- 学习任务系统
- 成就系统
- AI语音评测

---

## 7. 非功能需求

### 7.1 性能要求

- 页面加载时间 < 2秒
- 音频播放延迟 < 500ms
- 支持1000+并发用户
- 数据库查询响应 < 100ms

### 7.2 可用性要求

- 系统可用性 > 99.5%
- 定期备份（每日）
- 灾难恢复计划

### 7.3 兼容性要求

**浏览器：**

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

**移动设备：**

- iOS 13+
- Android 8+

### 7.4 可扩展性

- 支持横向扩展
- 模块化设计
- 插件化架构

---

## 8. 风险与挑战

### 8.1 技术风险

- 音频文件存储成本
- 大量并发播放的带宽成本
- 移动端兼容性问题

**应对措施：**

- 使用CDN降低带宽成本
- 音频文件压缩
- 充分测试移动端

### 8.2 业务风险

- 版权问题
- 用户增长缓慢
- 内容质量参差不齐

**应对措施：**

- 明确版权协议
- 制定推广计划
- 内容审核机制

### 8.3 安全风险

- 数据泄露
- 恶意攻击
- 账号被盗

**应对措施：**

- 完善的安全措施
- 定期安全审计
- 用户教育

---

## 9. 成功指标

### 9.1 用户指标

- 注册用户数
- 日活跃用户（DAU）
- 月活跃用户（MAU）
- 用户留存率

### 9.2 使用指标

- 音频播放次数
- 平均学习时长
- 扫码使用次数
- 收藏数量

### 9.3 业务指标

- 课本数量
- 音频数量
- 用户满意度
- NPS评分

---

## 10. 附录

### 10.1 术语表

- **课本（Textbook）**：教材的数字化版本
- **单元（Unit）**：课本中的章节
- **课程（Lesson）**：具体的听力音频内容
- **AB循环**：重复播放指定区间
- **断点续播**：记住上次播放位置

### 10.2 参考资料

- Next.js官方文档
- Supabase官方文档
- Howler.js文档
- Material Design指南

### 10.3 更新日志

- v1.0 - 2026-01-15：初始版本创建
