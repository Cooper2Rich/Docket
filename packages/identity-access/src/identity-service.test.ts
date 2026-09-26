import { describe, expect, it } from "vitest";
import {
  authenticateClerkSession,
  authenticateFixedIdentity,
  IdentityError,
  IdentityService,
  InMemoryIdentityStore,
  type ClerkIdentity,
  type ClerkSessionEvidence,
} from "./identity-service.js";

const now = new Date("2026-09-25T20:00:00.000Z");
const policy = {
  issuer: "https://clerk.docket.test",
  audience: "docket-api",
  authorizedParties: ["https://docket.test"],
  allowedOrigins: ["https://docket.test"],
} as const;

const evidence: ClerkSessionEvidence = {
  signatureValid: true,
  issuer: policy.issuer,
  audience: [policy.audience],
  authorizedParty: policy.authorizedParties[0],
  tokenExpiresAt: new Date("2026-09-25T20:05:00.000Z"),
  sessionExpiresAt: new Date("2026-10-02T20:00:00.000Z"),
  notBefore: new Date("2026-09-25T19:59:00.000Z"),
  sessionStatus: "active",
  userId: "user_clerk_001",
  sessionId: "session_clerk_001",
  origin: policy.allowedOrigins[0],
  verifiedEmail: "ada@example.test",
  profileName: "Ada Example",
  signInMethod: "google",
};

function acceptedIdentity(changes: Partial<ClerkIdentity> = {}): ClerkIdentity {
  return {
    ...authenticateClerkSession(evidence, policy, now),
    ...changes,
  };
}

function harness() {
  const store = new InMemoryIdentityStore();
  const counters = { account: 0, session: 0, event: 0 };
  let clock = new Date(now);
  const service = new IdentityService({
    store,
    now: () => clock,
    nextId: (kind) => `${kind}_${String(++counters[kind]).padStart(3, "0")}`,
  });
  return {
    service,
    store,
    advanceTo: (next: Date) => {
      clock = new Date(next);
    },
  };
}

describe("AuthenticateClerkSession", () => {
  it("accepts Google and verified-email identities only from signed request-time evidence", () => {
    expect(authenticateClerkSession(evidence, policy, now)).toMatchObject({
      userId: evidence.userId,
      signInMethod: "google",
    });
    expect(
      authenticateClerkSession(
        { ...evidence, signInMethod: "verified_email_code" },
        policy,
        now,
      ),
    ).toMatchObject({ signInMethod: "verified_email_code" });
  });

  it.each([
    ["signature", { signatureValid: false }],
    ["issuer", { issuer: "https://attacker.test" }],
    ["audience", { audience: ["another-api"] }],
    ["authorized party", { authorizedParty: "https://attacker.test" }],
    ["not-before", { notBefore: new Date("2026-09-25T20:01:00.000Z") }],
    ["inactive session", { sessionStatus: "inactive" as const }],
    ["origin", { origin: "https://attacker.test" }],
  ])("rejects invalid %s evidence", (_label, change) => {
    expect(() =>
      authenticateClerkSession({ ...evidence, ...change }, policy, now),
    ).toThrow(expect.objectContaining({ code: "IDENTITY_INVALID" }));
  });

  it("distinguishes expired session evidence", () => {
    expect(() =>
      authenticateClerkSession(
        {
          ...evidence,
          sessionExpiresAt: new Date("2026-09-25T19:59:59.000Z"),
        },
        policy,
        now,
      ),
    ).toThrow(expect.objectContaining({ code: "SESSION_EXPIRED" }));
  });

  it("uses the live Clerk session lifetime rather than the short-lived token lifetime", () => {
    const identity = authenticateClerkSession(evidence, policy, now);
    expect(identity.expiresAt).toEqual(evidence.sessionExpiresAt);

    expect(() =>
      authenticateClerkSession(
        {
          ...evidence,
          tokenExpiresAt: new Date("2026-09-25T19:59:59.000Z"),
        },
        policy,
        now,
      ),
    ).toThrow(expect.objectContaining({ code: "SESSION_EXPIRED" }));
  });

  it("forbids the fixed adapter before staging or production can serve", () => {
    expect(authenticateFixedIdentity("test", acceptedIdentity())).toMatchObject(
      {
        userId: evidence.userId,
      },
    );
    expect(() =>
      authenticateFixedIdentity("production", acceptedIdentity()),
    ).toThrow(expect.objectContaining({ code: "FIXED_IDENTITY_FORBIDDEN" }));
  });
});

