# User Profile and Settings Design

**Date:** 2026-01-18
**Status:** Design Complete
**Author:** Development Team

## Overview

This document outlines the complete design for the user-facing personal center (profile) and settings pages, including all functional requirements, technical architecture, and implementation details.

## 1. Architecture and Routing

### 1.1 Route Structure

```
src/app/(main)/
├── layout.tsx              # Main layout with top navigation and user menu
├── profile/
│   └── page.tsx           # Personal center (single-page card layout)
└── settings/
    └── page.tsx           # Settings page (tabbed layout)
```

### 1.2 Database Extensions

**Add preferences field to users table:**

```sql
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{
  "notifications": {
    "learningReminder": true,
    "subscriptionExpiry": true,
    "emailNotifications": true
  },
  "player": {
    "defaultSpeed": 1.0,
    "autoPlayNext": false,
    "subtitleMode": "bilingual"
  }
}'::jsonb;
```

**Create login_history table for account security:**

```sql
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  device_info TEXT,
  login_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_login_at ON login_history(login_at DESC);
```

### 1.3 Storage Strategy

**Database Storage (cross-device sync):**

- Notification preferences
- Subtitle display mode
- Auto-play next setting

**localStorage Storage (device-specific):**

- Playback speed
- Volume level
- AB loop state

## 2. Profile Page Design

### 2.1 Layout Structure

Single-page card layout with the following sections:

```
┌─────────────────────────────────────────┐
│ User Info Card                           │
│ [Avatar] Username                        │
│ Email | School | Grade                   │
│ [Edit Profile] [Settings]                │
└─────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│ Learning Stats Cards                      │
│ Total Time   │ Completed    │ Streak Days  │
│ 120 hours    │ 45 lessons   │ 7 days       │
└──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────┐
│ Learning Calendar Heatmap                │
│ [Month Selector]                         │
│ Sun Mon Tue Wed Thu Fri Sat              │
│ □ ■ ■ □ ■ ■ □  (intensity by duration)  │
└─────────────────────────────────────────┘

┌──────────────────┬──────────────────────┐
│ Quick Access      │                      │
│ 📚 Favorites (12) │ 🕐 History (recent 5)│
│ [View All]        │ [View All]           │
└──────────────────┴──────────────────────┘
```

### 2.2 Data Sources

- **User Info**: `users` table
- **Learning Stats**: `user_stats` table (total time, completed lessons, streak days)
- **Learning Calendar**: `learning_stats` table aggregated by date
- **Favorites**: `favorites` table joined with `lessons`
- **History**: `play_history` table ordered by `last_played_at`

### 2.3 Component Hierarchy

```
ProfilePage
├── UserInfoCard
│   ├── Avatar
│   ├── UserBasicInfo
│   └── ActionButtons
├── LearningStatsCards
│   ├── StatCard (Total Time)
│   ├── StatCard (Completed Lessons)
│   └── StatCard (Streak Days)
├── LearningCalendar
│   └── HeatmapGrid
└── QuickAccessSection
    ├── FavoritesList
    └── HistoryList
```

## 3. Settings Page Design

### 3.1 Layout Structure

Tabbed layout with four main sections:

```
┌─────────────────────────────────────────┐
│ [Personal Info] [Player] [Notifications] [Security] │
└─────────────────────────────────────────┘

【Personal Info Tab】
┌─────────────────────────────────────────┐
│ Avatar Upload                            │
│ [Current Avatar] [Upload New]            │
│                                          │
│ Username: [Input]                        │
│ Email: user@example.com (read-only)     │
│ School: [Input]                          │
│ Grade: [Select]                          │
│                                          │
│ Change Password                          │
│ Current Password: [Input]                │
│ New Password: [Input]                    │
│ Confirm Password: [Input]                │
│                                          │
│ [Save Changes]                           │
└─────────────────────────────────────────┘

【Player Tab】
- Default Speed: [0.5x] [0.75x] [1.0x] [1.25x] [1.5x] [2.0x]
- Auto-play Next: [Toggle]
- Default Subtitle Mode: [English] [Chinese] [Bilingual]
- Volume: [Slider] (localStorage)

【Notifications Tab】
- Learning Reminder: [Toggle] + Time Picker
- Subscription Expiry: [Toggle]
- Email Notifications: [Toggle]

【Security Tab】
- Recent Login Devices (last 5)
- Login History
- [Logout All Devices]
- [Logout]
```

