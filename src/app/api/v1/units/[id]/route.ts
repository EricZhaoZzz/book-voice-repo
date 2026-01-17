import { NextRequest } from "next/server";
import { UnitService } from "@/services/unit.service";
import { success, errors } from "@/lib/api/response";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const unit = await UnitService.getUnitById(id);
    return success(unit);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unit not found") {
        return errors.notFound(error.message);
      }
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