describe("Docket Account and Session commands", () => {
  it("maps one stable Clerk user to one role-free Account across mutable profile changes", async () => {
    const { service, store } = harness();
    const first = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "create-001",
    });
    const changed = await service.createDocketSession({
      identity: acceptedIdentity({
        sessionId: "session_clerk_002",
        verifiedEmail: "ada.changed@example.test",
        profileName: "Ada Changed",
      }),
      idempotencyKey: "create-002",
    });

    expect(changed.account).toMatchObject({
      id: first.account.id,
      displayName: "Ada Example",
      verifiedEmail: "ada.changed@example.test",
      authority: [],
    });
    expect(store.snapshot().links[0]).toMatchObject({
      profileName: "Ada Changed",
      verifiedEmail: "ada.changed@example.test",
    });
    expect(store.snapshot().accounts).toHaveLength(1);
    expect(store.snapshot().links).toHaveLength(1);
    expect(
      store.snapshot().events.filter(({ name }) => name === "AccountCreated"),
    ).toHaveLength(1);
    expect(store.snapshot().events[0]?.actorAccountId).toBe(first.account.id);
  });

  it("returns an equivalent retry and rejects conflicting reuse of its command key", async () => {
    const { service, store } = harness();
    const command = {
      identity: acceptedIdentity(),
      idempotencyKey: "equivalent-key",
    } as const;
    const [left, right] = await Promise.all([
      service.createDocketSession(command),
      service.createDocketSession(command),
    ]);

    expect(right).toEqual(left);
    expect(store.snapshot().accounts).toHaveLength(1);
    expect(store.snapshot().sessions).toHaveLength(1);
    await expect(
      service.createDocketSession({
        ...command,
        identity: acceptedIdentity({ sessionId: "different-session" }),
      }),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    expect(store.snapshot().sessions).toHaveLength(1);
  });

  it("accepts a refreshed token for the same live Clerk and Docket session", async () => {
    const { service, advanceTo } = harness();
    const firstIdentity = authenticateClerkSession(evidence, policy, now);
    const created = await service.createDocketSession({
      identity: firstIdentity,
      idempotencyKey: "create-before-token-refresh",
    });

    const afterOriginalTokenExpiry = new Date("2026-09-25T20:06:00.000Z");
    advanceTo(afterOriginalTokenExpiry);
    const refreshedIdentity = authenticateClerkSession(
      {
        ...evidence,
        tokenExpiresAt: new Date("2026-09-25T20:11:00.000Z"),
      },
      policy,
      afterOriginalTokenExpiry,
    );

    await expect(
      service.listDocketSessions(refreshedIdentity),
    ).resolves.toContainEqual(created.session);
  });

  it("resumes only an already-active Docket session during provider unavailability", async () => {
    const { service } = harness();
    const created = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "create-before-provider-outage",
    });

    await expect(
      service.resumeDocketSession({
        userId: evidence.userId,
        sessionId: evidence.sessionId,
      }),
    ).resolves.toMatchObject({
      userId: evidence.userId,
      sessionId: evidence.sessionId,
      signInMethod: "unknown",
      expiresAt: new Date(created.session.expiresAt),
    });
    await expect(
      service.resumeDocketSession({
        userId: "user_never_authenticated",
        sessionId: "session_never_authenticated",
      }),
    ).rejects.toMatchObject({ code: "IDENTITY_INVALID" });

    await service.revokeDocketSession({
      identity: acceptedIdentity(),
      sessionId: created.session.id,
      expectedVersion: created.session.version,
      idempotencyKey: "revoke-before-provider-outage",
    });
    await expect(
      service.resumeDocketSession({
        userId: evidence.userId,
        sessionId: evidence.sessionId,
      }),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
  });

  it("rolls Account, link, Session, receipt, and event writes back atomically", async () => {
    const { service, store } = harness();
    store.failBeforeCommit = true;

    await expect(
      service.createDocketSession({
        identity: acceptedIdentity(),
        idempotencyKey: "rollback-key",
      }),
    ).rejects.toThrow("simulated persistence failure");
    expect(store.snapshot()).toEqual({
      accounts: [],
      links: [],
      sessions: [],
      events: [],
    });
  });

  it("enforces the ordinary five-session limit without persisting a sixth", async () => {
    const { service, store } = harness();
    for (let index = 1; index <= 5; index += 1) {
      await service.createDocketSession({
        identity: acceptedIdentity({
          sessionId: `clerk-session-${String(index)}`,
        }),
        idempotencyKey: `create-${String(index)}`,
      });
    }

    await expect(
      service.createDocketSession({
        identity: acceptedIdentity({ sessionId: "clerk-session-6" }),
        idempotencyKey: "create-6",
      }),
    ).rejects.toMatchObject({ code: "SESSION_LIMIT_REACHED" });
    expect(store.snapshot().sessions).toHaveLength(5);
  });

  it("lists only the Account holder's sessions and rejects stale revocation", async () => {
    const { service, store } = harness();
    const created = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "create-for-revoke",
    });
    expect(await service.listDocketSessions(acceptedIdentity())).toHaveLength(
      1,
    );

    await expect(
      service.revokeDocketSession({
        identity: acceptedIdentity(),
        sessionId: created.session.id,
        expectedVersion: 2,
        idempotencyKey: "stale-revoke",
      }),
    ).rejects.toMatchObject({ code: "AUTHORITY_STALE" });
    expect(store.snapshot().sessions[0]?.status).toBe("active");

    const revoked = await service.revokeDocketSession({
      identity: acceptedIdentity(),
      sessionId: created.session.id,
      expectedVersion: 1,
      idempotencyKey: "current-revoke",
    });
    expect(revoked.session).toMatchObject({ status: "revoked", version: 2 });
    expect(store.snapshot().events.at(-1)?.name).toBe("SessionRevoked");
  });

  it("rejects a revocation when the acting Docket Session is not active", async () => {
    const { service, store } = harness();
    const created = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "create-active-session",
    });

    await expect(
      service.revokeDocketSession({
        identity: acceptedIdentity({ sessionId: "unbound-clerk-session" }),
        sessionId: created.session.id,
        expectedVersion: 1,
        idempotencyKey: "denied-revoke",
      }),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    expect(store.snapshot().sessions[0]?.status).toBe("active");
  });

  it("rejects expired actors and does not let a receipt revive revoked authority", async () => {
    const { service, store, advanceTo } = harness();
    const actor = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "create-actor",
    });
    const targetIdentity = acceptedIdentity({ sessionId: "session-target" });
    const target = await service.createDocketSession({
      identity: targetIdentity,
      idempotencyKey: "create-target",
    });
    const command = {
      identity: acceptedIdentity(),
      sessionId: target.session.id,
      expectedVersion: 1,
      idempotencyKey: "revoke-target",
    } as const;

    const first = await service.revokeDocketSession(command);
    await expect(service.revokeDocketSession(command)).resolves.toEqual(first);
    await service.revokeDocketSession({
      identity: acceptedIdentity(),
      sessionId: actor.session.id,
      expectedVersion: 1,
      idempotencyKey: "revoke-actor",
    });
    await expect(service.revokeDocketSession(command)).rejects.toMatchObject({
      code: "SESSION_EXPIRED",
    });

    advanceTo(new Date("2026-09-27T20:00:00.000Z"));
    await expect(
      service.listDocketSessions(targetIdentity),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    expect(
      store.snapshot().events.filter(({ name }) => name === "SessionRevoked"),
    ).toHaveLength(2);
  });

  it("does not count expired sessions toward the ordinary session limit", async () => {
    const { service, store, advanceTo } = harness();
    for (let index = 1; index <= 5; index += 1) {
      await service.createDocketSession({
        identity: acceptedIdentity({
          sessionId: `expiring-session-${String(index)}`,
          expiresAt: new Date("2026-09-25T21:00:00.000Z"),
        }),
        idempotencyKey: `expiring-create-${String(index)}`,
      });
    }
    advanceTo(new Date("2026-09-25T21:00:01.000Z"));

    await expect(
      service.createDocketSession({
        identity: acceptedIdentity({
          sessionId: "replacement-session",
          expiresAt: new Date("2026-09-26T21:00:00.000Z"),
        }),
        idempotencyKey: "replacement-create",
      }),
    ).resolves.toMatchObject({ session: { status: "active" } });
    expect(store.snapshot().sessions).toHaveLength(6);
  });

  it("does not expose persistence internals through domain errors", () => {
    const error = new IdentityError("IDENTITY_INVALID", "safe detail");
    expect(error).toMatchObject({ code: "IDENTITY_INVALID" });
    expect(error.message).not.toContain("select ");
  });
});
