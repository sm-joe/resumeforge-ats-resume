import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./specs",
  fullyParallel: false,
  retries: 1,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: process.env.RESUMEFORGE_E2E_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
});
