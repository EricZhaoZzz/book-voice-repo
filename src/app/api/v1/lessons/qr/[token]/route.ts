import { NextRequest } from "next/server";
import { LessonService } from "@/services/lesson.service";
import { success, errors } from "@/lib/api/response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const lesson = await LessonService.getLessonByQrToken(token);
    return success(lesson);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Invalid QR code") {
        return errors.notFound(error.message);
      }
      if (error.message === "QR code has expired") {
        return errors.badRequest(error.message);
      }
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
