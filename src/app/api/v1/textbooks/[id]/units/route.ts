import { NextRequest } from "next/server";
import { UnitService } from "@/services/unit.service";
import { success, errors } from "@/lib/api/response";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const units = await UnitService.getUnitsByTextbookId(id);
    return success(units);
  } catch (error) {
    if (error instanceof Error) {
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
