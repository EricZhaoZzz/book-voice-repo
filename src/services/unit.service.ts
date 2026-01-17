import { createClient } from "@/lib/supabase/server";
import type { Unit, Lesson, Textbook } from "@/types/api";

export interface UnitWithLessons extends Unit {
  lessons: Lesson[];
}

export interface UnitWithTextbook extends Unit {
  textbook: Textbook;
}

export class UnitService {
  static async getUnitsByTextbookId(textbookId: string): Promise<Unit[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("units")
      .select("*")
      .eq("textbook_id", textbookId)
      .order("order_num", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  static async getUnitById(id: string): Promise<Unit> {
    const supabase = await createClient();

    const { data, error } = await supabase.from("units").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Unit not found");
      }
      throw new Error(error.message);
    }

    return data;
  }

  static async getUnitWithTextbook(id: string): Promise<UnitWithTextbook> {
    const supabase = await createClient();

    const { data: unit, error: unitError } = await supabase
      .from("units")
      .select("*")
      .eq("id", id)
      .single();

    if (unitError) {
      if (unitError.code === "PGRST116") {
        throw new Error("Unit not found");
      }
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
      ...unit,
      textbook,
    };
  }

  static async getUnitWithLessons(id: string): Promise<UnitWithLessons> {
    const supabase = await createClient();

    const { data: unit, error: unitError } = await supabase
      .from("units")
      .select("*")
      .eq("id", id)
      .single();

    if (unitError) {
      if (unitError.code === "PGRST116") {
        throw new Error("Unit not found");
      }
      throw new Error(unitError.message);
    }

    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*")
      .eq("unit_id", id)
      .order("order_num", { ascending: true });

    if (lessonsError) {
      throw new Error(lessonsError.message);
    }

    return {
      ...unit,
      lessons: lessons || [],
    };
  }
}
