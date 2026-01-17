import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { UserService } from "@/services/user.service";
import { success, errors } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async (context) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const limit = parseInt(searchParams.get("limit") || "50", 10);

      const history = await UserService.getPlayHistory(context.userId, limit);
      return success(history);
    } catch (error) {
      if (error instanceof Error) {
        return errors.badRequest(error.message);
      }
      return errors.internal();
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (context) => {
    try {
      const body = await request.json();
      const { lessonId, position } = body;

      if (!lessonId) {
        return errors.badRequest("lessonId is required");
      }

      if (typeof position !== "number") {
        return errors.badRequest("position must be a number");
      }

      const record = await UserService.updatePlayHistory(context.userId, lessonId, position);
      return success(record);
    } catch (error) {
      if (error instanceof Error) {
        return errors.badRequest(error.message);
      }
      return errors.internal();
    }
  });
}
