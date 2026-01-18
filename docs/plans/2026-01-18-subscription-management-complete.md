# Subscription Management Complete Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement complete subscription management system including API routes, admin UI, batch student import, class management, expiration handling, and learning reports export.

**Architecture:** Build on existing Next.js 16 + Supabase foundation. Database schema already exists (subscriptions, classes, class_students tables). Need to add API routes, admin UI components, and background job handlers. Use TanStack Query for client-side data fetching, React Hook Form + Zod for validation, and Shadcn/ui for UI components.

**Tech Stack:** Next.js 16, TypeScript, Supabase, TanStack Query, Zod, React Hook Form, Shadcn/ui, xlsx (Excel parsing), exceljs (Excel generation)

**Current Status:**

- Database tables: `subscriptions`, `classes`, `class_students` ✅
- RLS policies: ✅
- Subscription service: Basic CRUD ✅
- Validation schema: `src/lib/validations/subscription.ts` ✅
- API routes: ❌ Missing
- Admin UI: ❌ Missing
- Batch import: ❌ Missing
- Reports: ❌ Missing

---

## Task 1: Subscription API Routes - List and Create

**Files:**

- Create: `src/app/api/v1/admin/subscriptions/route.ts`

**Step 1: Write the API route for GET and POST**

```typescript
// src/app/api/v1/admin/subscriptions/route.ts
import { NextResponse } from "next/server";
import { createSubscription, getSubscriptions } from "@/services/subscription.service";
import { createSubscriptionSchema } from "@/lib/validations/subscription";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || !["admin", "super_admin"].includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 }
      );
    }

    const subscriptions = await getSubscriptions();
    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || !["admin", "super_admin"].includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = createSubscriptionSchema.parse(body);

    const subscription = await createSubscription(validated, user.id);
    return NextResponse.json({ success: true, data: subscription }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 400 });
  }
}
```

**Step 2: Test the endpoint manually**

Run: `npm run dev`
Test with curl or Postman:

- GET `http://localhost:3000/api/v1/admin/subscriptions` (requires auth)
  Expected: Returns list of subscriptions or 401 if not authenticated

**Step 3: Commit**

```bash
git add src/app/api/v1/admin/subscriptions/route.ts
git commit -m "feat: add subscription list and create API endpoints"
```

---

## Task 2: Subscription API Routes - Detail, Update, Delete

**Files:**

- Create: `src/app/api/v1/admin/subscriptions/[id]/route.ts`

**Step 1: Write the API route for GET, PUT, DELETE**

```typescript
// src/app/api/v1/admin/subscriptions/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} from "@/services/subscription.service";
import { updateSubscriptionSchema } from "@/lib/validations/subscription";
import { createClient } from "@/lib/supabase/server";

async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!userData || !["admin", "super_admin"].includes(userData.role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { user, supabase };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const subscription = await getSubscriptionById(id);
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateSubscriptionSchema.parse(body);

    const subscription = await updateSubscription(id, validated);
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id } = await params;
    await deleteSubscription(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 400 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/v1/admin/subscriptions/[id]/route.ts
git commit -m "feat: add subscription detail, update, delete API endpoints"
```

---

## Task 3: Class Service Layer

**Files:**

- Create: `src/services/class.service.ts`
- Create: `src/lib/validations/class.ts`

**Step 1: Write class validation schema**

```typescript
// src/lib/validations/class.ts
import { z } from "zod";

export const createClassSchema = z.object({
  subscription_id: z.string().uuid("Invalid subscription ID"),
  name: z.string().min(1, "Class name is required"),
  grade: z.string().min(1, "Grade is required"),
});

export const updateClassSchema = createClassSchema.partial().omit({ subscription_id: true });

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
```

**Step 2: Write class service**

