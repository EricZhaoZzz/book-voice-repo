import { z } from "zod";

export const textbookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  grade: z.string().min(1, "Grade is required"),
  publisher: z.string().min(1, "Publisher is required"),
  version: z.string().min(1, "Version is required"),
  description: z.string().optional(),
  cover_url: z.string().optional(),
  is_free: z.boolean().default(false),
  free_units_count: z.number().int().min(0).default(0),
});

export type TextbookFormData = z.infer<typeof textbookSchema>;

export const unitSchema = z.object({
  textbook_id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  order_num: z.number().int().min(1, "Order must be at least 1"),
  description: z.string().optional(),
  is_free: z.boolean().default(false),
  requires_vip: z.boolean().default(false),
});

export type UnitFormData = z.infer<typeof unitSchema>;

export const lessonSchema = z.object({
  unit_id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  order_num: z.number().int().min(1, "Order must be at least 1"),
  audio_url: z.string().min(1, "Audio file is required"),
  audio_duration: z.number().int().min(0).default(0),
  subtitle_text: z.any().optional(),
});

export type LessonFormData = z.infer<typeof lessonSchema>;

// Admin panel schemas
export const userUpdateSchema = z.object({
  role: z.enum(["student", "admin", "super_admin"]).optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
});

export type UserUpdateData = z.infer<typeof userUpdateSchema>;

export const audioSchema = z.object({
  lesson_id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["main", "listening", "practice"]).default("main"),
  audio_url: z.string().min(1, "Audio URL is required"),
  duration: z.number().int().min(0).optional(),
  order_num: z.number().int().min(0).default(0),
  is_default: z.boolean().default(false),
  subtitle_text: z.any().optional(),
});

export type AudioFormData = z.infer<typeof audioSchema>;

export const settingsSchema = z.object({
  site_name: z.string().min(1, "Site name is required"),
  logo_url: z.string().url().optional().or(z.literal("")),
  allow_guest_access: z.boolean().default(false),
  allow_registration: z.boolean().default(true),
  default_playback_speed: z.number().min(0.5).max(2).default(1),
  auto_play_next: z.boolean().default(false),
  max_upload_size: z.number().int().min(1).max(100).default(50),
  allowed_formats: z.string().default("mp3,wav,ogg"),
  login_attempts: z.number().int().min(1).max(10).default(5),
  captcha_enabled: z.boolean().default(false),
});

export type SettingsData = z.infer<typeof settingsSchema>;
