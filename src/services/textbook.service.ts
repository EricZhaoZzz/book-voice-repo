import { createClient } from "@/lib/supabase/server";
import type { Textbook, Unit } from "@/types/api";

export interface TextbookListParams {
  grade?: string;
  page?: number;
  limit?: number;
}

export interface TextbookListResult {
  data: Textbook[];
  total: number;
}

export interface TextbookWithUnits extends Textbook {
  units: Unit[];
}

export class TextbookService {
  static async getTextbooks(params: TextbookListParams = {}): Promise<TextbookListResult> {
    const { grade, page = 1, limit = 20 } = params;
    const supabase = await createClient();

    let query = supabase.from("textbooks").select("*", { count: "exact" });

    if (grade) {
      query = query.eq("grade", grade);
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data || [],
      total: count || 0,
    };
  }

  static async getTextbookById(id: string): Promise<Textbook> {
    const supabase = await createClient();

    const { data, error } = await supabase.from("textbooks").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Textbook not found");
      }
      throw new Error(error.message);
    }

    return data;
  }

  static async getTextbookWithUnits(id: string): Promise<TextbookWithUnits> {
    const supabase = await createClient();

    const { data: textbook, error: textbookError } = await supabase
      .from("textbooks")
      .select("*")
      .eq("id", id)
      .single();

    if (textbookError) {
      if (textbookError.code === "PGRST116") {
        throw new Error("Textbook not found");
      }
      throw new Error(textbookError.message);
    }

    const { data: units, error: unitsError } = await supabase
      .from("units")
      .select("*")
      .eq("textbook_id", id)
      .order("order_num", { ascending: true });

    if (unitsError) {
      throw new Error(unitsError.message);
    }

    return {
      ...textbook,
      units: units || [],
    };
  }
}
