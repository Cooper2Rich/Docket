import { parseRuntimeConfig } from "@docket/runtime";

export function validateWebRuntime(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  return parseRuntimeConfig("web", environment);
}
