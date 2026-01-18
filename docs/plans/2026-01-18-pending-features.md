# Pending Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement remaining planned features from PRD including phone/SMS login, subscription management, batch student import, and learning reports.

**Architecture:** Build on existing Next.js 16 + Supabase architecture. Add new API routes, database tables, and admin UI components. Use TanStack Query for data fetching and React Hook Form + Zod for validation.

**Tech Stack:** Next.js 16, TypeScript, Supabase, TanStack Query, Zod, React Hook Form, Shadcn/ui

---

## Task 1: Database Schema for Subscriptions

**Files:**

- Create: `supabase/migrations/20260118000001_subscriptions.sql`
- Modify: `src/types/database.ts` (regenerate after migration)

**Step 1: Write migration for subscriptions tables**

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name TEXT NOT NULL,
  school_contact TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  student_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'suspended')),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_subscription_id ON classes(subscription_id);
CREATE INDEX idx_classes_admin_id ON classes(admin_id);

-- Class-student relationship
CREATE TABLE class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_students_class_id ON class_students(class_id);
CREATE INDEX idx_class_students_student_id ON class_students(student_id);

-- Add student_id and subscription_id to users table
ALTER TABLE users ADD COLUMN student_id TEXT;
ALTER TABLE users ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
CREATE INDEX idx_users_subscription_id ON users(subscription_id);
```

**Step 2: Apply migration**

Run: `supabase db push`
Expected: Migration applied successfully

**Step 3: Regenerate database types**

Run: `npm run db:types`
Expected: `src/types/database.ts` updated with new tables

**Step 4: Commit**

```bash
git add supabase/migrations/20260118000001_subscriptions.sql src/types/database.ts
git commit -m "feat: add subscription and class management schema"
```

---

## Task 2: Subscription Service Layer

**Files:**

- Create: `src/services/subscription.service.ts`
- Create: `src/lib/validations/subscription.ts`

**Step 1: Write Zod validation schemas**

```typescript
// src/lib/validations/subscription.ts
import { z } from "zod";

export const createSubscriptionSchema = z.object({
  school_name: z.string().min(1, "School name is required"),
  school_contact: z.string().email().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  student_count: z.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
```

**Step 2: Write subscription service**

```typescript
// src/services/subscription.service.ts
import { createClient } from "@/lib/supabase/server";
import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from "@/lib/validations/subscription";

export async function createSubscription(data: CreateSubscriptionInput, userId: string) {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .insert({
      ...data,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return subscription;
}

export async function getSubscriptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSubscriptionById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("subscriptions").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}

export async function updateSubscription(id: string, data: UpdateSubscriptionInput) {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return subscription;
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("subscriptions").delete().eq("id", id);

  if (error) throw error;
}
```

**Step 3: Commit**

```bash
git add src/services/subscription.service.ts src/lib/validations/subscription.ts
git commit -m "feat: add subscription service layer"
```

---

## Task 3: Subscription API Routes

**Files:**

- Create: `src/app/api/v1/admin/subscriptions/route.ts`
- Create: `src/app/api/v1/admin/subscriptions/[id]/route.ts`

**Step 1: Write list and create endpoints**

```typescript
// src/app/api/v1/admin/subscriptions/route.ts
import { NextResponse } from "next/server";
import { createSubscription, getSubscriptions } from "@/services/subscription.service";
import { createSubscriptionSchema } from "@/lib/validations/subscription";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const subscriptions = await getSubscriptions();
    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
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

    const body = await request.json();
    const validated = createSubscriptionSchema.parse(body);

    const subscription = await createSubscription(validated, user.id);
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 400 }
    );
  }
}
```

**Step 2: Write detail, update, and delete endpoints**

```typescript
// src/app/api/v1/admin/subscriptions/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} from "@/services/subscription.service";
import { updateSubscriptionSchema } from "@/lib/validations/subscription";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const subscription = await getSubscriptionById(params.id);
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 404 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = updateSubscriptionSchema.parse(body);

    const subscription = await updateSubscription(params.id, validated);
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteSubscription(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 400 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/v1/admin/subscriptions/
git commit -m "feat: add subscription API routes"
```

---

## Task 4: Batch Student Import

**Files:**

- Create: `src/lib/utils/excel.ts`
- Create: `src/app/api/v1/admin/subscriptions/[id]/students/route.ts`

**Step 1: Install dependencies**

Run: `npm install xlsx`
Expected: Package installed

**Step 2: Write Excel parsing utility**

```typescript
// src/lib/utils/excel.ts
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
```

**Step 3: Write batch import API**

```typescript
// src/app/api/v1/admin/subscriptions/[id]/students/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseStudentExcel, validateStudentData } from "@/lib/utils/excel";

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

    const supabase = await createClient();
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);

      const accounts = batch.map((student) => ({
        email: `${student.student_id}@temp.local`,
        password: "123456",
        user_metadata: {
          username: student.name,
          student_id: student.student_id,
          grade: student.grade,
          class: student.class,
          subscription_id: params.id,
        },
      }));

      for (const account of accounts) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: account.user_metadata,
        });

        if (!error) results.push(data.user);
      }
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
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}
```

**Step 4: Commit**

```bash
git add src/lib/utils/excel.ts src/app/api/v1/admin/subscriptions/[id]/students/
git commit -m "feat: add batch student import functionality"
```

---

## Task 5: Subscription Expiration Checker

**Files:**

- Create: `src/lib/cron/check-subscriptions.ts`
- Create: `src/app/api/cron/check-subscriptions/route.ts`

**Step 1: Write expiration checker logic**

```typescript
// src/lib/cron/check-subscriptions.ts
import { createClient } from "@/lib/supabase/server";

