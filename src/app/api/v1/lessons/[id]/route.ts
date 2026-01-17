import { NextRequest } from "next/server";
import { LessonService } from "@/services/lesson.service";
import { success, errors } from "@/lib/api/response";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lesson = await LessonService.getLessonById(id);
    return success(lesson);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Lesson not found") {
        return errors.notFound(error.message);
      }
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
