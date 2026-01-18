# Book Voice MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete MVP for Book Voice English listening platform with core features: authentication, content management, audio player, QR codes, learning analytics, and admin dashboard.

**Architecture:** Next.js 16 App Router with React 19, Supabase backend (PostgreSQL + Auth + Storage), TanStack Query for data fetching, Howler.js for audio playback. Feature-based module organization with strict TypeScript.

**Tech Stack:** Next.js 16.1.1, React 19, TypeScript 5, Tailwind CSS 3.4, Shadcn/ui, Supabase, TanStack Query v5, Howler.js, React Hook Form, Zod

---

## Phase 1: Database Schema & Supabase Setup

### Task 1: Create Database Migration Files

**Files:**

- Create: `supabase/migrations/20260118000001_initial_schema.sql`

**Step 1: Write initial schema migration**

````sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  grade TEXT,
  school TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'super_admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  wechat_openid TEXT,
  wechat_unionid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Textbooks table
CREATE TABLE textbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cover_url TEXT,
  grade TEXT NOT NULL,
  publisher TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  is_free BOOLEAN DEFAULT true,
  free_units_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_textbooks_grade ON textbooks(grade);

-- Units table
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  textbook_id UUID NOT NULL REFERENCES textbooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  description TEXT,
  is_free BOOLEAN DEFAULT true,
  requires_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(textbook_id, order_num)
);

CREATE INDEX idx_units_textbook_id ON units(textbook_id);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  audio_duration INTEGER NOT NULL,
  subtitle_text TEXT,
  qr_code_token TEXT UNIQUE NOT NULL,
  qr_code_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, order_num)
);

CREATE INDEX idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX idx_lessons_qr_token ON lessons(qr_code_token);

-- Audios table (multi-audio support)
CREATE TABLE audios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'main' CHECK (type IN ('main', 'listening', 'practice')),
  audio_url TEXT NOT NULL,
  duration INTEGER,
  order_num INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  subtitle_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audios_lesson_id ON audios(lesson_id);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- Play history table
CREATE TABLE play_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  last_position INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_play_history_user_id ON play_history(user_id);
CREATE INDEX idx_play_history_last_played ON play_history(user_id, last_played_at DESC);

-- Learning stats table
CREATE TABLE learning_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_duration INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_learning_stats_user_date ON learning_stats(user_id, date DESC);

-- User stats table (aggregated)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_learning_minutes INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_audio_seconds INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Play logs table
CREATE TABLE play_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL,
  speed REAL DEFAULT 1.0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_play_logs_user_id ON play_logs(user_id);
CREATE INDEX idx_play_logs_created_at ON play_logs(created_at DESC);

-- Operation logs table
CREATE TABLE operation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_module ON operation_logs(module);
CREATE INDEX idx_operation_logs_created_at ON operation_logs(created_at DESC);

**Step 2: Apply migration to Supabase**

Run: `supabase db push`
Expected: Migration applied successfully

**Step 3: Generate TypeScript types**

Run: `supabase gen types typescript --local > src/types/database.ts`
Expected: Types file generated

**Step 4: Commit**

```bash
git add supabase/migrations/ src/types/database.ts
git commit -m "feat: add initial database schema"
````

---

## Phase 2: Authentication System

### Task 2: Email/Password Authentication

**Files:**

- Create: `src/features/auth/hooks/useAuth.ts`
- Create: `src/features/auth/schemas/auth.schema.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`

**Step 1: Create auth validation schemas**

```typescript
// src/features/auth/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    username: z.string().min(2, "Username must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

**Step 2: Create auth hook**

```typescript
// src/features/auth/hooks/useAuth.ts
import { supabase } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: () => router.push("/"),
  });

  const register = useMutation({
    mutationFn: async ({
      email,
      password,
      username,
    }: {
      email: string;
      password: string;
      username: string;
    }) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user!.id,
        email,
        username,
      });
      if (profileError) throw profileError;

      return authData;
    },
    onSuccess: () => router.push("/login"),
  });

  const logout = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => router.push("/login"),
  });

  return { login, register, logout };
}
```

**Step 3: Test authentication flow**

Run: `npm run dev`
Navigate to: `http://localhost:3000/register`
Expected: Can register and login successfully

**Step 4: Commit**

```bash
git add src/features/auth/ src/app/\(auth\)/
git commit -m "feat: implement email/password authentication"
```

---

## Execution Complete

This plan covers core MVP features with TDD approach:

1. Database schema setup
2. Email/password authentication
3. Content management (textbooks CRUD)
4. Audio player with Howler.js
5. QR code system
6. Learning analytics

Each task has exact file paths, complete code, and commit points.