```typescript
// src/services/class.service.ts
import { createClient } from "@/lib/supabase/server";
import type { CreateClassInput, UpdateClassInput } from "@/lib/validations/class";

export async function createClass(data: CreateClassInput, adminId: string) {
  const supabase = await createClient();

  const { data: classData, error } = await supabase
    .from("classes")
    .insert({
      ...data,
      admin_id: adminId,
    })
    .select()
    .single();

  if (error) throw error;
  return classData;
}

export async function getClassesBySubscription(subscriptionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select("*, class_students(count)")
    .eq("subscription_id", subscriptionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getClassById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select("*, subscriptions(school_name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateClass(id: string, data: UpdateClassInput) {
  const supabase = await createClient();

  const { data: classData, error } = await supabase
    .from("classes")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return classData;
}

export async function deleteClass(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("classes").delete().eq("id", id);

  if (error) throw error;
}

export async function getClassStudents(classId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("class_students")
    .select("*, users(id, username, email, student_id, grade, status)")
    .eq("class_id", classId)
    .order("joined_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addStudentToClass(classId: string, studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("class_students")
    .insert({ class_id: classId, student_id: studentId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeStudentFromClass(classId: string, studentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("class_students")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) throw error;
}
```

**Step 3: Commit**

```bash
git add src/services/class.service.ts src/lib/validations/class.ts
git commit -m "feat: add class service layer and validation"
```

---

## Task 4: Class API Routes

**Files:**

- Create: `src/app/api/v1/admin/classes/route.ts`
- Create: `src/app/api/v1/admin/classes/[id]/route.ts`
- Create: `src/app/api/v1/admin/classes/[id]/students/route.ts`

**Step 1: Write class list and create endpoint**

```typescript
// src/app/api/v1/admin/classes/route.ts
import { NextResponse } from "next/server";
import { createClass, getClassesBySubscription } from "@/services/class.service";
import { createClassSchema } from "@/lib/validations/class";
import { createClient } from "@/lib/supabase/server";

async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!userData || !["admin", "super_admin"].includes(userData.role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { user, supabase };
}

export async function GET(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("subscription_id");

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: { message: "subscription_id is required" } },
        { status: 400 }
      );
    }

    const classes = await getClassesBySubscription(subscriptionId);
    return NextResponse.json({ success: true, data: classes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const validated = createClassSchema.parse(body);

    const classData = await createClass(validated, auth.user.id);
    return NextResponse.json({ success: true, data: classData }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 400 });
  }
}
```

**Step 2: Write class detail endpoint**

```typescript
// src/app/api/v1/admin/classes/[id]/route.ts
import { NextResponse } from "next/server";
import { getClassById, updateClass, deleteClass } from "@/services/class.service";
import { updateClassSchema } from "@/lib/validations/class";
import { createClient } from "@/lib/supabase/server";

async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!userData || !["admin", "super_admin"].includes(userData.role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { user, supabase };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const classData = await getClassById(id);
    return NextResponse.json({ success: true, data: classData });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateClassSchema.parse(body);

    const classData = await updateClass(id, validated);
    return NextResponse.json({ success: true, data: classData });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id } = await params;
    await deleteClass(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 400 });
  }
}
```

**Step 3: Write class students endpoint**

```typescript
// src/app/api/v1/admin/classes/[id]/students/route.ts
import { NextResponse } from "next/server";
import {
  getClassStudents,
  addStudentToClass,
  removeStudentFromClass,
} from "@/services/class.service";
import { createClient } from "@/lib/supabase/server";

async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!userData || !["admin", "super_admin"].includes(userData.role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { user, supabase };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const students = await getClassStudents(id);
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { student_id } = body;

    if (!student_id) {
      return NextResponse.json(
        { success: false, error: { message: "student_id is required" } },
        { status: 400 }
      );
    }

    const result = await addStudentToClass(id, student_id);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: { message: "student_id is required" } },
        { status: 400 }
      );
    }

    await removeStudentFromClass(id, studentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 400 });
  }
}
```

**Step 4: Commit**

```bash
git add src/app/api/v1/admin/classes/
git commit -m "feat: add class management API routes"
```

---

## Task 5: Excel Parsing Utility for Batch Import

**Files:**

- Create: `src/lib/utils/excel.ts`

**Step 1: Install xlsx package**

Run: `npm install xlsx`
Expected: Package installed successfully

**Step 2: Write Excel parsing utility**

