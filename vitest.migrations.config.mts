import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    include: [
      "apps/migrate/src/index.integration.test.ts",
      "packages/database/src/index.test.ts",
      "packages/testkit/src/migrations.integration.test.ts",
    ],
    maxWorkers: 1,
    passWithNoTests: false,
    testTimeout: 120_000,
  },
});
