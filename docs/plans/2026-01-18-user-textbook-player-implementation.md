# 用户端课本、单元、音频播放功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现用户端的课本浏览、单元查看、课程列表和音频播放功能（Phase 1 MVP）

**Architecture:** 使用Next.js App Router构建用户端页面，TanStack Query管理服务端数据，复用已有的AudioPlayer和SubtitleDisplay组件。采用feature-based组织结构，每个功能模块独立管理hooks和组件。

**Tech Stack:** Next.js 16, React 19, TypeScript 5, TanStack Query v5, Shadcn/ui, Tailwind CSS, Howler.js

---

## Task 1: 创建数据层 - Textbooks Hooks

**Files:**

- Create: `src/features/textbooks/hooks/use-textbooks.ts`
- Create: `src/features/textbooks/hooks/use-textbook.ts`
- Create: `src/features/textbooks/hooks/use-units.ts`
- Create: `src/features/textbooks/hooks/index.ts`

**Step 1: 创建 useTextbooks hook**

```typescript
// src/features/textbooks/hooks/use-textbooks.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Textbook } from "@/types";

interface UseTextbooksOptions {
  grade?: string;
}

export function useTextbooks(options: UseTextbooksOptions = {}) {
  return useQuery({
    queryKey: ["textbooks", options.grade],
    queryFn: async () => {
      let query = supabase.from("textbooks").select("*").order("created_at", { ascending: false });

      if (options.grade) {
        query = query.eq("grade", options.grade);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Textbook[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Step 2: 创建 useTextbook hook**

```typescript
// src/features/textbooks/hooks/use-textbook.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Textbook } from "@/types";

