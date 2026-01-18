import { describe, it, expect } from "vitest";
import { textbookSchema, unitSchema, lessonSchema, settingsSchema } from "./content";

describe("textbookSchema", () => {
  const validTextbook = {
    name: "Test Textbook",
    grade: "Grade 3",
    publisher: "Test Publisher",
    version: "1.0",
  };

  it("should validate correct textbook data", () => {
    const result = textbookSchema.safeParse(validTextbook);
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = textbookSchema.safeParse({ ...validTextbook, name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty grade", () => {
    const result = textbookSchema.safeParse({ ...validTextbook, grade: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty publisher", () => {
    const result = textbookSchema.safeParse({ ...validTextbook, publisher: "" });
    expect(result.success).toBe(false);
  });

  it("should default is_free to false", () => {
    const result = textbookSchema.safeParse(validTextbook);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_free).toBe(false);
    }
  });
});

describe("unitSchema", () => {
  const validUnit = {
    textbook_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Unit 1",
    order_num: 1,
  };

  it("should validate correct unit data", () => {
    const result = unitSchema.safeParse(validUnit);
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID for textbook_id", () => {
    const result = unitSchema.safeParse({ ...validUnit, textbook_id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("should reject order_num less than 1", () => {
    const result = unitSchema.safeParse({ ...validUnit, order_num: 0 });
    expect(result.success).toBe(false);
  });
});

describe("lessonSchema", () => {
  const validLesson = {
    unit_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Lesson 1",
    order_num: 1,
    audio_url: "/audio/lesson1.mp3",
    audio_duration: 180,
  };

  it("should validate correct lesson data", () => {
    const result = lessonSchema.safeParse(validLesson);
    expect(result.success).toBe(true);
  });

  it("should reject empty audio_url", () => {
    const result = lessonSchema.safeParse({ ...validLesson, audio_url: "" });
    expect(result.success).toBe(false);
  });

  it("should default audio_duration to 0", () => {
    const lessonWithoutDuration = {
      unit_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Lesson 1",
      order_num: 1,
      audio_url: "/audio/lesson1.mp3",
    };
    const result = lessonSchema.safeParse(lessonWithoutDuration);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.audio_duration).toBe(0);
    }
  });
});

describe("settingsSchema", () => {
  const validSettings = {
    site_name: "Book Voice",
    allow_guest_access: true,
    allow_registration: true,
    default_playback_speed: 1,
    auto_play_next: false,
    max_upload_size: 50,
    allowed_formats: "mp3,wav,ogg",
    login_attempts: 5,
    captcha_enabled: false,
  };

  it("should validate correct settings data", () => {
    const result = settingsSchema.safeParse(validSettings);
    expect(result.success).toBe(true);
  });

  it("should reject playback speed below 0.5", () => {
    const result = settingsSchema.safeParse({ ...validSettings, default_playback_speed: 0.4 });
    expect(result.success).toBe(false);
  });

  it("should reject playback speed above 2", () => {
    const result = settingsSchema.safeParse({ ...validSettings, default_playback_speed: 2.5 });
    expect(result.success).toBe(false);
  });

  it("should reject upload size above 100MB", () => {
    const result = settingsSchema.safeParse({ ...validSettings, max_upload_size: 101 });
    expect(result.success).toBe(false);
  });
});
