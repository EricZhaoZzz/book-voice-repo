# Technical Architecture Document

## System Overview

This document outlines the detailed technical architecture for the English Listening Audio Platform based on comprehensive technical interviews conducted on 2026-01-15.

---

## 1. Technology Stack

### 1.1 Frontend Stack

#### Core Framework

- **Next.js 14+** (App Router)
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API Routes
  - Image optimization
  - Code splitting

#### UI Layer

- **React 18+** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library (based on Radix UI)
  - Fully customizable
  - Copy-paste components
  - Perfect integration with Tailwind CSS

#### State Management

- **TanStack Query (React Query)** - Server state management
  - Automatic caching
  - Background refetching
  - Optimistic updates
  - Request deduplication
- **Zustand** (optional) - Client state management for UI state

#### Form Handling

- **React Hook Form** - Form state management
  - High performance (minimal re-renders)
  - Easy validation integration
  - TypeScript support
- **Zod** - Schema validation
  - Type-safe validation
  - Integration with React Hook Form
  - Reusable schemas

#### Audio Player

- **Howler.js** - Audio playback library
  - Cross-browser compatibility
  - Variable playback speed
  - Spatial audio support
  - Multiple audio format support
  - Event handling

### 1.2 Backend Stack

#### Backend as a Service (BaaS)

- **Supabase Cloud** (Managed hosting)
  - PostgreSQL database
  - Authentication system
  - File storage with CDN
  - Real-time subscriptions (future)
  - Row Level Security (RLS)
  - Auto-generated REST API

#### Database

- **PostgreSQL 15+** (via Supabase)
  - ACID compliance
  - JSON support
  - Full-text search
  - Indexing optimization

#### Authentication

- **Supabase Auth**
  - Email + Password login
  - JWT token management
  - Session management
  - Password reset
  - Guest mode support (localStorage)

### 1.3 File Storage & CDN

#### Storage Solution

- **Supabase Storage**
  - Built-in CDN acceleration
  - Global distribution
  - Direct upload from frontend
  - Automatic file optimization
  - Access control via RLS

#### Audio Processing

- **Client-side transcoding**
  - Browser-based audio conversion
  - No server resource usage
  - Immediate feedback to users
  - Format: MP3 (128kbps, 44.1kHz)

### 1.4 Development Tools

#### Code Quality

- **ESLint** - Code linting
  - Next.js recommended config
  - TypeScript rules
  - React hooks rules
- **Prettier** - Code formatting
  - Consistent code style
  - Auto-formatting on save
- **Husky + lint-staged** - Git hooks
  - Pre-commit linting
  - Pre-commit formatting
  - Prevent bad commits

#### Development Environment

- **React DevTools** - Component debugging
- **Supabase Studio** - Database management
- **VS Code** - Recommended IDE
  - ESLint extension
  - Prettier extension
  - TypeScript support

### 1.5 Monitoring & Analytics

#### Error Tracking

- **Sentry** - Error monitoring
  - Real-time error tracking
  - Stack trace analysis
  - User context
  - Free tier: 5,000 errors/month

#### Analytics

- **Self-built analytics** - User behavior tracking
  - Custom event tracking
  - Database-based storage
  - Privacy-focused

### 1.6 Deployment & CI/CD

#### Frontend Deployment

- **Vercel** - Hosting platform
  - Automatic deployments
  - Global CDN
  - SSL certificates
  - Preview deployments
  - Environment variables

#### CI/CD Pipeline

- **GitHub Actions**
  - Automated testing (future)
  - Code quality checks
  - Automated deployment
  - Branch protection

#### Domain & SSL

- **Custom domain** - User-owned domain
- **Vercel SSL** - Automatic SSL certificate
- **DNS** - Configured via domain registrar

---

## 2. Architecture Diagram

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Web Browser (Chrome, Safari, Firefox, Edge)                │
│  - React Components                                          │
│  - Howler.js Audio Player                                    │
│  - TanStack Query (Data Fetching)                           │
│  - Zustand (UI State)                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTPS
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Application Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Next.js 14 (Vercel)                                        │
│  - App Router                                                │
│  - Server Components                                         │
│  - API Routes                                                │
│  - Middleware (Auth, CSRF)                                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ REST API / GraphQL
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      Backend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Supabase Cloud                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                 │   │
│  │  - User data                                         │   │
│  │  - Content metadata                                  │   │
│  │  - Learning statistics                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Supabase Auth                                       │   │
│  │  - JWT tokens                                        │   │
│  │  - Session management                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Supabase Storage                                    │   │
│  │  - Audio files (MP3)                                 │   │
│  │  - Images (covers, avatars)                          │   │
│  │  - QR codes                                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ CDN
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                       CDN Layer                              │
├─────────────────────────────────────────────────────────────┤
│  Supabase CDN (Global)                                      │
│  - Audio file distribution                                   │
│  - Image optimization                                        │
│  - Edge caching                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

