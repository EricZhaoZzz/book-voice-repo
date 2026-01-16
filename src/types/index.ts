import { Database } from "./database";

// Extract table types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Textbook = Database["public"]["Tables"]["textbooks"]["Row"];
export type Unit = Database["public"]["Tables"]["units"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type PlayHistory = Database["public"]["Tables"]["play_history"]["Row"];
export type LearningStats = Database["public"]["Tables"]["learning_stats"]["Row"];
export type PlayLog = Database["public"]["Tables"]["play_logs"]["Row"];

// Insert types
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type TextbookInsert = Database["public"]["Tables"]["textbooks"]["Insert"];
export type UnitInsert = Database["public"]["Tables"]["units"]["Insert"];
export type LessonInsert = Database["public"]["Tables"]["lessons"]["Insert"];
export type FavoriteInsert = Database["public"]["Tables"]["favorites"]["Insert"];
export type PlayHistoryInsert = Database["public"]["Tables"]["play_history"]["Insert"];
export type LearningStatsInsert = Database["public"]["Tables"]["learning_stats"]["Insert"];
export type PlayLogInsert = Database["public"]["Tables"]["play_logs"]["Insert"];

// Update types
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type TextbookUpdate = Database["public"]["Tables"]["textbooks"]["Update"];
export type UnitUpdate = Database["public"]["Tables"]["units"]["Update"];
export type LessonUpdate = Database["public"]["Tables"]["lessons"]["Update"];

// Extended types with relations
export type TextbookWithUnits = Textbook & {
  units: UnitWithLessons[];
};

export type UnitWithLessons = Unit & {
  lessons: Lesson[];
};

export type LessonWithDetails = Lesson & {
  unit: Unit & {
    textbook: Textbook;
  };
};

// Subtitle types
export interface SubtitleItem {
  start: number;
  end: number;
  en: string;
  zh?: string;
}

export interface SubtitleData {
  subtitles: SubtitleItem[];
}

// Player types
export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  speed: PlaybackSpeed;
  isLoading: boolean;
  error: string | null;
}

export interface ABLoopState {
  enabled: boolean;
  pointA: number | null;
  pointB: number | null;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string | null;
  username: string;
  avatar_url: string | null;
  role: "student" | "admin";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  grade?: string;
  school?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Statistics types
export interface UserStats {
  totalDuration: number;
  streakDays: number;
  currentStreak: number;
  lessonsCompleted: number;
  totalLessons: number;
  averageSessionDuration: number;
}

export interface LessonStats {
  lessonId: string;
  lessonName: string;
  playCount: number;
  totalDuration: number;
  uniqueUsers: number;
}

// QR Code types
export interface QRCodeOptions {
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
}

export interface QRCodeExportOptions {
  lessonIds: string[];
  layout?: "grid" | "list";
  pageSize?: "A4" | "Letter";
  itemsPerPage?: number;
}
