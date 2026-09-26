import { describe, expect, it } from "vitest";
import {
  ClerkSessionTerminationService,
  IdentityWebhookHintService,
  InMemoryClerkSessionTerminationStore,
  InMemoryIdentityWebhookHintStore,
} from "@docket/identity-access";
import {
  createAccountSecurityHistoryRetentionWorker,
  createClerkIdentityHintObserver,
  createClerkSessionTerminator,
  createClerkSessionTerminationWorker,
  createIdentityMaintenanceWorker,
  createIdentityHintWorker,
  runIdentityHintConsumer,
} from "./index.js";

describe("Account Security History retention", () => {
  it("runs immediately and then no more than once per configured interval", async () => {
    let now = new Date("2026-09-26T18:00:00.000Z");
    let calls = 0;
    const worker = createAccountSecurityHistoryRetentionWorker(
      {
        deleteExpiredAccountSecurityHistory: () => {
          calls += 1;
          return Promise.resolve(2);
        },
      },
      { now: () => now, intervalMilliseconds: 60_000 },
    );

    await expect(worker.runOnce()).resolves.toEqual({
      status: "completed",
      deleted: 2,
    });
    await expect(worker.runOnce()).resolves.toEqual({
      status: "idle",
      deleted: 0,
    });
    now = new Date("2026-09-26T18:01:00.000Z");
    await expect(worker.runOnce()).resolves.toEqual({
      status: "completed",
      deleted: 2,
    });
    expect(calls).toBe(2);
  });

  it("keeps delivering pending Clerk terminations when cleanup repeatedly fails", async () => {
    const now = new Date("2026-09-26T18:00:00.000Z");
    const store = new InMemoryClerkSessionTerminationStore();
    for (const suffix of ["001", "002"]) {
      store.enqueue({
        sessionId: `session_docket_cleanup_failure_${suffix}`,
        clerkSessionId: `session_clerk_cleanup_failure_${suffix}`,
        requestedAt: now,
        attemptCount: 0,
      });
    }
    const cleanupError = new Error("simulated retention database failure");
    const observedErrors: unknown[] = [];
    let cleanupAttempts = 0;
    const terminated: string[] = [];
    const worker = createIdentityMaintenanceWorker(
      {
        runOnce: () => {
          cleanupAttempts += 1;
          return Promise.reject(cleanupError);
        },
      },
      createClerkSessionTerminationWorker(
        new ClerkSessionTerminationService(store, () => now),
        (sessionId) => {
          terminated.push(sessionId);
          return Promise.resolve();
        },
      ),
      {
        runOnce: () => Promise.reject(new Error("hint poll should not run")),
      },
      { onRetentionError: (error) => observedErrors.push(error) },
    );

    await expect(worker.runOnce()).resolves.toMatchObject({
      status: "delivered",
    });
    await expect(worker.runOnce()).resolves.toMatchObject({
      status: "delivered",
    });
    expect(cleanupAttempts).toBe(2);
    expect(observedErrors).toEqual([cleanupError, cleanupError]);
    expect(terminated).toEqual([
      "session_clerk_cleanup_failure_001",
      "session_clerk_cleanup_failure_002",
    ]);
  });
});

describe("identity hint worker", () => {
  it("delivers one sanitized hint through the worker boundary", async () => {
    const now = new Date("2026-09-25T19:00:00.000Z");
    const service = new IdentityWebhookHintService(
      new InMemoryIdentityWebhookHintStore(),
      () => now,
    );
    await service.enqueueVerifiedHint({
      deliveryId: "msg_worker_001",
      type: "session.revoked",
      clerkObjectId: "session_worker_001",
      occurredAt: now,
    });
    const observed: string[] = [];
    const worker = createIdentityHintWorker(service, (hint) => {
      observed.push(hint.clerkObjectId);
      return Promise.resolve();
    });

    await expect(worker.runOnce()).resolves.toEqual({
      status: "delivered",
      deliveryId: "msg_worker_001",
    });
    expect(observed).toEqual(["session_worker_001"]);
    await expect(worker.runOnce()).resolves.toEqual({ status: "idle" });
  });

  it("keeps polling across transient infrastructure failure and stops cleanly", async () => {
    const shutdown = new AbortController();
    const observedErrors: unknown[] = [];
    let calls = 0;
    const worker = {
      runOnce: () => {
        calls += 1;
        if (calls === 1) return Promise.reject(new Error("database offline"));
        shutdown.abort();
        return Promise.resolve({ status: "idle" as const });
      },
    };

    await runIdentityHintConsumer(worker, {
      signal: shutdown.signal,
      wait: () => Promise.resolve(),
      onError: (error) => observedErrors.push(error),
    });

    expect(calls).toBe(2);
    expect(observedErrors).toHaveLength(1);
  });
});