#### User Authentication Flow

```
User → Next.js → Supabase Auth → JWT Token → Client Storage
```

#### Audio Playback Flow

```
User Scan QR → Next.js → Supabase DB (Get Lesson) →
Supabase Storage (Get Audio URL) → CDN → Howler.js → Audio Playback
```

#### File Upload Flow

```
Admin → File Selection → Client-side Validation →
Direct Upload to Supabase Storage → Update DB with URL
```

---

## 3. Database Design

### 3.1 Database Schema

#### users table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  grade TEXT,
  school TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

#### textbooks table

```sql
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

-- Indexes
CREATE INDEX idx_textbooks_grade ON textbooks(grade);
CREATE INDEX idx_textbooks_created_by ON textbooks(created_by);
```

#### units table

```sql
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

-- Indexes
CREATE INDEX idx_units_textbook_id ON units(textbook_id);
CREATE INDEX idx_units_order ON units(textbook_id, order_num);
```

#### lessons table

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  audio_duration INTEGER NOT NULL, -- in seconds
  subtitle_text JSONB, -- {subtitles: [{start, end, en, zh}]}
  qr_code_token TEXT UNIQUE NOT NULL,
  qr_code_expires_at TIMESTAMPTZ, -- NULL means never expires
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, order_num)
);

-- Indexes
CREATE INDEX idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX idx_lessons_order ON lessons(unit_id, order_num);
CREATE INDEX idx_lessons_qr_token ON lessons(qr_code_token);
```

#### favorites table

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_lesson_id ON favorites(lesson_id);
```

#### play_history table

```sql
CREATE TABLE play_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  last_position INTEGER DEFAULT 0, -- in seconds
  play_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- cumulative play time in seconds
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_play_history_user_id ON play_history(user_id);
CREATE INDEX idx_play_history_lesson_id ON play_history(lesson_id);
CREATE INDEX idx_play_history_last_played ON play_history(user_id, last_played_at DESC);
```

#### learning_stats table

```sql
CREATE TABLE learning_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_duration INTEGER DEFAULT 0, -- in seconds
  lessons_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_learning_stats_user_date ON learning_stats(user_id, date DESC);
```

#### play_logs table

```sql
CREATE TABLE play_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- nullable for guest users
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- play duration in seconds
  speed REAL DEFAULT 1.0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_play_logs_user_id ON play_logs(user_id);
CREATE INDEX idx_play_logs_lesson_id ON play_logs(lesson_id);
CREATE INDEX idx_play_logs_created_at ON play_logs(created_at DESC);
```

### 3.2 Row Level Security (RLS) Policies

#### users table policies

```sql
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### textbooks, units, lessons policies

```sql
-- Everyone can read published content
CREATE POLICY "Anyone can read textbooks"
  ON textbooks FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read units"
  ON units FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read lessons"
  ON lessons FOR SELECT
  USING (true);

-- Only admins can modify content
CREATE POLICY "Admins can manage textbooks"
  ON textbooks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### favorites, play_history policies

```sql
-- Users can only access their own data
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own play history"
  ON play_history FOR ALL
  USING (auth.uid() = user_id);
```

---

## 4. API Design

### 4.1 API Architecture

Using Supabase Client for direct database access with RLS protection:

```typescript
// Frontend API calls
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Example: Fetch textbooks
const { data, error } = await supabase
  .from("textbooks")
  .select("*")
  .order("created_at", { ascending: false });
```

### 4.2 Custom API Routes (Next.js)

For operations requiring server-side logic:

#### QR Code Generation

```
POST /api/qrcode/generate
Body: { lessonId: string }
Response: { token: string, url: string }
```

#### PDF Export

```
POST /api/qrcode/export
Body: { lessonIds: string[] }
Response: { pdfUrl: string }
```

#### Analytics

```
GET /api/stats/user?userId={id}
Response: { totalDuration, streakDays, lessonsCompleted }
```

---

## 5. Security Architecture

### 5.1 Authentication & Authorization

#### Authentication Flow

1. User submits email + password
2. Supabase Auth validates credentials
3. Returns JWT access token + refresh token
4. Client stores tokens in httpOnly cookies
5. Subsequent requests include JWT in Authorization header

#### Guest Mode

