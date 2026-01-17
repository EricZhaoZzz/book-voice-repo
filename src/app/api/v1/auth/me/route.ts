import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { success } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async (context) => {
    return success({
      user: context.user,
    });
  });
}
