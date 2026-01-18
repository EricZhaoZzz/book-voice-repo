import { NextResponse } from "next/server";
import { generateClassReport } from "@/lib/utils/report-generator";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const buffer = await generateClassReport(params.id);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="class-report-${params.id}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: (error as Error).message } },
      { status: 500 }
    );
  }
}
