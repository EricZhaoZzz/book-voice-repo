# Integration Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up a comprehensive testing infrastructure with Vitest for unit/integration tests and Playwright for E2E tests. Create test suites for validation schemas, service layer, API routes, and critical user flows.

**Architecture:** Use Vitest as the primary test runner (faster than Jest, native ESM support). Playwright for browser-based E2E testing. Mock Supabase client for unit tests. Use test database for integration tests. Follow TDD approach where applicable.

**Tech Stack:** Vitest, @testing-library/react, Playwright, MSW (Mock Service Worker), @supabase/supabase-js mocks

**Current Status:**

- Testing framework: ❌ Not configured
- Test files: ❌ None
- Coverage: ❌ 0%

**Testing Strategy:**

1. **Unit Tests**: Validation schemas, utility functions (no external deps)
2. **Integration Tests**: Service layer, API routes (mocked Supabase)
3. **E2E Tests**: Critical user flows (real browser, test database)

---

## Task 1: Install Testing Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Install Vitest and related packages**

Run:

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
```

Expected: Packages installed successfully

**Step 2: Install Playwright**

Run:

```bash
npm install -D @playwright/test
npx playwright install
```

Expected: Playwright installed with browsers

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install testing dependencies"
```

---

## Task 2: Configure Vitest

**Files:**

- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Step 1: Create Vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "**/types/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 2: Create test setup file**

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock environment variables
vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
```

**Step 3: Add test scripts to package.json**

Add to `scripts` in `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

**Step 4: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json
git commit -m "chore: configure Vitest testing framework"
```

---

## Task 3: Create Supabase Mock Helper

**Files:**

- Create: `src/test/mocks/supabase.ts`

**Step 1: Write Supabase mock helper**

```typescript
// src/test/mocks/supabase.ts
import { vi } from "vitest";

export interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  lt: ReturnType<typeof vi.fn>;
  gt: ReturnType<typeof vi.fn>;
}

export function createMockQueryBuilder(
  mockData: unknown = null,
  mockError: Error | null = null
): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockData, error: mockError }),
    maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: mockError }),
    range: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
  };

  // Chain methods return builder, terminal methods return data
  builder.select.mockImplementation(() => {
    return {
      ...builder,
      then: (resolve: (value: { data: unknown; error: Error | null }) => void) =>
        resolve({ data: Array.isArray(mockData) ? mockData : [mockData], error: mockError }),
    };
  });

  return builder;
}

export function createMockSupabaseClient(
  overrides: Partial<{
    from: ReturnType<typeof vi.fn>;
    auth: {
      getUser: ReturnType<typeof vi.fn>;
      signInWithPassword: ReturnType<typeof vi.fn>;
      signUp: ReturnType<typeof vi.fn>;
      signOut: ReturnType<typeof vi.fn>;
    };
    storage: {
      from: ReturnType<typeof vi.fn>;
    };
  }> = {}
) {
  const defaultAuth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi
      .fn()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };

  const defaultStorage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: "test/path" }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://test.com/file" } }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };

  return {
    from: overrides.from || vi.fn().mockReturnValue(createMockQueryBuilder()),
    auth: { ...defaultAuth, ...overrides.auth },
    storage: { ...defaultStorage, ...overrides.storage },
  };
}

