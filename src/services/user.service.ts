import { createClient } from "@/lib/supabase/server";
import type { Favorite, PlayHistory, Lesson, Unit, Textbook } from "@/types/api";

export interface FavoriteWithLesson extends Favorite {
  lesson: Lesson & {
    unit: Unit & {
      textbook: Textbook;
    };
  };
}

export interface PlayHistoryWithLesson extends PlayHistory {
  lesson: Lesson & {
    unit: Unit & {
      textbook: Textbook;
    };
  };
}

export interface LearningStatsResult {
  totalDuration: number;
  totalLessons: number;
  streakDays: number;
  dailyStats: Array<{
    date: string;
    totalDuration: number;
    lessonsCompleted: number;
  }>;
}

export class UserService {
  static async getFavorites(userId: string): Promise<FavoriteWithLesson[]> {
    const supabase = await createClient();

    const { data: favorites, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    if (!favorites || favorites.length === 0) {
      return [];
    }

    const lessonIds = favorites.map((f) => f.lesson_id);
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*")
      .in("id", lessonIds);

    if (lessonsError) {
      throw new Error(lessonsError.message);
    }

    const unitIds = [...new Set(lessons?.map((l) => l.unit_id) || [])];
    const { data: units, error: unitsError } = await supabase
      .from("units")
      .select("*")
      .in("id", unitIds);

    if (unitsError) {
      throw new Error(unitsError.message);
    }

    const textbookIds = [...new Set(units?.map((u) => u.textbook_id) || [])];
    const { data: textbooks, error: textbooksError } = await supabase
      .from("textbooks")
      .select("*")
      .in("id", textbookIds);

    if (textbooksError) {
      throw new Error(textbooksError.message);
    }

    const textbookMap = new Map(textbooks?.map((t) => [t.id, t]));
    const unitMap = new Map(
      units?.map((u) => [u.id, { ...u, textbook: textbookMap.get(u.textbook_id)! }])
    );
    const lessonMap = new Map(lessons?.map((l) => [l.id, { ...l, unit: unitMap.get(l.unit_id)! }]));

    return favorites.map((f) => ({
      ...f,
      lesson: lessonMap.get(f.lesson_id)!,
    })) as FavoriteWithLesson[];
  }

  static async addFavorite(userId: string, lessonId: string): Promise<Favorite> {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .single();

    if (existing) {
      throw new Error("Already favorited");
    }

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: userId,
        lesson_id: lessonId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async removeFavorite(userId: string, lessonId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);

    if (error) {
      throw new Error(error.message);
    }
  }

  static async getPlayHistory(userId: string, limit = 50): Promise<PlayHistoryWithLesson[]> {
    const supabase = await createClient();

    const { data: history, error } = await supabase
      .from("play_history")
      .select("*")
      .eq("user_id", userId)
      .order("last_played_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    if (!history || history.length === 0) {
      return [];
    }

    const lessonIds = history.map((h) => h.lesson_id);
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*")
      .in("id", lessonIds);

    if (lessonsError) {
      throw new Error(lessonsError.message);
    }

    const unitIds = [...new Set(lessons?.map((l) => l.unit_id) || [])];
    const { data: units, error: unitsError } = await supabase
      .from("units")
      .select("*")
      .in("id", unitIds);

    if (unitsError) {
      throw new Error(unitsError.message);
    }

    const textbookIds = [...new Set(units?.map((u) => u.textbook_id) || [])];
    const { data: textbooks, error: textbooksError } = await supabase
      .from("textbooks")
      .select("*")
      .in("id", textbookIds);

    if (textbooksError) {
      throw new Error(textbooksError.message);
    }

    const textbookMap = new Map(textbooks?.map((t) => [t.id, t]));
    const unitMap = new Map(
      units?.map((u) => [u.id, { ...u, textbook: textbookMap.get(u.textbook_id)! }])
    );
    const lessonMap = new Map(lessons?.map((l) => [l.id, { ...l, unit: unitMap.get(l.unit_id)! }]));

    return history.map((h) => ({
      ...h,
      lesson: lessonMap.get(h.lesson_id)!,
    })) as PlayHistoryWithLesson[];
  }

  static async updatePlayHistory(
    userId: string,
    lessonId: string,
    position: number
  ): Promise<PlayHistory> {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("play_history")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("play_history")
        .update({
          last_position: position,
          play_count: (existing.play_count ?? 0) + 1,
          last_played_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from("play_history")
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          last_position: position,
          play_count: 1,
          total_duration: 0,
          last_played_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  }

  static async getLearningStats(userId: string): Promise<LearningStatsResult> {
    const supabase = await createClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: stats, error } = await supabase
      .from("learning_stats")
      .select("*")
      .eq("user_id", userId)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const dailyStats = (stats || []).map((s) => ({
      date: s.date,
      totalDuration: s.total_duration ?? 0,
      lessonsCompleted: s.lessons_completed ?? 0,
    }));

    const totalDuration = dailyStats.reduce((sum, s) => sum + s.totalDuration, 0);
    const totalLessons = dailyStats.reduce((sum, s) => sum + s.lessonsCompleted, 0);

    let streakDays = 0;
    const dateSet = new Set(dailyStats.map((s) => s.date));

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      if (i === 0 && !dateSet.has(dateStr)) {
        continue;
      }

      if (dateSet.has(dateStr)) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      totalDuration,
      totalLessons,
      streakDays,
      dailyStats,
    };
  }
}
