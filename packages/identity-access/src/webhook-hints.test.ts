import { describe, expect, it } from "vitest";
import {
  IdentityWebhookHintService,
  InMemoryIdentityWebhookHintStore,
  WebhookHintConflictError,
} from "./webhook-hints.js";

function fixture() {
  let now = new Date("2026-09-25T18:00:00.000Z");
  const store = new InMemoryIdentityWebhookHintStore();
  const service = new IdentityWebhookHintService(store, () => now);
  return {
    store,
    service,
    advance: (milliseconds: number) => {
      now = new Date(now.getTime() + milliseconds);
    },
  };
}

const hint = {
  deliveryId: "msg_identity_001",
  type: "user.updated" as const,
  clerkObjectId: "user_identity_001",
  occurredAt: new Date("2026-09-25T18:00:00.000Z"),
};

describe("Clerk webhook hints", () => {
  it("accepts an equivalent delivery once without storing provider payload or authority", async () => {
    const { service, store } = fixture();

    await expect(service.enqueueVerifiedHint(hint)).resolves.toBe("accepted");
    await expect(service.enqueueVerifiedHint(hint)).resolves.toBe("duplicate");

    expect(store.snapshot()).toHaveLength(1);
    expect(store.snapshot()[0]).toMatchObject({
      deliveryId: hint.deliveryId,
      clerkObjectId: hint.clerkObjectId,
      attemptCount: 0,
    });
    expect(JSON.stringify(store.snapshot())).not.toContain("email");
    expect(JSON.stringify(store.snapshot())).not.toContain("role");
  });

  it("rejects a conflicting reuse of the provider delivery identifier", async () => {
    const { service } = fixture();
    await service.enqueueVerifiedHint(hint);

    await expect(
      service.enqueueVerifiedHint({ ...hint, clerkObjectId: "user_other" }),
    ).rejects.toMatchObject({
      code: new WebhookHintConflictError().code,
    });
  });

  it("records a delivery failure and makes the hint available for retry", async () => {
    const { service, store, advance } = fixture();
    await service.enqueueVerifiedHint(hint);

    await expect(
      service.deliverNext(() => Promise.reject(new Error("provider outage"))),
    ).resolves.toEqual({ status: "failed", deliveryId: hint.deliveryId });
    expect(store.snapshot()[0]).toMatchObject({
      attemptCount: 1,
      lastErrorCode: "DELIVERY_FAILED",
    });
    expect(store.snapshot()[0]).not.toHaveProperty("deliveredAt");
    await expect(service.deliverNext(() => Promise.resolve())).resolves.toEqual(
      { status: "idle" },
    );

    advance(60_000);
    await expect(service.deliverNext(() => Promise.resolve())).resolves.toEqual(
      { status: "delivered", deliveryId: hint.deliveryId },
    );
    expect(store.snapshot()[0]).toMatchObject({ attemptCount: 2 });
    expect(store.snapshot()[0]?.deliveredAt).toBeInstanceOf(Date);
  });
});