### 3.2 Component Hierarchy

```
SettingsPage
├── SettingsTabs
├── PersonalInfoTab
│   ├── AvatarUpload
│   ├── ProfileForm
│   └── PasswordChangeForm
├── PlayerSettingsTab
├── NotificationSettingsTab
└── SecurityTab
    └── LoginHistoryTable
```

## 4. API Design

### 4.1 User Profile APIs

```typescript
// GET /api/v1/user/profile
// Response: { user: {...}, preferences: {...} }

// PUT /api/v1/user/profile
// Request: { username, school, grade, avatar_url }
// Response: { success: true, user: {...} }

// PUT /api/v1/user/password
// Request: { currentPassword, newPassword }
// Response: { success: true }
```

### 4.2 Preferences APIs

```typescript
// GET /api/v1/user/preferences
// Response: { notifications: {...}, player: {...} }

// PUT /api/v1/user/preferences
// Request: { notifications: {...}, player: {...} }
// Response: { success: true, preferences: {...} }
```

### 4.3 Login History APIs

```typescript
// GET /api/v1/user/login-history?limit=10
// Response: { items: [{ ip_address, device_info, login_at }] }
```

### 4.4 Existing APIs (Reuse)

- `GET /api/v1/user/stats` - Learning statistics
- `GET /api/v1/user/favorites` - Favorites list
- `GET /api/v1/user/history` - Play history

## 5. State Management

### 5.1 TanStack Query (Server State)

```typescript
// Query keys
const profileKeys = {
  profile: ['user', 'profile'],
  preferences: ['user', 'preferences'],
  loginHistory: (limit?: number) => ['user', 'loginHistory', limit],
};

// Cache configuration
{
  profile: { staleTime: 5 * 60 * 1000 },      // 5 minutes
  learningStats: { staleTime: 1 * 60 * 1000 }, // 1 minute
  favorites: { staleTime: 30 * 1000 },         // 30 seconds
  history: { staleTime: 0 },                   // Always fresh
}
```

### 5.2 Zustand (Client State)

```typescript
interface PlayerPreferencesStore {
  speed: number;
  volume: number;
  setSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
}

interface UIStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
```

### 5.3 localStorage (Persistence)

```typescript
// Keys
const STORAGE_KEYS = {
  PLAYER_SPEED: "player_speed",
  PLAYER_VOLUME: "player_volume",
  AB_LOOP_STATE: "ab_loop_state",
};
```

## 6. Data Loading Strategy

### 6.1 Profile Page

**Parallel Loading:**

```typescript
const { data: user } = useUser();
const { data: stats } = useLearningStats();
const { data: favorites } = useFavorites();
const { data: history } = usePlayHistory(5);
```

**Lazy Loading:**

- Learning calendar: Load current month on mount
- Load other months on demand when user navigates

### 6.2 Settings Page

**On-Demand Loading:**

- Load tab content only when tab is activated
- Login history: Paginated loading (10 per page)

## 7. Error Handling

### 7.1 API Error Handling

```typescript
try {
  await updateProfile(data);
  toast.success("保存成功");
} catch (error) {
  if (error.code === "UNAUTHORIZED") {
    router.push("/auth");
  } else if (error.code === "VALIDATION_ERROR") {
    setFormErrors(error.details);
  } else {
    toast.error("保存失败，请重试");
  }
}
```

### 7.2 Edge Cases

1. **Subscription Expired**: Show banner at top of profile page, restrict access to some features
2. **No Learning Data**: Display empty state with CTA ("Start your first lesson")
3. **Avatar Upload Failed**: Fallback to default avatar, show error message
4. **Password Change Failed**: Keep original password, show specific error reason
5. **Network Offline**: Show cached data + offline indicator

### 7.3 Data Validation

- **Username**: 2-20 characters, Chinese/English/numbers
- **Password**: Minimum 6 characters, must contain letters and numbers
- **Avatar**: Max 5MB, supports JPG/PNG/WebP
- **School/Grade**: Optional but with format restrictions

## 8. Performance Optimization

### 8.1 Data Loading

**Profile Page:**

- Use React Suspense for card components
- Prioritize user info and stats (critical content)
- Defer loading calendar and history (secondary content)
- Calendar: Lazy load by month

**Settings Page:**

- Tab content loaded on demand
- Login history: Paginated (10 per page)
- Avatar upload: Client-side compression

