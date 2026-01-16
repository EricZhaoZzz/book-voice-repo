import { createClient } from "@/lib/supabase/server";
import { LessonForm } from "../../lesson-form";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string; lessonId: string }>;
}) {
  const { id, unitId, lessonId } = await params;
  const supabase = await createClient();
  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).single();

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit Lesson</h1>
      <LessonForm textbookId={id} unitId={unitId} lesson={lesson} />
    </div>
  );
}
