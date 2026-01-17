# Admin Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a comprehensive admin panel with user management, analytics dashboard, content management, media library, system settings, and audit logs.

**Architecture:**

- Extend existing admin layout with sidebar navigation for all admin modules
- Use Server Actions for all CRUD operations with proper admin authentication
- Implement role-based access control (user/admin/super_admin)
- Add new database tables for user_stats, learning_records, operation_logs, and audios
- Reuse existing shadcn/ui components and follow established patterns

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Tailwind CSS, Shadcn/ui, TanStack Query, Zod

---

## Phase 1: Database Schema & Types

### Task 1: Add Database Migrations for New Tables

**Files:**

- Create: `supabase/migrations/20250117_admin_schema.sql`
- Modify: `src/types/database.ts`

**Step 1: Write the migration file**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_learning_minutes INT DEFAULT 0,
  total_lessons_completed INT DEFAULT 0,
  total_audio_seconds INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning records table
CREATE TABLE IF NOT EXISTS learning_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  played_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operation logs table
CREATE TABLE IF NOT EXISTS operation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audios table (per lesson)
CREATE TABLE IF NOT EXISTS audios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'main' CHECK (type IN ('main', 'listening', 'practice')),
  audio_url TEXT NOT NULL,
  duration INT,
  order_num INT DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  subtitle_text JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table extensions
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_user ON learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_lesson ON learning_records(lesson_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_module ON operation_logs(module);
CREATE INDEX IF NOT EXISTS idx_operation_logs_user ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created ON operation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audios_lesson ON audios(lesson_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- RLS Policies
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;

-- Admin can access all, users can only access own
CREATE POLICY "Admins can manage user_stats" ON user_stats
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage learning_records" ON learning_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Super admins can manage operation_logs" ON operation_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage audios" ON audios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

**Step 2: Run migration**

Run: `npx supabase db push` or `supabase migration run`
Expected: All new tables created

**Step 3: Generate TypeScript types**

Run: `npx supabase gen types typescript --local > src/types/database.ts`
Expected: New types added for user_stats, learning_records, operation_logs, audios

**Step 4: Verify types**

Check `src/types/database.ts` for new interfaces
Expected: `UserStats`, `LearningRecord`, `OperationLog`, `Audio` types exist

**Step 5: Commit**

```bash
git add supabase/migrations/ src/types/database.ts
git commit -m "feat: add admin panel database schema"
```

---

### Task 2: Update Zod Validation Schemas

**Files:**

- Modify: `src/lib/validations/content.ts`

**Step 1: Read existing validation file**

```typescript
// src/lib/validations/content.ts
// Add new schemas
```

**Step 2: Run test to verify schema**

Run: `npm run lint -- --quiet src/lib/validations/content.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/validations/content.ts
git commit -m "feat: add admin validation schemas"
```

---

## Phase 2: Admin Layout & Navigation

### Task 3: Update Admin Layout with Navigation

**Files:**

- Modify: `src/app/admin/layout.tsx`
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/users/[id]/page.tsx`
- Create: `src/app/admin/content/textbooks/page.tsx` (move existing)
- Create: `src/app/admin/media/page.tsx`
- Create: `src/app/admin/settings/page.tsx`
- Create: `src/app/admin/analytics/page.tsx`
- Create: `src/app/admin/logs/page.tsx`
- Create: `src/app/admin/logs/alerts/page.tsx`

**Step 1: Create navigation component**

```typescript
// src/components/admin/admin-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/content", label: "Content", icon: "📚" },
  { href: "/admin/media", label: "Media", icon: "🎵" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/logs", label: "Logs", icon: "📋" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

**Step 2: Update admin layout**

```typescript
// src/app/admin/layout.tsx
import { AdminNav } from "@/components/admin/admin-nav";
import { checkAdmin } from "./actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdmin();

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/10 p-4">
        <h1 className="text-lg font-bold mb-6 px-2">Admin Panel</h1>
        <AdminNav />
      </aside>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/admin/layout.tsx src/components/admin/
git commit -m "feat: update admin layout with navigation"
```

---

## Phase 3: User Management

### Task 4: Create User List Page

**Files:**

- Create: `src/app/admin/users/page.tsx`
- Modify: `src/app/admin/actions.ts` (add getUsers function)

**Step 1: Add getUsers action**

```typescript
// src/app/admin/actions.ts
export async function getUsers(options: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  await checkAdmin();
  const { search, role, status, page = 1, limit = 20 } = options;

  let query = supabase.from("users").select(
    `
      *,
      user_stats (
        total_learning_minutes,
        total_lessons_completed,
        last_activity_at
      )
    `,
    { count: "exact" }
  );

  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("email", `%${search}%`);

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return { data, count };
}
```

**Step 2: Create user list page**

```typescript
// src/app/admin/users/page.tsx
import { getUsers } from "../actions";
import { UserTable } from "./user-table";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { data, count } = await getUsers({
    search: params.search as string,
    role: params.role as string,
    status: params.status as string,
    page: Number(params.page) || 1,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      <UserTable users={data} total={count} />
    </div>
  );
}
```

**Step 3: Create user table component**

```typescript
// src/app/admin/users/user-table.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/database";

interface UserTableProps {
  users: User[];
  total: number;
}

const roleColors = {
  user: "bg-gray-100 text-gray-800",
  admin: "bg-blue-100 text-blue-800",
  super_admin: "bg-purple-100 text-purple-800",
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-yellow-100 text-yellow-800",
  banned: "bg-red-100 text-red-800",
};

export function UserTable({ users, total }: UserTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Learning Time</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.full_name || "No name"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={roleColors[user.role || "user"]}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[user.status || "active"]}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                {Math.round((user.user_stats?.total_learning_minutes || 0) / 60)}h
              </TableCell>
              <TableCell>
                {user.user_stats?.total_lessons_completed || 0}
              </TableCell>
              <TableCell>
                {user.user_stats?.last_activity_at
                  ? new Date(user.user_stats.last_activity_at).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/admin/users/${user.id}`}>View</a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Step 4: Verify page**

Run: `npm run dev` and navigate to `/admin/users`
Expected: User table renders with all columns

**Step 5: Commit**

```bash
git add src/app/admin/users/ src/app/admin/actions.ts
git commit -m "feat: add user management page"
```

---

### Task 5: Create User Details Page

**Files:**

- Create: `src/app/admin/users/[id]/page.tsx`
- Create: `src/app/admin/users/user-details.tsx`

**Step 1: Create user details page**

```typescript
// src/app/admin/users/[id]/page.tsx
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { checkAdmin } from "../../actions";
import { UserDetails } from "./user-details";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await checkAdmin();
  const { id } = await params;

  const { data: user } = await supabase
    .from("users")
    .select(`
      *,
      user_stats (*),
      learning_records (*, lessons (*, units (*, textbooks (*))))
    `)
    .eq("id", id)
    .single();

  if (!user) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Details</h1>
      <UserDetails user={user} />
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/admin/users/[id]/
git commit -m "feat: add user details page"
```

---

## Phase 4: Analytics Dashboard

### Task 6: Create Analytics Dashboard

**Files:**

- Create: `src/app/admin/analytics/page.tsx`
- Create: `src/components/analytics/metric-card.tsx`
- Create: `src/components/analytics/charts.tsx`

**Step 1: Create analytics actions**

```typescript
// src/app/admin/actions.ts
export async function getAnalyticsData(dateRange: { start: string; end: string }) {
  await checkAdmin();

  // Get total users
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  // Get new users today
  const today = new Date().toISOString().split("T")[0];
  const { count: todayNewUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today);

  // Get active users (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: weeklyActiveUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("last_login_at", sevenDaysAgo);

  // Get learning stats
  const { data: learningStats } = await supabase
    .from("user_stats")
    .select("total_learning_minutes, total_lessons_completed");

  const totalLearningMinutes =
    learningStats?.reduce((sum, s) => sum + (s.total_learning_minutes || 0), 0) || 0;
  const totalLessonsCompleted =
    learningStats?.reduce((sum, s) => sum + (s.total_lessons_completed || 0), 0) || 0;

  // Get content count
  const { count: textbookCount } = await supabase
    .from("textbooks")
    .select("*", { count: "exact", head: true });

  return {
    totalUsers: totalUsers || 0,
    todayNewUsers: todayNewUsers || 0,
    weeklyActiveUsers: weeklyActiveUsers || 0,
    totalLearningMinutes,
    totalLessonsCompleted,
    textbookCount: textbookCount || 0,
  };
}
```

**Step 2: Create analytics page**

```typescript
// src/app/admin/analytics/page.tsx
import { getAnalyticsData } from "../actions";
import { MetricCard } from "@/components/analytics/metric-card";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData({ start: "", end: "" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={data.totalUsers}
          icon="👥"
        />
        <MetricCard
          title="New Today"
          value={data.todayNewUsers}
          icon="🆕"
        />
        <MetricCard
          title="Weekly Active"
          value={data.weeklyActiveUsers}
          icon="📈"
        />
        <MetricCard
          title="Lessons Completed"
          value={data.totalLessonsCompleted}
          icon="✅"
        />
      </div>

      {/* Charts would be added here */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-4">User Growth</h3>
          {/* Chart component placeholder */}
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-4">Learning Time Distribution</h3>
          {/* Chart component placeholder */}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create metric card component**

```typescript
// src/components/analytics/metric-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
}

export function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/app/admin/analytics/ src/components/analytics/
git commit -m "feat: add analytics dashboard"
```

---

## Phase 5: Media Management

### Task 7: Create Media Library Page

**Files:**

- Create: `src/app/admin/media/page.tsx`
- Create: `src/app/admin/media/media-library.tsx`

**Step 1: Create media actions**

```typescript
// src/app/admin/actions.ts
export async function getMediaFiles(options: { type?: string; page?: number; limit?: number }) {
  await checkAdmin();
  const { type, page = 1, limit = 20 } = options;

  // Get audio files from storage
  const { data: files, error } = await supabase.storage.from("audio").list(undefined, {
    limit: limit,
    offset: (page - 1) * limit,
    sortBy: { column: "name", order: "desc" },
  });

  if (error) throw error;

  // Get usage info
  const { data: usage } = await supabase.storage.getUsage("audio");

  return {
    files: files || [],
    total: files?.length || 0,
    usage: usage || { added: 0, limit: 0 },
  };
}

export async function deleteMediaFile(path: string) {
  await checkAdmin();
  const { error } = await supabase.storage.from("audio").remove([path]);
  if (error) throw error;
  revalidatePath("/admin/media");
}
```

**Step 2: Create media page**

```typescript
// src/app/admin/media/page.tsx
import { getMediaFiles } from "../actions";
import { MediaLibrary } from "./media-library";

export default async function MediaPage() {
  const { files, total, usage } = await getMediaFiles({});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Media Library</h1>
      <MediaLibrary files={files} total={total} usage={usage} />
    </div>
  );
}
```

**Step 3: Create media library component**

```typescript
// src/app/admin/media/media-library.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteMediaFile } from "../actions";
import { useState, useTransition } from "react";
import { Progress } from "@/components/ui/progress";

