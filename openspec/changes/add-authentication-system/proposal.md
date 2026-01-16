# Change: Add Authentication System

## Why

The application needs a complete authentication system to allow users to register, login, and access protected content. Currently, the auth page UI exists but lacks actual Supabase integration and route protection.

## What Changes

- Implement Supabase authentication (login/register) in existing auth page
- Add middleware for session management and route protection
- Create auth feature module with hooks and utilities
- Implement guest mode with localStorage for anonymous users
- Add protected route wrapper for authenticated-only pages

## Impact

- Affected specs: auth (new capability)
- Affected code:
  - `src/app/(auth)/auth/page.tsx` - Connect to Supabase auth
  - `src/middleware.ts` - New file for route protection
  - `src/features/auth/` - New auth feature module
  - `src/lib/supabase/middleware.ts` - New Supabase middleware client
