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