export function MediaLibrary({ files, total, usage }: any) {
  const [isPending, startTransition] = useTransition();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDelete = (path: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      startTransition(async () => {
        await deleteMediaFile(path);
      });
    }
  };

  const usagePercent = usage?.limit
    ? Math.round((usage.added / usage.limit) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Storage Usage</span>
          <span className="text-sm text-muted-foreground">
            {formatSize(usage?.added || 0)} / {formatSize(usage?.limit || 0)}
          </span>
        </div>
        <Progress value={usagePercent} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file: any) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.name}</TableCell>
                <TableCell>{formatSize(file.metadata?.size || 0)}</TableCell>
                <TableCell>
                  {file.created_at
                    ? new Date(file.created_at).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.name)}
                      disabled={isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/app/admin/media/
git commit -m "feat: add media library page"
```

---

## Phase 6: System Settings

### Task 8: Create System Settings Page

**Files:**

- Create: `src/app/admin/settings/page.tsx`
- Create: `src/app/admin/settings/settings-form.tsx`

**Step 1: Create settings actions**

```typescript
// src/app/admin/actions.ts
const SETTINGS_CACHE = new Map<string, any>();

export async function getSettings() {
  await checkAdmin();

  // Cache settings in memory for this request
  if (SETTINGS_CACHE.has("site_settings")) {
    return SETTINGS_CACHE.get("site_settings");
  }

  const { data } = await supabase.from("system_settings").select("*").single();

  const settings = data || {
    site_name: "Book Voice",
    logo_url: "",
    allow_guest_access: false,
    allow_registration: true,
    default_playback_speed: 1,
    auto_play_next: false,
    max_upload_size: 50,
    allowed_formats: "mp3,wav,ogg",
    login_attempts: 5,
    captcha_enabled: false,
  };

  SETTINGS_CACHE.set("site_settings", settings);
  return settings;
}

export async function updateSettings(updates: Record<string, any>) {
  await checkAdmin();

  const { error } = await supabase.from("system_settings").upsert(updates, { onConflict: "key" });

  if (error) throw error;
  SETTINGS_CACHE.delete("site_settings");
  revalidatePath("/admin/settings");
}
```

**Step 2: Create settings page**

```typescript
// src/app/admin/settings/page.tsx
import { getSettings } from "../actions";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">System Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
```

**Step 3: Create settings form component**

```typescript
// src/app/admin/settings/settings-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings } from "../actions";
import { useState, useTransition } from "react";

interface SettingsFormProps {
  settings: Record<string, any>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState(settings);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateSettings(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Site Info */}
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="site_name">Site Name</Label>
            <Input
              id="site_name"
              value={formData.site_name || ""}
              onChange={(e) => handleChange("site_name", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={formData.logo_url || ""}
              onChange={(e) => handleChange("logo_url", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="allow_guest_access">Allow Guest Access</Label>
            <Switch
              id="allow_guest_access"
              checked={formData.allow_guest_access || false}
              onCheckedChange={(checked) => handleChange("allow_guest_access", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="allow_registration">Allow Registration</Label>
            <Switch
              id="allow_registration"
              checked={formData.allow_registration || false}
              onCheckedChange={(checked) => handleChange("allow_registration", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Playback */}
      <Card>
        <CardHeader>
          <CardTitle>Playback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="default_playback_speed">Default Playback Speed</Label>
            <Input
              id="default_playback_speed"
              type="number"
              step="0.25"
              min="0.5"
              max="2"
              value={formData.default_playback_speed || 1}
              onChange={(e) => handleChange("default_playback_speed", parseFloat(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto_play_next">Auto-play Next</Label>
            <Switch
              id="auto_play_next"
              checked={formData.auto_play_next || false}
              onCheckedChange={(checked) => handleChange("auto_play_next", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/app/admin/settings/
git commit -m "feat: add system settings page"
```

---

## Phase 7: Audit Logs

### Task 9: Create Audit Logs Page

**Files:**

- Create: `src/app/admin/logs/page.tsx`
- Create: `src/app/admin/logs/logs-table.tsx`

**Step 1: Create logs actions**

```typescript
// src/app/admin/actions.ts
export async function getOperationLogs(options: {
  module?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  await checkAdmin();

  // Only super_admin can access logs
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized: Super admin required");
  }

  const { module, userId, startDate, endDate, page = 1, limit = 50 } = options;

  let query = supabase.from("operation_logs").select(
    `
      *,
      users:user_id (email)
    `,
    { count: "exact" }
  );

  if (module) query = query.eq("module", module);
  if (userId) query = query.eq("user_id", userId);
  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return { data, count };
}
```

**Step 2: Create logs page**

```typescript
// src/app/admin/logs/page.tsx
import { getOperationLogs } from "../actions";
import { LogsTable } from "./logs-table";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { data, count } = await getOperationLogs({
    module: params.module as string,
    startDate: params.start as string,
    endDate: params.end as string,
    page: Number(params.page) || 1,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Operation Logs</h1>
      <LogsTable logs={data} total={count} />
    </div>
  );
}
```

**Step 3: Create logs table component**

```typescript
// src/app/admin/logs/logs-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LogsTableProps {
  logs: any[];
  total: number;
}

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800",
  login: "bg-gray-100 text-gray-800",
};

export function LogsTable({ logs, total }: LogsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>IP Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
              <TableCell>
                {log.users?.email || "System"}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{log.module}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={actionColors[log.action] || "bg-gray-100"}>
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell>
                {log.resource_type && (
                  <span className="text-muted-foreground">
                    {log.resource_type}
                    {log.resource_id && ` (${log.resource_id.slice(0, 8)}...)`}
                  </span>
                )}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {log.ip_address || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/app/admin/logs/
git commit -m "feat: add audit logs page"
```

---

## Phase 8: Audio Management Per Lesson

### Task 10: Create Lesson Audio Management

**Files:**

- Create: `src/app/admin/content/textbooks/[textbookId]/units/[unitId]/lessons/[lessonId]/audios/page.tsx`
- Modify: `src/app/admin/actions.ts` (add audio CRUD functions)

**Step 1: Add audio actions**

```typescript
// src/app/admin/actions.ts
export async function getAudios(lessonId: string) {
  await checkAdmin();

  const { data, error } = await supabase
    .from("audios")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_num", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createAudio(data: {
  lesson_id: string;
  title: string;
  type: "main" | "listening" | "practice";
  audio_url: string;
  duration?: number;
  order_num?: number;
}) {
  await checkAdmin();

  const { error } = await supabase.from("audios").insert(data);
  if (error) throw error;
  revalidatePath("/admin/content");
}

export async function updateAudio(
  id: string,
  data: Partial<{
    title: string;
    type: "main" | "listening" | "practice";
    audio_url: string;
    duration: number;
    order_num: number;
    is_default: boolean;
  }>
) {
  await checkAdmin();

  const { error } = await supabase
    .from("audios")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/content");
}

export async function deleteAudio(id: string) {
  await checkAdmin();

  const { error } = await supabase.from("audios").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/content");
}

export async function setDefaultAudio(audioId: string, lessonId: string) {
  await checkAdmin();

  // Unset all defaults for this lesson
  await supabase.from("audios").update({ is_default: false }).eq("lesson_id", lessonId);
  // Set new default
  await supabase.from("audios").update({ is_default: true }).eq("id", audioId);
  revalidatePath("/admin/content");
}
```

**Step 2: Create audio management page**

```typescript
// src/app/admin/content/textbooks/[textbookId]/units/[unitId]/lessons/[lessonId]/audios/page.tsx
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { checkAdmin } from "../../../../../actions";
import { AudioList } from "./audio-list";

export default async function LessonAudiosPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  await checkAdmin();
  const { lessonId } = await params;

  const { data: lesson } = await supabase
    .from("lessons")
    .select(`
      *,
      units:textbook_id (
        textbooks:textbooks (name)
      )
    `)
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const { data: audios } = await supabase
    .from("audios")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_num");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audio Management</h1>
          <p className="text-muted-foreground">
            {lesson.units?.textbooks?.name} - {lesson.name}
          </p>
        </div>
      </div>
      <AudioList lessonId={lessonId} audios={audios || []} />
    </div>
  );
}
```

**Step 3: Create audio list component**

```typescript
// src/app/admin/content/textbooks/[textbookId]/units/[unitId]/lessons/[lessonId]/audios/audio-list.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Audio } from "@/types/database";
import { createAudio, deleteAudio, setDefaultAudio } from "../../../../../actions";
import { useState, useTransition } from "react";

interface AudioListProps {
  lessonId: string;
  audios: Audio[];
}

const typeLabels = {
  main: "Reading",
  listening: "Listening",
  practice: "Practice",
};

export function AudioList({ lessonId, audios }: AudioListProps) {
  const [isPending, startTransition] = useTransition();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSetDefault = (audioId: string) => {
    startTransition(async () => {
      await setDefaultAudio(audioId, lessonId);
    });
  };

  const handleDelete = (audioId: string) => {
    if (confirm("Are you sure you want to delete this audio?")) {
      startTransition(async () => {
        await deleteAudio(audioId);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <a href={`/admin/content/textbooks/${lessonId}/audios/new`}>
            Add Audio
          </a>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audios.map((audio) => (
              <TableRow key={audio.id}>
                <TableCell className="font-medium">{audio.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{typeLabels[audio.type]}</Badge>
                </TableCell>
                <TableCell>
                  {audio.duration ? formatDuration(audio.duration) : "-"}
                </TableCell>
                <TableCell>
                  {audio.is_default && (
                    <Badge variant="default">Default</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {!audio.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(audio.id)}
                        disabled={isPending}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(audio.id)}
                      disabled={isPending}
                      className="text-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/app/admin/content/textbooks/audios/ src/app/admin/actions.ts
git commit -m "feat: add audio management per lesson"
```

---

## Phase 9: Security & Logging Middleware

### Task 11: Add Operation Logging to Actions

**Files:**

- Modify: `src/app/admin/actions.ts`

**Step 1: Add logging helper**

```typescript
// src/app/admin/actions.ts
async function logOperation(data: {
  action: string;
  module: string;
  resource_type?: string;
  resource_id?: string;
  old_value?: any;
  new_value?: any;
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("operation_logs").insert({
      user_id: user.id,
      action: data.action,
      module: data.module,
      resource_type: data.resource_type,
      resource_id: data.resource_id,
      old_value: data.old_value,
      new_value: data.new_value,
      // IP and user_agent would be captured from request headers in middleware
    });
  } catch (e) {
    // Silent fail - logging should not break main operations
    console.error("Failed to log operation:", e);
  }
}

// Wrap create/update/delete operations with logging
export async function createTextbook(data: TextbookInsert) {
  await checkAdmin();

  const { data: result, error } = await supabase.from("textbooks").insert(data).select().single();

  if (error) throw error;

  await logOperation({
    action: "create",
    module: "content",
    resource_type: "textbook",
    resource_id: result.id,
    new_value: data,
  });

  revalidatePath("/admin/content");
  return result;
}

export async function deleteTextbook(id: string) {
  await checkAdmin();

  const { data: old } = await supabase.from("textbooks").select("*").eq("id", id).single();

  const { error } = await supabase.from("textbooks").delete().eq("id", id);
  if (error) throw error;

  await logOperation({
    action: "delete",
    module: "content",
    resource_type: "textbook",
    resource_id: id,
    old_value: old,
  });

  revalidatePath("/admin/content");
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/admin/actions.ts
git commit -m "feat: add operation logging to admin actions"
```

---

## Summary

| Phase                  | Tasks     | Estimated Files |
| ---------------------- | --------- | --------------- |
| 1. Database Schema     | Tasks 1-2 | 2 files         |
| 2. Layout & Navigation | Task 3    | 9 files         |
| 3. User Management     | Tasks 4-5 | 5 files         |
| 4. Analytics Dashboard | Task 6    | 4 files         |
| 5. Media Management    | Task 7    | 3 files         |
| 6. System Settings     | Task 8    | 3 files         |
| 7. Audit Logs          | Task 9    | 3 files         |
| 8. Audio Management    | Task 10   | 4 files         |
| 9. Security & Logging  | Task 11   | 1 file          |

**Total: ~34 files to create/modify**

---

## Plan Complete

**Plan saved to:** `docs/plans/2025-01-17-admin-panel-implementation.md`

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
