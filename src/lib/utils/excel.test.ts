import { describe, it, expect } from "vitest";
import { validateStudentData, type StudentImportRow } from "./excel";

describe("validateStudentData", () => {
  it("should return no errors for valid data", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "001", grade: "3", class: "A" },
      { name: "Jane Smith", student_id: "002", grade: "3", class: "A" },
    ];
    const errors = validateStudentData(students);
    expect(errors).toHaveLength(0);
  });

  it("should detect missing name", () => {
    const students: StudentImportRow[] = [{ name: "", student_id: "001", grade: "3", class: "A" }];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("Name"))).toBe(true);
  });

  it("should detect missing student_id", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "", grade: "3", class: "A" },
    ];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("Student ID"))).toBe(true);
  });

  it("should detect duplicate student_id", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "001", grade: "3", class: "A" },
      { name: "Jane Smith", student_id: "001", grade: "3", class: "B" },
    ];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("Duplicate"))).toBe(true);
  });

  it("should detect missing grade", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "001", grade: "", class: "A" },
    ];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("Grade"))).toBe(true);
  });

  it("should detect missing class", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "001", grade: "3", class: "" },
    ];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("Class"))).toBe(true);
  });

  it("should detect exceeding max students", () => {
    const students: StudentImportRow[] = Array.from({ length: 1001 }, (_, i) => ({
      name: `Student ${i}`,
      student_id: String(i).padStart(4, "0"),
      grade: "3",
      class: "A",
    }));
    const errors = validateStudentData(students);
    expect(errors.some((e) => e.includes("1000"))).toBe(true);
  });

  it("should report correct row numbers", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "001", grade: "3", class: "A" },
      { name: "", student_id: "002", grade: "3", class: "A" },
    ];
    const errors = validateStudentData(students);
    expect(errors.some((e) => e.includes("Row 3"))).toBe(true);
  });
});
