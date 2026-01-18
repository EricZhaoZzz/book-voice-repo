import * as XLSX from "xlsx";

export interface StudentImportRow {
  name: string;
  student_id: string;
  grade: string;
  class: string;
}

export function parseStudentExcel(buffer: ArrayBuffer): StudentImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<StudentImportRow>(sheet);

  return data.map((row) => ({
    name: String(row.name || "").trim(),
    student_id: String(row.student_id || "").trim(),
    grade: String(row.grade || "").trim(),
    class: String(row.class || "").trim(),
  }));
}

export function validateStudentData(students: StudentImportRow[]): string[] {
  const errors: string[] = [];
  const studentIds = new Set<string>();

  students.forEach((student, index) => {
    const row = index + 2;

    if (!student.name) errors.push(`Row ${row}: Name is required`);
    if (!student.student_id) errors.push(`Row ${row}: Student ID is required`);
    if (!student.grade) errors.push(`Row ${row}: Grade is required`);
    if (!student.class) errors.push(`Row ${row}: Class is required`);

    if (studentIds.has(student.student_id)) {
      errors.push(`Row ${row}: Duplicate student ID ${student.student_id}`);
    }
    studentIds.add(student.student_id);
  });

  if (students.length > 1000) {
    errors.push("Maximum 1000 students per import");
  }

  return errors;
}
