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
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run format    # Format with Prettier
```

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

**TypeScript:** Path alias `@/*` maps to `./src/*`. Unused variables prefixed with `_` are allowed.

**Styling:** Use `cn()` utility from `lib/utils` to merge Tailwind classes.

**Commits:** Follow conventional commits (feat, fix, docs, style, refactor, test, chore).

**ESLint:** Uses ESLint 9 flat config format (`eslint.config.mjs`).

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Key Files

- `src/types/database.ts` - Database type definitions
- `src/lib/supabase/` - Supabase client configurations
- `src/lib/validations/` - Zod validation schemas
- `docs/PRD.md` - Product requirements (Chinese)
- `docs/TECHNICAL_ARCHITECTURE.md` - Technical architecture details
