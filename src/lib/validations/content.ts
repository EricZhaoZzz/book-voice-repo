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
