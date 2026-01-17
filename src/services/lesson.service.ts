import { createClient } from "@/lib/supabase/server";
import type { Lesson, Unit, Textbook } from "@/types/api";

export interface LessonWithUnit extends Lesson {
  unit: Unit;
}

export interface LessonWithFullPath extends Lesson {
  unit: Unit & {
    textbook: Textbook;
  };
}

export class LessonService {
  static async getLessonsByUnitId(unitId: string): Promise<Lesson[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("unit_id", unitId)
      .order("order_num", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  static async getLessonById(id: string): Promise<Lesson> {
    const supabase = await createClient();

    const { data, error } = await supabase.from("lessons").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Lesson not found");
      }
      throw new Error(error.message);
    }

    return data;
  }

  static async getLessonWithFullPath(id: string): Promise<LessonWithFullPath> {
    const supabase = await createClient();

    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();

    if (lessonError) {
      if (lessonError.code === "PGRST116") {
        throw new Error("Lesson not found");
      }
      throw new Error(lessonError.message);
    }

    const { data: unit, error: unitError } = await supabase
      .from("units")
      .select("*")
      .eq("id", lesson.unit_id)
      .single();

    if (unitError) {
      throw new Error(unitError.message);
    }

    const { data: textbook, error: textbookError } = await supabase
      .from("textbooks")
      .select("*")
      .eq("id", unit.textbook_id)
      .single();

    if (textbookError) {
      throw new Error(textbookError.message);
    }

    return {
      ...lesson,
      unit: {
        ...unit,
        textbook,
      },
    };
  }

  static async getLessonByQrToken(token: string): Promise<Lesson> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("qr_code_token", token)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Invalid QR code");
      }
      throw new Error(error.message);
    }

    if (data.qr_code_expires_at) {
      const expiresAt = new Date(data.qr_code_expires_at);
      if (expiresAt < new Date()) {
        throw new Error("QR code has expired");
      }
    }

    return data;
  }
}
