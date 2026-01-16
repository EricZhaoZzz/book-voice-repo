## 1. Environment Configuration

- [ ] 1.1 Create `.env.local` file with Supabase credentials
- [ ] 1.2 Verify environment variables are loaded correctly

## 2. Database Tables Setup

- [ ] 2.1 Create `users` table with indexes
- [ ] 2.2 Create `textbooks` table with indexes
- [ ] 2.3 Create `units` table with indexes and foreign key to textbooks
- [ ] 2.4 Create `lessons` table with indexes and foreign key to units
- [ ] 2.5 Create `favorites` table with indexes and foreign keys
- [ ] 2.6 Create `play_history` table with indexes and foreign keys
- [ ] 2.7 Create `learning_stats` table with indexes and foreign keys
- [ ] 2.8 Create `play_logs` table with indexes and foreign keys

## 3. Row Level Security (RLS) Policies

- [ ] 3.1 Enable RLS on all tables
- [ ] 3.2 Create policies for `users` table (read/update own data, admin read all)
- [ ] 3.3 Create policies for content tables (public read, admin write)
- [ ] 3.4 Create policies for user data tables (user-specific access)

## 4. Storage Buckets Configuration

- [ ] 4.1 Create `audio` bucket for lesson audio files
- [ ] 4.2 Create `images` bucket for covers and avatars
- [ ] 4.3 Configure bucket policies for public read access
- [ ] 4.4 Configure upload policies for admin users

## 5. Verification

- [ ] 5.1 Test database connection from Next.js app
- [ ] 5.2 Verify RLS policies work correctly
- [ ] 5.3 Test storage bucket access