export function useTextbook(id: string | undefined) {
  return useQuery({
    queryKey: ["textbook", id],
    queryFn: async () => {
      if (!id) throw new Error("Textbook ID is required");

      const { data, error } = await supabase.from("textbooks").select("*").eq("id", id).single();

      if (error) throw error;
      return data as Textbook;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

**Step 3: 创建 useUnits hook**

```typescript
// src/features/textbooks/hooks/use-units.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Unit } from "@/types";

export function useUnits(textbookId: string | undefined) {
  return useQuery({
    queryKey: ["units", textbookId],
    queryFn: async () => {
      if (!textbookId) throw new Error("Textbook ID is required");

      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("textbook_id", textbookId)
        .order("order_num", { ascending: true });

      if (error) throw error;
      return data as Unit[];
    },
    enabled: !!textbookId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

**Step 4: 创建 index 导出文件**

```typescript
// src/features/textbooks/hooks/index.ts
export { useTextbooks } from "./use-textbooks";
export { useTextbook } from "./use-textbook";
export { useUnits } from "./use-units";
```

**Step 5: 提交**

```bash
git add src/features/textbooks/hooks/
git commit -m "feat: add textbooks data hooks"
```

---

## Task 2: 创建数据层 - Lessons Hooks

**Files:**

- Create: `src/features/lessons/hooks/use-lessons.ts`
- Create: `src/features/lessons/hooks/use-lesson.ts`
- Create: `src/features/lessons/hooks/index.ts`

**Step 1: 创建 useLessons hook**

```typescript
// src/features/lessons/hooks/use-lessons.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Lesson } from "@/types";

export function useLessons(unitId: string | undefined) {
  return useQuery({
    queryKey: ["lessons", unitId],
    queryFn: async () => {
      if (!unitId) throw new Error("Unit ID is required");

      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("unit_id", unitId)
        .order("order_num", { ascending: true });

      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!unitId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

**Step 2: 创建 useLesson hook**

```typescript
// src/features/lessons/hooks/use-lesson.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { LessonWithDetails } from "@/types";

export function useLesson(id: string | undefined) {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: async () => {
      if (!id) throw new Error("Lesson ID is required");

      const { data, error } = await supabase
        .from("lessons")
        .select(
          `
          *,
          unit:units(
            *,
            textbook:textbooks(*)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as LessonWithDetails;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

**Step 3: 创建 index 导出文件**

```typescript
// src/features/lessons/hooks/index.ts
export { useLessons } from "./use-lessons";
export { useLesson } from "./use-lesson";
```

**Step 4: 提交**

```bash
git add src/features/lessons/hooks/
git commit -m "feat: add lessons data hooks"
```

---

## Task 3: 创建主布局

**Files:**

- Create: `src/app/(main)/layout.tsx`
- Create: `src/components/layout/main-nav.tsx`

**Step 1: 创建主导航组件**

```typescript
// src/components/layout/main-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/textbooks", label: "课本", icon: BookOpen },
  { href: "/favorites", label: "收藏", icon: Heart },
  { href: "/profile", label: "我的", icon: User },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Book Voice
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Step 2: 创建主布局**

```typescript
// src/app/(main)/layout.tsx
import { MainNav } from "@/components/layout/main-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

**Step 3: 提交**

```bash
git add src/app/(main)/layout.tsx src/components/layout/main-nav.tsx
git commit -m "feat: add main layout and navigation"
```

---

## Task 4: 创建首页 - 推荐课本

**Files:**

- Create: `src/app/(main)/page.tsx`
- Create: `src/components/textbooks/textbook-card.tsx`

**Step 1: 创建课本卡片组件**

```typescript
// src/components/textbooks/textbook-card.tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Textbook } from "@/types";

interface TextbookCardProps {
  textbook: Textbook;
}

export function TextbookCard({ textbook }: TextbookCardProps) {
  return (
    <Link href={`/textbooks/${textbook.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-[3/4] relative bg-muted">
          {textbook.cover_url ? (
            <Image
              src={textbook.cover_url}
              alt={textbook.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              暂无封面
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium truncate">{textbook.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{textbook.grade}</Badge>
            <span className="text-xs text-muted-foreground truncate">
              {textbook.publisher}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

**Step 2: 创建首页**

```typescript
// src/app/(main)/page.tsx
"use client";

import { useTextbooks } from "@/features/textbooks/hooks";
import { TextbookCard } from "@/components/textbooks/textbook-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data: textbooks, isLoading } = useTextbooks();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">推荐课本</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {textbooks?.map((textbook) => (
              <TextbookCard key={textbook.id} textbook={textbook} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

**Step 3: 提交**

```bash
git add src/app/(main)/page.tsx src/components/textbooks/textbook-card.tsx
git commit -m "feat: add home page with textbook grid"
```

---

## Task 5: 创建课本详情页

**Files:**

- Create: `src/app/(main)/textbooks/[id]/page.tsx`
- Create: `src/components/units/unit-card.tsx`

**Step 1: 创建单元卡片组件**

```typescript
// src/components/units/unit-card.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import type { Unit } from "@/types";

interface UnitCardProps {
  unit: Unit;
  textbookId: string;
}

export function UnitCard({ unit, textbookId }: UnitCardProps) {
  return (
    <Link href={`/textbooks/${textbookId}/units/${unit.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{unit.name}</span>
            <ChevronRight className="h-5 w-5 flex-shrink-0" />
          </CardTitle>
        </CardHeader>
        {unit.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {unit.description}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
```

**Step 2: 创建课本详情页**

```typescript
// src/app/(main)/textbooks/[id]/page.tsx
"use client";

import { use } from "react";
import Image from "next/image";
import { useTextbook, useUnits } from "@/features/textbooks/hooks";
import { UnitCard } from "@/components/units/unit-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TextbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: textbook, isLoading: textbookLoading } = useTextbook(id);
  const { data: units, isLoading: unitsLoading } = useUnits(id);

  if (textbookLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!textbook) return <div>课本不存在</div>;

  return (
    <div className="space-y-8">
      <div className="flex gap-6">
        <div className="w-32 h-44 relative bg-muted rounded-lg overflow-hidden flex-shrink-0">
          {textbook.cover_url ? (
            <Image
              src={textbook.cover_url}
              alt={textbook.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              暂无封面
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{textbook.name}</h1>
          <div className="flex gap-4 text-sm text-muted-foreground mb-4">
            <span>年级: {textbook.grade}</span>
            <span>出版社: {textbook.publisher}</span>
            <span>版本: {textbook.version}</span>
          </div>
          {textbook.description && (
            <p className="text-muted-foreground">{textbook.description}</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">单元列表</h2>
        {unitsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : units && units.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} textbookId={id} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">暂无单元</p>
        )}
      </div>
    </div>
  );
}
```

**Step 3: 提交**

```bash
git add src/app/(main)/textbooks/ src/components/units/
git commit -m "feat: add textbook detail page with unit grid"
```

---

## Task 6: 创建单元课程列表页

**Files:**

- Create: `src/app/(main)/textbooks/[id]/units/[unitId]/page.tsx`
- Create: `src/components/lessons/lesson-item.tsx`

**Step 1: 创建课程项组件**

```typescript
// src/components/lessons/lesson-item.tsx
import Link from "next/link";
import { Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Lesson } from "@/types";

interface LessonItemProps {
  lesson: Lesson;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function LessonItem({ lesson }: LessonItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{lesson.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(lesson.audio_duration)}</span>
            </div>
          </div>
          <Link href={`/play/${lesson.id}`}>
            <Button size="sm">
              <Play className="h-4 w-4 mr-1" />
              播放
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: 创建单元课程列表页**

```typescript
// src/app/(main)/textbooks/[id]/units/[unitId]/page.tsx
"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessons } from "@/features/lessons/hooks";
import { LessonItem } from "@/components/lessons/lesson-item";
import { Skeleton } from "@/components/ui/skeleton";

export default function UnitLessonsPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const { id, unitId } = use(params);
  const { data: lessons, isLoading } = useLessons(unitId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/textbooks/${id}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回课本
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">课程列表</h2>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : lessons && lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <LessonItem key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">暂无课程</p>
        )}
      </div>
    </div>
  );
}
```

**Step 3: 提交**

```bash
git add src/app/(main)/textbooks/[id]/units/ src/components/lessons/
git commit -m "feat: add unit lessons list page"
```

---

## Task 7: 创建播放页面

**Files:**

- Create: `src/app/(main)/play/[lessonId]/page.tsx`

**Step 1: 创建播放页面**

```typescript
// src/app/(main)/play/[lessonId]/page.tsx
"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLesson } from "@/features/lessons/hooks";
import { AudioPlayer } from "@/features/player/components/AudioPlayer";
import { SubtitleDisplay } from "@/features/player/components/SubtitleDisplay";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlayPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const { data: lesson, isLoading } = useLesson(lessonId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return <div>课程不存在</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/textbooks/${lesson.unit.textbook.id}/units/${lesson.unit_id}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回课程列表
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{lesson.name}</h1>
        <p className="text-muted-foreground">
          {lesson.unit.textbook.name} - {lesson.unit.name}
        </p>
      </div>

      <AudioPlayer lesson={lesson} />

      {lesson.subtitle_text && (
        <SubtitleDisplay subtitles={lesson.subtitle_text as any} />
      )}
    </div>
  );
}
```

**Step 2: 提交**

```bash
git add src/app/(main)/play/
git commit -m "feat: add lesson play page"
```

---

## Task 8: 添加移动端底部导航

**Files:**

- Modify: `src/components/layout/main-nav.tsx`

**Step 1: 更新主导航组件添加移动端底部导航**

```typescript
// src/components/layout/main-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/textbooks", label: "课本", icon: BookOpen },
  { href: "/favorites", label: "收藏", icon: Heart },
  { href: "/profile", label: "我的", icon: User },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Book Voice
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
```

**Step 2: 更新主布局添加底部导航间距**

```typescript
// src/app/(main)/layout.tsx
import { MainNav } from "@/components/layout/main-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <main className="flex-1 container mx-auto px-4 py-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
```

**Step 3: 提交**

```bash
git add src/components/layout/main-nav.tsx src/app/(main)/layout.tsx
git commit -m "feat: add mobile bottom navigation"
```

---

## 实现完成

Phase 1 MVP 核心功能已完成：

- ✅ 数据层 hooks（textbooks, units, lessons）
- ✅ 主布局和导航（桌面端 + 移动端）
- ✅ 首页（推荐课本网格）
- ✅ 课本详情页（单元卡片网格）
- ✅ 单元课程列表页
- ✅ 播放页面（复用AudioPlayer和SubtitleDisplay）

**下一步（Phase 2）:**

- 收藏功能
- 播放进度保存和恢复
- 播放列表侧边栏
- 个人中心
