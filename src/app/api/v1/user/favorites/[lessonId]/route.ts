import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { UserService } from "@/services/user.service";
import { success, errors } from "@/lib/api/response";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  return withAuth(request, async (context) => {
    try {
      const { lessonId } = await params;
      await UserService.removeFavorite(context.userId, lessonId);
      return success({ message: "Favorite removed" });
    } catch (error) {
      if (error instanceof Error) {
        return errors.badRequest(error.message);
      }
      return errors.internal();
    }
  });
}
