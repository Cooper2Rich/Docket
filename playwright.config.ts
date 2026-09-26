import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./apps/web/e2e",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    baseURL,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    channel: process.env.CI ? undefined : "msedge",
  },
  webServer: [
    {
      command:
        "pnpm --filter @docket/api build && node apps/api/dist/e2e-server.js",
      env: {
        DOCKET_ENV: "test",
      },
      reuseExistingServer: false,
      timeout: 120_000,
      url: "http://127.0.0.1:3001/health/live",
    },
    {
      command: `pnpm --dir apps/web dev --port ${port}`,
      env: {
        CLERK_PUBLISHABLE_KEY: "pk_live_ZG9ja2V0LmV4YW1wbGUuY29tJA",
        CLERK_SECRET_KEY: "sk_live_docket_e2e_fixture",
        DOCKET_CLERK_ALLOWED_ORIGINS: baseURL,
      },
      reuseExistingServer: false,
      timeout: 120_000,
      url: baseURL,
    },
  ],
});
