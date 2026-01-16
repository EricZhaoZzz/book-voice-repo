# Change: Add Content Management System

## Why

The platform needs an admin interface to manage educational content (textbooks, units, lessons). Currently there is no way for administrators to create, edit, or delete content through the application.

## What Changes

- Add admin dashboard layout with navigation
- Create textbook management pages (list, create, edit, delete)
- Create unit management pages (list, create, edit, delete)
- Create lesson management pages (list, create, edit, delete, audio upload)
- Implement file upload for cover images and audio files
- Add server actions for CRUD operations

## Impact

- Affected specs: content-management (new capability)
- Affected code:
  - `src/app/admin/` - Admin route pages
  - `src/features/admin/` - Admin feature module (new)
  - `src/lib/validations/` - Zod schemas for content
  - `src/app/api/` - API routes for file upload
