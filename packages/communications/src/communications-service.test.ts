import { describe, expect, it } from "vitest";
import {
  CommunicationsError,
  CommunicationsService,
  InMemoryCommunicationsStore,
  type DeliveryProvider,
  type SafeCommunicationsTelemetry,
} from "./communications-service.js";
import type { CreateNoticeIntentRequest } from "./contracts.js";

const actor = { accountId: "account_sender_001" } as const;
const recipient = "account_recipient_001";
const instant = new Date("2026-09-26T20:00:00.000Z");

function input(
  overrides: Partial<CreateNoticeIntentRequest> = {},
): CreateNoticeIntentRequest {
  return {
    noticeIntentId: "notice_001",
    recipientAccountId: recipient,
    subject: "Tournament update",
    body: "Your registration change is ready to review.",
    expectedAuthorityVersion: 4,
    expectedVersion: 0,
    idempotencyKey: "notice-command-001",
    correlationId: "request-001",
    causationId: "registration-command-001",
    ...overrides,
  };
}

function setup(
  options: Readonly<{
    store?: InMemoryCommunicationsStore;
    provider?: DeliveryProvider;
    allowed?: boolean;
    authorityVersion?: number;
    afterProviderDelivery?: () => void | Promise<void>;
    maximumAttempts?: number;
    telemetry?: SafeCommunicationsTelemetry;
  }> = {},
) {
  const store = options.store ?? new InMemoryCommunicationsStore();
  let sequence = 0;
  const service = new CommunicationsService({
    store,
    authority: {
      resolve: () =>
        Promise.resolve({
          allowed: options.allowed ?? true,
          authorityVersion: options.authorityVersion ?? 4,
        }),
    },
    provider:
      options.provider ??
      ({
        deliver: () => Promise.resolve({ providerMessageId: "mail-001" }),
      } satisfies DeliveryProvider),
    now: () => new Date(instant),
    nextId: (kind) => `${kind}_${String(++sequence).padStart(3, "0")}`,
    ...(options.afterProviderDelivery
      ? { afterProviderDelivery: options.afterProviderDelivery }
      : {}),
    ...(options.maximumAttempts
      ? { maximumAttempts: options.maximumAttempts }
      : {}),
    ...(options.telemetry ? { telemetry: options.telemetry } : {}),
  });
  return { service, store };
}

