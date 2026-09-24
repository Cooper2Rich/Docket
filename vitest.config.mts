import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./apps/web/app", import.meta.url)),
    },
  },
  test: {
    exclude: [...configDefaults.exclude, "apps/web/e2e/**"],
    passWithNoTests: false,
  },
});
