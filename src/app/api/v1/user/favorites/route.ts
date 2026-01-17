import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { UserService } from "@/services/user.service";
import { success, errors } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async (context) => {
    try {
      const favorites = await UserService.getFavorites(context.userId);
      return success(favorites);
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
      const { lessonId } = body;

      if (!lessonId) {
        return errors.badRequest("lessonId is required");
      }

      const favorite = await UserService.addFavorite(context.userId, lessonId);
      return success(favorite, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Already favorited") {
          return errors.conflict(error.message);
        }
        return errors.badRequest(error.message);
      }
      return errors.internal();
    }
  });
}
