import { describe, expect, it } from "vitest";
import { applicationEnvironment } from "./run-check.mjs";

describe("check command environment", () => {
  it("keeps evidence attribution out of spawned application processes", () => {
    expect(
      applicationEnvironment({
        DOCKET_VERIFY_ITEM: "R1-FND-002-A",
        DOCKET_ENV: "test",
        PATH: "synthetic-path",
      }),
    ).toEqual({
      DOCKET_ENV: "test",
      PATH: "synthetic-path",
    });
  });
});