export async function checkExpiringSubscriptions() {
  const supabase = await createClient();
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const { data: expiringSoon } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("status", "active")
    .lte("end_date", sevenDaysLater.toISOString().split("T")[0])
    .gte("end_date", today.toISOString().split("T")[0]);

  const { data: expired } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("status", "active")
    .lt("end_date", today.toISOString().split("T")[0]);

  for (const sub of expired || []) {
    await supabase.from("subscriptions").update({ status: "expired" }).eq("id", sub.id);

    await supabase.from("users").update({ status: "suspended" }).eq("subscription_id", sub.id);
  }

  return {
    expiringSoon: expiringSoon?.length || 0,
    expired: expired?.length || 0,
  };
}
```

**Step 2: Write cron API endpoint**

```typescript
// src/app/api/cron/check-subscriptions/route.ts
import { NextResponse } from "next/server";
import { checkExpiringSubscriptions } from "@/lib/cron/check-subscriptions";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkExpiringSubscriptions();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}
```

**Step 3: Add environment variable**

Add to `.env.local`:

```
CRON_SECRET=your-secret-key-here
```

**Step 4: Commit**

```bash
git add src/lib/cron/check-subscriptions.ts src/app/api/cron/check-subscriptions/
git commit -m "feat: add subscription expiration checker"
```

---

## Task 6: Admin Subscription Management UI

**Files:**

- Create: `src/app/admin/subscriptions/page.tsx`
- Create: `src/app/admin/subscriptions/[id]/page.tsx`
- Create: `src/components/admin/subscription-form.tsx`

**Step 1: Write subscription list page**

```typescript
// src/app/admin/subscriptions/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <Link href="/admin/subscriptions/new">
          <Button>Create Subscription</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">School Name</th>
              <th className="px-6 py-3 text-left">Start Date</th>
              <th className="px-6 py-3 text-left">End Date</th>
              <th className="px-6 py-3 text-left">Students</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions?.map((sub) => (
              <tr key={sub.id} className="border-t">
                <td className="px-6 py-4">{sub.school_name}</td>
                <td className="px-6 py-4">{sub.start_date}</td>
                <td className="px-6 py-4">{sub.end_date}</td>
                <td className="px-6 py-4">{sub.student_count}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'expired' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/subscriptions/${sub.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/admin/subscriptions/
git commit -m "feat: add subscription management UI"
```

---

## Task 7: Learning Reports Export

**Files:**

- Create: `src/lib/utils/report-generator.ts`
- Create: `src/app/api/v1/admin/classes/[id]/reports/route.ts`

**Step 1: Install dependencies**

Run: `npm install exceljs`
Expected: Package installed

**Step 2: Write report generator**

```typescript
// src/lib/utils/report-generator.ts
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
```

**Step 3: Write report API endpoint**

```typescript
// src/app/api/v1/admin/classes/[id]/reports/route.ts
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
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}
```

**Step 4: Commit**

```bash
git add src/lib/utils/report-generator.ts src/app/api/v1/admin/classes/[id]/reports/
git commit -m "feat: add learning report export functionality"
```

---

## Execution Notes

- All database migrations should be tested in development before production
- Batch import should include progress tracking UI for better UX
- Cron job should be configured in deployment platform (Vercel Cron, etc.)
- Excel templates should be provided to schools for student import
- Email notifications for expiring subscriptions require email service integration
