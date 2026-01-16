## Context

Book Voice requires a PostgreSQL database to store:

- User profiles and authentication data
- Content hierarchy (textbooks → units → lessons)
- User activity data (favorites, play history, learning stats)
- Analytics data (play logs)

Supabase Cloud is the chosen BaaS provider, offering managed PostgreSQL with built-in authentication, storage, and Row Level Security.

## Goals / Non-Goals

**Goals:**

- Set up production-ready database schema matching TypeScript types
- Implement secure RLS policies for data protection
- Configure storage buckets for media files
- Enable the application to connect to Supabase

**Non-Goals:**

- Database migrations tooling (manual SQL for MVP)
- Real-time subscriptions (future phase)
- Database replication or sharding (future scaling)

## Decisions

### Decision 1: Use Supabase SQL Editor for Schema Creation

**What:** Execute SQL scripts directly in Supabase Dashboard SQL Editor.

**Why:**

- Simplest approach for initial setup
- No additional tooling required
- Direct visibility into database state

**Alternatives considered:**

- Supabase CLI migrations: More complex setup, better for ongoing changes
- Prisma: Additional abstraction layer, not needed for Supabase

### Decision 2: RLS Policy Strategy

**What:** Implement three-tier access control:

1. Public content (textbooks, units, lessons) - readable by anyone
2. User data (favorites, history, stats) - accessible only by owner
3. Admin operations - full access for admin role users

**Why:**

- Matches application requirements
- Database-level security (defense in depth)
- Simplifies API logic

### Decision 3: Storage Bucket Structure

**What:** Two buckets:

- `audio` - MP3 files for lessons
- `images` - Cover images and avatars

**Why:**

- Logical separation of content types
- Different caching strategies possible
- Easier access control management

## Risks / Trade-offs

| Risk                          | Mitigation                                                    |
| ----------------------------- | ------------------------------------------------------------- |
| Manual SQL execution errors   | Review SQL carefully, test in development first               |
| RLS policy gaps               | Test all access patterns before production                    |
| Environment variable exposure | Use `.env.local` (gitignored), Vercel env vars for production |

## Migration Plan

1. Create `.env.local` with provided credentials
2. Execute table creation SQL in Supabase Dashboard
3. Execute RLS policy SQL
4. Create storage buckets via Dashboard
5. Verify connection from local development

**Rollback:** Delete tables and recreate if issues found (no existing data).

## Open Questions

- None - schema is defined in `src/types/database.ts` and `docs/TECHNICAL_ARCHITECTURE.md`
