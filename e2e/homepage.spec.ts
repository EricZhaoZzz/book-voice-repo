import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Book Voice/);
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /login|sign in/i })).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("should navigate to textbooks page", async ({ page }) => {
    await page.goto("/");
    await page.goto("/textbooks");
    await expect(page).toHaveURL(/textbooks/);
  });
});
