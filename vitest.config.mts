import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./apps/web/app", import.meta.url)),
      "@docket/runtime": fileURLToPath(
        new URL("./packages/runtime/src/index.ts", import.meta.url),
      ),
      "@docket/testkit": fileURLToPath(
        new URL("./packages/testkit/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    exclude: [...configDefaults.exclude, "apps/web/e2e/**"],
    passWithNoTests: false,
  },
});