### 8.2 Caching Strategy

```typescript
// TanStack Query cache config
{
  userProfile: { staleTime: 5 * 60 * 1000 },    // 5 minutes
  learningStats: { staleTime: 1 * 60 * 1000 },  // 1 minute
  favorites: { staleTime: 30 * 1000 },          // 30 seconds
  history: { staleTime: 0 },                    // Always fresh
}
```

### 8.3 Image Optimization

- Avatar uses Next.js Image component for automatic optimization
- Support WebP format with JPEG fallback
- Generate multiple thumbnail sizes (64x64, 128x128, 256x256)

## 9. Security

### 9.1 Authentication and Authorization

**Page Access Control:**

```typescript
// middleware.ts protection
if (!session && isProtectedRoute) {
  redirect("/auth");
}

// Profile and settings pages: logged-in users only
// Expired subscription users: view-only with limited features
```

**Sensitive Operations:**

- Password change: Requires current password verification
- Email change: Requires email verification
- Account deletion: Requires confirmation + password verification

### 9.2 Data Security

**Password Handling:**

- No plaintext password storage on frontend
- Use Supabase Auth's bcrypt encryption
- Force re-login after password change

**Avatar Upload Security:**

- File type whitelist (MIME type + extension)
- File size limit (5MB)
- Random filename (UUID) to prevent path traversal
- Store in isolated Supabase Storage bucket

**XSS Protection:**

- User input auto-escaped by React
- Rich text content sanitized with DOMPurify

## 10. User Experience

### 10.1 Interaction Feedback

**Form Submission:**

- Save button shows loading state (disabled + spinner)
- Success: Toast notification + button restore
- Failure: Toast error message + form remains editable

**Real-time Validation:**

- Username input: Validate format on blur
- Password strength: Real-time strength indicator (weak/medium/strong)
- Avatar upload: Drag zone highlight + preview

### 10.2 Loading States

**Skeleton Screens:**

- Profile cards use skeleton placeholders
- Learning calendar shows loading animation
- Settings tabs show spinner on switch

**Empty States:**

- No favorites: "Start favoriting your favorite lessons"
- No history: "Start your first lesson"
- No login records: "No login history yet"

### 10.3 Animations

- Card entrance: Fade in + slide up (stagger effect)
- Stats numbers: Number rolling animation
- Learning calendar: Hover shows detailed info (tooltip)
- Tab switching: Smooth transition

## 11. Implementation Checklist

### Phase 1: Database and API

- [ ] Add preferences column to users table
- [ ] Create login_history table
- [ ] Implement profile APIs
- [ ] Implement preferences APIs
- [ ] Implement login history APIs

### Phase 2: Profile Page

- [ ] Create profile page layout
- [ ] Implement UserInfoCard component
- [ ] Implement LearningStatsCards component
- [ ] Implement LearningCalendar component
- [ ] Implement QuickAccessSection component

### Phase 3: Settings Page

- [ ] Create settings page layout
- [ ] Implement PersonalInfoTab component
- [ ] Implement PlayerSettingsTab component
- [ ] Implement NotificationSettingsTab component
- [ ] Implement SecurityTab component

### Phase 4: Integration

- [ ] Connect components to APIs
- [ ] Implement error handling
- [ ] Add loading states and animations
- [ ] Test all user flows
- [ ] Performance optimization

## 12. Testing Strategy

### 12.1 Unit Tests

- Form validation logic
- Data transformation utilities
- State management stores

### 12.2 Integration Tests

- Profile page data loading
- Settings page tab switching
- Form submission flows

### 12.3 E2E Tests

- Complete profile update flow
- Password change flow
- Avatar upload flow
- Settings preferences update flow

## 13. Accessibility

- Keyboard navigation support for all interactive elements
- ARIA labels for screen readers
- Focus management for modals and tabs
- Color contrast compliance (WCAG AA)
- Form error announcements

## 14. Mobile Responsiveness

- Profile page: Single column layout on mobile
- Settings tabs: Horizontal scroll on mobile
- Avatar upload: Touch-friendly drag zone
- Calendar: Swipe navigation for months

## Conclusion

This design provides a comprehensive user profile and settings system with:

- Complete learning data visualization
- Flexible preference management
- Robust security features
- Excellent user experience
- Performance optimization
- Mobile-first responsive design

The implementation follows the project's existing patterns and integrates seamlessly with the current architecture.