```typescript
// src/lib/utils/excel.ts
import * as XLSX from "xlsx";

export interface StudentImportRow {
  name: string;
  student_id: string;
  grade: string;
  class_name: string;
}

export function parseStudentExcel(buffer: ArrayBuffer): StudentImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Get raw data with headers
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  return rawData.map((row) => ({
    name: String(row["Name"] || row["name"] || row["姓名"] || "").trim(),
    student_id: String(row["Student ID"] || row["student_id"] || row["学号"] || "").trim(),
    grade: String(row["Grade"] || row["grade"] || row["年级"] || "").trim(),
    class_name: String(row["Class"] || row["class"] || row["班级"] || "").trim(),
  }));
}

export interface ValidationError {
  row: number;
  message: string;
}

export function validateStudentData(students: StudentImportRow[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const studentIds = new Set<string>();

  if (students.length === 0) {
    errors.push({ row: 0, message: "No data found in file" });
    return errors;
  }

  if (students.length > 1000) {
    errors.push({ row: 0, message: "Maximum 1000 students per import" });
  }

  students.forEach((student, index) => {
    const row = index + 2; // Excel rows start at 1, header is row 1

    if (!student.name) {
      errors.push({ row, message: "Name is required" });
    }

    if (!student.student_id) {
      errors.push({ row, message: "Student ID is required" });
    } else if (studentIds.has(student.student_id)) {
      errors.push({ row, message: `Duplicate student ID: ${student.student_id}` });
    } else {
      studentIds.add(student.student_id);
    }

    if (!student.grade) {
      errors.push({ row, message: "Grade is required" });
    }

    if (!student.class_name) {
      errors.push({ row, message: "Class is required" });
    }
  });

  return errors;
}

export function generateStudentTemplate(): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const data = [
    ["Name", "Student ID", "Grade", "Class"],
    ["Zhang San", "2024001", "3", "1"],
    ["Li Si", "2024002", "3", "1"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}
```

**Step 3: Commit**

```bash
git add src/lib/utils/excel.ts
git commit -m "feat: add Excel parsing utility for student import"
```

---

## Task 6: Batch Student Import API

**Files:**

- Create: `src/app/api/v1/admin/subscriptions/[id]/students/route.ts`
- Modify: `src/services/subscription.service.ts` (add batch import function)

**Step 1: Add batch import function to subscription service**

Add to `src/services/subscription.service.ts`:

```typescript
// Add these imports at the top
import type { StudentImportRow } from "@/lib/utils/excel";

// Add this function at the end of the file
export async function batchImportStudents(
  subscriptionId: string,
  students: StudentImportRow[],
  defaultPassword: string = "123456"
) {
  const supabase = await createClient();
  const results: { success: number; failed: number; errors: string[] } = {
    success: 0,
    failed: 0,
    errors: [],
  };

  const batchSize = 50;

  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);

    for (const student of batch) {
      try {
        // Create auth user with Supabase Admin API
        // Note: This requires service role key and admin API access
        const email = `${student.student_id}@student.bookvoice.local`;

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("student_id", student.student_id)
          .single();

        if (existingUser) {
          results.failed++;
          results.errors.push(`Student ID ${student.student_id} already exists`);
          continue;
        }

        // Insert user directly (password handled separately via Supabase Auth)
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert({
            email,
            username: student.name,
            student_id: student.student_id,
            grade: student.grade,
            school: student.class_name,
            role: "student",
            status: "active",
            subscription_id: subscriptionId,
          })
          .select()
          .single();

        if (userError) {
          results.failed++;
          results.errors.push(`Failed to create user ${student.student_id}: ${userError.message}`);
          continue;
        }

        results.success++;
      } catch (error) {
        results.failed++;
        const message = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Error processing ${student.student_id}: ${message}`);
      }
    }
  }

  // Update subscription student count
  await supabase
    .from("subscriptions")
    .update({ student_count: results.success })
    .eq("id", subscriptionId);

  return results;
}
```

**Step 2: Write batch import API endpoint**

```typescript
// src/app/api/v1/admin/subscriptions/[id]/students/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseStudentExcel, validateStudentData } from "@/lib/utils/excel";
import { batchImportStudents } from "@/services/subscription.service";

