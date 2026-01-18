import { FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("Running global setup for E2E tests...");
}

export default globalSetup;
