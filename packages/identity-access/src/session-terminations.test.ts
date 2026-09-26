import { describe, expect, it } from "vitest";
import {
  ClerkSessionTerminationService,
  InMemoryClerkSessionTerminationStore,
} from "./session-terminations.js";

describe("Clerk session termination delivery", () => {
  it("records a delivery failure and retries the same minimized command", async () => {
    let now = new Date("2026-09-26T16:00:00.000Z");
    const store = new InMemoryClerkSessionTerminationStore();
    store.enqueue({
      sessionId: "session_docket_001",
      clerkSessionId: "session_clerk_001",
      requestedAt: now,
      attemptCount: 0,
    });
    const service = new ClerkSessionTerminationService(store, () => now);
    const delivered: string[] = [];

    await expect(
      service.deliverNext(() => Promise.reject(new Error("provider outage"))),
    ).resolves.toEqual({
      status: "failed",
      sessionId: "session_docket_001",
    });
    expect(store.snapshot()[0]).toMatchObject({
      attemptCount: 1,
      lastErrorCode: "DELIVERY_FAILED",
    });

    now = new Date("2026-09-26T16:01:00.000Z");
    await expect(
      service.deliverNext((clerkSessionId) => {
        delivered.push(clerkSessionId);
        return Promise.resolve();
      }),
    ).resolves.toEqual({
      status: "delivered",
      sessionId: "session_docket_001",
    });
    expect(delivered).toEqual(["session_clerk_001"]);
    expect(store.snapshot()[0]).toMatchObject({ attemptCount: 2 });
    expect(store.snapshot()[0]?.deliveredAt).toEqual(now);
    expect(store.snapshot()[0]?.lastErrorCode).toBeUndefined();
  });
});