async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!userData || !["admin", "super_admin"].includes(userData.role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { user, supabase };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id: subscriptionId } = await params;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: "No file provided" } },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Invalid file type. Please upload an Excel file (.xlsx or .xls)" },
        },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const students = parseStudentExcel(buffer);
    const validationErrors = validateStudentData(students);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Validation failed",
            details: validationErrors,
          },
        },
        { status: 400 }
      );
    }

    const results = await batchImportStudents(subscriptionId, students);

    return NextResponse.json({
      success: true,
      data: {
        imported: results.success,
        failed: results.failed,
        total: students.length,
        errors: results.errors.slice(0, 10), // Return first 10 errors
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id: subscriptionId } = await params;

    // Get all students for this subscription
    const { data: students, error } = await auth.supabase
      .from("users")
      .select("id, username, email, student_id, grade, school, status, created_at")
      .eq("subscription_id", subscriptionId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
```

**Step 3: Commit**

```bash
git add src/services/subscription.service.ts src/app/api/v1/admin/subscriptions/[id]/students/route.ts
git commit -m "feat: add batch student import API"
```

---

## Task 7: Learning Report Generator

**Files:**

- Create: `src/lib/utils/report-generator.ts`

**Step 1: Install exceljs package**

Run: `npm install exceljs`
Expected: Package installed successfully

**Step 2: Write report generator utility**

```typescript
// src/lib/utils/report-generator.ts
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";

export interface StudentReportData {
  name: string;
  student_id: string;
  grade: string;
  class_name: string;
  total_minutes: number;
  lessons_completed: number;
  streak_days: number;
  last_activity: string;
}

export async function getClassReportData(classId: string): Promise<StudentReportData[]> {
  const supabase = await createClient();

  // Get students in the class
  const { data: classStudents, error: studentsError } = await supabase
    .from("class_students")
    .select("student_id")
    .eq("class_id", classId);

  if (studentsError) throw studentsError;
  if (!classStudents || classStudents.length === 0) return [];

  const studentIds = classStudents.map((cs) => cs.student_id);

  // Get user details
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username, student_id, grade, school")
    .in("id", studentIds);

  if (usersError) throw usersError;

  // Get stats for all students
  const { data: stats, error: statsError } = await supabase
    .from("user_stats")
    .select("*")
    .in("user_id", studentIds);

  if (statsError) throw statsError;

  // Combine data
  const statsMap = new Map(stats?.map((s) => [s.user_id, s]) || []);

  return (users || []).map((user) => {
    const userStats = statsMap.get(user.id);
    return {
      name: user.username,
      student_id: user.student_id || "",
      grade: user.grade || "",
      class_name: user.school || "",
      total_minutes: userStats?.total_learning_minutes || 0,
      lessons_completed: userStats?.total_lessons_completed || 0,
      streak_days: userStats?.streak_days || 0,
      last_activity: userStats?.last_activity_at
        ? new Date(userStats.last_activity_at).toLocaleDateString()
        : "N/A",
    };
  });
}

export async function generateClassReportExcel(classId: string): Promise<Buffer> {
  const data = await getClassReportData(classId);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Book Voice";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Learning Report");

  // Define columns
  worksheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Student ID", key: "student_id", width: 15 },
    { header: "Grade", key: "grade", width: 10 },
    { header: "Class", key: "class_name", width: 15 },
    { header: "Total Minutes", key: "total_minutes", width: 15 },
    { header: "Lessons Completed", key: "lessons_completed", width: 20 },
    { header: "Streak Days", key: "streak_days", width: 15 },
    { header: "Last Activity", key: "last_activity", width: 20 },
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // Add summary row
  const summaryRow = worksheet.addRow({
    name: "Total",
    student_id: "",
    grade: "",
    class_name: "",
    total_minutes: data.reduce((sum, r) => sum + r.total_minutes, 0),
    lessons_completed: data.reduce((sum, r) => sum + r.lessons_completed, 0),
    streak_days: "",
    last_activity: "",
  });
  summaryRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function getSubscriptionReportData(
  subscriptionId: string
): Promise<StudentReportData[]> {
  const supabase = await createClient();

  // Get all students in the subscription
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username, student_id, grade, school")
    .eq("subscription_id", subscriptionId);

  if (usersError) throw usersError;
  if (!users || users.length === 0) return [];

  const studentIds = users.map((u) => u.id);

  // Get stats for all students
  const { data: stats, error: statsError } = await supabase
    .from("user_stats")
    .select("*")
    .in("user_id", studentIds);

  if (statsError) throw statsError;

  // Combine data
  const statsMap = new Map(stats?.map((s) => [s.user_id, s]) || []);

  return users.map((user) => {
    const userStats = statsMap.get(user.id);
    return {
      name: user.username,
      student_id: user.student_id || "",
      grade: user.grade || "",
      class_name: user.school || "",
      total_minutes: userStats?.total_learning_minutes || 0,
      lessons_completed: userStats?.total_lessons_completed || 0,
      streak_days: userStats?.streak_days || 0,
      last_activity: userStats?.last_activity_at
        ? new Date(userStats.last_activity_at).toLocaleDateString()
        : "N/A",
    };
  });
}

export async function generateSubscriptionReportExcel(subscriptionId: string): Promise<Buffer> {
  const data = await getSubscriptionReportData(subscriptionId);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Book Voice";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Learning Report");

  worksheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Student ID", key: "student_id", width: 15 },
    { header: "Grade", key: "grade", width: 10 },
    { header: "Class", key: "class_name", width: 15 },
    { header: "Total Minutes", key: "total_minutes", width: 15 },
    { header: "Lessons Completed", key: "lessons_completed", width: 20 },
    { header: "Streak Days", key: "streak_days", width: 15 },
    { header: "Last Activity", key: "last_activity", width: 20 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  const summaryRow = worksheet.addRow({
    name: "Total",
    student_id: "",
    grade: "",
    class_name: "",
    total_minutes: data.reduce((sum, r) => sum + r.total_minutes, 0),
    lessons_completed: data.reduce((sum, r) => sum + r.lessons_completed, 0),
    streak_days: "",
    last_activity: "",
  });
  summaryRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
```

**Step 3: Commit**

```bash
git add src/lib/utils/report-generator.ts
git commit -m "feat: add learning report generator utility"
```

---

## Task 8: Learning Report API Endpoints

**Files:**

- Create: `src/app/api/v1/admin/classes/[id]/reports/route.ts`
- Create: `src/app/api/v1/admin/subscriptions/[id]/reports/route.ts`

**Step 1: Write class report endpoint**

```typescript
// src/app/api/v1/admin/classes/[id]/reports/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateClassReportExcel } from "@/lib/utils/report-generator";

async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!userData || !["admin", "super_admin"].includes(userData.role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { user, supabase };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id: classId } = await params;

    const buffer = await generateClassReportExcel(classId);
    const filename = `class-report-${classId}-${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
```

**Step 2: Write subscription report endpoint**

```typescript
// src/app/api/v1/admin/subscriptions/[id]/reports/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSubscriptionReportExcel } from "@/lib/utils/report-generator";

async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!userData || !["admin", "super_admin"].includes(userData.role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { user, supabase };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: { message: auth.error } },
        { status: auth.status }
      );
    }

    const { id: subscriptionId } = await params;

    const buffer = await generateSubscriptionReportExcel(subscriptionId);
    const filename = `subscription-report-${subscriptionId}-${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/v1/admin/classes/[id]/reports/ src/app/api/v1/admin/subscriptions/[id]/reports/
git commit -m "feat: add learning report download API endpoints"
```

---

## Task 9: Subscription Expiration Checker

**Files:**

- Create: `src/lib/cron/check-subscriptions.ts`
- Create: `src/app/api/cron/check-subscriptions/route.ts`

**Step 1: Write expiration checker logic**

```typescript
// src/lib/cron/check-subscriptions.ts
import { createClient } from "@/lib/supabase/server";

export interface ExpirationCheckResult {
  expiringSoon: number;
  expired: number;
  processed: string[];
}

export async function checkExpiringSubscriptions(): Promise<ExpirationCheckResult> {
  const supabase = await createClient();
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const todayStr = today.toISOString().split("T")[0];
  const sevenDaysStr = sevenDaysLater.toISOString().split("T")[0];

  const result: ExpirationCheckResult = {
    expiringSoon: 0,
    expired: 0,
    processed: [],
  };

  // Find subscriptions expiring in the next 7 days (for notifications)
  const { data: expiringSoon } = await supabase
    .from("subscriptions")
    .select("id, school_name, end_date, school_contact")
    .eq("status", "active")
    .lte("end_date", sevenDaysStr)
    .gte("end_date", todayStr);

  result.expiringSoon = expiringSoon?.length || 0;

  // TODO: Send notification emails for expiring subscriptions
  // This would require email service integration (SendGrid, Resend, etc.)

  // Find and process expired subscriptions
  const { data: expired } = await supabase
    .from("subscriptions")
    .select("id, school_name")
    .eq("status", "active")
    .lt("end_date", todayStr);

  if (expired && expired.length > 0) {
    for (const sub of expired) {
      // Update subscription status to expired
      await supabase.from("subscriptions").update({ status: "expired" }).eq("id", sub.id);

      // Suspend all students in this subscription
      await supabase
        .from("users")
        .update({ status: "suspended" })
        .eq("subscription_id", sub.id)
        .eq("role", "student");

      result.processed.push(sub.school_name);
    }
    result.expired = expired.length;
  }

  return result;
}
```

**Step 2: Write cron API endpoint**

```typescript
// src/app/api/cron/check-subscriptions/route.ts
import { NextResponse } from "next/server";
import { checkExpiringSubscriptions } from "@/lib/cron/check-subscriptions";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkExpiringSubscriptions();

    return NextResponse.json({
      success: true,
      data: {
        checkedAt: new Date().toISOString(),
        expiringSoon: result.expiringSoon,
        expired: result.expired,
        processedSchools: result.processed,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
```

**Step 3: Add CRON_SECRET to environment**

Add to `.env.local`:

```
CRON_SECRET=your-secure-random-string-here
```

**Step 4: Commit**

```bash
git add src/lib/cron/check-subscriptions.ts src/app/api/cron/check-subscriptions/route.ts
git commit -m "feat: add subscription expiration checker cron job"
```

---

## Task 10: Admin Subscription List Page

**Files:**

- Create: `src/app/admin/subscriptions/page.tsx`

**Step 1: Write subscription list page**

```typescript
// src/app/admin/subscriptions/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      expired: "destructive",
      suspended: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">Manage school subscriptions</p>
        </div>
        <Link href="/admin/subscriptions/new">
          <Button>Create Subscription</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions?.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.school_name}</TableCell>
                <TableCell>{sub.start_date}</TableCell>
                <TableCell>{sub.end_date}</TableCell>
                <TableCell>{sub.student_count}</TableCell>
                <TableCell>{getStatusBadge(sub.status)}</TableCell>
                <TableCell>{getPaymentBadge(sub.payment_status || "pending")}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/subscriptions/${sub.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/subscriptions/${sub.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!subscriptions || subscriptions.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No subscriptions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/admin/subscriptions/page.tsx
git commit -m "feat: add admin subscription list page"
```

---

## Task 11: Admin Subscription Detail Page

**Files:**

- Create: `src/app/admin/subscriptions/[id]/page.tsx`

**Step 1: Write subscription detail page**

```typescript
// src/app/admin/subscriptions/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .single();

  if (!subscription) {
    notFound();
  }

  // Get students in this subscription
  const { data: students } = await supabase
    .from("users")
    .select("id, username, email, student_id, grade, school, status, created_at")
    .eq("subscription_id", id)
    .order("created_at", { ascending: false });

  // Get classes in this subscription
  const { data: classes } = await supabase
    .from("classes")
    .select("*, class_students(count)")
    .eq("subscription_id", id)
    .order("created_at", { ascending: false });

  const daysRemaining = Math.ceil(
    (new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{subscription.school_name}</h1>
          <p className="text-muted-foreground">Subscription Details</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/subscriptions/${id}/import`}>
            <Button variant="outline">Import Students</Button>
          </Link>
          <Link href={`/api/v1/admin/subscriptions/${id}/reports`}>
            <Button variant="outline">Download Report</Button>
          </Link>
          <Link href={`/admin/subscriptions/${id}/edit`}>
            <Button>Edit</Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge
              variant={subscription.status === "active" ? "default" : "destructive"}
            >
              {subscription.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Days Remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${daysRemaining < 7 ? "text-red-500" : ""}`}>
              {daysRemaining > 0 ? daysRemaining : "Expired"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">{subscription.start_date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End Date</p>
            <p className="font-medium">{subscription.end_date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contact</p>
            <p className="font-medium">{subscription.school_contact || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Status</p>
            <Badge
              variant={subscription.payment_status === "paid" ? "default" : "secondary"}
            >
              {subscription.payment_status || "pending"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Classes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Classes</CardTitle>
          <Link href={`/admin/subscriptions/${id}/classes/new`}>
            <Button size="sm">Add Class</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes?.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.grade}</TableCell>
                  <TableCell>{cls.class_students?.[0]?.count || 0}</TableCell>
                  <TableCell>
                    <Link href={`/admin/classes/${cls.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {(!classes || classes.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No classes found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Students */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({students?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.slice(0, 20).map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.username}</TableCell>
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{student.school}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === "active" ? "default" : "secondary"}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(student.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {(!students || students.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No students found. Click &quot;Import Students&quot; to add students.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {students && students.length > 20 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Showing 20 of {students.length} students
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/admin/subscriptions/[id]/page.tsx
git commit -m "feat: add admin subscription detail page"
```

---

## Task 12: Admin Subscription Form Component

**Files:**

- Create: `src/app/admin/subscriptions/subscription-form.tsx`
- Create: `src/app/admin/subscriptions/new/page.tsx`
- Create: `src/app/admin/subscriptions/[id]/edit/page.tsx`

**Step 1: Write subscription form component**

```typescript
// src/app/admin/subscriptions/subscription-form.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSubscriptionSchema, type CreateSubscriptionInput } from "@/lib/validations/subscription";
import { useState } from "react";

interface SubscriptionFormProps {
  initialData?: {
    id: string;
    school_name: string;
    school_contact: string | null;
    start_date: string;
    end_date: string;
    student_count: number;
    status: string;
    payment_status: string | null;
    notes: string | null;
  };
}

export function SubscriptionForm({ initialData }: SubscriptionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<CreateSubscriptionInput>({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      school_name: initialData?.school_name || "",
      school_contact: initialData?.school_contact || "",
      start_date: initialData?.start_date || new Date().toISOString().split("T")[0],
      end_date:
        initialData?.end_date ||
        new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      student_count: initialData?.student_count || 0,
      notes: initialData?.notes || "",
    },
  });

  async function onSubmit(data: CreateSubscriptionInput) {
    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/v1/admin/subscriptions/${initialData.id}`
        : "/api/v1/admin/subscriptions";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to save subscription");
      }

      router.push("/admin/subscriptions");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save subscription");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="school_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter school name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="school_contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contact@school.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="student_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Student Count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Subscription" : "Create Subscription"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**Step 2: Write new subscription page**

```typescript
// src/app/admin/subscriptions/new/page.tsx
import { SubscriptionForm } from "../subscription-form";

export default function NewSubscriptionPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Subscription</h1>
        <p className="text-muted-foreground">Add a new school subscription</p>
      </div>
      <SubscriptionForm />
    </div>
  );
}
```

**Step 3: Write edit subscription page**

```typescript
// src/app/admin/subscriptions/[id]/edit/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SubscriptionForm } from "../../subscription-form";

export default async function EditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .single();

  if (!subscription) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Subscription</h1>
        <p className="text-muted-foreground">{subscription.school_name}</p>
      </div>
      <SubscriptionForm initialData={subscription} />
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/admin/subscriptions/subscription-form.tsx src/app/admin/subscriptions/new/ src/app/admin/subscriptions/[id]/edit/
git commit -m "feat: add subscription form and create/edit pages"
```

---

## Task 13: Student Import Page

**Files:**

- Create: `src/app/admin/subscriptions/[id]/import/page.tsx`
- Create: `src/app/admin/subscriptions/[id]/import/import-form.tsx`

**Step 1: Write import form component**

```typescript
// src/app/admin/subscriptions/[id]/import/import-form.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportFormProps {
  subscriptionId: string;
}

interface ImportResult {
  imported: number;
  failed: number;
  total: number;
  errors: string[];
}

export function ImportForm({ subscriptionId }: ImportFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/v1/admin/subscriptions/${subscriptionId}/students`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.details) {
          setError(`Validation errors:\n${data.error.details.map((e: { row: number; message: string }) => `Row ${e.row}: ${e.message}`).join("\n")}`);
        } else {
          setError(data.error?.message || "Import failed");
        }
        return;
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsUploading(false);
    }
  }

  function downloadTemplate() {
    // Create a simple CSV template
    const template = "Name,Student ID,Grade,Class\nZhang San,2024001,3,1\nLi Si,2024002,3,1\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Instructions</CardTitle>
          <CardDescription>
            Upload an Excel file (.xlsx) with student information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Excel file should contain the following columns:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li><strong>Name</strong> - Student full name (required)</li>
            <li><strong>Student ID</strong> - Unique student identifier (required)</li>
            <li><strong>Grade</strong> - Grade level (required)</li>
            <li><strong>Class</strong> - Class name/number (required)</li>
          </ul>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              disabled={isUploading}
            />
            <div className="flex gap-4">
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Importing..." : "Import Students"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Import Error</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert variant={result.failed > 0 ? "default" : "default"}>
          <AlertTitle>Import Complete</AlertTitle>
          <AlertDescription>
            <p>Successfully imported: {result.imported} / {result.total} students</p>
            {result.failed > 0 && (
              <p className="text-red-600">Failed: {result.failed}</p>
            )}
            {result.errors.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => router.push(`/admin/subscriptions/${subscriptionId}`)}
            >
              View Subscription
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

**Step 2: Write import page**

```typescript
// src/app/admin/subscriptions/[id]/import/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ImportForm } from "./import-form";

export default async function ImportStudentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, school_name")
    .eq("id", id)
    .single();

  if (!subscription) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Import Students</h1>
        <p className="text-muted-foreground">{subscription.school_name}</p>
      </div>
      <ImportForm subscriptionId={id} />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/admin/subscriptions/[id]/import/
git commit -m "feat: add batch student import UI"
```

---

## Task 14: Update Admin Navigation

**Files:**

- Modify: `src/app/admin/layout.tsx`

**Step 1: Read current layout file**

Check the current admin layout for navigation structure.

**Step 2: Add subscriptions link to admin navigation**

Add a navigation link for "Subscriptions" to the admin sidebar/nav. The exact modification depends on the current layout structure.

Look for the navigation links section and add:

```typescript
{ href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
```

Import the CreditCard icon from lucide-react if not already imported.

**Step 3: Commit**

```bash
git add src/app/admin/layout.tsx
git commit -m "feat: add subscriptions to admin navigation"
```

---

## Task 15: Final Integration Test

**Step 1: Start development server**

Run: `npm run dev`
Expected: Server starts without errors

**Step 2: Test subscription management flow**

1. Navigate to `/admin/subscriptions`
2. Click "Create Subscription"
3. Fill in form and submit
4. View created subscription
5. Click "Import Students"
6. Upload test Excel file
7. Verify students are imported

**Step 3: Test report download**

1. Navigate to subscription detail page
2. Click "Download Report"
3. Verify Excel file downloads

**Step 4: Test API endpoints**

```bash
# Test list subscriptions
curl http://localhost:3000/api/v1/admin/subscriptions

# Test cron endpoint (with secret)
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/check-subscriptions
```

**Step 5: Run lint and format**

Run: `npm run lint && npm run format`
Expected: No errors

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: complete subscription management implementation"
```

---

## Execution Notes

- **Database already exists**: The subscription, classes, and class_students tables are already in the database with RLS policies
- **Service layer exists**: Basic subscription.service.ts exists, needs enhancement for batch import
- **Validation exists**: subscription.ts validation schema exists
- **Missing components**: API routes, admin UI pages, batch import, report generation
- **Testing**: Manual testing via browser and curl. No unit tests in this phase.
- **Cron configuration**: After deployment, configure the cron job in your hosting platform (Vercel Cron, AWS CloudWatch Events, etc.) to call `/api/cron/check-subscriptions` daily
- **Email notifications**: Subscription expiration email notifications require email service integration (SendGrid, Resend, etc.) - marked as TODO in the cron job