// Mock user data factory
export function createMockUser(
  overrides: Partial<{
    id: string;
    email: string;
    username: string;
    role: string;
    status: string;
  }> = {}
) {
  return {
    id: overrides.id || "test-user-id",
    email: overrides.email || "test@example.com",
    username: overrides.username || "testuser",
    role: overrides.role || "student",
    status: overrides.status || "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Mock subscription data factory
export function createMockSubscription(
  overrides: Partial<{
    id: string;
    school_name: string;
    start_date: string;
    end_date: string;
    status: string;
  }> = {}
) {
  const today = new Date();
  const sixMonthsLater = new Date(today);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  return {
    id: overrides.id || "test-subscription-id",
    school_name: overrides.school_name || "Test School",
    school_contact: "contact@test.com",
    start_date: overrides.start_date || today.toISOString().split("T")[0],
    end_date: overrides.end_date || sixMonthsLater.toISOString().split("T")[0],
    student_count: 0,
    status: overrides.status || "active",
    payment_status: "paid",
    notes: null,
    created_by: "admin-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Mock textbook data factory
export function createMockTextbook(
  overrides: Partial<{
    id: string;
    name: string;
    grade: string;
    publisher: string;
  }> = {}
) {
  return {
    id: overrides.id || "test-textbook-id",
    name: overrides.name || "Test Textbook",
    grade: overrides.grade || "Grade 3",
    publisher: overrides.publisher || "Test Publisher",
    version: "1.0",
    description: "Test description",
    cover_url: null,
    is_free: true,
    free_units_count: 0,
    created_by: "admin-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
```

**Step 2: Commit**

```bash
git add src/test/mocks/supabase.ts
git commit -m "chore: add Supabase mock helpers for testing"
```

---

## Task 4: Write Validation Schema Unit Tests

**Files:**

- Create: `src/lib/validations/auth.test.ts`
- Create: `src/lib/validations/subscription.test.ts`
- Create: `src/lib/validations/content.test.ts`

**Step 1: Write auth validation tests**

```typescript
// src/lib/validations/auth.test.ts
import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, forgotPasswordSchema } from "./auth";

describe("loginSchema", () => {
  it("should validate correct login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("should validate correct registration data", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "test@example.com",
      password: "password1",
      confirmPassword: "password1",
    });
    expect(result.success).toBe(true);
  });

  it("should reject short username", () => {
    const result = registerSchema.safeParse({
      username: "a",
      email: "test@example.com",
      password: "password1",
      confirmPassword: "password1",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without number", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "test@example.com",
      password: "password",
      confirmPassword: "password",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without letter", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "test@example.com",
      password: "12345678",
      confirmPassword: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("should reject mismatched passwords", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "test@example.com",
      password: "password1",
      confirmPassword: "password2",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "test@example.com",
      password: "pass1",
      confirmPassword: "pass1",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("should validate correct email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it passes**

Run: `npm test -- src/lib/validations/auth.test.ts`
Expected: All tests pass

**Step 3: Write subscription validation tests**

```typescript
// src/lib/validations/subscription.test.ts
import { describe, it, expect } from "vitest";
import { createSubscriptionSchema, updateSubscriptionSchema } from "./subscription";

describe("createSubscriptionSchema", () => {
  const validData = {
    school_name: "Test School",
    school_contact: "contact@test.com",
    start_date: "2026-01-01",
    end_date: "2026-06-30",
    student_count: 100,
    notes: "Test notes",
  };

  it("should validate correct subscription data", () => {
    const result = createSubscriptionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty school name", () => {
    const result = createSubscriptionSchema.safeParse({
      ...validData,
      school_name: "",
    });
    expect(result.success).toBe(false);
  });

  it("should accept optional contact email", () => {
    const result = createSubscriptionSchema.safeParse({
      ...validData,
      school_contact: "",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid date format", () => {
    const result = createSubscriptionSchema.safeParse({
      ...validData,
      start_date: "01-01-2026",
    });
    expect(result.success).toBe(false);
  });

  it("should reject end date before start date", () => {
    const result = createSubscriptionSchema.safeParse({
      ...validData,
      start_date: "2026-06-30",
      end_date: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative student count", () => {
    const result = createSubscriptionSchema.safeParse({
      ...validData,
      student_count: -1,
    });
    expect(result.success).toBe(false);
  });

  it("should default student_count to 0", () => {
    const dataWithoutCount = {
      school_name: "Test School",
      start_date: "2026-01-01",
      end_date: "2026-06-30",
    };
    const result = createSubscriptionSchema.safeParse(dataWithoutCount);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.student_count).toBe(0);
    }
  });
});

describe("updateSubscriptionSchema", () => {
  it("should allow partial updates", () => {
    const result = updateSubscriptionSchema.safeParse({
      school_name: "Updated School",
    });
    expect(result.success).toBe(true);
  });

  it("should allow empty update", () => {
    const result = updateSubscriptionSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/validations/subscription.test.ts`
Expected: All tests pass

**Step 5: Write content validation tests**

```typescript
// src/lib/validations/content.test.ts
import { describe, it, expect } from "vitest";
import { textbookSchema, unitSchema, lessonSchema, settingsSchema } from "./content";

describe("textbookSchema", () => {
  const validTextbook = {
    name: "Test Textbook",
    grade: "Grade 3",
    publisher: "Test Publisher",
    version: "1.0",
  };

  it("should validate correct textbook data", () => {
    const result = textbookSchema.safeParse(validTextbook);
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = textbookSchema.safeParse({ ...validTextbook, name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty grade", () => {
    const result = textbookSchema.safeParse({ ...validTextbook, grade: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty publisher", () => {
    const result = textbookSchema.safeParse({ ...validTextbook, publisher: "" });
    expect(result.success).toBe(false);
  });

  it("should default is_free to false", () => {
    const result = textbookSchema.safeParse(validTextbook);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_free).toBe(false);
    }
  });
});

describe("unitSchema", () => {
  const validUnit = {
    textbook_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Unit 1",
    order_num: 1,
  };

  it("should validate correct unit data", () => {
    const result = unitSchema.safeParse(validUnit);
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID for textbook_id", () => {
    const result = unitSchema.safeParse({ ...validUnit, textbook_id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("should reject order_num less than 1", () => {
    const result = unitSchema.safeParse({ ...validUnit, order_num: 0 });
    expect(result.success).toBe(false);
  });
});

describe("lessonSchema", () => {
  const validLesson = {
    unit_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Lesson 1",
    order_num: 1,
    audio_url: "/audio/lesson1.mp3",
    audio_duration: 180,
  };

  it("should validate correct lesson data", () => {
    const result = lessonSchema.safeParse(validLesson);
    expect(result.success).toBe(true);
  });

  it("should reject empty audio_url", () => {
    const result = lessonSchema.safeParse({ ...validLesson, audio_url: "" });
    expect(result.success).toBe(false);
  });

  it("should default audio_duration to 0", () => {
    const lessonWithoutDuration = {
      unit_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Lesson 1",
      order_num: 1,
      audio_url: "/audio/lesson1.mp3",
    };
    const result = lessonSchema.safeParse(lessonWithoutDuration);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.audio_duration).toBe(0);
    }
  });
});

describe("settingsSchema", () => {
  const validSettings = {
    site_name: "Book Voice",
    allow_guest_access: true,
    allow_registration: true,
    default_playback_speed: 1,
    auto_play_next: false,
    max_upload_size: 50,
    allowed_formats: "mp3,wav,ogg",
    login_attempts: 5,
    captcha_enabled: false,
  };

  it("should validate correct settings data", () => {
    const result = settingsSchema.safeParse(validSettings);
    expect(result.success).toBe(true);
  });

  it("should reject playback speed below 0.5", () => {
    const result = settingsSchema.safeParse({ ...validSettings, default_playback_speed: 0.4 });
    expect(result.success).toBe(false);
  });

  it("should reject playback speed above 2", () => {
    const result = settingsSchema.safeParse({ ...validSettings, default_playback_speed: 2.5 });
    expect(result.success).toBe(false);
  });

  it("should reject upload size above 100MB", () => {
    const result = settingsSchema.safeParse({ ...validSettings, max_upload_size: 101 });
    expect(result.success).toBe(false);
  });
});
```

**Step 6: Run all validation tests**

Run: `npm test -- src/lib/validations/`
Expected: All tests pass

**Step 7: Commit**

```bash
git add src/lib/validations/*.test.ts
git commit -m "test: add validation schema unit tests"
```

---

## Task 5: Write Excel Utility Unit Tests

**Files:**

- Create: `src/lib/utils/excel.test.ts`

**Step 1: Write Excel parsing tests**

```typescript
// src/lib/utils/excel.test.ts
import { describe, it, expect } from "vitest";
import { parseStudentExcel, validateStudentData, type StudentImportRow } from "./excel";

describe("validateStudentData", () => {
  it("should return no errors for valid data", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "001", grade: "3", class_name: "A" },
      { name: "Jane Smith", student_id: "002", grade: "3", class_name: "A" },
    ];
    const errors = validateStudentData(students);
    expect(errors).toHaveLength(0);
  });

  it("should detect missing name", () => {
    const students: StudentImportRow[] = [
      { name: "", student_id: "001", grade: "3", class_name: "A" },
    ];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Name"))).toBe(true);
  });

  it("should detect missing student_id", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "", grade: "3", class_name: "A" },
    ];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Student ID"))).toBe(true);
  });

  it("should detect duplicate student_id", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "001", grade: "3", class_name: "A" },
      { name: "Jane Smith", student_id: "001", grade: "3", class_name: "B" },
    ];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Duplicate"))).toBe(true);
  });

  it("should detect missing grade", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "001", grade: "", class_name: "A" },
    ];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Grade"))).toBe(true);
  });

  it("should detect missing class", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "001", grade: "3", class_name: "" },
    ];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Class"))).toBe(true);
  });

  it("should detect empty data", () => {
    const students: StudentImportRow[] = [];
    const errors = validateStudentData(students);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("No data"))).toBe(true);
  });

  it("should detect exceeding max students", () => {
    const students: StudentImportRow[] = Array.from({ length: 1001 }, (_, i) => ({
      name: `Student ${i}`,
      student_id: String(i).padStart(4, "0"),
      grade: "3",
      class_name: "A",
    }));
    const errors = validateStudentData(students);
    expect(errors.some((e) => e.message.includes("1000"))).toBe(true);
  });

  it("should report correct row numbers", () => {
    const students: StudentImportRow[] = [
      { name: "John Doe", student_id: "001", grade: "3", class_name: "A" },
      { name: "", student_id: "002", grade: "3", class_name: "A" }, // Error in row 3 (header is row 1)
    ];
    const errors = validateStudentData(students);
    expect(errors.some((e) => e.row === 3)).toBe(true);
  });
});
```

**Step 2: Run test to verify it passes**

Run: `npm test -- src/lib/utils/excel.test.ts`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/lib/utils/excel.test.ts
git commit -m "test: add Excel utility unit tests"
```

---

## Task 6: Configure Playwright for E2E Tests

**Files:**

- Create: `playwright.config.ts`
- Create: `e2e/global-setup.ts`

**Step 1: Create Playwright config**

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Step 2: Create E2E test directory structure**

```typescript
// e2e/global-setup.ts
import { FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  // Global setup for E2E tests
  // Can be used to:
  // - Set up test database
  // - Create test users
  // - Configure test environment
  console.log("Running global setup for E2E tests...");
}

export default globalSetup;
```

**Step 3: Commit**

```bash
git add playwright.config.ts e2e/
git commit -m "chore: configure Playwright for E2E testing"
```

---

## Task 7: Write E2E Auth Flow Tests

**Files:**

- Create: `e2e/auth.spec.ts`

**Step 1: Write auth E2E tests**

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Book Voice/);
    await expect(page.getByRole("heading", { name: /login|sign in/i })).toBeVisible();
  });

  test("should show validation errors for empty login form", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /login|sign in/i }).click();
    await expect(page.getByText(/email/i)).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("invalid@test.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /login|sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /register|sign up|create account/i }).click();
    await expect(page).toHaveURL(/register/);
  });

  test("should show register page with form fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });

  test("should show password mismatch error on register", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel(/username/i).fill("testuser");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("password1");
    await page.getByLabel(/confirm password/i).fill("password2");
    await page.getByRole("button", { name: /register|sign up/i }).click();

    await expect(page.getByText(/match/i)).toBeVisible();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /forgot|reset/i }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });
});
```

**Step 2: Run E2E tests**

Run: `npm run test:e2e -- --project=chromium e2e/auth.spec.ts`
Expected: Tests run (may fail if pages don't exist yet, that's expected)

**Step 3: Commit**

```bash
git add e2e/auth.spec.ts
git commit -m "test: add E2E auth flow tests"
```

---

## Task 8: Write E2E Homepage Tests

**Files:**

- Create: `e2e/homepage.spec.ts`

**Step 1: Write homepage E2E tests**

```typescript
// e2e/homepage.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Book Voice/);
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");
    // Check for login link when not authenticated
    await expect(page.getByRole("link", { name: /login|sign in/i })).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    // Page should still be usable
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("should navigate to textbooks page", async ({ page }) => {
    await page.goto("/");
    // Look for textbooks link or navigate directly
    await page.goto("/textbooks");
    await expect(page).toHaveURL(/textbooks/);
  });
});
```

**Step 2: Run E2E tests**

Run: `npm run test:e2e -- --project=chromium e2e/homepage.spec.ts`
Expected: Tests run

**Step 3: Commit**

```bash
git add e2e/homepage.spec.ts
git commit -m "test: add E2E homepage tests"
```

---

## Task 9: Write API Route Integration Tests

**Files:**

- Create: `src/app/api/v1/textbooks/route.test.ts`

**Step 1: Write textbooks API tests**

```typescript
// src/app/api/v1/textbooks/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Supabase client module
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { GET } from "./route";
import { createClient } from "@/lib/supabase/server";
import { createMockQueryBuilder, createMockTextbook } from "@/test/mocks/supabase";

describe("GET /api/v1/textbooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return list of textbooks", async () => {
    const mockTextbooks = [
      createMockTextbook({ id: "1", name: "Textbook 1" }),
      createMockTextbook({ id: "2", name: "Textbook 2" }),
    ];

    const mockQueryBuilder = createMockQueryBuilder(mockTextbooks);
    const mockClient = {
      from: vi.fn().mockReturnValue(mockQueryBuilder),
    };

    vi.mocked(createClient).mockResolvedValue(mockClient as never);

    const request = new Request("http://localhost:3000/api/v1/textbooks");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should handle database errors gracefully", async () => {
    const mockQueryBuilder = createMockQueryBuilder(null, new Error("Database error"));
    const mockClient = {
      from: vi.fn().mockReturnValue(mockQueryBuilder),
    };

    vi.mocked(createClient).mockResolvedValue(mockClient as never);

    const request = new Request("http://localhost:3000/api/v1/textbooks");
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
```

**Step 2: Run API integration tests**

Run: `npm test -- src/app/api/`
Expected: Tests run (some may need adjustment based on actual API implementation)

**Step 3: Commit**

```bash
git add src/app/api/v1/textbooks/route.test.ts
git commit -m "test: add API route integration tests"
```

---

## Task 10: Add Test Scripts and CI Configuration

**Files:**

- Modify: `package.json`
- Create: `.github/workflows/test.yml`

**Step 1: Update package.json scripts**

Ensure these scripts exist in `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

**Step 2: Create GitHub Actions workflow**

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run test:run
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: always()
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

**Step 3: Commit**

```bash
git add package.json .github/workflows/test.yml
git commit -m "chore: add test scripts and CI configuration"
```

---

## Task 11: Create Test Documentation

**Files:**

- Create: `docs/TESTING.md`

**Step 1: Write testing documentation**

````markdown
# Testing Guide

## Overview

This project uses:

- **Vitest** for unit and integration tests
- **Playwright** for E2E (end-to-end) tests
- **Testing Library** for React component testing

## Running Tests

### Unit & Integration Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Open Vitest UI
npm run test:ui
```
````

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- e2e/auth.spec.ts

# Run in specific browser
npm run test:e2e -- --project=chromium
```

## Test Structure

```
src/
├── lib/
│   └── validations/
│       ├── auth.ts
│       └── auth.test.ts      # Unit tests alongside source
├── services/
│   ├── subscription.service.ts
│   └── subscription.service.test.ts
├── app/
│   └── api/
│       └── v1/
│           └── textbooks/
│               ├── route.ts
│               └── route.test.ts
└── test/
    ├── setup.ts              # Vitest setup
    └── mocks/
        └── supabase.ts       # Mock helpers

e2e/
├── auth.spec.ts              # Auth flow tests
├── homepage.spec.ts          # Homepage tests
└── global-setup.ts           # E2E setup
```

## Writing Tests

### Validation Schema Tests

```typescript
import { describe, it, expect } from "vitest";
import { mySchema } from "./my-schema";

describe("mySchema", () => {
  it("should validate correct data", () => {
    const result = mySchema.safeParse({ field: "value" });
    expect(result.success).toBe(true);
  });
});
```

### API Route Tests

```typescript
import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("GET /api/v1/resource", () => {
  it("should return data", async () => {
    // Mock setup
    const request = new Request("http://localhost/api/v1/resource");
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
```

### E2E Tests

```typescript
import { test, expect } from "@playwright/test";

test("should complete user flow", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Expected Title/);
});
```

## Coverage Goals

- Validation schemas: 90%+
- Service layer: 80%+
- API routes: 80%+
- UI components: 60%+

## CI/CD

Tests run automatically on:

- Push to main/master
- Pull requests

See `.github/workflows/test.yml` for configuration.

````

**Step 2: Commit**

```bash
git add docs/TESTING.md
git commit -m "docs: add testing documentation"
````

---

## Task 12: Run Full Test Suite and Verify

**Step 1: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 2: Run unit tests**

Run: `npm run test:run`
Expected: All unit tests pass

**Step 3: Run E2E tests (optional - requires dev server)**

Run: `npm run test:e2e`
Expected: E2E tests run (some may fail if pages don't exist)

**Step 4: Check coverage**

Run: `npm run test:coverage`
Expected: Coverage report generated

**Step 5: Final commit**

```bash
git add -A
git commit -m "test: complete integration testing setup"
```

---

## Execution Notes

- **No existing tests**: This is a greenfield testing setup
- **Vitest chosen over Jest**: Better ESM support, faster, native TypeScript
- **Mocking strategy**: Mock Supabase at module level for isolation
- **E2E tests**: May need adjustment based on actual page implementations
- **Coverage targets**: Start with validation schemas (easiest), expand to services and API routes
- **CI/CD**: GitHub Actions configured, needs secrets for Supabase in E2E tests
- **Test data factories**: Use `createMock*` helpers for consistent test data
