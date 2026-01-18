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
