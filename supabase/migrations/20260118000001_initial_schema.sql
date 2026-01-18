-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  grade TEXT,
  school TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'super_admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  wechat_openid TEXT,
  wechat_unionid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Textbooks table
CREATE TABLE IF NOT EXISTS textbooks (
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

CREATE INDEX IF NOT EXISTS idx_textbooks_grade ON textbooks(grade);

-- Units table
CREATE TABLE IF NOT EXISTS units (
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

CREATE INDEX IF NOT EXISTS idx_units_textbook_id ON units(textbook_id);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  audio_duration INTEGER NOT NULL,
  subtitle_text TEXT,
  qr_code_token TEXT UNIQUE NOT NULL,
  qr_code_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, order_num)
);

CREATE INDEX IF NOT EXISTS idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_lessons_qr_token ON lessons(qr_code_token);

-- Audios table (multi-audio support)
CREATE TABLE IF NOT EXISTS audios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'main' CHECK (type IN ('main', 'listening', 'practice')),
  audio_url TEXT NOT NULL,
  duration INTEGER,
  order_num INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  subtitle_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audios_lesson_id ON audios(lesson_id);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Play history table
CREATE TABLE IF NOT EXISTS play_history (
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

CREATE INDEX IF NOT EXISTS idx_play_history_user_id ON play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_last_played ON play_history(user_id, last_played_at DESC);

-- Learning stats table
CREATE TABLE IF NOT EXISTS learning_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_duration INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_learning_stats_user_date ON learning_stats(user_id, date DESC);

-- User stats table (aggregated)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_learning_minutes INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_audio_seconds INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Play logs table
CREATE TABLE IF NOT EXISTS play_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL,
  speed REAL DEFAULT 1.0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_play_logs_user_id ON play_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_play_logs_created_at ON play_logs(created_at DESC);

-- Operation logs table
CREATE TABLE IF NOT EXISTS operation_logs (
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

CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_module ON operation_logs(module);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at DESC);
