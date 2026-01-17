# Admin Panel Design Document

**Date:** 2025-01-17

## 1. Overall Architecture

### 1.1 Page Structure

```
/admin/
├── layout.tsx           # Admin layout with sidebar navigation
├── page.tsx             # Dashboard overview
├── users/               # User management (new)
│   ├── list/page.tsx    # User list
│   └── [id]/page.tsx    # User details
├── content/             # Content management (expand existing)
│   └── textbooks/       # Textbook management
│       ├── page.tsx                     # Textbook list
│       ├── new/page.tsx                 # Create textbook
│       └── [id]/
│           ├── edit/page.tsx            # Edit textbook
│           └── units/
│               ├── page.tsx             # Unit list
│               ├── new/page.tsx         # Create unit
│               └── [unitId]/
│                   ├── edit/page.tsx    # Edit unit
│                   └── lessons/
│                       ├── page.tsx             # Lesson list
│                       ├── new/page.tsx         # Create lesson
│                       └── [lessonId]/
│                           ├── edit/page.tsx    # Edit lesson
│                           └── audios/          # Audio management (new)
│                               └── page.tsx
├── media/               # Media management (new)
│   └── page.tsx
├── settings/            # System settings (new)
│   └── page.tsx
├── analytics/           # Analytics (new)
│   └── page.tsx
└── logs/                # Audit logs (new)
    ├── page.tsx         # Operation logs
    └── alerts/page.tsx  # Security alerts
```

### 1.2 Content Hierarchy

```
Textbook (教材)
└── Units (单元) [1:N]
    └── Lessons (课时) [1:N]
        └── Audios (音频) [1:N]
            ├── audio_url: Audio file URL
            ├── title: Audio title (e.g., "Reading", "Listening")
            ├── type: Type (main/listening/practice)
            ├── duration: Duration in seconds
            └── order_num: Sort order
```

## 2. User Management

### 2.1 Database Schema Extensions

