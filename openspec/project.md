# Project Context

## Purpose

Book Voice is an English listening audio platform designed for K-12 students. The platform provides audio content organized by textbooks, units, and lessons to help students improve their English listening skills.

## Tech Stack

- **Framework:** Next.js 16.1.1 (App Router), React 19
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 3.4, Shadcn/ui (Radix UI primitives)
- **State Management:** TanStack Query v5 (server state), Zustand (client state)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Forms:** React Hook Form + Zod validation
- **Audio:** Howler.js

## Project Conventions

### Code Style

- Path alias `@/*` maps to `./src/*`
- Unused variables prefixed with `_` are allowed
- Use `cn()` utility from `lib/utils` to merge Tailwind classes
- ESLint 9 flat config format (`eslint.config.mjs`)
- Prettier for code formatting
- No Chinese characters in code (comments, strings, etc.)

### Architecture Patterns

- **Route Groups:** Uses `(auth)` and `(main)` route groups to separate authentication and main app layouts
- **Feature-based Organization:** Each feature module in `features/` contains its own components, hooks, and utilities
- **Three-tier Content Structure:** Textbook → Unit → Lesson
- **Supabase Client Separation:**
  - `createClient()` from `lib/supabase/client.ts` for client components
  - `createClient()` from `lib/supabase/server.ts` for server components/actions
  - Middleware handles auth session refresh

### Testing Strategy

- Run `npm run lint` for ESLint checks
- Run `npm run build` to verify production build

### Git Workflow

- Follow conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Main branch: `master`

## Domain Context

- **Target Users:** K-12 students learning English
- **Content Hierarchy:** Textbooks contain Units, Units contain Lessons
- **User Data:** Favorites, play history, and learning statistics
- **Row Level Security (RLS):** Enforced on all user data tables in Supabase

## Important Constraints

- All user data must be protected with Supabase RLS policies
- Audio playback must be optimized for mobile devices
- UI must be accessible and age-appropriate for K-12 students

## External Dependencies

- **Supabase:** PostgreSQL database, authentication, and file storage
- **Environment Variables Required:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL`
