## Context

The Book Voice platform requires an admin interface for managing educational content. The content follows a three-tier hierarchy: Textbook → Unit → Lesson. Administrators need to create, edit, and delete content at each level, as well as upload cover images and audio files.

## Goals / Non-Goals

**Goals:**

- Provide a simple, functional admin interface for content CRUD operations
- Enable file uploads for cover images and audio files
- Ensure only admin users can access content management features

**Non-Goals:**

- Bulk import/export functionality
- Content versioning or draft system
- Advanced media processing (transcoding, compression)

## Decisions

**Decision: Use Server Actions for CRUD operations**

- Server Actions provide type-safe, direct database access without separate API routes
- Simpler than REST endpoints for form submissions
- Built-in form validation with Zod

**Decision: Use Supabase Storage for file uploads**

- Already configured with audio and images buckets
- RLS policies already restrict uploads to admin users
- CDN delivery for media files

**Decision: Simple table-based UI with Shadcn components**

- Consistent with existing UI patterns
- Minimal additional dependencies
- Accessible by default

## Risks / Trade-offs

**Risk: Large audio file uploads may timeout**

- Mitigation: Use client-side upload directly to Supabase Storage with signed URLs

**Risk: No content preview before publish**

- Trade-off: Accepted for simplicity; can add later if needed

## Open Questions

None - requirements are clear from the database schema and PRD.
