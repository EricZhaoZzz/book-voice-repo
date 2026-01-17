import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { UserService } from "@/services/user.service";
import { success, errors } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async (context) => {
    try {
      const stats = await UserService.getLearningStats(context.userId);
      return success(stats);
    } catch (error) {
      if (error instanceof Error) {
        return errors.badRequest(error.message);
      }
      return errors.internal();
    }
  });
}
