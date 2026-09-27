import { describe, expect, it } from "vitest";
import {
  InMemoryPrivilegedContextAlertStore,
  PrivilegedContextAlertService,
} from "./privileged-context-alerts.js";
import type { PrivilegedContextRestoredAlert } from "./role-context.js";

const restoredAt = new Date("2026-09-26T18:00:00.000Z");
const alert: PrivilegedContextRestoredAlert = {
  id: "security-alert-1",
  accountId: "account-1",
  docketSessionId: "session-1",
  contextId: "context-1",
  contextKind: "platform_administrator",
  scopeLabel: "Docket platform",
  device: "Firefox on Windows",
  approximateLocation: "Austin, US",
  restoredAt,
  terminationPath: "/account/sessions",
  attemptCount: 0,
};

describe("privileged-context restoration alert delivery", () => {
  it("records failure without losing the minimized alert and retries it at least once", async () => {
    let now = restoredAt;
    const store = new InMemoryPrivilegedContextAlertStore();
    store.enqueue(alert);
    const service = new PrivilegedContextAlertService(store, () => now);

    await expect(
      service.deliverNext(() => Promise.reject(new Error("inbox unavailable"))),
    ).resolves.toEqual({ status: "failed", alertId: alert.id });
    expect(store.snapshot()[0]).toMatchObject({
      attemptCount: 1,
      lastErrorCode: "DELIVERY_FAILED",
    });
    await expect(service.deliverNext(() => Promise.resolve())).resolves.toEqual(
      { status: "idle" },
    );

    now = new Date(restoredAt.getTime() + 60_000);
    const published: PrivilegedContextRestoredAlert[] = [];
    await expect(
      service.deliverNext((value) => {
        published.push(value);
        return Promise.resolve();
      }),
    ).resolves.toEqual({ status: "delivered", alertId: alert.id });
    expect(published).toEqual([
      expect.objectContaining({
        id: alert.id,
        device: alert.device,
        approximateLocation: alert.approximateLocation,
        terminationPath: "/account/sessions",
        attemptCount: 2,
      }),
    ]);
    expect(store.snapshot()[0]).toMatchObject({
      attemptCount: 2,
      deliveredAt: now,
    });
  });
});
