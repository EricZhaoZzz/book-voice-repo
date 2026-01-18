import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseStudentExcel, validateStudentData } from "@/lib/utils/excel";
import type { Database } from "@/types/database";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: "No file provided" } },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const students = parseStudentExcel(buffer);
    const errors = validateStudentData(students);

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: { message: "Validation failed", details: errors } },
        { status: 400 }
      );
    }

    const adminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];

    for (const student of students) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: `${student.student_id}@temp.local`,
        password: "123456",
        email_confirm: true,
        user_metadata: {
          username: student.name,
          student_id: student.student_id,
          grade: student.grade,
          class: student.class,
          subscription_id: params.id,
        },
      });

      if (!error) results.push(data.user);
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: results.length,
        total: students.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: (error as Error).message } },
      { status: 500 }
    );
  }
}
