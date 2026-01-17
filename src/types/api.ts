import type { Database } from "@/types/database";

// Re-export database types for convenience
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Textbook = Database["public"]["Tables"]["textbooks"]["Row"];
export type Unit = Database["public"]["Tables"]["units"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type PlayHistory = Database["public"]["Tables"]["play_history"]["Row"];
export type LearningStats = Database["public"]["Tables"]["learning_stats"]["Row"];

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface WechatLoginRequest {
  code: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Textbook types
export interface TextbookListParams extends PaginationParams {
  grade?: string;
}

export interface TextbookWithUnits extends Textbook {
  units?: Unit[];
}

// Unit types
export interface UnitWithLessons extends Unit {
  lessons?: Lesson[];
}

export interface UnitWithTextbook extends Unit {
  textbook?: Textbook;
}

// Lesson types
export interface LessonWithUnit extends Lesson {
  unit?: Unit;
}

export interface LessonWithFullPath extends Lesson {
  unit?: Unit & {
    textbook?: Textbook;
  };
}

// Favorite types
export interface FavoriteWithLesson extends Favorite {
  lesson?: LessonWithFullPath;
}

export interface AddFavoriteRequest {
  lessonId: string;
}

// Play history types
export interface PlayHistoryWithLesson extends PlayHistory {
  lesson?: LessonWithFullPath;
}

export interface UpdatePlayHistoryRequest {
  lessonId: string;
  position: number;
}

// Learning stats types
export interface DailyStats {
  date: string;
  totalDuration: number;
  lessonsCompleted: number;
}

export interface LearningStatsResponse {
  totalDuration: number;
  totalLessons: number;
  streakDays: number;
  dailyStats: DailyStats[];
}
