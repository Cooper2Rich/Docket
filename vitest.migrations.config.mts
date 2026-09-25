import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@docket/database": fileURLToPath(
        new URL("./packages/database/src/index.ts", import.meta.url),
      ),
      "@docket/runtime": fileURLToPath(
        new URL("./packages/runtime/src/index.ts", import.meta.url),
      ),
      "@docket/testkit": fileURLToPath(
        new URL("./packages/testkit/src/index.ts", import.meta.url),
      ),
    },
  },
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
