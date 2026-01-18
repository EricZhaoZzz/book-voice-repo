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
