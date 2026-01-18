import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";

export async function generateClassReport(classId: string) {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("class_students")
    .select("student_id, users!inner(*)")
    .eq("class_id", classId);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Learning Report");

  worksheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Student ID", key: "student_id", width: 15 },
    { header: "Total Minutes", key: "total_minutes", width: 15 },
    { header: "Lessons Completed", key: "lessons_completed", width: 20 },
    { header: "Streak Days", key: "streak_days", width: 15 },
    { header: "Last Activity", key: "last_activity", width: 20 },
  ];

  for (const student of students || []) {
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", student.student_id)
      .single();

    worksheet.addRow({
      name: student.users.username,
      student_id: student.users.student_id,
      total_minutes: stats?.total_learning_minutes || 0,
      lessons_completed: stats?.total_lessons_completed || 0,
      streak_days: stats?.streak_days || 0,
      last_activity: stats?.last_activity_at || "N/A",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