- Generate temporary UUID in localStorage
- No server-side session
- Limited functionality (no data persistence)

### 5.2 Security Measures

#### Input Validation & Sanitization

- **Zod schemas** for all user inputs
- **DOMPurify** for HTML sanitization (if needed)
- **SQL injection protection** via Supabase parameterized queries

#### CSRF Protection

- **Next.js CSRF tokens** for state-changing operations
- **SameSite cookies** for session management
- **Origin validation** for API requests

#### Rate Limiting

- **Supabase built-in rate limiting** for auth endpoints
- **Custom rate limiting** for API routes using middleware
  - 100 requests per minute per IP
  - 1000 requests per hour per user

#### Row Level Security (RLS)

- **Database-level access control**
- **User can only access own data**
- **Admins have elevated permissions**
- **Public content accessible to all**

#### Content Security Policy (CSP)

```typescript
// next.config.js
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;",
  },
];
```

---

## 6. Performance Optimization

### 6.1 Frontend Optimization

#### Code Splitting

- **Automatic code splitting** via Next.js
- **Dynamic imports** for heavy components
- **Route-based splitting** for pages

#### Caching Strategy

- **TanStack Query** for server state caching
  - Stale time: 5 minutes
  - Cache time: 30 minutes
  - Automatic background refetching
- **Next.js SWR** for static data
- **Browser caching** for static assets

#### Image Optimization

- **Next.js Image component** for automatic optimization
- **WebP format** with fallback
- **Lazy loading** for below-the-fold images
- **Responsive images** for different screen sizes

#### Audio Optimization

- **MP3 format** (128kbps) for optimal size/quality
- **Streaming playback** (no full download required)
- **CDN delivery** for low latency
- **Preloading** for next track in playlist

### 6.2 Database Optimization

#### Indexing Strategy

- **Primary keys** on all tables
- **Foreign key indexes** for joins
- **Composite indexes** for common queries
- **Partial indexes** for filtered queries

#### Query Optimization

- **Select only needed columns**
- **Use pagination** for large result sets
- **Avoid N+1 queries** with proper joins
- **Use database views** for complex queries

### 6.3 CDN & Caching

#### Supabase Storage CDN

- **Global edge network**
- **Automatic caching** of static files
- **Cache-Control headers** for optimal caching
- **Gzip compression** for text files

#### Vercel Edge Network

- **Global CDN** for Next.js pages
- **Edge caching** for static pages
- **ISR (Incremental Static Regeneration)** for dynamic content

---

## 7. Scalability Considerations

### 7.1 Current Architecture (MVP)

**Target:** 100-1,000 concurrent users

**Infrastructure:**

- Vercel (Frontend): Auto-scaling
- Supabase Cloud (Backend): Managed scaling
- Supabase Storage (Files): CDN-backed

**Expected Performance:**

- Page load: < 2 seconds
- Audio playback latency: < 500ms
- Database query: < 100ms
- Concurrent users: 100+

### 7.2 Future Scaling Strategy

**Phase 1: 1,000-10,000 users**

- Upgrade Supabase plan (more connections)
- Implement Redis caching layer
- Add database read replicas
- Optimize expensive queries

**Phase 2: 10,000-100,000 users**

- Implement database sharding
- Add load balancer
- Use separate storage for hot/cold data
- Implement queue system for async tasks

**Phase 3: 100,000+ users**

- Microservices architecture
- Multi-region deployment
- Dedicated CDN for audio files
- Advanced caching strategies

---

## 8. Development Workflow

### 8.1 Project Structure

```
book-voice-repo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── (main)/            # Main app routes
│   │   ├── admin/             # Admin routes
│   │   └── api/               # API routes
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── player/            # Audio player
│   │   ├── textbooks/         # Textbook management
│   │   ├── lessons/           # Lesson management
│   │   └── analytics/         # Analytics
│   ├── components/            # Shared components
│   │   ├── ui/                # UI components (shadcn)
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities
│   │   ├── supabase/          # Supabase client
│   │   ├── utils/             # Helper functions
│   │   └── hooks/             # Custom hooks
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── public/                    # Static files
├── docs/                      # Documentation
└── tests/                     # Tests (future)
```

### 8.2 Git Workflow

**Branch Strategy:**

- `main` - Production branch
- `develop` - Development branch (future)
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

**Commit Convention:**

```
feat: add audio player component
fix: resolve playback issue on Safari
docs: update API documentation
style: format code with prettier
refactor: simplify authentication logic
test: add unit tests for player
chore: update dependencies
```

### 8.3 Code Style

**TypeScript:**

