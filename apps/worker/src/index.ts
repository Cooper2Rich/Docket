import { parseRuntimeConfig } from "@docket/runtime";

export function validateWorkerRuntime(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  return parseRuntimeConfig("worker", environment);
}

export const workerRuntimeConfig = validateWorkerRuntime();

export const workerAdapterStatus = {
  available: false,
  owningWorkItem: "R1-FND-002-B",
} as const;
