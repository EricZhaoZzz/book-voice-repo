<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Book Voice is an English listening audio platform for K-12 students, built with Next.js 16 App Router, React 19, TypeScript, and Supabase.

## Tech Stack

- **Framework:** Next.js 16.1.1 (App Router), React 19
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 3.4, Shadcn/ui (Radix UI)
- **State:** TanStack Query v5 (server), Zustand (client)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Forms:** React Hook Form + Zod validation
- **Audio:** Howler.js

## Commands

```bash
npm run dev            # Start development server (localhost:3000)
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint with auto-fix
npm run format         # Format with Prettier
npm run prepare        # Install Husky git hooks
npm run test           # Run unit tests (watch mode)
npm run test:run       # Run unit tests once
npm run test:coverage  # Run tests with coverage report
npm run test:ui        # Run tests with Vitest UI
npm run test:e2e       # Run Playwright E2E tests
npm run test:e2e:ui    # Run E2E tests with Playwright UI
```

**Pre-commit Hooks:** Husky + lint-staged automatically runs ESLint and Prettier on staged files before each commit.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group (login/register)
│   ├── (main)/            # Main app route group
│   ├── admin/             # Admin routes
│   └── api/               # API routes
├── components/
│   ├── ui/                # Shadcn/ui components
│   └── layout/            # Layout components
├── features/              # Feature modules
│   ├── auth/              # Authentication
│   ├── player/            # Audio player
│   ├── textbooks/         # Textbook management
│   ├── lessons/           # Lesson management
│   └── analytics/         # Learning analytics
├── lib/
│   ├── supabase/          # Supabase client (client.ts, server.ts, middleware.ts)
│   ├── utils/             # Utility functions (cn() for classnames)
│   ├── hooks/             # Custom React hooks
│   └── validations/       # Zod schemas
└── types/
    ├── database.ts        # Supabase database types
    └── index.ts           # Shared types
```

## Architecture Patterns

**Route Groups:** Uses `(auth)` and `(main)` route groups to separate authentication and main app layouts.

**Feature-based Organization:** Each feature module in `features/` contains its own components, hooks, and utilities.

**Database Schema:** Three-tier content structure: Textbook → Unit → Lesson. User data includes favorites, play_history, and learning_stats with Row Level Security (RLS).

**Supabase Clients:**

- `createClient()` from `lib/supabase/client.ts` for client components
- `createClient()` from `lib/supabase/server.ts` for server components/actions
- Middleware handles auth session refresh

## Code Conventions

**TypeScript:**

- Path alias `@/*` maps to `./src/*`
- Strict mode enabled
- Unused variables prefixed with `_` are allowed (ESLint configured)
- No explicit `any` warnings

**Styling:** Use `cn()` utility from `lib/utils` to merge Tailwind classes with proper conditional logic.

**Commits:** Follow conventional commits format:

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: update dependencies
```

**ESLint:** Uses ESLint 9 flat config format (`eslint.config.mjs`) with Next.js core web vitals and TypeScript rules.

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Key Files

- `src/types/database.ts` - Supabase database type definitions (auto-generated)
- `src/lib/supabase/client.ts` - Client-side Supabase client (for client components)
- `src/lib/supabase/server.ts` - Server-side Supabase client (for Server Components/Actions)
- `src/lib/supabase/middleware.ts` - Auth session refresh middleware
- `src/lib/validations/` - Zod validation schemas
- `docs/PRD.md` - Product requirements (Chinese)
- `docs/TECHNICAL_ARCHITECTURE.md` - Comprehensive technical architecture
- `eslint.config.mjs` - ESLint flat config
- `.lintstagedrc.js` - Pre-commit linting and formatting rules

## Important Notes

**Supabase Client Usage:**

- Always use `createClient()` from `lib/supabase/server.ts` in Server Components and Server Actions
- Always use the exported `supabase` instance from `lib/supabase/client.ts` in Client Components
- Both clients are typed with `Database` type from `types/database.ts`

**Admin Panel:** Comprehensive admin dashboard at `/admin` includes user management, content management (textbooks → units → lessons), media library, system settings, and audit logs.

**Audio Files:** Stored in Supabase Storage with CDN delivery. Target format is MP3 (128kbps, 44.1kHz).

**QR Code Flow:** Each lesson has a unique `qr_code_token` for quick access. Tokens can optionally expire (`qr_code_expires_at`).
