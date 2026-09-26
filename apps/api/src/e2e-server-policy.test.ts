import { describe, expect, it } from "vitest";
import { assertE2eServerEnvironment } from "./e2e-server-policy.js";

describe("test-only E2E server policy", () => {
  it("rejects staging and production before the fixed identity server starts", () => {
    expect(() => assertE2eServerEnvironment("staging")).toThrow(
      "E2E_SERVER_FORBIDDEN_IN_ENVIRONMENT",
    );
    expect(() => assertE2eServerEnvironment("production")).toThrow(
      "E2E_SERVER_FORBIDDEN_IN_ENVIRONMENT",
    );
    expect(assertE2eServerEnvironment("test")).toBe("test");
  });
});