- Strict mode enabled
- No implicit any
- Explicit return types for functions

**React:**

- Functional components only
- Custom hooks for reusable logic
- Props interface for all components

**Comments:**

- Minimal comments (code should be self-explanatory)
- JSDoc for complex functions
- TODO comments for future improvements

---

## 9. Environment Configuration

### 9.1 Environment Variables

```bash
# .env.local (not committed to Git)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=English Listening Platform

# Sentry (Error Monitoring)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Feature Flags (future)
NEXT_PUBLIC_ENABLE_WECHAT_LOGIN=false
NEXT_PUBLIC_ENABLE_REALTIME=false
```

### 9.2 Configuration Management

**Development:**

- `.env.local` for local development
- Not committed to Git
- Shared via secure channel

**Production:**

- Vercel environment variables
- Configured in Vercel dashboard
- Separate values for preview/production

---

## 10. Monitoring & Logging

### 10.1 Error Monitoring

**Sentry Integration:**

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

**Error Tracking:**

- Frontend errors
- API errors
- Database errors
- User context (non-PII)

### 10.2 Logging Strategy

**Development:**

- Console logs for debugging
- Detailed error messages

**Production:**

- Structured logging
- Error-level logs only
- No sensitive data in logs

---

## 11. Backup & Disaster Recovery

### 11.1 Backup Strategy

**Database Backup:**

- **Supabase automatic backups** (daily)
- **Point-in-time recovery** (7 days)
- **Manual backups** before major changes

**File Backup:**

- **Supabase Storage redundancy** (automatic)
- **Multi-region replication** (future)

### 11.2 Disaster Recovery Plan

**RTO (Recovery Time Objective):** < 4 hours
**RPO (Recovery Point Objective):** < 24 hours

**Recovery Steps:**

1. Identify issue and impact
2. Switch to backup system (if available)
3. Restore from latest backup
4. Verify data integrity
5. Resume service
6. Post-mortem analysis

---

## 12. Technology Decision Summary

| Category               | Technology              | Reason                               |
| ---------------------- | ----------------------- | ------------------------------------ |
| Frontend Framework     | Next.js 14              | SSR, SSG, API Routes, excellent DX   |
| UI Library             | React 18                | Industry standard, large ecosystem   |
| Language               | TypeScript              | Type safety, better DX               |
| Styling                | Tailwind CSS            | Utility-first, fast development      |
| Component Library      | Shadcn/ui               | Customizable, copy-paste, Radix UI   |
| State Management       | TanStack Query          | Server state, caching, refetching    |
| Form Handling          | React Hook Form         | Performance, easy validation         |
| Validation             | Zod                     | Type-safe, composable schemas        |
| Audio Player           | Howler.js               | Cross-browser, feature-rich          |
| Backend                | Supabase Cloud          | BaaS, PostgreSQL, Auth, Storage      |
| Database               | PostgreSQL              | ACID, JSON support, full-text search |
| Authentication         | Supabase Auth           | Built-in, JWT, session management    |
| File Storage           | Supabase Storage        | CDN, direct upload, RLS              |
| Audio Transcoding      | Client-side             | No server load, immediate feedback   |
| QR Code Generation     | Frontend (qrcode.react) | Fast, no server load                 |
| PDF Export             | Frontend (jsPDF)        | Client-side, no server load          |
| Error Monitoring       | Sentry                  | Real-time, stack traces, free tier   |
| Analytics              | Self-built              | Privacy-focused, custom events       |
| Deployment             | Vercel                  | Auto-deploy, CDN, SSL, preview       |
| CI/CD                  | GitHub Actions          | Automated, flexible, free            |
| Code Quality           | ESLint + Prettier       | Linting, formatting, consistency     |
| Git Hooks              | Husky + lint-staged     | Pre-commit checks                    |
| Testing                | None (MVP)              | Focus on features first              |
| Performance Monitoring | None (MVP)              | Add after launch                     |

---

## 13. Future Enhancements

### 13.1 Phase 2 Features

- WeChat login integration
- SMS verification code
- Real-time classroom sync
- Offline playback (PWA)
- Advanced analytics dashboard

### 13.2 Phase 3 Features

- Mobile native apps (React Native)
- AI voice assessment
- Social features (comments, discussions)
- Gamification (achievements, leaderboards)
- Parent/teacher roles

### 13.3 Technical Improvements

- Comprehensive test coverage
- Performance monitoring
- A/B testing framework
- Advanced caching strategies
- Microservices architecture (if needed)

---

**Document Version:** v2.0
**Last Updated:** 2026-01-15
**Author:** Technical Team
**Status:** Approved
