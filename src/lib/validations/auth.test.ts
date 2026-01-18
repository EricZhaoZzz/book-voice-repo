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
