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
