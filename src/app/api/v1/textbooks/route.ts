import { NextRequest } from "next/server";
import { TextbookService } from "@/services/textbook.service";
import { paginated, errors } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const grade = searchParams.get("grade") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await TextbookService.getTextbooks({ grade, page, limit });

    return paginated(result.data, {
      page,
      limit,
      total: result.total,
    });
  } catch (error) {
    if (error instanceof Error) {
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
