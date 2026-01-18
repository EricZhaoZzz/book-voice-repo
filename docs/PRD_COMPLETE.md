# Book Voice - English Listening Audio Platform

## Complete Product Requirements Document (PRD)

**Version:** 2.0
**Last Updated:** 2026-01-18
**Status:** Production Ready
**Document Type:** Comprehensive PRD

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Functional Requirements](#3-functional-requirements)
4. [Technical Architecture](#4-technical-architecture)
5. [Database Design](#5-database-design)
6. [API Design](#6-api-design)
7. [UI/UX Design](#7-uiux-design)
8. [Business Rules](#8-business-rules)
9. [Implementation Status](#9-implementation-status)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Security Architecture](#11-security-architecture)
12. [Deployment & Operations](#12-deployment--operations)
13. [Risks & Mitigation](#13-risks--mitigation)
14. [Future Roadmap](#14-future-roadmap)
15. [Appendix](#15-appendix)

---

## 1. Project Overview

### 1.1 Background

Book Voice is an English listening audio platform designed for K-12 students (ages 6-18). The platform provides convenient access to textbook-accompanying audio content through QR code scanning, supporting various learning scenarios including classroom teaching, home study, and after-school review.

### 1.2 Product Positioning

| Aspect               | Description                                                                            |
| -------------------- | -------------------------------------------------------------------------------------- |
| **Core Value**       | Enable students to access English listening resources anytime, anywhere via QR codes   |
| **Target Users**     | Primary students (6-12), Secondary students (13-18)                                    |
| **Use Cases**        | Classroom teaching assistance, Home study/homework, Exam preparation, Commute learning |
| **Deployment Model** | Web application (responsive), accessible via mobile browsers                           |
| **Business Model**   | School bulk subscription (semester-based authorization)                                |

### 1.3 Product Goals

- Provide simple and easy-to-use audio playback experience
- Support QR code scanning for quick navigation to specific lessons
- Track learning progress and generate learning reports
- Support scalable content management and expansion
- Enable multi-platform access via RESTful API

### 1.4 Technology Stack Summary

| Layer                  | Technology                                   |
| ---------------------- | -------------------------------------------- |
| **Frontend Framework** | Next.js 16.1.1 (App Router), React 19        |
| **Language**           | TypeScript 5 (strict mode)                   |
| **Styling**            | Tailwind CSS 3.4, Shadcn/ui (Radix UI)       |
| **State Management**   | TanStack Query v5 (server), Zustand (client) |
| **Forms**              | React Hook Form + Zod validation             |
| **Backend**            | Supabase (PostgreSQL, Auth, Storage)         |
| **Audio Player**       | Howler.js                                    |
| **QR Code**            | qrcode.react, jsPDF                          |

---

## 1.5 Business Model & Monetization

### 1.5.1 Revenue Model

**Primary Model:** School Bulk Subscription

- Schools purchase semester-based subscriptions for all students
- Pricing based on custom duration (e.g., 6 months from purchase date)
- Batch account provisioning via Excel import
- Unified default password (e.g., 123456) with mandatory change on first login

**Content Strategy:** Hybrid Content Model

- Core textbooks: Licensed from publishers (official audio)
- Supplementary materials: Self-produced or admin-uploaded content
- Teacher content: Admins can upload custom audio for specific classes

**Access Control:**

- Subscription expires: Complete access revoked
- No grace period after expiration
- Students cannot export or delete learning data

### 1.5.2 Content Quality Assurance

**Review Mechanisms:**

- Manual review: Admin approval for all uploaded content
- User reporting: Students can report inappropriate content
- No AI detection in initial version (manual review only)
- No expert review panel (simplified workflow)

**Manual Review Process:**

- Admin reviews all uploaded audio and subtitle content
- Check audio quality (clarity, volume, no noise)
- Verify content appropriateness (no sensitive/political content)
- Approve or reject with feedback
- Track review status in `content_audit_logs` table

### 1.5.3 Payment Integration

**Supported Methods:**

- School bulk purchase only (no individual payments)
- Payment handled offline or through school procurement systems
- No WeChat Pay/Alipay integration for individual users

---

## 2. User Roles & Permissions

### 2.1 Student Role

**Capabilities:**

- Browse and play authorized audio content
- Use player features (speed control, AB loop, resume playback)
- View subtitle/text content (English/Chinese/Bilingual)
- Favorite lessons for quick access
- View personal learning progress and reports
- Access lessons via QR code scanning

**Data Access:**

- Read access to authorized textbooks and lessons
- Full access to own learning data (favorites, history, stats)
- No access to admin features or other users' data

**Account Status:** `active` | `suspended` | `banned`

### 2.2 Admin Role

**Capabilities:**

- Manage all audio content (upload, edit, delete)
- Manage textbook, unit, and lesson organization
- Generate and manage QR codes
- Batch export QR codes as PDF
- Manage user accounts (view, suspend, ban)
- Batch import students via Excel
- View class/student learning data (with school authorization)
- Generate class learning reports (export Excel/PDF)
- Upload custom audio for specific classes
- View global statistics and analytics
- Configure system settings
- View audit/operation logs
- Review and approve uploaded content

**Data Access:**

- Full content management permissions
- Read access to all user data and statistics
- Can view authorized class learning data
- Cannot access super admin features

**Note:** No separate teacher role - admins handle all teaching-related functions

### 2.3 Super Admin Role

**Capabilities:**

- All admin capabilities
- Manage admin accounts
- Access system-level configurations
- View complete audit logs

### 2.4 Guest Mode

**Capabilities:**

- Play audio content (limited)
- Use basic player features (play/pause, speed control, AB loop)
- View subtitles

**Limitations:**

- Cannot save learning progress
- Cannot favorite lessons
- Cannot view learning statistics
- Cannot access premium/paid content
- Session based on localStorage (temporary guest ID)

---

## 3. Functional Requirements

### 3.1 User Authentication System

#### 3.1.1 Registration & Login Methods

| Method           | Status         | Description                                   |
| ---------------- | -------------- | --------------------------------------------- |
| Email + Password | ✅ Implemented | Standard authentication via Supabase Auth     |
| WeChat Login     | ✅ Implemented | OAuth via WeChat Open Platform                |
| Phone + SMS      | 🔄 Planned     | SMS verification via Aliyun/Tencent Cloud     |
| Guest Mode       | ✅ Implemented | Temporary access with cookie-based guest ID   |
| Batch Import     | 🔄 Planned     | School bulk account creation via Excel import |

**Email + Password Implementation:**

- Email format validation
- Password requirements: minimum 6 characters, letters + numbers
- Password encryption: bcrypt (via Supabase)
- Password reset via email

**WeChat Login Implementation:**

- OAuth 2.0 authorization flow
- Retrieves unionid and openid
- Auto-creates user account on first login
- Syncs avatar and nickname from WeChat

**Guest Mode Implementation:**

- Generates temporary guest ID stored in cookies
- No server-side session
- Prompts registration after playback completion
- Seamless upgrade to registered user

**Batch Import Implementation:**

- Admin uploads Excel file with student list (name, student ID, grade, class)
- System generates accounts with unified default password (e.g., 123456)
- Students forced to change password on first login
- Bulk account creation linked to school subscription

#### 3.1.2 User Profile

| Feature                        | Status         |
| ------------------------------ | -------------- |
| View/edit personal information | ✅ Implemented |
| View learning statistics       | ✅ Implemented |
| Manage favorites list          | ✅ Implemented |
| View learning history          | ✅ Implemented |
| Logout                         | ✅ Implemented |

### 3.2 Content Organization Structure

#### 3.2.1 Three-Layer Hierarchy

```
Textbook (Textbook)
├── Unit 1 (Unit)
│   ├── Lesson 1 (Lesson)
│   │   ├── Audio Files (Audios)
│   │   ├── Subtitles
│   │   └── QR Code
│   ├── Lesson 2
│   └── ...
├── Unit 2
└── ...
```

#### 3.2.2 Textbook Properties

| Property         | Type    | Description                                               |
| ---------------- | ------- | --------------------------------------------------------- |
| id               | UUID    | Primary key                                               |
| name             | string  | Textbook name (e.g., "PEP Primary English Grade 3 Vol.1") |
| cover_url        | string  | Cover image URL                                           |
| grade            | string  | Grade level tag                                           |
| publisher        | string  | Publisher name                                            |
| version          | string  | Version number                                            |
| description      | text    | Description                                               |
| is_free          | boolean | Whether completely free                                   |
| free_units_count | integer | Number of free units                                      |
| created_by       | UUID    | Creator admin ID                                          |

#### 3.2.3 Unit Properties

| Property     | Type    | Description                        |
| ------------ | ------- | ---------------------------------- |
| id           | UUID    | Primary key                        |
| textbook_id  | UUID    | Parent textbook reference          |
| name         | string  | Unit name (e.g., "Unit 1 - Hello") |
| order_num    | integer | Display order                      |
| description  | text    | Unit description                   |
| is_free      | boolean | Whether free access                |
| requires_vip | boolean | Whether requires VIP               |

#### 3.2.4 Lesson Properties

| Property           | Type      | Description            |
| ------------------ | --------- | ---------------------- |
| id                 | UUID      | Primary key            |
| unit_id            | UUID      | Parent unit reference  |
| name               | string    | Lesson name            |
| order_num          | integer   | Display order          |
| audio_url          | string    | Primary audio file URL |
| audio_duration     | integer   | Duration in seconds    |
| subtitle_text      | JSONB     | Subtitle content       |
| qr_code_token      | string    | Unique QR code token   |
| qr_code_expires_at | timestamp | Optional expiration    |

#### 3.2.5 Audio Properties (Multi-Audio Support)

| Property      | Type    | Description                       |
| ------------- | ------- | --------------------------------- |
| id            | UUID    | Primary key                       |
| lesson_id     | UUID    | Parent lesson reference           |
| title         | string  | Audio title                       |
| type          | enum    | "main" / "listening" / "practice" |
| audio_url     | string  | Audio file URL                    |
| duration      | integer | Duration in seconds               |
| order_num     | integer | Display order                     |
| is_default    | boolean | Whether default audio             |
| subtitle_text | JSONB   | Subtitle content                  |

### 3.3 Audio Player

#### 3.3.1 Basic Playback Features ✅

| Feature        | Status | Description                   |
| -------------- | ------ | ----------------------------- |
| Play/Pause     | ✅     | Toggle playback               |
| Progress bar   | ✅     | Seekable progress control     |
| Volume control | ✅     | Adjustable volume slider      |
| Time display   | ✅     | Current time / Total duration |
| Previous/Next  | ✅     | Navigate within unit playlist |
| Loading states | ✅     | Loading indicators            |

#### 3.3.2 Advanced Playback Features ✅

**Variable Speed Playback:**

- Supported speeds: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x
- Maintains pitch at all speeds
- Remembers user preference

**AB Loop:**

- Manual mode: Click to set A point, click to set B point
- Automatic mode: Click subtitle sentence to loop
- Visual markers on progress bar
- Loop counter display
- Clear button to reset

**Resume Playback:**

- Auto-saves playback position
- Resumes on next visit
- Per-lesson position tracking
- Clears after completion

#### 3.3.3 Subtitle Display ✅

| Feature                    | Status |
| -------------------------- | ------ |
| English only mode          | ✅     |
| Chinese only mode          | ✅     |
| Bilingual mode (EN + ZH)   | ✅     |
| Click-to-seek on subtitles | ✅     |
| Auto-scroll to current     | ✅     |
| Highlight current subtitle | ✅     |
| Font size adjustment       | ✅     |

**Supported Subtitle Formats:**

- SRT (recommended)
- VTT
- JSON (custom format)

#### 3.3.4 Playlist

- Display all lessons in current unit
- Highlight currently playing item
- Click to switch playback
- Show playback status icons
- Auto-play next track option

### 3.4 QR Code System

#### 3.4.1 QR Code Generation ✅

**Automatic Generation:**

- Unique QR code per lesson
- Contains lesson ID and access token
- URL format: `https://domain.com/play?code=XXXXXX`

**Token Format:**

- 12-character unique token
- Format: XXXXXX-XXXXXX
- Generated via UUID + timestamp

**Expiration Options:**

- Default: Never expires (for printed textbooks)
- Optional: 1 day, 7 days, 30 days, custom date
- Expired codes show error message with regeneration option

**Customization:**

- Logo placement (center, max 30% area)
- Custom colors (foreground/background)
- Size options (200x200 - 1000x1000)
- Border options

#### 3.4.2 QR Code Scanning Flow ✅

```
1. User scans QR code
2. Redirect to /play?code=xxx
3. Validate token
4. Check expiration
5. If not logged in → Show login/guest options
6. Fetch lesson data
7. Start audio playback
8. Handle invalid/expired codes gracefully
```

#### 3.4.4 QR Code Distribution Channels

**Printed Textbooks:**

- Permanent QR codes (never expire)
- Printed directly on textbook pages
- Requires publisher partnership

**Teacher Distribution:**

- QR codes with optional expiration
- Distributed via WeChat/DingTalk
- Can be regenerated if needed

**School Posters/Displays:**

- QR codes with login verification
- Posted in public areas (classrooms, hallways)
- Security consideration: requires authentication

**Online Marketing:**

- Short-term promotional codes
- Trackable source attribution
- Time-limited for campaigns

#### 3.4.3 Batch Export 🔄

| Feature                               | Status     |
| ------------------------------------- | ---------- |
| Select textbook/unit for batch export | ✅         |
| PDF generation (A4, 6 per page)       | ✅         |
| Include lesson names                  | ✅         |
| Custom layout templates               | 🔄 Planned |
| High-resolution output (300dpi)       | ✅         |

### 3.5 Favorites System ✅

- Add/remove favorites with single click
- Favorites list page with sorting
- Favorite indicator on lesson cards
- Quick access from favorites
- Synced across devices (for logged-in users)

### 3.6 Learning Analytics

#### 3.6.1 Student Dashboard ✅

| Metric                | Status | Description                  |
| --------------------- | ------ | ---------------------------- |
| Total learning time   | ✅     | Cumulative playback duration |
| Daily learning time   | ✅     | Today's study duration       |
| Weekly learning time  | ✅     | This week's study duration   |
| Monthly learning time | ✅     | This month's study duration  |
| Streak days           | ✅     | Consecutive learning days    |
| Completed lessons     | ✅     | Total lessons finished       |
| Learning calendar     | ✅     | Heatmap visualization        |

**Streak Calculation:**

- Minimum 5 minutes per day to count
- Resets after missing a day
- Tracks current and longest streak

#### 3.6.2 Learning Reports 🔄

**Report Formats:**

- **Excel Export:** Detailed learning data for teacher analysis
- **Real-time Dashboard:** Live statistics display (no export needed)

**Excel Report Contents:**

- Student name, ID, grade, class
- Total learning time (minutes)
- Lessons completed count
- Daily learning breakdown
- Streak days
- Last activity date

**Implementation:**

```typescript
async function generateClassReport(classId: string) {
  const students = await getClassStudents(classId);
  const data = await Promise.all(
    students.map(async (student) => {
      const stats = await getUserStats(student.id);
      return {
        name: student.username,
        studentId: student.student_id,
        totalMinutes: stats.total_learning_minutes,
        lessonsCompleted: stats.total_lessons_completed,
        streakDays: stats.streak_days,
        lastActivity: stats.last_activity_at,
      };
    })
  );

  return exportToExcel(data);
}
```

#### 3.6.3 Admin Analytics ✅

| Metric                     | Status |
| -------------------------- | ------ |
| Daily Active Users (DAU)   | ✅     |
| Monthly Active Users (MAU) | ✅     |
| New user registrations     | ✅     |
| Total play counts          | ✅     |
| Popular lessons ranking    | ✅     |
| User retention metrics     | ✅     |
| Data export (CSV)          | ✅     |

### 3.7 Subscription Management System 🔄

#### 3.7.1 School Subscription

**Subscription Model:**

- Custom duration (e.g., 6 months from purchase date)
- School-level subscription (covers all students)
- Batch account provisioning
- Automatic expiration handling

**Subscription Properties:**

- School name and contact
- Start date and end date
- Number of student accounts
- Subscription status (active, expired, suspended)
- Payment status (offline tracking)

**Access Control:**

- Active subscription: Full access to all content
- Expired subscription: Complete access revoked immediately
- No grace period after expiration
- Students notified 7 days before expiration

**Expiration Handling:**

- **Email Reminders:** Send to school admin at 7, 3, 1 days before expiration
- **Student Popup:** Show expiration notice when logging in (within 7 days)
- **Immediate Disable:** All student accounts disabled on expiration date
- **No Read-Only Mode:** No grace period or limited access after expiration

**Implementation:**

```typescript
// Scheduled job to check and handle expiring subscriptions
async function checkExpiringSubscriptions() {
  const today = new Date();
  const sevenDaysLater = addDays(today, 7);

  // Find subscriptions expiring in 7 days
  const expiringSoon = await db.query(
    "SELECT * FROM subscriptions WHERE end_date = $1 AND status = $2",
    [sevenDaysLater, "active"]
  );

  // Send email reminders
  for (const sub of expiringSoon) {
    await sendExpirationReminder(sub.school_contact, 7);
  }

  // Find expired subscriptions
  const expired = await db.query(
    "SELECT * FROM subscriptions WHERE end_date < $1 AND status = $2",
    [today, "active"]
  );

  // Disable all student accounts
  for (const sub of expired) {
    await disableSubscriptionAccess(sub.id);
    await updateSubscriptionStatus(sub.id, "expired");
  }
}
```

#### 3.7.2 Batch Student Import

**Import Process (Batch Processing):**

- Admin uploads Excel file with columns: Name, Student ID, Grade, Class
- System validates data format
- Processes in batches of 50 students
- Displays progress bar during import
- Generates accounts with default password (123456)
- Links accounts to school subscription
- Exports account list with credentials

**Excel Template:**

```
| Name | Student ID | Grade | Class |
|------|-----------|-------|-------|
| 张三 | 2024001   | 3     | 1     |
| 李四 | 2024002   | 3     | 1     |
```

**Validation Rules:**

- Student ID must be unique
- Grade must be valid (1-12)
- Class must be alphanumeric
- Maximum 1000 students per import

**Batch Processing Implementation:**

```typescript
async function batchImportStudents(students: Student[], batchSize = 50) {
  const batches = chunk(students, batchSize);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    // Create accounts in batch
    await Promise.all(batch.map((student) => createStudentAccount(student)));

    // Update progress
    const progress = ((i + 1) / batches.length) * 100;
    await updateImportProgress(progress);
  }
}
```

### 3.8 Offline Caching System 🔄

**HTTP Caching Only:**

- Rely on browser's native HTTP caching mechanism
- No Service Worker implementation
- No active offline support
- Cache-Control headers set on audio files
- Users must be online to access content

**Cache Headers Configuration:**

```typescript
// Set cache headers for audio files
res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
res.setHeader("ETag", fileHash);
```

**Future Consideration:**

- PWA support with Service Worker may be added in Phase 3
- Manual download feature for offline access (future)

### 3.9 Admin Dashboard

#### 3.7.1 Dashboard Overview ✅

- Quick stats cards (users, content, plays)
- Recent activity feed
- System health indicators
- Quick action buttons

#### 3.7.2 Content Management ✅

**Textbook Management:**

- CRUD operations (Create, Read, Update, Delete)
- Cover image upload
- Grade/publisher filtering
- Search functionality

**Unit Management:**

- Create units under textbooks
- Drag-and-drop ordering
- Batch operations
- Nested display

**Lesson Management:**

- Create lessons under units
- Audio file upload (MP3, M4A, WAV, OGG)
- Subtitle file upload (SRT, VTT)
- Auto-duration extraction
- Batch upload (up to 20 files)
- Progress indicators

**Audio Management:**

- Multiple audios per lesson
- Audio type classification (main, listening, practice)
- Set default audio
- Audio replacement

#### 3.7.3 User Management ✅

| Feature               | Status |
| --------------------- | ------ |
| User list with search | ✅     |
| User detail view      | ✅     |
| User statistics       | ✅     |
| Suspend/Ban users     | ✅     |
| Password reset        | ✅     |
| Role management       | ✅     |

#### 3.7.4 Media Library ✅

- Browse all uploaded media
- Filter by type (audio, image)
- Search by filename
- Delete unused files
- Storage statistics

#### 3.7.5 System Settings ✅

- Site configuration
- Upload limits
- Access control settings
- Email notification config (planned)

#### 3.7.6 Audit Logs ✅

| Log Field     | Description                          |
| ------------- | ------------------------------------ |
| user_id       | Actor user ID                        |
| action        | Action type (create, update, delete) |
| module        | Module name (textbooks, users, etc.) |
| resource_type | Resource type                        |
| resource_id   | Resource ID                          |
| old_value     | Previous value (JSON)                |
| new_value     | New value (JSON)                     |
| ip_address    | Client IP                            |
| user_agent    | Client user agent                    |
| created_at    | Timestamp                            |

---

## 4. Technical Architecture

### 4.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Web Browser (Chrome, Safari, Firefox, Edge)                │
│  - React 19 Components                                       │
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
│  Next.js 16 (Vercel)                                        │
│  - App Router                                                │
│  - Server Components                                         │
│  - API Routes (/api/v1/*)                                   │
│  - Server Actions                                            │
│  - Middleware (Auth, CSRF)                                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ REST API
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      Backend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Supabase Cloud                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                 │   │
│  │  - User data, Content metadata, Learning stats       │   │
│  │  - Row Level Security (RLS)                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Supabase Auth                                       │   │
│  │  - Email/Password, WeChat OAuth                      │   │
│  │  - JWT tokens, Session management                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Supabase Storage                                    │   │
│  │  - Audio files (MP3), Images, QR codes               │   │
│  │  - CDN acceleration                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Project Structure

```
book-voice-repo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group (login, register, forgot-password)
│   │   ├── (main)/            # Main app route group
│   │   ├── (marketing)/       # Marketing pages (landing)
│   │   ├── admin/             # Admin dashboard routes
│   │   │   ├── textbooks/     # Textbook management
│   │   │   ├── users/         # User management
│   │   │   ├── media/         # Media library
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── logs/          # Audit logs
│   │   │   └── settings/      # System settings
│   │   └── api/v1/            # RESTful API routes
│   ├── components/
│   │   ├── ui/                # Shadcn/ui components
│   │   ├── admin/             # Admin-specific components
│   │   ├── analytics/         # Analytics components
│   │   └── providers/         # Context providers
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── player/            # Audio player
│   │   ├── textbooks/         # Textbook management
│   │   ├── lessons/           # Lesson management
│   │   ├── user/              # User features
│   │   └── analytics/         # Learning analytics
│   ├── services/              # Backend service layer
│   │   ├── auth.service.ts    # Authentication service
│   │   ├── textbook.service.ts # Textbook service
│   │   ├── unit.service.ts    # Unit service
│   │   ├── lesson.service.ts  # Lesson service
│   │   └── user.service.ts    # User service
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   ├── api/               # API client and helpers
│   │   ├── middleware/        # Middleware utilities
│   │   ├── utils/             # Helper functions
│   │   ├── hooks/             # Custom React hooks
│   │   └── validations/       # Zod schemas
│   ├── types/
│   │   ├── database.ts        # Supabase database types
│   │   ├── api.ts             # API types
│   │   └── index.ts           # Shared types
│   └── styles/                # Global styles
├── public/                    # Static files
├── docs/                      # Documentation
└── tests/                     # Tests (future)
```

### 4.3 Key Dependencies

**Core:**

- next: ^16.1.1
- react: ^19.0.0
- typescript: ^5.0.0

**State & Data:**

- @tanstack/react-query: ^5.x
- zustand: ^4.x
- react-hook-form: ^7.x
- zod: ^3.x

**Supabase:**

- @supabase/supabase-js: ^2.x
- @supabase/ssr: ^0.x

**UI:**

- tailwindcss: ^3.4.x
- @radix-ui/\*: Various Radix primitives
- lucide-react: Icons
- class-variance-authority: Component variants

**Audio & QR:**

- howler: ^2.x
- qrcode.react: ^3.x
- jspdf: ^2.x

### 4.4 Error Handling & Logging

**Logging Strategy (Hybrid Approach):**

- **Critical Errors:** Sentry for error tracking and alerting
- **General Logs:** Store in database `error_logs` table for admin review
- **Development:** Console output for debugging

**Log Levels:**

- `error`: Critical failures requiring immediate attention
- `warn`: Potential issues that don't break functionality
- `info`: General operational information
- `debug`: Detailed debugging information (dev only)

**Error Tracking Implementation:**

```typescript
// Sentry configuration for critical errors
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  },
});

// Database logging for general errors
await supabase.from("error_logs").insert({
  level: "error",
  message: error.message,
  stack: error.stack,
  context: { userId, action },
  created_at: new Date(),
});
```

### 4.5 Performance Monitoring

**User Behavior Analytics:**

- Track user paths and feature usage frequency
- Monitor session duration and bounce rates
- Analyze conversion funnels (registration, first play, etc.)
- Integration: Google Analytics or Mixpanel

**Key Metrics:**

- User engagement: Daily/Monthly Active Users
- Feature adoption: Most used features, unused features
- User retention: Day 1, Day 7, Day 30 retention rates
- Session quality: Average session duration, pages per session

### 4.6 Caching Architecture

**Client-Side Caching:**

- TanStack Query with configured `staleTime` and `cacheTime`
- Textbook list: 5 minutes stale time
- Lesson data: 10 minutes stale time
- User stats: 1 minute stale time

**Server-Side Caching (Redis):**

- Hot content: Popular textbooks and lessons
- User sessions: JWT token validation cache
- API responses: Frequently accessed endpoints
- Cache invalidation: On content updates

**Redis Configuration:**

```typescript
// Cache hot content
await redis.setex(`textbook:${id}`, 3600, JSON.stringify(textbook));

// Cache user sessions
await redis.setex(`session:${userId}`, 7200, sessionData);

// Cache API responses
await redis.setex(`api:${endpoint}:${params}`, 300, response);
```

**Cache Strategy:**

- Write-through: Update cache on data modification
- TTL-based expiration: Automatic cleanup
- LRU eviction: When memory limit reached

### 4.7 File Storage Strategy

**Hybrid Storage Approach:**

- **Small Files (< 10MB):** Supabase Storage
  - Images (covers, avatars, QR codes)
  - Subtitle files
  - System assets
- **Large Files (> 10MB):** Aliyun OSS
  - Audio files (MP3, M4A, WAV, OGG)
  - Batch exports
  - Backup archives

**Storage Configuration:**

```typescript
// Supabase Storage for small files
const { data, error } = await supabase.storage.from("images").upload(`covers/${uuid}.jpg`, file);

// Aliyun OSS for audio files
const result = await ossClient.put(`audio/${uuid}.mp3`, file, {
  headers: {
    "Cache-Control": "public, max-age=31536000",
  },
});
```

**CDN Configuration:**

- Aliyun CDN for audio files (domestic users)
- Supabase CDN for images and static assets
- Cache headers: 1 year for immutable assets

### 4.8 Audio Processing

**No Transcoding Approach:**

- Accept multiple formats: MP3, M4A, WAV, OGG
- Client-side playback via Howler.js handles format compatibility
- No server-side conversion required
- Reduces processing overhead and storage costs

**File Validation:**

- Verify file extension and MIME type
- Check audio duration and bitrate
- Validate file size limits (max 100MB)
- Scan for corrupted files

### 4.9 Subtitle Management

**Storage Format:**

- Store original SRT/VTT content in database TEXT field
- No parsing or conversion on upload
- Client-side parsing during playback
- Preserves original formatting and timing

**Subtitle Schema:**

```sql
ALTER TABLE lessons ADD COLUMN subtitle_text TEXT;
ALTER TABLE audios ADD COLUMN subtitle_text TEXT;
```

---

## 5. Database Design

### 5.1 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │  textbooks  │     │    units    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ email       │◄────│ created_by  │     │ textbook_id │───►│
│ username    │     │ name        │◄────│ name        │
│ role        │     │ grade       │     │ order_num   │
│ status      │     │ publisher   │     │ is_free     │
│ ...         │     │ ...         │     │ ...         │
└─────────────┘     └─────────────┘     └─────────────┘
      │                                       │
      │                                       │
      ▼                                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  favorites  │     │   lessons   │◄────│   audios    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ user_id     │───►◄│ unit_id     │     │ lesson_id   │
│ lesson_id   │     │ name        │     │ title       │
│ created_at  │     │ audio_url   │     │ type        │
└─────────────┘     │ qr_code_token│     │ audio_url   │
                    │ ...         │     │ ...         │
                    └─────────────┘     └─────────────┘
                          │
                          │
      ┌───────────────────┼───────────────────┐
      │                   │                   │
      ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│play_history │     │ play_logs   │     │learning_stats│
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ user_id     │     │ user_id     │     │ user_id     │
│ lesson_id   │     │ lesson_id   │     │ date        │
│ last_position│     │ duration    │     │ total_duration│
│ play_count  │     │ speed       │     │ lessons_completed│
│ ...         │     │ completed   │     │ ...         │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 5.2 Complete Table Definitions

#### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  grade TEXT,
  school TEXT,
  role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'admin', 'super_admin')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'banned')),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  wechat_openid TEXT,
  wechat_unionid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

#### textbooks

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

CREATE INDEX idx_textbooks_grade ON textbooks(grade);
CREATE INDEX idx_textbooks_created_by ON textbooks(created_by);
```

#### units

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

CREATE INDEX idx_units_textbook_id ON units(textbook_id);
CREATE INDEX idx_units_order ON units(textbook_id, order_num);
```

#### lessons

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  audio_duration INTEGER NOT NULL,
  subtitle_text JSONB,
  qr_code_token TEXT UNIQUE NOT NULL,
  qr_code_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, order_num)
);

CREATE INDEX idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX idx_lessons_order ON lessons(unit_id, order_num);
CREATE INDEX idx_lessons_qr_token ON lessons(qr_code_token);
```

#### audios (Multi-audio support)

```sql
CREATE TABLE audios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'main' CHECK (type IN ('main', 'listening', 'practice')),
  audio_url TEXT NOT NULL,
  duration INTEGER,
  order_num INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  subtitle_text JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audios_lesson_id ON audios(lesson_id);
```

#### favorites

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_lesson_id ON favorites(lesson_id);
```

#### play_history

```sql
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
CREATE INDEX idx_play_history_lesson_id ON play_history(lesson_id);
CREATE INDEX idx_play_history_last_played ON play_history(user_id, last_played_at DESC);
```

#### learning_stats

```sql
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
```

#### play_logs

```sql
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
CREATE INDEX idx_play_logs_lesson_id ON play_logs(lesson_id);
CREATE INDEX idx_play_logs_created_at ON play_logs(created_at DESC);
```

#### user_stats (Aggregated statistics)

```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_learning_minutes INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_audio_seconds INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### learning_records

```sql
CREATE TABLE learning_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  played_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_records_user_id ON learning_records(user_id);
CREATE INDEX idx_learning_records_lesson_id ON learning_records(lesson_id);
```

#### operation_logs (Audit logs)

```sql
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
```

#### subscriptions (School subscriptions)

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name TEXT NOT NULL,
  school_contact TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  student_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'suspended')),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
```

#### classes (Class management)

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_subscription_id ON classes(subscription_id);
CREATE INDEX idx_classes_admin_id ON classes(admin_id);
```

#### class_students (Class-student relationship)

```sql
CREATE TABLE class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_students_class_id ON class_students(class_id);
CREATE INDEX idx_class_students_student_id ON class_students(student_id);
```

#### content_audit_logs (Content review logs)

```sql
CREATE TABLE content_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('audio', 'subtitle', 'textbook')),
  content_id UUID NOT NULL,
  reviewer_id UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  ai_detection_result JSONB,
  manual_review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_audit_logs_content ON content_audit_logs(content_type, content_id);
CREATE INDEX idx_content_audit_logs_status ON content_audit_logs(status);
CREATE INDEX idx_content_audit_logs_reviewer ON content_audit_logs(reviewer_id);
```

---

## 6. API Design

### 6.1 API Architecture

All APIs follow RESTful conventions with versioning:

- Base URL: `/api/v1`
- Authentication: Bearer Token (JWT)
- Response format: JSON
- Error handling: Standard HTTP status codes

### 6.2 Authentication APIs

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| POST   | `/api/v1/auth/register` | User registration    |
| POST   | `/api/v1/auth/login`    | User login           |
| POST   | `/api/v1/auth/logout`   | User logout          |
| POST   | `/api/v1/auth/refresh`  | Refresh access token |
| GET    | `/api/v1/auth/me`       | Get current user     |
| POST   | `/api/v1/auth/wechat`   | WeChat OAuth login   |

**Login Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "role": "student"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "expiresIn": 3600
    }
  }
}
```

### 6.3 Content APIs

| Method | Endpoint                      | Description                |
| ------ | ----------------------------- | -------------------------- |
| GET    | `/api/v1/textbooks`           | List textbooks (paginated) |
| GET    | `/api/v1/textbooks/:id`       | Get textbook details       |
| GET    | `/api/v1/textbooks/:id/units` | Get textbook units         |
| GET    | `/api/v1/units/:id`           | Get unit details           |
| GET    | `/api/v1/units/:id/lessons`   | Get unit lessons           |
| GET    | `/api/v1/lessons/:id`         | Get lesson details         |
| GET    | `/api/v1/lessons/qr/:token`   | Get lesson by QR token     |

**Textbook List Response:**

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### 6.4 User Data APIs

| Method | Endpoint                           | Description             |
| ------ | ---------------------------------- | ----------------------- |
| GET    | `/api/v1/user/favorites`           | Get user favorites      |
| POST   | `/api/v1/user/favorites/:lessonId` | Add favorite            |
| DELETE | `/api/v1/user/favorites/:lessonId` | Remove favorite         |
| GET    | `/api/v1/user/history`             | Get play history        |
| PUT    | `/api/v1/user/history`             | Update play position    |
| GET    | `/api/v1/user/stats`               | Get learning statistics |

### 6.5 Upload APIs

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| POST   | `/api/v1/upload/audio`  | Upload audio file |
| POST   | `/api/v1/upload/images` | Upload image file |

**Upload Constraints:**

- Audio: MP3, M4A, WAV, OGG (max 100MB)
- Images: JPG, PNG, WebP (max 10MB)

### 6.6 Subscription APIs

| Method | Endpoint                                   | Description              |
| ------ | ------------------------------------------ | ------------------------ |
| GET    | `/api/v1/admin/subscriptions`              | List all subscriptions   |
| POST   | `/api/v1/admin/subscriptions`              | Create new subscription  |
| GET    | `/api/v1/admin/subscriptions/:id`          | Get subscription details |
| PUT    | `/api/v1/admin/subscriptions/:id`          | Update subscription      |
| DELETE | `/api/v1/admin/subscriptions/:id`          | Delete subscription      |
| POST   | `/api/v1/admin/subscriptions/:id/students` | Batch import students    |

### 6.7 Class Management APIs

| Method | Endpoint                             | Description           |
| ------ | ------------------------------------ | --------------------- |
| GET    | `/api/v1/admin/classes`              | List all classes      |
| POST   | `/api/v1/admin/classes`              | Create new class      |
| GET    | `/api/v1/admin/classes/:id`          | Get class details     |
| GET    | `/api/v1/admin/classes/:id/students` | Get class students    |
| GET    | `/api/v1/admin/classes/:id/reports`  | Generate class report |

### 6.8 Content Audit APIs

| Method | Endpoint                                    | Description             |
| ------ | ------------------------------------------- | ----------------------- |
| GET    | `/api/v1/admin/content-audit`               | List pending content    |
| POST   | `/api/v1/admin/content-audit/:id/approve`   | Approve content         |
| POST   | `/api/v1/admin/content-audit/:id/reject`    | Reject content          |
| GET    | `/api/v1/admin/content-audit/:id/ai-result` | Get AI detection result |

### 6.6 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {...}
  }
}
```

---

## 7. UI/UX Design

### 7.1 Design System

#### Color Palette

| Color       | Hex     | Usage                              |
| ----------- | ------- | ---------------------------------- |
| Primary     | #4A90E2 | Primary buttons, links, highlights |
| Secondary   | #F5A623 | Accent elements, warnings          |
| Success     | #7ED321 | Success states, completion         |
| Warning     | #F8E71C | Alerts, cautions                   |
| Destructive | #D0021B | Errors, delete actions             |
| Background  | #FFFFFF | Main background                    |
| Foreground  | #1A1A1A | Text, icons                        |

#### Typography

- **Headings:** Rounded sans-serif, bold
- **Body:** Clear readable sans-serif
- **Font sizes:** Large for children readability

#### Design Principles

- Large buttons for easy tapping (min 44x44px)
- Clear visual hierarchy
- Generous whitespace
- Card-based layouts
- Rounded corners for friendly appearance
- Child-appropriate iconography

### 7.2 Page Layouts

#### Home Page

- Top navigation (Logo, Search, User avatar)
- Textbook grid layout
- Each card shows cover, name, grade
- Filter/search functionality

#### Textbook Detail Page

- Textbook info (cover, name, description)
- Unit list (accordion or cards)
- Lessons nested under units
- Progress indicators

#### Player Page

- Top: Lesson info (name, unit)
- Center: Player controls
  - Large play/pause button
  - Progress bar
  - Time display
  - Volume control
  - Speed selector
  - AB loop button
- Bottom: Subtitle display area
- Sidebar: Playlist (collapsible)

#### Personal Center

- User info card
- Learning stats cards
- Quick access to favorites, history
- Settings access

#### Admin Dashboard

- Sidebar navigation
- Main content area with tables/forms
- Data visualization charts
- Action buttons

### 7.3 Responsive Design

| Breakpoint | Width          | Layout                                        |
| ---------- | -------------- | --------------------------------------------- |
| Mobile     | < 640px        | Single column, bottom nav, full-screen player |
| Tablet     | 640px - 1024px | Two columns, sidebar nav                      |
| Desktop    | > 1024px       | Multi-column, full features                   |

---

## 8. Business Rules

### 8.1 Content Access Control

```
IF user not logged in AND content is free:
    Allow access, no data tracking
ELSE IF user not logged in AND content requires login:
    Redirect to login page
ELSE IF user logged in:
    Allow access, track learning data
ELSE IF content requires VIP AND user not VIP:
    Show upgrade prompt
```

### 8.2 Learning Progress Calculation

**Lesson Completion:**

```
completion_rate = (played_duration / audio_duration) * 100%

IF completion_rate >= 80%:
    Mark as completed
ELSE:
    Mark as in progress
```

**Learning Duration Tracking:**

- Only count actual playback time
- Pause time not included
- Fast-forward not double counted
- Updated after each play session

**Streak Days Calculation:**

```
IF today has learning record (>= 5 min) AND yesterday has record:
    streak_days += 1
ELSE IF today has record AND yesterday has no record:
    streak_days = 1
ELSE:
    streak_days unchanged (until reset)
```

### 8.3 QR Code Rules

**Token Generation:**

- Format: UUID + timestamp
- Length: 12 characters (XXXXXX-XXXXXX)
- Unique per lesson

**URL Format:**

```
https://domain.com/play?code={token}
```

**Expiration Handling:**

- Default: Never expires
- Optional: Custom expiration date
- Expired codes: Show message, offer regeneration

### 8.4 Audio Processing

**Supported Input Formats:**

- MP3 (recommended)
- M4A/AAC
- WAV
- OGG

**Standard Output:**

- Format: MP3
- Bitrate: 128kbps
- Sample rate: 44.1kHz
- Channels: Stereo

**File Constraints:**

- Single file: Max 100MB
- Batch upload: Max 20 files, 500MB total

---

## 9. Implementation Status

### 9.1 Completed Features ✅

| Category    | Feature                | Status      |
| ----------- | ---------------------- | ----------- |
| **Auth**    | Email + Password login | ✅ Complete |
| **Auth**    | WeChat OAuth login     | ✅ Complete |
| **Auth**    | Guest mode             | ✅ Complete |
| **Auth**    | Password reset         | ✅ Complete |
| **Content** | Textbook CRUD          | ✅ Complete |
| **Content** | Unit CRUD              | ✅ Complete |
| **Content** | Lesson CRUD            | ✅ Complete |
| **Content** | Multi-audio support    | ✅ Complete |
| **Content** | Audio upload           | ✅ Complete |
| **Content** | Image upload           | ✅ Complete |
| **Player**  | Basic playback         | ✅ Complete |
| **Player**  | Variable speed         | ✅ Complete |
| **Player**  | AB loop                | ✅ Complete |
| **Player**  | Subtitle display       | ✅ Complete |
| **Player**  | Resume playback        | ✅ Complete |
| **QR Code** | Generation             | ✅ Complete |
| **QR Code** | Scanning flow          | ✅ Complete |
| **User**    | Favorites              | ✅ Complete |
| **User**    | Play history           | ✅ Complete |
| **User**    | Learning stats         | ✅ Complete |
| **Admin**   | Dashboard              | ✅ Complete |
| **Admin**   | User management        | ✅ Complete |
| **Admin**   | Content management     | ✅ Complete |
| **Admin**   | Media library          | ✅ Complete |
| **Admin**   | Analytics              | ✅ Complete |
| **Admin**   | Audit logs             | ✅ Complete |
| **Admin**   | Settings               | ✅ Complete |
| **API**     | RESTful endpoints      | ✅ Complete |
| **API**     | Authentication         | ✅ Complete |
| **API**     | Pagination             | ✅ Complete |

### 9.2 In Progress 🔄

| Feature                   | Status     | Notes                             |
| ------------------------- | ---------- | --------------------------------- |
| Phone + SMS login         | 🔄 Planned | Requires SMS provider integration |
| Learning reports          | 🔄 Planned | Weekly/monthly reports            |
| Report sharing            | 🔄 Planned | Image/PDF export                  |
| Batch QR export templates | 🔄 Planned | Custom layout options             |

### 9.3 Future Roadmap 📋

| Phase   | Features                                                      |
| ------- | ------------------------------------------------------------- |
| Phase 2 | Phone + SMS login, Learning reports, Achievements             |
| Phase 3 | Offline playback (PWA), Advanced analytics, Social features   |
| Phase 4 | Mobile native apps, AI voice assessment, Parent/teacher roles |

---

## 10. Non-Functional Requirements

### 10.1 Performance Requirements

| Metric                  | Target                         |
| ----------------------- | ------------------------------ |
| Page load time          | < 2 seconds                    |
| Audio playback latency  | < 500ms                        |
| Concurrent users        | 100+ (MVP), 1000+ (production) |
| Database query response | < 100ms                        |
| API response time       | < 200ms                        |
| Lighthouse score        | > 90                           |

### 10.2 Availability Requirements

| Metric               | Target     |
| -------------------- | ---------- |
| System availability  | > 99.5%    |
| Backup frequency     | Daily      |
| Recovery time (RTO)  | < 4 hours  |
| Recovery point (RPO) | < 24 hours |

### 10.3 Compatibility Requirements

**Browsers:**

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

**Mobile Devices:**

- iOS 13+
- Android 8+

### 10.4 Scalability

- Support horizontal scaling
- Modular architecture
- CDN for static assets
- Database connection pooling

---

## 11. Security Architecture

### 11.1 Authentication & Authorization

- **JWT Tokens:** Access tokens with expiration
- **Refresh Tokens:** Secure token refresh flow
- **Session Management:** httpOnly cookies
- **Row Level Security:** Database-level access control
- **Role-based Access:** student, admin, super_admin

### 11.2 Data Protection

| Measure          | Implementation                |
| ---------------- | ----------------------------- |
| Transport        | HTTPS everywhere              |
| Password storage | bcrypt hashing (via Supabase) |
| API security     | CORS, rate limiting           |
| Input validation | Zod schemas                   |
| SQL injection    | Parameterized queries         |
| XSS prevention   | Content sanitization          |
| CSRF protection  | SameSite cookies              |

### 11.3 Rate Limiting

**Implementation: Sliding Window Algorithm**

- Uses Redis or in-memory storage for precise rate control
- Tracks request timestamps in a sliding time window
- Automatically expires old entries

**Rate Limits:**

- General API: 100 requests per minute per IP
- User API: 1000 requests per hour per authenticated user
- Auth endpoints: 10 requests per minute per IP
- Upload endpoints: 5 requests per minute per user

**Implementation Example:**

```typescript
// Sliding window rate limiter
async function checkRateLimit(key: string, limit: number, window: number) {
  const now = Date.now();
  const windowStart = now - window;

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count requests in window
  const count = await redis.zcard(key);

  if (count >= limit) {
    throw new Error("Rate limit exceeded");
  }

  // Add current request
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, Math.ceil(window / 1000));
}
```

### 11.4 File Upload Security

**Security Measures:**

- **File Type Validation:** Verify extension and MIME type match
- **Filename Randomization:** Use UUID to prevent path traversal
- **Size Limits:** Audio 100MB, Images 10MB per file
- **Rate Limiting:** 5 uploads per minute per user

**Upload Validation:**

```typescript
// File upload security checks
function validateUpload(file: File) {
  // Check file type
  const allowedTypes = ["audio/mpeg", "audio/mp4", "image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type");
  }

  // Check file size
  const maxSize = file.type.startsWith("audio/") ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File too large");
  }

  // Generate random filename
  const ext = file.name.split(".").pop();
  const filename = `${uuid()}.${ext}`;

  return filename;
}
```

### 11.5 Security Enhancements

**Operation Confirmation:**

- Require confirmation for sensitive operations (delete content, modify password)
- Display operation details before confirmation
- Implement cooldown period for repeated attempts

**Login Anomaly Detection:**

- Track login IP addresses and device information
- Detect unusual login patterns (new location, new device)
- Send email alerts for suspicious activity
- Optional: Require additional verification for anomalous logins

**Implementation:**

```typescript
// Login anomaly detection
async function detectLoginAnomaly(userId: string, ip: string, userAgent: string) {
  const recentLogins = await db.query(
    "SELECT ip_address, user_agent FROM login_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
    [userId]
  );

  const isNewIP = !recentLogins.some((login) => login.ip_address === ip);
  const isNewDevice = !recentLogins.some((login) => login.user_agent === userAgent);

  if (isNewIP || isNewDevice) {
    // Send alert email
    await sendSecurityAlert(userId, { ip, userAgent, isNewIP, isNewDevice });
  }
}
```

---

## 12. Deployment & Operations

### 12.1 Deployment Architecture

**Production Environment: Aliyun ECS**

- **Application Server:** Aliyun ECS with Docker deployment
- **Database:** Supabase Cloud (PostgreSQL)
- **File Storage:** Hybrid (Supabase Storage + Aliyun OSS)
- **CDN:** Aliyun CDN for audio files
- **Domain:** Domestic domain with ICP filing
- **SSL:** Let's Encrypt via Nginx

**Deployment Stack:**

```yaml
# Docker Compose configuration
services:
  app:
    image: book-voice:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    restart: always

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    restart: always
```

**Infrastructure:**

- **ECS Instance:** 4 vCPU, 8GB RAM (scalable)
- **Redis:** Aliyun Redis instance for caching
- **Load Balancer:** Aliyun SLB for high availability
- **Monitoring:** Aliyun CloudMonitor + Sentry

### 12.2 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=Book Voice

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=xxx

# Aliyun OSS
ALIYUN_OSS_ACCESS_KEY_ID=xxx
ALIYUN_OSS_ACCESS_KEY_SECRET=xxx
ALIYUN_OSS_BUCKET=book-voice-audio
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_CDN_DOMAIN=cdn.yourdomain.com

# Email Service (SendGrid/Resend)
EMAIL_SERVICE_API_KEY=xxx
EMAIL_FROM=noreply@yourdomain.com

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 12.3 Third-Party Service Integration

**Email Service (SendGrid/Resend):**

- Password reset emails
- Subscription expiration notifications
- Learning report delivery
- Security alerts

**Aliyun OSS:**

- Audio file storage (> 10MB)
- Backup archives
- CDN acceleration for domestic users

**AI Services (Future):**

- Speech recognition for subtitle generation
- Audio quality detection
- Pronunciation assessment

**Integration Example:**

```typescript
// Email service integration
import { Resend } from "resend";

const resend = new Resend(process.env.EMAIL_SERVICE_API_KEY);

async function sendSubscriptionExpiryNotice(email: string, daysLeft: number) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `订阅即将到期提醒 - 剩余${daysLeft}天`,
    html: `<p>您的订阅将在${daysLeft}天后到期...</p>`,
  });
}
```

### 12.4 CI/CD Pipeline

- **Git Repository:** GitHub
- **Branch Strategy:** main (production), feature/\* (features)
- **Commit Convention:** Conventional commits
- **Pre-commit Hooks:** Husky + lint-staged
- **Deployment:** Manual deployment to Aliyun ECS via GitHub Actions
- **Preview Environments:** Staging environment for testing

**GitHub Actions Workflow:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to ECS
        run: |
          ssh ${{ secrets.ECS_HOST }} "cd /app && git pull && docker-compose up -d --build"
```

### 12.5 Backup Strategy

**Supabase Automatic Backups:**

- Daily full backups (retained 30 days)
- Point-in-time recovery available
- No additional external backup required

**Data Retention Policy:**

- **Operation Logs:** 90 days retention
- **Error Logs:** 180 days retention
- **Learning Data:** Permanent retention
- **Play Logs:** Partition by month, archive after 1 year

### 12.6 Database Performance Optimization

**Composite Indexes:**

```sql
-- High-frequency query indexes
CREATE INDEX idx_play_history_user_lesson ON play_history(user_id, lesson_id);
CREATE INDEX idx_learning_stats_user_date ON learning_stats(user_id, date DESC);
CREATE INDEX idx_play_logs_user_created ON play_logs(user_id, created_at DESC);
CREATE INDEX idx_favorites_user_created ON favorites(user_id, created_at DESC);
```

**Table Partitioning:**

```sql
-- Partition play_logs by month
CREATE TABLE play_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE play_logs_2026_01 PARTITION OF play_logs
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE play_logs_2026_02 PARTITION OF play_logs
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

**Query Optimization:**

- Use EXPLAIN ANALYZE for slow queries
- Implement query result caching in Redis
- Use materialized views for complex aggregations

### 12.7 Frontend Performance Optimization

**Code Splitting:**

```typescript
// Lazy load admin dashboard
const AdminDashboard = dynamic(() => import('@/features/admin/Dashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// Lazy load audio player
const AudioPlayer = dynamic(() => import('@/features/player/AudioPlayer'), {
  loading: () => <PlayerSkeleton />
});
```

**Image Optimization:**

```typescript
// Use next/image for automatic optimization
import Image from 'next/image';

<Image
  src={textbook.cover_url}
  alt={textbook.name}
  width={300}
  height={400}
  quality={85}
  placeholder="blur"
  blurDataURL={textbook.blur_data_url}
/>
```

**Font Optimization:**

```typescript
// Use next/font for optimized font loading
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
```

**CSS Optimization:**

- Critical CSS inlined in HTML
- Non-critical CSS loaded asynchronously
- Tailwind CSS purging for production builds

### 12.8 Testing Strategy

**Unit Testing (Jest + React Testing Library):**

```typescript
// Component testing
describe('AudioPlayer', () => {
  it('should play audio when play button clicked', async () => {
    render(<AudioPlayer audioUrl="/test.mp3" />);
    const playButton = screen.getByRole('button', { name: /play/i });
    await userEvent.click(playButton);
    expect(mockHowler.play).toHaveBeenCalled();
  });
});

// Service testing
describe('LessonService', () => {
  it('should fetch lesson by ID', async () => {
    const lesson = await lessonService.getById('lesson-id');
    expect(lesson).toBeDefined();
    expect(lesson.id).toBe('lesson-id');
  });
});
```

**Test Coverage Goals:**

- Critical business logic: 80%+ coverage
- UI components: 60%+ coverage
- Utility functions: 90%+ coverage

---

## 13. Risks & Mitigation

### 13.1 Technical Risks

| Risk                          | Impact | Mitigation                                |
| ----------------------------- | ------ | ----------------------------------------- |
| Audio transcoding performance | High   | Client-side transcoding                   |
| Concurrent playback bandwidth | High   | CDN, audio compression                    |
| Mobile compatibility          | Medium | Progressive enhancement, thorough testing |
| Database performance          | Medium | Proper indexing, query optimization       |

### 13.2 Business Risks

| Risk             | Impact | Mitigation                          |
| ---------------- | ------ | ----------------------------------- |
| Copyright issues | High   | Clear licensing agreements          |
| Slow user growth | Medium | School partnerships, marketing      |
| Content quality  | Medium | Content review process              |
| Storage costs    | Low    | Audio compression, CDN optimization |

### 13.3 Security Risks

| Risk              | Impact | Mitigation                       |
| ----------------- | ------ | -------------------------------- |
| Data breach       | High   | RLS, encryption, access controls |
| Account hijacking | High   | Strong auth, 2FA (future)        |
| DDoS attacks      | Medium | Rate limiting, CDN protection    |

---

## 14. Future Roadmap

### Phase 2: Enhanced Features

- Phone + SMS verification login
- Learning reports (weekly/monthly)
- Achievement/badge system
- Report sharing (image export)
- Advanced QR code templates

### Phase 3: Platform Expansion

- Progressive Web App (offline support)
- Advanced analytics dashboard
- A/B testing framework
- Social features (comments, discussions)
- Gamification (leaderboards)

### Phase 4: Native & AI

- Mobile native apps (React Native)
- AI voice assessment
- Speech-to-text for practice
- Personalized learning paths
- Parent/teacher dashboards

### Phase 5: Enterprise

- Multi-tenant support
- School/district management
- API for third-party integrations
- White-label solutions
- Advanced reporting

---

## 15. Appendix

### 15.1 Glossary

| Term            | Definition                                   |
| --------------- | -------------------------------------------- |
| Textbook        | Digital version of a physical textbook       |
| Unit            | Chapter within a textbook                    |
| Lesson          | Specific listening content within a unit     |
| AB Loop         | Repeat playback between two marked points    |
| Resume Playback | Continue from last stopped position          |
| QR Token        | Unique identifier for quick lesson access    |
| RLS             | Row Level Security (database access control) |

### 15.2 Reference Documents

- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- Howler.js Documentation: https://howlerjs.com
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- Shadcn/ui Documentation: https://ui.shadcn.com

### 15.3 Version History

| Version | Date       | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-01-15 | Initial PRD creation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2.0     | 2026-01-18 | Complete update with implementation status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2.1     | 2026-01-18 | Business model refinement: Added school bulk subscription model, batch student import, subscription management, offline caching strategy, content audit system, class management, and new database tables (subscriptions, classes, class_students, content_audit_logs)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 3.0     | 2026-01-18 | Technical architecture deep dive: Added comprehensive technical specifications including error handling (Sentry + database logs), performance monitoring (user behavior analytics), caching architecture (client + Redis), file storage strategy (hybrid Supabase + Aliyun OSS), audio processing (no transcoding), subtitle management (raw format storage), API rate limiting (sliding window algorithm), file upload security, security enhancements (operation confirmation, login anomaly detection), deployment architecture (Aliyun ECS), third-party integrations (email, OSS, AI services), database optimization (composite indexes, table partitioning), frontend optimization (code splitting, image/font optimization), testing strategy (unit tests), subscription expiration handling, batch import processing, learning reports (Excel export), offline caching (HTTP only), and content review (manual only) |

---

**Document Status:** Production Ready
**Last Review:** 2026-01-18
**Next Review:** Upon major feature completion
**Maintainer:** Development Team
