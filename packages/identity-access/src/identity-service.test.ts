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
import {
  ClerkSessionTerminationService,
  InMemoryClerkSessionTerminationStore,
} from "./session-terminations.js";

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

function privilegedDecision(
  accountId: string,
  clerkSessionId: string,
  changes: Partial<{
    decisionId: string;
    contextId: string;
    authorityVersion: number;
    currentAuthorityVersion: number;
    activation: "switch" | "restore";
  }> = {},
) {
  return {
    decisionId: "privileged-decision-001",
    accountId,
    clerkSessionId,
    contextId: "platform-context-001",
    contextKind: "platform_administrator" as const,
    authorityVersion: 1,
    currentAuthorityVersion: 1,
    status: "active" as const,
    activation: "switch" as const,
    ...changes,
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
    expect(store.snapshot().displayNameHistory).toMatchObject([
      { displayName: "Ada Example" },
    ]);
  });

  it("records only minimized accepted sign-ins in the two-year Account Security History", async () => {
    const { service, store } = harness();
    await service.createDocketSession({
      identity: acceptedIdentity({
        sessionMetadata: {
          device: "Firefox on desktop",
          approximateLocation: "Austin, US",
        },
      }),
      idempotencyKey: "security-history-create",
    });

    const history =
      await service.listAccountSecurityHistory(acceptedIdentity());
    expect(history[0]?.id).toBe("event_003");
    expect(history).toMatchObject([
      {
        kind: "accepted_sign_in",
        occurredAt: now.toISOString(),
        device: "Firefox on desktop",
        approximateLocation: "Austin, US",
      },
    ]);
    expect(store.snapshot().securityHistory[0]).toMatchObject({
      accountId: store.snapshot().accounts[0]?.id,
      retainedUntil: new Date("2028-09-25T20:00:00.000Z"),
      legalHold: false,
    });
    expect(store.snapshot().securityHistory[0]).not.toHaveProperty(
      "clerkSessionId",
    );
    expect(store.snapshot().securityHistory[0]).not.toHaveProperty(
      "verifiedEmail",
    );
  });

  it("idempotently ingests only trusted reverification and suspension history", async () => {
    const { service, store } = harness();
    const created = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "trusted-history-create",
    });
    const reverification = {
      eventId: "reverification-001",
      accountId: created.account.id,
      kind: "clerk_reverification" as const,
      source: "validated_clerk_reverification" as const,
      signatureValidated: true as const,
      occurredAt: now,
    };
    const first =
      await service.recordTrustedAccountSecurityHistory(reverification);
    await expect(
      service.recordTrustedAccountSecurityHistory(reverification),
    ).resolves.toEqual(first);
    await service.recordTrustedAccountSecurityHistory({
      eventId: "suspension-001",
      accountId: created.account.id,
      kind: "account_suspension",
      source: "account_suspension_workflow",
      decisionVersion: 3,
      currentDecisionVersion: 3,
      suspensionStatus: "imposed",
      occurredAt: now,
    });

    expect(store.snapshot().securityHistory.map(({ kind }) => kind)).toEqual([
      "accepted_sign_in",
      "clerk_reverification",
      "account_suspension",
    ]);
    expect(JSON.stringify(store.snapshot().securityHistory)).not.toContain(
      '"source"',
    );
    await expect(
      service.recordTrustedAccountSecurityHistory({
        ...reverification,
        signatureValidated: false,
      } as never),
    ).rejects.toMatchObject({ code: "IDENTITY_INVALID" });
    await expect(
      service.recordTrustedAccountSecurityHistory({
        eventId: "suspension-stale",
        accountId: created.account.id,
        kind: "account_suspension",
        source: "account_suspension_workflow",
        decisionVersion: 2,
        currentDecisionVersion: 3,
        suspensionStatus: "reinstated",
        occurredAt: now,
      }),
    ).rejects.toMatchObject({ code: "AUTHORITY_STALE" });
  });

  it("deletes expired Account Security History while keeping current records", async () => {
    const { service, store, advanceTo } = harness();
    await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "retention-create",
    });
    advanceTo(new Date("2028-09-25T19:59:59.999Z"));
    await expect(service.deleteExpiredAccountSecurityHistory()).resolves.toBe(
      0,
    );
    advanceTo(new Date("2028-09-25T20:00:00.000Z"));
    await expect(service.deleteExpiredAccountSecurityHistory()).resolves.toBe(
      1,
    );
    expect(store.snapshot().securityHistory).toEqual([]);
  });

  it("governs Docket Display Name changes independently of Clerk profile recovery", async () => {
    const { service, store, advanceTo } = harness();
    const created = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "display-create",
    });
    const command = {
      identity: acceptedIdentity(),
      displayName: "Ada Docket",
      expectedVersion: created.account.version,
      idempotencyKey: "display-change",
    } as const;
    const changed = await service.changeDisplayName(command);
    await expect(service.changeDisplayName(command)).resolves.toEqual(changed);
    const cachedCreateReceipt = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "display-create",
    });
    expect(cachedCreateReceipt.account.displayName).toBe("Ada Example");
    await expect(
      service.getAccountProfile(acceptedIdentity()),
    ).resolves.toEqual(changed.account);

    await expect(
      service.changeDisplayName({
        ...command,
        displayName: "Ada Too Soon",
        expectedVersion: changed.account.version,
        idempotencyKey: "display-too-soon",
      }),
    ).rejects.toMatchObject({ code: "DISPLAY_NAME_CHANGE_TOO_SOON" });

    advanceTo(new Date("2026-10-25T20:00:00.000Z"));
    const recoveredIdentity = acceptedIdentity({
      sessionId: "session_clerk_recovered",
      profileName: "Changed Clerk Profile",
      expiresAt: new Date("2026-11-01T20:00:00.000Z"),
    });
    const recovered = await service.createDocketSession({
      identity: recoveredIdentity,
      idempotencyKey: "display-recovery",
    });
    expect(recovered.account.displayName).toBe("Ada Docket");
    expect(
      store.snapshot().displayNameHistory.map(({ displayName }) => displayName),
    ).toEqual(["Ada Example", "Ada Docket"]);
    expect(store.snapshot().links[0]?.profileName).toBe(
      "Changed Clerk Profile",
    );
  });

  it("allows an idempotent documented early correction only through current Platform approval", async () => {
    const { service, store } = harness();
    const created = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "reviewed-name-create",
    });
    const selfChanged = await service.changeDisplayName({
      identity: acceptedIdentity(),
      displayName: "Ada Public",
      expectedVersion: created.account.version,
      idempotencyKey: "reviewed-name-self-change",
    });
    const approval = {
      reviewId: "name-review-001",
      targetAccountId: created.account.id,
      approvedByAccountId: created.account.id,
      permission: "platform_administrator" as const,
      authorityVersion: 4,
      currentAuthorityVersion: 4,
      status: "approved" as const,
      decidedAt: now,
    };
    const corrected = await service.changeDisplayNameAfterReviewedCorrection({
      displayName: "Ada Safety Name",
      expectedVersion: selfChanged.account.version,
      approval,
    });
    await expect(
      service.changeDisplayNameAfterReviewedCorrection({
        displayName: "Ada Safety Name",
        expectedVersion: selfChanged.account.version,
        approval,
      }),
    ).resolves.toEqual(corrected);

    expect(corrected.history).toMatchObject({
      changeKind: "reviewed_correction",
      reviewId: approval.reviewId,
      approvedByAccountId: approval.approvedByAccountId,
    });
    expect(
      store.snapshot().displayNameHistory.map(({ displayName }) => displayName),
    ).toEqual(["Ada Example", "Ada Public", "Ada Safety Name"]);
    await expect(
      service.changeDisplayNameAfterReviewedCorrection({
        displayName: "Rejected Name",
        expectedVersion: corrected.account.version,
        approval: {
          ...approval,
          reviewId: "name-review-stale",
          authorityVersion: 3,
        },
      }),
    ).rejects.toMatchObject({ code: "AUTHORITY_STALE" });
  });

  it("rejects stale concurrent Display Name changes and rolls failed writes back", async () => {
    const { service, store, advanceTo } = harness();
    const created = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "display-concurrency-create",
    });
    const [first, second] = await Promise.allSettled([
      service.changeDisplayName({
        identity: acceptedIdentity(),
        displayName: "Ada First",
        expectedVersion: created.account.version,
        idempotencyKey: "display-first",
      }),
      service.changeDisplayName({
        identity: acceptedIdentity(),
        displayName: "Ada Second",
        expectedVersion: created.account.version,
        idempotencyKey: "display-second",
      }),
    ]);
    expect(first.status).toBe("fulfilled");
    expect(second.status).toBe("rejected");
    if (second.status !== "rejected") throw new Error("expected rejection");
    expect(second.reason).toBeInstanceOf(IdentityError);
    if (!(second.reason instanceof IdentityError)) {
      throw new Error("expected IdentityError");
    }
    expect(second.reason.code).toBe("AUTHORITY_STALE");

    advanceTo(new Date("2026-10-25T20:00:00.000Z"));
    const laterIdentity = acceptedIdentity({
      sessionId: "session_clerk_later",
      expiresAt: new Date("2026-11-01T20:00:00.000Z"),
    });
    await service.createDocketSession({
      identity: laterIdentity,
      idempotencyKey: "display-rollback-session",
    });
    const before = store.snapshot();
    store.failBeforeCommit = true;
    await expect(
      service.changeDisplayName({
        identity: laterIdentity,
        displayName: "Ada Rollback",
        expectedVersion: before.accounts[0]?.version ?? 0,
        idempotencyKey: "display-rollback",
      }),
    ).rejects.toThrow("simulated persistence failure before commit");
    expect(store.snapshot()).toEqual(before);
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

  it("captures trusted session metadata once without changing command identity", async () => {
    const { service, store } = harness();
    const identity = acceptedIdentity({
      sessionMetadata: {
        device: "Firefox on desktop",
        approximateLocation: "Austin, US",
      },
    });
    const first = await service.createDocketSession({
      identity,
      idempotencyKey: "stable-observational-metadata",
    });

    const changed = await service.createDocketSession({
      identity: {
        ...identity,
        sessionMetadata: {
          device: "Safari on mobile",
          approximateLocation: "Dallas, US",
        },
      },
      idempotencyKey: "stable-observational-metadata",
    });
    const unavailable = await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "stable-observational-metadata",
    });

    expect(changed).toEqual(first);
    expect(unavailable).toEqual(first);
    expect(store.snapshot().sessions).toMatchObject([
      {
        device: "Firefox on desktop",
        approximateLocation: "Austin, US",
      },
    ]);
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
    ).resolves.toContainEqual({
      ...created.session,
      lastActivityAt: "2026-09-25T20:06:00.000Z",
      inactivityExpiresAt: "2026-09-26T08:06:00.000Z",
    });
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
      clerkSessionTerminations: [],
      displayNameHistory: [],
      securityHistory: [],
    });
  });

  it("ends the oldest ordinary session when a sixth ordinary session starts", async () => {
    const { service, store } = harness();
    for (let index = 1; index <= 6; index += 1) {
      await service.createDocketSession({
        identity: acceptedIdentity({
          sessionId: `clerk-session-${String(index)}`,
        }),
        idempotencyKey: `create-${String(index)}`,
      });
    }

    expect(store.snapshot().sessions).toHaveLength(6);
    expect(store.snapshot().sessions[0]).toMatchObject({
      clerkSessionId: "clerk-session-1",
      status: "revoked",
    });
    expect(
      store.snapshot().sessions.filter(({ status }) => status === "active"),
    ).toHaveLength(5);
    expect(store.snapshot().events.at(-2)?.name).toBe("SessionRevoked");
  });

  it("ends the prior privileged session when a second privileged session starts", async () => {
    const { service, store, advanceTo } = harness();
    const firstIdentity = acceptedIdentity({ sessionId: "privileged-clerk-1" });
    const first = await service.createDocketSession({
      identity: firstIdentity,
      idempotencyKey: "privileged-create-1",
      device: "Firefox on Linux",
      approximateLocation: "Austin, Texas",
    });
    await service.activatePrivilegedDocketSession({
      identity: firstIdentity,
      authorization: privilegedDecision(
        first.account.id,
        firstIdentity.sessionId,
      ),
      expectedVersion: first.session.version,
      idempotencyKey: "privileged-activate-1",
    });
    const secondIdentity = acceptedIdentity({
      sessionId: "privileged-clerk-2",
    });
    const second = await service.createDocketSession({
      identity: secondIdentity,
      idempotencyKey: "privileged-create-2",
      device: "Safari on macOS",
      approximateLocation: "Dallas, Texas",
    });
    const command = {
      identity: secondIdentity,
      authorization: privilegedDecision(
        second.account.id,
        secondIdentity.sessionId,
        {
          decisionId: "privileged-decision-002",
          contextId: "privacy-context-001",
          activation: "restore",
        },
      ),
      expectedVersion: second.session.version,
      idempotencyKey: "privileged-activate-2",
    } as const;
    const current = await service.activatePrivilegedDocketSession(command);
    await expect(
      service.activatePrivilegedDocketSession(command),
    ).resolves.toEqual(current);

    expect(current.session).toMatchObject({
      sessionClass: "privileged",
      device: "Safari on macOS",
      approximateLocation: "Dallas, Texas",
      privilegedActivatedAt: "2026-09-25T20:00:00.000Z",
      expiresAt: "2026-09-26T08:00:00.000Z",
      inactivityExpiresAt: "2026-09-25T20:30:00.000Z",
    });
    expect(current.privilegedActivation).toMatchObject({
      activation: "restore",
      securityAlert: {
        device: "Safari on macOS",
        approximateLocation: "Dallas, Texas",
        occurredAt: now.toISOString(),
      },
    });
    expect(store.snapshot().sessions).toMatchObject([
      { status: "revoked", sessionClass: "privileged" },
      { status: "active", sessionClass: "privileged" },
    ]);

    advanceTo(new Date("2026-09-25T20:20:00.000Z"));
    const refreshed = (await service.listDocketSessions(secondIdentity)).find(
      ({ id }) => id === current.session.id,
    );
    expect(refreshed).toMatchObject({
      lastActivityAt: "2026-09-25T20:20:00.000Z",
      privilegedActivatedAt: "2026-09-25T20:00:00.000Z",
    });
  });

  it("enforces ordinary inactivity and absolute limits while activity refreshes only the inactivity deadline", async () => {
    const { service, advanceTo } = harness();
    const identity = acceptedIdentity();
    await service.createDocketSession({
      identity,
      idempotencyKey: "ordinary-limits",
    });

    advanceTo(new Date("2026-09-26T07:00:00.000Z"));
    const active = await service.listDocketSessions(identity);
    expect(active[0]).toMatchObject({
      lastActivityAt: "2026-09-26T07:00:00.000Z",
      inactivityExpiresAt: "2026-09-26T19:00:00.000Z",
      expiresAt: "2026-10-02T20:00:00.000Z",
    });
    advanceTo(new Date("2026-09-26T19:00:00.000Z"));
    await expect(service.listDocketSessions(identity)).rejects.toMatchObject({
      code: "SESSION_EXPIRED",
    });

    const absolute = harness();
    const absoluteIdentity = acceptedIdentity();
    await absolute.service.createDocketSession({
      identity: absoluteIdentity,
      idempotencyKey: "ordinary-absolute",
    });
    for (let hour = 11; hour < 7 * 24; hour += 11) {
      absolute.advanceTo(new Date(now.getTime() + hour * 60 * 60 * 1_000));
      await absolute.service.listDocketSessions(absoluteIdentity);
    }
    absolute.advanceTo(new Date("2026-10-02T20:00:00.000Z"));
    await expect(
      absolute.service.listDocketSessions(absoluteIdentity),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
  });

  it("enforces privileged 30-minute inactivity and 12-hour absolute limits", async () => {
    const inactive = harness();
    const inactiveIdentity = acceptedIdentity({ sessionId: "priv-inactive" });
    const inactiveCreated = await inactive.service.createDocketSession({
      identity: inactiveIdentity,
      idempotencyKey: "priv-inactive-create",
    });
    await inactive.service.activatePrivilegedDocketSession({
      identity: inactiveIdentity,
      authorization: privilegedDecision(
        inactiveCreated.account.id,
        inactiveIdentity.sessionId,
      ),
      expectedVersion: inactiveCreated.session.version,
      idempotencyKey: "priv-inactive-activate",
    });
    inactive.advanceTo(new Date("2026-09-25T20:30:00.000Z"));
    await expect(
      inactive.service.listDocketSessions(inactiveIdentity),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });

    const absolute = harness();
    const absoluteIdentity = acceptedIdentity({ sessionId: "priv-absolute" });
    const absoluteCreated = await absolute.service.createDocketSession({
      identity: absoluteIdentity,
      idempotencyKey: "priv-absolute-create",
    });
    await absolute.service.activatePrivilegedDocketSession({
      identity: absoluteIdentity,
      authorization: privilegedDecision(
        absoluteCreated.account.id,
        absoluteIdentity.sessionId,
      ),
      expectedVersion: absoluteCreated.session.version,
      idempotencyKey: "priv-absolute-activate",
    });
    for (let minute = 29; minute < 12 * 60; minute += 29) {
      absolute.advanceTo(new Date(now.getTime() + minute * 60 * 1_000));
      await absolute.service.listDocketSessions(absoluteIdentity);
    }
    absolute.advanceTo(new Date("2026-09-26T08:00:00.000Z"));
    await expect(
      absolute.service.listDocketSessions(absoluteIdentity),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
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
    expect(store.snapshot().clerkSessionTerminations).toEqual([
      expect.objectContaining({
        sessionId: created.session.id,
        clerkSessionId: evidence.sessionId,
      }),
    ]);
  });

  it("keeps activity freshness separate from command version for self-revocation", async () => {
    const { service, advanceTo } = harness();
    const identity = acceptedIdentity();
    const created = await service.createDocketSession({
      identity,
      idempotencyKey: "create-for-active-self-revoke",
    });

    advanceTo(new Date("2026-09-25T21:00:00.000Z"));
    const [active] = await service.listDocketSessions(identity);
    expect(active).toMatchObject({
      version: created.session.version,
      lastActivityAt: "2026-09-25T21:00:00.000Z",
    });

    advanceTo(new Date("2026-09-25T21:01:00.000Z"));
    const command = {
      identity,
      sessionId: created.session.id,
      expectedVersion: created.session.version,
      idempotencyKey: "active-self-revoke",
    } as const;
    const revoked = await service.revokeDocketSession(command);
    expect(revoked.session).toMatchObject({ status: "revoked", version: 2 });
    await expect(service.revokeDocketSession(command)).rejects.toMatchObject({
      code: "SESSION_EXPIRED",
    });
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

  it("requires live session authority before replaying a revocation receipt", async () => {
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
    const pending = store
      .snapshot()
      .clerkSessionTerminations.find(
        ({ sessionId }) => sessionId === target.session.id,
      );
    expect(pending).toBeDefined();
    if (!pending) throw new Error("expected a pending Clerk termination");
    const deliveryStore = new InMemoryClerkSessionTerminationStore();
    deliveryStore.enqueue(pending);
    await expect(
      new ClerkSessionTerminationService(
        deliveryStore,
        () => new Date(now),
      ).deliverNext(() => Promise.reject(new Error("Clerk unavailable"))),
    ).resolves.toMatchObject({ status: "failed" });
    await service.revokeDocketSession({
      identity: acceptedIdentity(),
      sessionId: actor.session.id,
      expectedVersion: 1,
      idempotencyKey: "revoke-actor",
    });
    await expect(service.revokeDocketSession(command)).rejects.toMatchObject({
      code: "SESSION_EXPIRED",
    });

    const replacementIdentity = acceptedIdentity({
      sessionId: "session-replacement-actor",
    });
    await service.createDocketSession({
      identity: replacementIdentity,
      idempotencyKey: "create-replacement-actor",
    });
    await expect(
      service.revokeDocketSession({
        ...command,
        identity: replacementIdentity,
      }),
    ).resolves.toEqual(first);

    advanceTo(new Date("2026-09-27T20:00:00.000Z"));
    await expect(
      service.listDocketSessions(targetIdentity),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    expect(
      store.snapshot().events.filter(({ name }) => name === "SessionRevoked"),
    ).toHaveLength(2);
  });

  it.each([
    ["inactivity", new Date("2026-09-26T08:00:00.000Z")],
    ["absolute lifetime", new Date("2026-10-02T20:00:00.000Z")],
  ])(
    "does not let a %s-expired actor replay a revocation receipt",
    async (_reason, expiry) => {
      const { service, advanceTo } = harness();
      const actorIdentity = acceptedIdentity({
        expiresAt: new Date("2026-10-10T20:00:00.000Z"),
      });
      await service.createDocketSession({
        identity: actorIdentity,
        idempotencyKey: `create-expiring-actor-${_reason}`,
      });
      const target = await service.createDocketSession({
        identity: acceptedIdentity({ sessionId: `target-${_reason}` }),
        idempotencyKey: `create-expiring-target-${_reason}`,
      });
      const command = {
        identity: actorIdentity,
        sessionId: target.session.id,
        expectedVersion: target.session.version,
        idempotencyKey: `revoke-before-${_reason}`,
      } as const;
      await service.revokeDocketSession(command);

      if (_reason === "absolute lifetime") {
        for (let hour = 11; hour < 7 * 24; hour += 11) {
          advanceTo(new Date(now.getTime() + hour * 60 * 60 * 1_000));
          await service.listDocketSessions(actorIdentity);
        }
      }
      advanceTo(expiry);
      await expect(service.revokeDocketSession(command)).rejects.toMatchObject({
        code: "SESSION_EXPIRED",
      });
    },
  );

  it("logs out everywhere atomically and queues every associated Clerk session", async () => {
    const { service, store } = harness();
    const identities = [
      acceptedIdentity(),
      acceptedIdentity({ sessionId: "session_clerk_002" }),
      acceptedIdentity({ sessionId: "session_clerk_003" }),
    ] as const;
    for (const [index, identity] of identities.entries()) {
      await service.createDocketSession({
        identity,
        idempotencyKey: `create-for-logout-all-${String(index)}`,
      });
    }
    const command = {
      identity: identities[2],
      idempotencyKey: "logout-everywhere",
    } as const;

    const first = await service.revokeAllDocketSessions(command);
    await expect(
      service.revokeAllDocketSessions(command),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });

    const replacementIdentity = acceptedIdentity({
      sessionId: "session_clerk_after_logout_all",
    });
    await service.createDocketSession({
      identity: replacementIdentity,
      idempotencyKey: "create-after-logout-all",
    });
    await expect(
      service.revokeAllDocketSessions({
        ...command,
        identity: replacementIdentity,
      }),
    ).resolves.toEqual(first);

    expect(first.session).toMatchObject({ status: "revoked", version: 2 });
    expect(store.snapshot().sessions).toHaveLength(4);
    expect(store.snapshot().sessions.at(-1)).toMatchObject({
      clerkSessionId: replacementIdentity.sessionId,
      status: "active",
    });
    expect(store.snapshot().clerkSessionTerminations).toHaveLength(3);
    expect(
      store
        .snapshot()
        .clerkSessionTerminations.map(({ clerkSessionId }) => clerkSessionId)
        .sort(),
    ).toEqual(identities.map(({ sessionId }) => sessionId).sort());
  });

  it("rolls back logout everywhere including provider deliveries", async () => {
    const { service, store } = harness();
    await service.createDocketSession({
      identity: acceptedIdentity(),
      idempotencyKey: "create-before-logout-rollback",
    });
    store.failBeforeCommit = true;

    await expect(
      service.revokeAllDocketSessions({
        identity: acceptedIdentity(),
        idempotencyKey: "logout-everywhere-rollback",
      }),
    ).rejects.toThrow("simulated persistence failure");
    expect(store.snapshot().sessions[0]?.status).toBe("active");
    expect(store.snapshot().clerkSessionTerminations).toEqual([]);
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
