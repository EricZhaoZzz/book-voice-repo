import { NextRequest } from "next/server";
import { LessonService } from "@/services/lesson.service";
import { success, errors } from "@/lib/api/response";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lessons = await LessonService.getLessonsByUnitId(id);
    return success(lessons);
  } catch (error) {
    if (error instanceof Error) {
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