describe("Clerk hint revalidation", () => {
  const hint = (type: "session.revoked" | "user.deleted" | "user.updated") =>
    ({
      deliveryId: "msg_revalidate_001",
      type,
      clerkObjectId: type.startsWith("user.")
        ? "user_worker_001"
        : "session_worker_001",
      occurredAt: new Date("2026-09-25T19:00:00.000Z"),
      digest: "digest",
      attemptCount: 1,
    }) as const;

  it("reads updated users and accepts only the same current Clerk object", async () => {
    const observer = createClerkIdentityHintObserver({
      users: {
        getUser: (id: string) => Promise.resolve({ id }),
      },
      sessions: { getSession: () => Promise.reject(new Error("unused")) },
    } as never);

    await expect(observer(hint("user.updated"))).resolves.toBeUndefined();
  });

  it("requires the backend session to be revoked or absent", async () => {
    const active = createClerkIdentityHintObserver({
      users: { getUser: () => Promise.reject(new Error("unused")) },
      sessions: {
        getSession: (id: string) => Promise.resolve({ id, status: "active" }),
      },
    } as never);
    const revoked = createClerkIdentityHintObserver({
      users: { getUser: () => Promise.reject(new Error("unused")) },
      sessions: {
        getSession: (id: string) => Promise.resolve({ id, status: "revoked" }),
      },
    } as never);

    await expect(active(hint("session.revoked"))).rejects.toThrow(
      "CLERK_SESSION_STILL_ACTIVE",
    );
    await expect(revoked(hint("session.revoked"))).resolves.toBeUndefined();
  });

  it("confirms deletion through a Clerk backend not-found response", async () => {
    const observer = createClerkIdentityHintObserver({
      users: {
        getUser: () =>
          Promise.reject(
            Object.assign(new Error("not found"), { status: 404 }),
          ),
      },
      sessions: { getSession: () => Promise.reject(new Error("unused")) },
    } as never);

    await expect(observer(hint("user.deleted"))).resolves.toBeUndefined();
  });
});

describe("Clerk session termination", () => {
  it("revokes only the associated Clerk session without an upstream-provider call", async () => {
    const revoked: string[] = [];
    const terminate = createClerkSessionTerminator({
      sessions: {
        revokeSession: (sessionId: string) => {
          revoked.push(sessionId);
          return Promise.resolve({ id: sessionId });
        },
      },
    } as never);

    await expect(terminate("session_clerk_001")).resolves.toBeUndefined();
    expect(revoked).toEqual(["session_clerk_001"]);
  });

  it("delivers a queued termination through the worker boundary", async () => {
    const now = new Date("2026-09-26T16:00:00.000Z");
    const store = new InMemoryClerkSessionTerminationStore();
    store.enqueue({
      sessionId: "session_docket_worker_001",
      clerkSessionId: "session_clerk_worker_001",
      requestedAt: now,
      attemptCount: 0,
    });
    const terminated: string[] = [];
    const worker = createClerkSessionTerminationWorker(
      new ClerkSessionTerminationService(store, () => now),
      (sessionId) => {
        terminated.push(sessionId);
        return Promise.resolve();
      },
    );

    await expect(worker.runOnce()).resolves.toEqual({
      status: "delivered",
      sessionId: "session_docket_worker_001",
    });
    expect(terminated).toEqual(["session_clerk_worker_001"]);
  });
});