describe("transactional notice intent", () => {
  it("commits notice intent and outbox atomically or rolls back both", async () => {
    const store = new InMemoryCommunicationsStore();
    store.failNextTransaction();
    const { service } = setup({ store });

    await expect(service.createNoticeIntent(actor, input())).rejects.toThrow(
      "SIMULATED_TRANSACTION_ROLLBACK",
    );
    expect(store.snapshot()).toMatchObject({
      intents: [],
      receipts: [],
      outbox: [],
    });

    const created = await service.createNoticeIntent(actor, input());
    expect(created.outbox).toMatchObject({
      eventName: "NoticeRequested",
      eventVersion: 1,
      aggregateId: "notice_001",
      correlationId: "request-001",
      causationId: "registration-command-001",
      payload: { noticeIntentId: "notice_001" },
    });
    expect(store.snapshot()).toMatchObject({
      intents: [{ id: "notice_001", state: "queued" }],
      outbox: [{ state: "pending", publishAttempts: 0 }],
    });
  });

  it("returns equivalent retry and rejects conflicting idempotency reuse", async () => {
    const { service, store } = setup();
    const first = await service.createNoticeIntent(actor, input());
    await expect(service.createNoticeIntent(actor, input())).resolves.toEqual(
      first,
    );
    await expect(
      service.createNoticeIntent(actor, input({ body: "Different input" })),
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_CONFLICT" });
    expect(store.snapshot().intents).toHaveLength(1);
    expect(store.snapshot().outbox).toHaveLength(1);
  });

  it("rejects denied and stale authority and foreign inbox reads", async () => {
    const denied = setup({ allowed: false }).service;
    await expect(
      denied.createNoticeIntent(actor, input()),
    ).rejects.toMatchObject({ code: "RECIPIENT_UNAUTHORIZED" });

    const stale = setup({ authorityVersion: 5 }).service;
    await expect(
      stale.createNoticeIntent(actor, input()),
    ).rejects.toMatchObject({ code: "STALE_VERSION" });

    const { service } = setup();
    await service.createNoticeIntent(actor, input());
    await expect(
      service.readAccessInbox({ accountId: "account_other_001" }, recipient),
    ).rejects.toMatchObject({ code: "RECIPIENT_UNAUTHORIZED" });
  });
});

describe("idempotent at-least-once delivery", () => {
  it("preserves one logical effect across timeout, duplicate delivery and worker restart", async () => {
    const providerEffects = new Map<string, string>();
    let calls = 0;
    const provider: DeliveryProvider = {
      deliver: ({ idempotencyKey }) => {
        calls += 1;
        const providerMessageId =
          providerEffects.get(idempotencyKey) ?? "provider-message-001";
        providerEffects.set(idempotencyKey, providerMessageId);
        if (calls === 1) {
          throw Object.assign(new Error("response timed out"), {
            code: "PROVIDER_TIMEOUT",
          });
        }
        return Promise.resolve({ providerMessageId });
      },
    };
    const store = new InMemoryCommunicationsStore();
    const firstProcess = setup({ store, provider }).service;
    const created = await firstProcess.createNoticeIntent(actor, input());

    await expect(
      firstProcess.deliverNotice(created.outbox),
    ).rejects.toMatchObject({ code: "DELIVERY_PROVIDER_FAILED" });

    const restartedProcess = setup({ store, provider }).service;
    await expect(
      restartedProcess.deliverNotice(created.outbox),
    ).resolves.toEqual({
      state: "delivered",
      noticeIntentId: "notice_001",
      equivalentRetry: false,
    });
    await expect(
      restartedProcess.deliverNotice(created.outbox),
    ).resolves.toEqual({
      state: "delivered",
      noticeIntentId: "notice_001",
      equivalentRetry: true,
    });

    expect(providerEffects).toEqual(
      new Map([["notice_001", "provider-message-001"]]),
    );
    expect(store.snapshot().inbox).toHaveLength(1);
    expect(store.snapshot().attempts).toMatchObject([
      { attemptNumber: 1, state: "failed", providerCode: "PROVIDER_TIMEOUT" },
      { attemptNumber: 2, state: "delivered" },
    ]);
  });

  it("preserves in-app delivery and escalates after provider failure", async () => {
    const { service, store } = setup({
      maximumAttempts: 2,
      provider: {
        deliver: () =>
          Promise.reject(
            Object.assign(new Error("mail unavailable"), {
              code: "SMTP_UNAVAILABLE",
            }),
          ),
      },
    });
    const created = await service.createNoticeIntent(actor, input());

    await expect(service.deliverNotice(created.outbox)).rejects.toMatchObject({
      code: "DELIVERY_PROVIDER_FAILED",
    });
    expect(
      (await service.readAccessInbox({ accountId: recipient }, recipient))
        .items,
    ).toMatchObject([{ deliveryState: "pending" }]);

    await expect(service.deliverNotice(created.outbox)).rejects.toMatchObject({
      code: "DELIVERY_PROVIDER_FAILED",
    });
    expect(store.snapshot().intents).toMatchObject([{ state: "failed" }]);
    expect(store.snapshot().inbox).toMatchObject([
      { deliveryState: "delivery_failed" },
    ]);
    expect(
      store.snapshot().outbox.map(({ envelope }) => envelope.eventName),
    ).toEqual(["NoticeRequested", "NoticeDeliveryFailed", "NoticeEscalated"]);
  });

  it("records bounded retry history and redacts telemetry", async () => {
    const facts: unknown[] = [];
    const telemetry: SafeCommunicationsTelemetry = {
      record: (fact) => facts.push(fact),
    };
    const { service, store } = setup({
      telemetry,
      provider: {
        deliver: () =>
          Promise.reject(
            Object.assign(new Error("contains private provider detail"), {
              code: "SAFE_PROVIDER_CODE",
            }),
          ),
      },
    });
    const created = await service.createNoticeIntent(actor, input());
    await expect(service.deliverNotice(created.outbox)).rejects.toBeInstanceOf(
      CommunicationsError,
    );

    expect(store.snapshot().attempts).toMatchObject([
      {
        attemptNumber: 1,
        state: "failed",
        providerCode: "SAFE_PROVIDER_CODE",
        nextAttemptAt: "2026-09-26T20:01:00.000Z",
      },
    ]);
    const serialized = JSON.stringify(facts);
    expect(serialized).not.toContain(input().subject);
    expect(serialized).not.toContain(input().body);
    expect(serialized).not.toContain(recipient);
    expect(serialized).not.toContain("contains private provider detail");
    expect(serialized).toContain("noticeReference");
    expect(serialized).toContain("request-001");
  });
});
