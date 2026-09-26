import { describe, expect, it } from "vitest";
import { applicationEnvironment, environmentForCheck } from "./run-check.mjs";

describe("check command environment", () => {
  it("keeps evidence attribution out of spawned application processes", () => {
    expect(
      applicationEnvironment({
        DOCKET_PR_NUMBER: "170",
        DOCKET_VERIFY_ITEM: "R1-FND-002-A",
        DOCKET_ENV: "test",
        PATH: "synthetic-path",
      }),
    ).toEqual({
      DOCKET_ENV: "test",
      PATH: "synthetic-path",
    });
  });

  it("forwards the selected item only to the full-CI verifier", () => {
    const environment = {
      DOCKET_PR_NUMBER: "170",
      DOCKET_VERIFY_ITEM: "R1-IDA-001-A",
      DOCKET_ENV: "test",
      PATH: "synthetic-path",
    };

    expect(environmentForCheck("unit", environment)).toEqual({
      DOCKET_ENV: "test",
      PATH: "synthetic-path",
    });
    expect(environmentForCheck("ci-full", environment)).toEqual({
      DOCKET_VERIFY_ITEM: "R1-IDA-001-A",
      DOCKET_ENV: "test",
      PATH: "synthetic-path",
    });
  });
});
