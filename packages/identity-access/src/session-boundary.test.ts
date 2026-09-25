import { describe, expect, it } from "vitest";
import { resolveIdentitySession } from "./session-boundary.js";

const authority = {
  userId: "account_fixture_001",
  sessionId: "session_fixture_001",
  authorityVersion: "authority-v1",
  currentAuthorityVersion: "authority-v1",
} as const;

describe("identity session authoritative query", () => {
  it("does not let a TypeScript assertion bypass runtime request validation", () => {
    const assertedInput = { audience: "platform" } as unknown as {
      audience: "self";
    };

    expect(
      resolveIdentitySession(assertedInput, authority, "request_fixture_001"),
    ).toEqual({
      status: 400,
      body: {
        code: "REQUEST_INVALID",
        message: "The request is invalid.",
        requestId: "request_fixture_001",
      },
    });
  });

  it("fails closed when server authority is stale", () => {
    expect(
      resolveIdentitySession(
        { audience: "self" },
        { ...authority, currentAuthorityVersion: "authority-v2" },
        "request_fixture_002",
      ),
    ).toMatchObject({
      status: 409,
      body: { code: "AUTHORITY_STALE", requestId: "request_fixture_002" },
    });
  });

  it("fails output validation before an invalid projection crosses the boundary", () => {
    expect(
      resolveIdentitySession(
        { audience: "self" },
        { ...authority, userId: "a".repeat(129) },
        "request_fixture_003",
      ),
    ).toMatchObject({
      status: 500,
      body: { code: "RESPONSE_INVALID" },
    });
  });
});
