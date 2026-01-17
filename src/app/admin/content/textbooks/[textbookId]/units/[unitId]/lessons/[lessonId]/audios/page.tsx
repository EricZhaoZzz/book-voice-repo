import { getAudios } from "@/app/admin/actions";
import { AudiosList } from "./audios-list";

interface Audio {
  id: string;
  lesson_id: string;
  title: string;
  type: "main" | "listening" | "practice";
  audio_url: string;
  duration: number | null;
  order_num: number;
  is_default: boolean;
  subtitle_text: unknown;
  created_at: string;
  updated_at: string;
}

export default async function LessonAudiosPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const audios = await getAudios(lessonId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audio Management</h1>
      <AudiosList lessonId={lessonId} audios={audios as Audio[]} />
    </div>
  );
}