```sql
-- Users table extensions
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));
ALTER TABLE TABLE users ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN login_count INT DEFAULT 0;

-- User stats table
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_learning_minutes INT DEFAULT 0,
  total_lessons_completed INT DEFAULT 0,
  total_audio_seconds INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning records table
CREATE TABLE learning_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  lesson_id UUID REFERENCES lessons(id),
  played_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 User List Columns

| Column            | Description             | Filter/Sort |
| ----------------- | ----------------------- | ----------- |
| Username          | Display name or email   | Search      |
| Role              | User/Admin/Super Admin  | Filter      |
| Status            | Active/Suspended/Banned | Filter      |
| Learning Time     | Total minutes           | Sort        |
| Completed Lessons | Number completed        | Sort        |
| Last Active       | Last activity time      | Sort        |
| Registered        | Account creation time   | Sort        |
| Actions           | View/Edit/Freeze        | -           |

### 2.3 Role Permissions

| Permission      | User | Admin | Super Admin |
| --------------- | ---- | ----- | ----------- |
| View own data   | Yes  | Yes   | Yes         |
| View all users  | -    | Yes   | Yes         |
| Freeze users    | -    | -     | Yes         |
| Manage content  | -    | Yes   | Yes         |
| System settings | -    | -     | Yes         |
| Audit logs      | -    | -     | Yes         |

## 3. Analytics

### 3.1 Analytics Dimensions

| Type            | Metrics                                    | Data Source                   |
| --------------- | ------------------------------------------ | ----------------------------- |
| User Statistics | Total users, today新增, DAU/WAU            | users + login_at              |
| Engagement      | Avg learning time, completion rate, streak | user_stats + learning_records |
| Content         | Play count, completion rate, progress      | learning_records + lessons    |

### 3.2 Dashboard Widgets

- **Core Metrics Cards:** Total users, Today新增, DAU, Course count
- **Charts:** User growth trend (30-day line chart), Content popularity (bar chart TOP10)
- **Distribution:** Learning time distribution pie chart, Completion rate pie chart
- **Recent Active Users List**

### 3.3 Report Export

```
Export Parameters:
├── Date Range: [Start] ~ [End]
├── Report Type:
│   ├── User Activity Report
│   ├── Content Popularity Report
│   └── Learning Records Report
└── Format: CSV / Excel
```

## 4. Content Operations

### 4.1 Batch Import (Excel Template)

| Textbook Name | Cover URL | Grade | Publisher | Unit Name | Unit Order | Lesson Name | Lesson Order | Audio URL | Subtitle    |
| ------------- | --------- | ----- | --------- | --------- | ---------- | ----------- | ------------ | --------- | ----------- |
| 三年级上册    | cover.jpg | 3     | 人教版    | Unit 1    | 1          | Lesson 1    | 1            | audio.mp3 | subtitle... |

### 4.2 Batch Operations

| Operation               | Level       | Description           |
| ----------------------- | ----------- | --------------------- |
| Batch Publish/Unpublish | All levels  | Control visibility    |
| Batch Delete            | All levels  | Delete selected items |
| Batch Sort              | Unit/Lesson | Drag to reorder       |
| Batch Move              | Lesson      | Move between units    |
| Batch Set Free/Paid     | Unit/Lesson | Toggle access         |

### 4.3 System Settings

| Category  | Setting                    | Description     |
| --------- | -------------------------- | --------------- |
| Site Info | Site name, Logo, Copyright | Basic info      |
| Features  | Guest access, Registration | Feature toggles |
| Playback  | Default speed, Auto-play   | Player defaults |
| Upload    | Max file size, Formats     | Upload limits   |
| Security  | Login attempts, Captcha    | Security policy |

### 4.4 Media Management

```
Media Library:
- File list with: Name, Size, Format, Status (used/unused), Upload time
- Actions: Preview, Copy link, Delete
- Storage statistics and usage bar
```

## 5. Audit Logs

### 5.1 Database Schema

```sql
CREATE TABLE operation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,              -- login/create/update/delete
  module TEXT NOT NULL,              -- users/content/media/settings
  resource_type TEXT,                -- textbook/unit/lesson/audio
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operation_logs_module ON operation_logs(module);
CREATE INDEX idx_operation_logs_user ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_created ON operation_logs(created_at DESC);
```

### 5.2 Security Monitoring Rules

| Rule                    | Description                     | Action           |
| ----------------------- | ------------------------------- | ---------------- |
| Frequent login failures | >= 5 failures in 5 min          | Temp lock 15 min |
| Abnormal IP login       | Same account from different IPs | Send alert       |
| Batch delete            | Single delete >= 10 records     | Log and notify   |
| Sensitive config change | Critical settings modified      | Log and notify   |

### 5.3 Alert Levels

| Level  | Trigger                     | Notification  |
| ------ | --------------------------- | ------------- |
| High   | Account lock, config change | Real-time     |
| Medium | Batch ops, abnormal login   | Daily summary |
| Low    | Login failures              | Log only      |

## 6. Audio Management (Per Lesson)

### 6.1 Database Schema

```sql
CREATE TABLE audios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,              -- Audio title
  type TEXT DEFAULT 'main' CHECK (type IN ('main', 'listening', 'practice')),
  audio_url TEXT NOT NULL,
  duration INT,                      -- Duration in seconds
  order_num INT DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  subtitle_text JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Audio Types

| Type      | Description        | Usage             |
| --------- | ------------------ | ----------------- |
| main      | Reading            | Main content      |
| listening | Listening exercise | Practice          |
| practice  | Repeat exercise    | Speaking practice |

### 6.3 Audio Management UI

```
Lesson: Lesson 1 - Hello
├── Audio List
│   ├── Title        Type      Duration    Default    Actions
│   ├── 课文朗读      main      03:24       ✓         [Edit][Delete]
│   ├── 听力练习      listen    02:15       -         [Edit][Delete]
│   └── 跟读练习      practice  04:30       -         [Edit][Delete]
├── Actions: [Add Audio] [Batch Upload] [Sort]
└── Batch: [Set Default] [Batch Delete]
```

---

## Summary

| Module             | Path               | Features                              |
| ------------------ | ------------------ | ------------------------------------- |
| Dashboard          | `/admin`           | Metrics, charts, trends               |
| User Management    | `/admin/users/*`   | List, details, freeze, password reset |
| Content Management | `/admin/content/*` | Textbook → Unit → Lesson → Audio      |
| Media Management   | `/admin/media`     | Audio library, storage                |
| System Settings    | `/admin/settings`  | Site config, features, playback       |
| Analytics          | `/admin/analytics` | User stats, reports, export           |
| Audit Logs         | `/admin/logs`      | Operation logs, security alerts       |
