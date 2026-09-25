import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  auditSummary,
  scanCredentialEntries,
  validateStaticSecurity,
} from "./policy.mjs";

describe("security policy", () => {
  it("accepts the tracked repository credential scan and immutable workflow", async () => {
    await expect(validateStaticSecurity(process.cwd())).resolves.toEqual({
      scannedCredentials: true,
      immutableActions: true,
    });
  });

  it("rejects a credential-shaped tracked value without logging the value", () => {
    const token = `ghp_${"a".repeat(36)}`;
    expect(
      scanCredentialEntries([
        { file: "fixture.txt", content: Buffer.from(token) },
      ]),
    ).toEqual([{ file: "fixture.txt", kind: "GITHUB_TOKEN" }]);
  });

  it("blocks the checked-in vulnerable dependency fixture", async () => {
    const fixture = JSON.parse(
      await readFile("tools/fixtures/security/vulnerable-audit.json", "utf8"),
    );
    expect(auditSummary(fixture)).toEqual({
      high: 1,
      critical: 0,
      blocked: 1,
    });
  });
});
