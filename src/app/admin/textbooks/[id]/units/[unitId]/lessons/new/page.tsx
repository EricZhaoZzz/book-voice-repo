import { LessonForm } from "../lesson-form";

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const { id, unitId } = await params;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">New Lesson</h1>
      <LessonForm textbookId={id} unitId={unitId} />
    </div>
  );
}
