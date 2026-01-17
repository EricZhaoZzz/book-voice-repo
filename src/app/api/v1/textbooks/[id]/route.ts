import { NextRequest } from "next/server";
import { TextbookService } from "@/services/textbook.service";
import { success, errors } from "@/lib/api/response";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const textbook = await TextbookService.getTextbookById(id);
    return success(textbook);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Textbook not found") {
        return errors.notFound(error.message);
      }
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
