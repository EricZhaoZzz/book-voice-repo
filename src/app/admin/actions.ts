"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { textbookSchema, type TextbookFormData } from "@/lib/validations/content";
import { generateToken } from "@/lib/utils";
import type { Database } from "@/types/database";

type Textbook = Database["public"]["Tables"]["textbooks"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = (await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: "student" | "admin" } | null };

  if (!profile || profile.role !== "admin") throw new Error("Forbidden");
  return { supabase, userId: user.id };
}

interface LogEntry {
  action: string;
  module: string;
  resource_type: string;
  resource_id?: string;
  old_value?: unknown;
  new_value?: unknown;
}

async function logOperation(log: LogEntry) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("operation_logs").insert({
    user_id: user.id,
    action: log.action,
    module: log.module,
    resource_type: log.resource_type,
    resource_id: log.resource_id || null,
    old_value: log.old_value ? JSON.parse(JSON.stringify(log.old_value)) : null,
    new_value: log.new_value ? JSON.parse(JSON.stringify(log.new_value)) : null,
    ip_address: null,
    user_agent: null,
  });

  if (error) {
    console.error("Failed to log operation:", error);
  }
}

export async function getTextbooks(): Promise<Textbook[]> {
  const { supabase } = await checkAdmin();
  const { data, error } = await supabase
    .from("textbooks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTextbook(id: string): Promise<Textbook> {
  const { supabase } = await checkAdmin();
  const { data, error } = await supabase.from("textbooks").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}

export async function createTextbook(formData: TextbookFormData) {
  const { supabase, userId } = await checkAdmin();
  const validated = textbookSchema.parse(formData);

  const { data: newTextbook, error } = await supabase
    .from("textbooks")
    .insert({
      name: validated.name,
      grade: validated.grade,
      publisher: validated.publisher,
      version: validated.version,
      description: validated.description || null,
      cover_url: validated.cover_url || null,
      is_free: validated.is_free,
      free_units_count: validated.free_units_count,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  await logOperation({
    action: "create",
    module: "content",
    resource_type: "textbook",
    resource_id: newTextbook.id,
    new_value: validated,
  });

  revalidatePath("/admin/textbooks");
}

export async function updateTextbook(id: string, formData: TextbookFormData) {
  const { supabase } = await checkAdmin();
  const validated = textbookSchema.parse(formData);

  const { data: oldTextbook } = await supabase.from("textbooks").select("*").eq("id", id).single();

  const { error } = await supabase
    .from("textbooks")
    .update({
      name: validated.name,
      grade: validated.grade,
      publisher: validated.publisher,
      version: validated.version,
      description: validated.description || null,
      cover_url: validated.cover_url || null,
      is_free: validated.is_free,
      free_units_count: validated.free_units_count,
    })
    .eq("id", id);

  if (error) throw error;

  await logOperation({
    action: "update",
    module: "content",
    resource_type: "textbook",
    resource_id: id,
    old_value: oldTextbook,
    new_value: validated,
  });

  revalidatePath("/admin/textbooks");
}

export async function deleteTextbook(id: string) {
  const { supabase } = await checkAdmin();

  const { data: units } = await supabase.from("units").select("id").eq("textbook_id", id).limit(1);

  if (units && units.length > 0) {
    throw new Error("Cannot delete textbook with existing units");
  }

  const { data: oldTextbook } = await supabase.from("textbooks").select("*").eq("id", id).single();

  const { error } = await supabase.from("textbooks").delete().eq("id", id);
  if (error) throw error;

  await logOperation({
    action: "delete",
    module: "content",
    resource_type: "textbook",
    resource_id: id,
    old_value: oldTextbook,
  });

  revalidatePath("/admin/textbooks");
}

export async function getUnits(textbookId: string): Promise<Unit[]> {
  const { supabase } = await checkAdmin();
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("textbook_id", textbookId)
    .order("order_num");

  if (error) throw error;
  return data || [];
}

export async function createUnit(formData: {
  textbook_id: string;
  name: string;
  order_num: number;
  description?: string;
  is_free?: boolean;
  requires_vip?: boolean;
}) {
  const { supabase } = await checkAdmin();

  const { data: newUnit, error } = await supabase
    .from("units")
    .insert({
      textbook_id: formData.textbook_id,
      name: formData.name,
      order_num: formData.order_num,
      description: formData.description || null,
      is_free: formData.is_free ?? false,
      requires_vip: formData.requires_vip ?? false,
    })
    .select()
    .single();

  if (error) throw error;

  await logOperation({
    action: "create",
    module: "content",
    resource_type: "unit",
    resource_id: newUnit.id,
    new_value: formData,
  });

  revalidatePath(`/admin/textbooks/${formData.textbook_id}/units`);
}

export async function updateUnit(
  id: string,
  formData: {
    name?: string;
    order_num?: number;
    description?: string;
    is_free?: boolean;
    requires_vip?: boolean;
  }
) {
  const { supabase } = await checkAdmin();

  const { data: oldUnit } = await supabase.from("units").select("*").eq("id", id).single();
  const { data: unit } = await supabase.from("units").select("textbook_id").eq("id", id).single();

  const { error } = await supabase.from("units").update(formData).eq("id", id);
  if (error) throw error;

  await logOperation({
    action: "update",
    module: "content",
    resource_type: "unit",
    resource_id: id,
    old_value: oldUnit,
    new_value: formData,
  });

  if (unit) revalidatePath(`/admin/textbooks/${unit.textbook_id}/units`);
}

export async function deleteUnit(id: string) {
  const { supabase } = await checkAdmin();

  const { data: unit } = await supabase.from("units").select("textbook_id").eq("id", id).single();
  const { data: oldUnit } = await supabase.from("units").select("*").eq("id", id).single();

  const { data: lessons } = await supabase.from("lessons").select("id").eq("unit_id", id).limit(1);

  if (lessons && lessons.length > 0) {
    throw new Error("Cannot delete unit with existing lessons");
  }

  const { error } = await supabase.from("units").delete().eq("id", id);
  if (error) throw error;

  await logOperation({
    action: "delete",
    module: "content",
    resource_type: "unit",
    resource_id: id,
    old_value: oldUnit,
  });

  if (unit) revalidatePath(`/admin/textbooks/${unit.textbook_id}/units`);
}

export async function getLessons(unitId: string): Promise<Lesson[]> {
  const { supabase } = await checkAdmin();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("unit_id", unitId)
    .order("order_num");

  if (error) throw error;
  return data || [];
}

export async function createLesson(formData: {
  unit_id: string;
  name: string;
  order_num: number;
  audio_url: string;
  audio_duration: number;
}) {
  const { supabase } = await checkAdmin();

  const { data: unit } = await supabase
    .from("units")
    .select("textbook_id")
    .eq("id", formData.unit_id)
    .single();

  const { data: newLesson, error } = await supabase
    .from("lessons")
    .insert({
      unit_id: formData.unit_id,
      name: formData.name,
      order_num: formData.order_num,
      audio_url: formData.audio_url,
      audio_duration: formData.audio_duration,
      qr_code_token: generateToken(),
    })
    .select()
    .single();

  if (error) throw error;

  await logOperation({
    action: "create",
    module: "content",
    resource_type: "lesson",
    resource_id: newLesson.id,
    new_value: formData,
  });

  if (unit)
    revalidatePath(`/admin/textbooks/${unit.textbook_id}/units/${formData.unit_id}/lessons`);
}

export async function updateLesson(
  id: string,
  formData: { name?: string; order_num?: number; audio_url?: string; audio_duration?: number }
) {
  const { supabase } = await checkAdmin();

  const { data: oldLesson } = await supabase.from("lessons").select("*").eq("id", id).single();
  const { data: lesson } = await supabase.from("lessons").select("unit_id").eq("id", id).single();

  const { error } = await supabase.from("lessons").update(formData).eq("id", id);
  if (error) throw error;

  await logOperation({
    action: "update",
    module: "content",
    resource_type: "lesson",
    resource_id: id,
    old_value: oldLesson,
    new_value: formData,
  });

  if (lesson) {
    const { data: unit } = await supabase
      .from("units")
      .select("textbook_id")
      .eq("id", lesson.unit_id)
      .single();
    if (unit)
      revalidatePath(`/admin/textbooks/${unit.textbook_id}/units/${lesson.unit_id}/lessons`);
  }
}

export async function deleteLesson(id: string) {
  const { supabase } = await checkAdmin();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("unit_id, audio_url")
    .eq("id", id)
    .single();

  const { data: oldLesson } = await supabase.from("lessons").select("*").eq("id", id).single();

  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw error;

  if (lesson?.audio_url) {
    const path = lesson.audio_url.split("/").pop();
    if (path) {
      await supabase.storage.from("audio").remove([path]);
    }
  }

  await logOperation({
    action: "delete",
    module: "content",
    resource_type: "lesson",
    resource_id: id,
    old_value: oldLesson,
  });

  if (lesson) {
    const { data: unit } = await supabase
      .from("units")
      .select("textbook_id")
      .eq("id", lesson.unit_id)
      .single();
    if (unit)
      revalidatePath(`/admin/textbooks/${unit.textbook_id}/units/${lesson.unit_id}/lessons`);
  }
}

// User management functions
type User = Database["public"]["Tables"]["users"]["Row"] & {
  user_stats?: Database["public"]["Tables"]["user_stats"]["Row"] | null;
};

export async function getUsers(options: {
  search?: string;
  role?: "student" | "admin" | "super_admin";
  status?: "active" | "suspended" | "banned";
  page?: number;
  limit?: number;
}) {
  const { supabase } = await checkAdmin();
  const { search, role, status, page = 1, limit = 20 } = options;

  let query = supabase.from("users").select(
    `
      *,
      user_stats (
        total_learning_minutes,
        total_lessons_completed,
        last_activity_at
      )
    `,
    { count: "exact" }
  );

  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("email", `%${search}%`);

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return { data: data as unknown as User[], count };
}

type UserDetail = Database["public"]["Tables"]["users"]["Row"] & {
  user_stats?: Database["public"]["Tables"]["user_stats"]["Row"] | null;
  learning_records?: Array<{
    id: string;
    lesson_id: string;
    played_seconds: number;
    completed: boolean;
    created_at: string;
    lessons?: {
      id: string;
      name: string;
      unit_id: string;
      units?: {
        id: string;
        textbook_id: string;
        name: string;
        textbooks?: {
          id: string;
          name: string;
        } | null;
      } | null;
    } | null;
  }>;
};

export async function getUser(id: string) {
  const { supabase } = await checkAdmin();

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      user_stats (*),
      learning_records (
        *,
        lessons (
          *,
          units (
            *,
            textbooks (name)
          )
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as UserDetail;
}

// Analytics functions
export async function getAnalyticsData() {
  const { supabase } = await checkAdmin();

  // Get total users
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  // Get new users today
  const today = new Date().toISOString().split("T")[0];
  const { count: todayNewUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today);

  // Get active users (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: weeklyActiveUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("last_login_at", sevenDaysAgo);

  // Get learning stats
  const { data: learningStats } = await supabase
    .from("user_stats")
    .select("total_learning_minutes, total_lessons_completed");

  const totalLearningMinutes =
    learningStats?.reduce((sum, s) => sum + (s.total_learning_minutes || 0), 0) || 0;
  const totalLessonsCompleted =
    learningStats?.reduce((sum, s) => sum + (s.total_lessons_completed || 0), 0) || 0;

  // Get content count
  const { count: textbookCount } = await supabase
    .from("textbooks")
    .select("*", { count: "exact", head: true });

  return {
    totalUsers: totalUsers || 0,
    todayNewUsers: todayNewUsers || 0,
    weeklyActiveUsers: weeklyActiveUsers || 0,
    totalLearningMinutes,
    totalLessonsCompleted,
    textbookCount: textbookCount || 0,
  };
}

// Media functions
export async function getMediaFiles(options: { page?: number; limit?: number } = {}) {
  const { supabase } = await checkAdmin();
  const { page = 1, limit = 20 } = options;

  // Get audio files from storage
  const { data: files, error } = await supabase.storage.from("audio").list(undefined, {
    limit: limit,
    offset: (page - 1) * limit,
    sortBy: { column: "name", order: "desc" },
  });

  if (error) throw error;

  return {
    files: files || [],
    total: files?.length || 0,
  };
}

export async function deleteMediaFile(path: string) {
  const { supabase } = await checkAdmin();
  const { error } = await supabase.storage.from("audio").remove([path]);
  if (error) throw error;
  revalidatePath("/admin/media");
}

// Settings functions
export async function getSettings() {
  const { supabase } = await checkAdmin();

  const result = await supabase
    .from("system_settings" as never)
    .select("*")
    .single();
  const { data } = result as { data: Record<string, unknown> | null };

  const settings = data || {
    site_name: "Book Voice",
    logo_url: "",
    allow_guest_access: false,
    allow_registration: true,
    default_playback_speed: 1,
    auto_play_next: false,
    max_upload_size: 50,
    allowed_formats: "mp3,wav,ogg",
    login_attempts: 5,
    captcha_enabled: false,
  };

  return settings;
}

export async function updateSettings(updates: Record<string, unknown>) {
  const { supabase } = await checkAdmin();

  const result = await supabase.from("system_settings" as never).upsert(updates as never, {
    onConflict: "key",
  });
  const { error } = result as { error: { message: string } | null };

  if (error) throw new Error(error.message);

  await logOperation({
    action: "update",
    module: "settings",
    resource_type: "system_settings",
    new_value: updates,
  });

  revalidatePath("/admin/settings");
}

type Audio = Database["public"]["Tables"]["audios"]["Row"];

// Audio management functions
export async function getAudios(lessonId: string): Promise<Audio[]> {
  const { supabase } = await checkAdmin();
  const { data, error } = await supabase
    .from("audios")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_num");

  if (error) throw error;
  return data || [];
}

export async function getAudio(id: string): Promise<Audio> {
  const { supabase } = await checkAdmin();
  const { data, error } = await supabase.from("audios").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}

export async function createAudio(formData: {
  lesson_id: string;
  title: string;
  type?: "main" | "listening" | "practice";
  audio_url: string;
  duration?: number;
  order_num?: number;
  is_default?: boolean;
  subtitle_text?: string;
}) {
  const { supabase } = await checkAdmin();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("unit_id")
    .eq("id", formData.lesson_id)
    .single();

  // If setting as default, unset other defaults
  if (formData.is_default) {
    await supabase.from("audios").update({ is_default: false }).eq("lesson_id", formData.lesson_id);
  }

  const { data: newAudio, error } = await supabase
    .from("audios")
    .insert({
      lesson_id: formData.lesson_id,
      title: formData.title,
      type: formData.type || "main",
      audio_url: formData.audio_url,
      duration: formData.duration || null,
      order_num: formData.order_num || 0,
      is_default: formData.is_default || false,
      subtitle_text: formData.subtitle_text ? JSON.parse(formData.subtitle_text) : null,
    })
    .select()
    .single();

  if (error) throw error;

  await logOperation({
    action: "create",
    module: "content",
    resource_type: "audio",
    resource_id: newAudio.id,
    new_value: formData,
  });

  revalidatePath(`/admin/content/textbooks/*/units/*/lessons/${formData.lesson_id}/audios`);
}

export async function updateAudio(
  id: string,
  formData: {
    title?: string;
    type?: "main" | "listening" | "practice";
    audio_url?: string;
    duration?: number;
    order_num?: number;
    is_default?: boolean;
    subtitle_text?: string;
  }
) {
  const { supabase } = await checkAdmin();

  const { data: oldAudio } = await supabase.from("audios").select("*").eq("id", id).single();
  const { data: audio } = await supabase.from("audios").select("lesson_id").eq("id", id).single();

  // If setting as default, unset other defaults for this lesson
  if (formData.is_default && audio) {
    await supabase
      .from("audios")
      .update({ is_default: false })
      .eq("lesson_id", audio.lesson_id)
      .neq("id", id);
  }

  const { error } = await supabase
    .from("audios")
    .update({
      title: formData.title,
      type: formData.type,
      audio_url: formData.audio_url,
      duration: formData.duration,
      order_num: formData.order_num,
      is_default: formData.is_default,
      subtitle_text: formData.subtitle_text ? JSON.parse(formData.subtitle_text) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  await logOperation({
    action: "update",
    module: "content",
    resource_type: "audio",
    resource_id: id,
    old_value: oldAudio,
    new_value: formData,
  });

  if (audio) {
    revalidatePath(`/admin/content/textbooks/*/units/*/lessons/${audio.lesson_id}/audios`);
  }
}

export async function deleteAudio(id: string) {
  const { supabase } = await checkAdmin();

  const { data: audio } = await supabase
    .from("audios")
    .select("lesson_id, audio_url")
    .eq("id", id)
    .single();

  const { data: oldAudio } = await supabase.from("audios").select("*").eq("id", id).single();

  const { error } = await supabase.from("audios").delete().eq("id", id);
  if (error) throw error;

  // Delete file from storage
  if (audio?.audio_url) {
    const path = audio.audio_url.split("/").pop();
    if (path) {
      await supabase.storage.from("audio").remove([path]);
    }
  }

  await logOperation({
    action: "delete",
    module: "content",
    resource_type: "audio",
    resource_id: id,
    old_value: oldAudio,
  });

  if (audio) {
    revalidatePath(`/admin/content/textbooks/*/units/*/lessons/${audio.lesson_id}/audios`);
  }
}

export async function setDefaultAudio(id: string) {
  const { supabase } = await checkAdmin();

  const { data: audio } = await supabase.from("audios").select("lesson_id").eq("id", id).single();

  if (!audio) throw new Error("Audio not found");

  const { data: oldAudio } = await supabase.from("audios").select("*").eq("id", id).single();

  // Unset all defaults for this lesson
  await supabase.from("audios").update({ is_default: false }).eq("lesson_id", audio.lesson_id);

  // Set this one as default
  const { error } = await supabase.from("audios").update({ is_default: true }).eq("id", id);

  if (error) throw error;

  await logOperation({
    action: "update",
    module: "content",
    resource_type: "audio",
    resource_id: id,
    old_value: oldAudio,
    new_value: { is_default: true },
  });

  revalidatePath(`/admin/content/textbooks/*/units/*/lessons/${audio.lesson_id}/audios`);
}

// Log functions
export async function getOperationLogs(
  options: {
    module?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ data: Array<Record<string, unknown>>; count: number }> {
  const { supabase } = await checkAdmin();

  // Only super_admin can access logs
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data: profile } = (await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single()) as { data: { role: string } | null };

  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized: Super admin required");
  }

  const { module, startDate, endDate, page = 1, limit = 50 } = options;

  let query = supabase.from("operation_logs" as never).select(
    `
      *,
      users:user_id (email)
    `,
    { count: "exact" }
  );

  if (module) query = query.eq("module", module);
  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const result = await query
    .range((page - 1) * limit, page * limit - 1)
    .order("created_at", { ascending: false });

  const { data, error, count } = result as {
    data: Array<Record<string, unknown>>;
    error: { message: string } | null;
    count: number | null;
  };

  if (error) throw new Error(error.message);
  return { data, count: count || 0 };
}
