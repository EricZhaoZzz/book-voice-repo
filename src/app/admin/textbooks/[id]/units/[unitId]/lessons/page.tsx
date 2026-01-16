import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLessons, deleteLesson } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/app/admin/textbooks/delete-button";

export default async function LessonsPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const { id, unitId } = await params;
  const supabase = await createClient();
  const { data: unit } = await supabase.from("units").select("name").eq("id", unitId).single();
  const lessons = await getLessons(unitId);

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/admin/textbooks/${id}/units`}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to Units
        </Link>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lessons - {unit?.name}</h1>
        <Link href={`/admin/textbooks/${id}/units/${unitId}/lessons/new`}>
          <Button>Add Lesson</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="border-b">
                <td className="px-4 py-3 text-sm">{lesson.order_num}</td>
                <td className="px-4 py-3 text-sm">{lesson.name}</td>
                <td className="px-4 py-3 text-sm">
                  {Math.floor(lesson.audio_duration / 60)}:
                  {(lesson.audio_duration % 60).toString().padStart(2, "0")}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <Link href={`/admin/textbooks/${id}/units/${unitId}/lessons/${lesson.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <DeleteButton id={lesson.id} action={deleteLesson} />
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No lessons found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
