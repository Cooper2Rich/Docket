import { createHash } from "node:crypto";
import { Value } from "@sinclair/typebox/value";
import {
  OutboxEnvelopeSchema,
  type CreateNoticeIntentRequest,
  type CreateNoticeIntentResult,
  type DeliveryAttempt,
  type DeliverNoticeResult,
  type InboxItem,
  type NoticeIntent,
  type OutboxEnvelope,
} from "./contracts.js";

export type CommunicationsErrorCode =
  | "IDEMPOTENCY_CONFLICT"
  | "RECIPIENT_UNAUTHORIZED"
  | "DELIVERY_PROVIDER_FAILED"
  | "STALE_VERSION"
  | "REQUEST_INVALID";

export class CommunicationsError extends Error {
  constructor(
    readonly code: CommunicationsErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CommunicationsError";
  }
}

export interface CommunicationsActor {
  readonly accountId: string;
}

export interface RecipientAuthority {
  readonly allowed: boolean;
  readonly authorityVersion: number;
}

export interface RecipientAuthorityResolver {
  resolve(
    actor: CommunicationsActor,
    recipientAccountId: string,
  ): Promise<RecipientAuthority>;
}

export interface DeliveryProvider {
  deliver(
    input: Readonly<{
      idempotencyKey: string;
      recipientAccountId: string;
      subject: string;
      body: string;
      correlationId: string;
    }>,
  ): Promise<Readonly<{ providerMessageId: string }>>;
}

export interface SafeCommunicationsTelemetry {
  record(
    fact: Readonly<{
      name:
        | "notice.queued"
        | "notice.delivery_started"
        | "notice.delivery_failed"
        | "notice.delivered";
      correlationId: string;
      noticeReference: string;
      attempt?: number;
      state: NoticeIntent["state"];
      providerCode?: string;
    }>,
  ): void;
}

export interface NoticeReceipt {
  readonly digest: string;
  readonly result: CreateNoticeIntentResult;
}

export interface StoredOutboxMessage {
  readonly envelope: OutboxEnvelope;
  readonly state: "pending" | "claimed" | "published";
  readonly claimOwner?: string;
  readonly claimExpiresAt?: string;
  readonly publishAttempts: number;
  readonly lastFailureCode?: string;
}

export interface CommunicationsTransaction {
  getIntent(id: string): Promise<NoticeIntent | undefined>;
  saveIntent(intent: NoticeIntent): Promise<void>;
  getReceipt(key: string): Promise<NoticeReceipt | undefined>;
  saveReceipt(key: string, receipt: NoticeReceipt): Promise<void>;
  appendOutbox(message: StoredOutboxMessage): Promise<void>;
  getInboxItemByIntent(intentId: string): Promise<InboxItem | undefined>;
  saveInboxItem(item: InboxItem): Promise<void>;
  listInboxItems(recipientAccountId: string): Promise<readonly InboxItem[]>;
  listAttempts(intentId: string): Promise<readonly DeliveryAttempt[]>;
  saveAttempt(attempt: DeliveryAttempt): Promise<void>;
}

export interface CommunicationsStore {
  transaction<T>(
    work: (transaction: CommunicationsTransaction) => T | Promise<T>,
  ): Promise<T>;
  deleteExpired(now: string): Promise<
    Readonly<{
      intents: number;
      attempts: number;
      inboxItems: number;
    }>
  >;
}

export interface CommunicationsServiceOptions {
  readonly store: CommunicationsStore;
  readonly authority: RecipientAuthorityResolver;
  readonly provider: DeliveryProvider;
  readonly now?: () => Date;
  readonly nextId?: (kind: "event" | "attempt" | "inbox") => string;
  readonly telemetry?: SafeCommunicationsTelemetry;
  readonly maximumAttempts?: number;
  readonly retentionMilliseconds?: number;
  readonly afterProviderDelivery?: () => void | Promise<void>;
}

function canonicalDigest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function safeCode(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && /^[A-Z0-9_]{1,64}$/u.test(code)
    ? code
    : "PROVIDER_UNAVAILABLE";
}

function pseudonym(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function event(
  id: string,
  eventName: OutboxEnvelope["eventName"],
  intent: NoticeIntent,
  occurredAt: string,
): OutboxEnvelope {
  return {
    id,
    eventName,
    eventVersion: 1,
    aggregateId: intent.id,
    correlationId: intent.correlationId,
    causationId:
      eventName === "NoticeRequested" ? intent.causationId : intent.id,
    occurredAt,
    payload: { noticeIntentId: intent.id },
  };
}

export class CommunicationsService {
  private readonly now: () => Date;
  private readonly nextId: NonNullable<CommunicationsServiceOptions["nextId"]>;
  private readonly telemetry: SafeCommunicationsTelemetry;
  private readonly maximumAttempts: number;
  private readonly retentionMilliseconds: number;

  constructor(private readonly options: CommunicationsServiceOptions) {
    this.now = options.now ?? (() => new Date());
    let counter = 0;
    this.nextId =
      options.nextId ??
      ((kind) => `${kind}_${String(++counter).padStart(8, "0")}`);
    this.telemetry = options.telemetry ?? { record: () => undefined };
    this.maximumAttempts = options.maximumAttempts ?? 3;
    this.retentionMilliseconds =
      options.retentionMilliseconds ?? 30 * 24 * 60 * 60 * 1_000;
    if (this.maximumAttempts < 1) {
      throw new TypeError("COMMUNICATIONS_RETRY_POLICY_INVALID");
    }
  }

  async createNoticeIntent(
    actor: CommunicationsActor,
    input: CreateNoticeIntentRequest,
  ): Promise<CreateNoticeIntentResult> {
    const authority = await this.options.authority.resolve(
      actor,
      input.recipientAccountId,
    );
    if (!authority.allowed) {
      throw new CommunicationsError(
        "RECIPIENT_UNAUTHORIZED",
        "the recipient is unavailable",
      );
    }
    if (authority.authorityVersion !== input.expectedAuthorityVersion) {
      throw new CommunicationsError(
        "STALE_VERSION",
        "the recipient authority changed",
      );
    }
    const digest = canonicalDigest({ actor: actor.accountId, ...input });
    const result = await this.options.store.transaction(async (transaction) => {
      const receipt = await transaction.getReceipt(input.idempotencyKey);
      if (receipt) {
        if (receipt.digest !== digest) {
          throw new CommunicationsError(
            "IDEMPOTENCY_CONFLICT",
            "the idempotency key has different input",
          );
        }
        return clone(receipt.result);
      }
      if (await transaction.getIntent(input.noticeIntentId)) {
        throw new CommunicationsError(
          "STALE_VERSION",
          "the notice intent already exists",
        );
      }
      const createdAt = this.now();
      const intent: NoticeIntent = {
        id: input.noticeIntentId,
        initiatingActorId: actor.accountId,
        recipientAccountId: input.recipientAccountId,
        audience: "authorized_recipient",
        subject: input.subject,
        body: input.body,
        state: "queued",
        version: 1,
        correlationId: input.correlationId,
        causationId: input.causationId,
        eventVersion: 1,
        createdAt: createdAt.toISOString(),
        retainedUntil: new Date(
          createdAt.getTime() + this.retentionMilliseconds,
        ).toISOString(),
      };
      const envelope = event(
        this.nextId("event"),
        "NoticeRequested",
        intent,
        createdAt.toISOString(),
      );
      const created = { intent, outbox: envelope };
      await transaction.saveIntent(intent);
      await transaction.appendOutbox({
        envelope,
        state: "pending",
        publishAttempts: 0,
      });
      await transaction.saveReceipt(input.idempotencyKey, {
        digest,
        result: created,
      });
      return created;
    });
    this.record("notice.queued", result.intent);
    return result;
  }

  async deliverNotice(envelope: OutboxEnvelope): Promise<DeliverNoticeResult> {
    if (
      !Value.Check(OutboxEnvelopeSchema, envelope) ||
      envelope.eventName !== "NoticeRequested"
    ) {
      throw new CommunicationsError(
        "REQUEST_INVALID",
        "the outbox envelope is invalid",
      );
    }

    const prepared = await this.options.store.transaction(
      async (transaction) => {
        const intent = await transaction.getIntent(
          envelope.payload.noticeIntentId,
        );
        if (intent?.id !== envelope.aggregateId) {
          throw new CommunicationsError(
            "REQUEST_INVALID",
            "the notice intent is unavailable",
          );
        }
        if (intent.state === "delivered") {
          return { intent, equivalentRetry: true as const };
        }
        if (intent.state === "failed") {
          throw new CommunicationsError(
            "DELIVERY_PROVIDER_FAILED",
            "the delivery retry policy is exhausted",
          );
        }
        const attempts = await transaction.listAttempts(intent.id);
        const attemptNumber = attempts.length + 1;
        const attempt: DeliveryAttempt = {
          id: this.nextId("attempt"),
          noticeIntentId: intent.id,
          attemptNumber,
          state: "started",
          startedAt: this.now().toISOString(),
        };
        await transaction.saveAttempt(attempt);
        if (!(await transaction.getInboxItemByIntent(intent.id))) {
          await transaction.saveInboxItem({
            id: this.nextId("inbox"),
            noticeIntentId: intent.id,
            recipientAccountId: intent.recipientAccountId,
            subject: intent.subject,
            body: intent.body,
            deliveryState: "pending",
            version: 1,
            createdAt: this.now().toISOString(),
          });
        }
        return { intent, attempt, equivalentRetry: false as const };
      },
    );

    if (prepared.equivalentRetry) {
      return {
        state: "delivered",
        noticeIntentId: prepared.intent.id,
        equivalentRetry: true,
      };
    }

    this.record(
      "notice.delivery_started",
      prepared.intent,
      prepared.attempt.attemptNumber,
    );
    try {
      await this.options.provider.deliver({
        idempotencyKey: prepared.intent.id,
        recipientAccountId: prepared.intent.recipientAccountId,
        subject: prepared.intent.subject,
        body: prepared.intent.body,
        correlationId: prepared.intent.correlationId,
      });
      await this.options.afterProviderDelivery?.();
    } catch (error) {
      if (error instanceof CommunicationsError) throw error;
      const providerCode = safeCode(error);
      const failed = await this.options.store.transaction(
        async (transaction) => {
          const current = await transaction.getIntent(prepared.intent.id);
          if (!current) throw error;
          if (current.state === "delivered") return current;
          const exhausted =
            prepared.attempt.attemptNumber >= this.maximumAttempts;
          const now = this.now();
          const nextAttemptAt = new Date(
            now.getTime() +
              Math.min(
                60_000 * 2 ** (prepared.attempt.attemptNumber - 1),
                60 * 60 * 1_000,
              ),
          ).toISOString();
          await transaction.saveAttempt({
            ...prepared.attempt,
            state: "failed",
            providerCode,
            completedAt: now.toISOString(),
            ...(exhausted ? {} : { nextAttemptAt }),
          });
          const next: NoticeIntent = {
            ...current,
            state: exhausted ? "failed" : "retrying",
            version: current.version + 1,
          };
          await transaction.saveIntent(next);
          const inbox = await transaction.getInboxItemByIntent(next.id);
          if (inbox && exhausted) {
            await transaction.saveInboxItem({
              ...inbox,
              deliveryState: "delivery_failed",
              version: inbox.version + 1,
            });
          }
          const failureEvent = event(
            this.nextId("event"),
            exhausted ? "NoticeEscalated" : "NoticeDeliveryFailed",
            next,
            now.toISOString(),
          );
          await transaction.appendOutbox({
            envelope: failureEvent,
            state: "pending",
            publishAttempts: 0,
          });
          return next;
        },
      );
      this.record(
        "notice.delivery_failed",
        failed,
        prepared.attempt.attemptNumber,
        providerCode,
      );
      throw new CommunicationsError(
        "DELIVERY_PROVIDER_FAILED",
        "delivery failed and was retained for retry",
        { cause: error },
      );
    }

    const delivered = await this.options.store.transaction(
      async (transaction) => {
        const current = await transaction.getIntent(prepared.intent.id);
        if (!current) {
          throw new CommunicationsError(
            "REQUEST_INVALID",
            "the notice intent is unavailable",
          );
        }
        if (current.state === "delivered") return current;
        const now = this.now().toISOString();
        await transaction.saveAttempt({
          ...prepared.attempt,
          state: "delivered",
          completedAt: now,
        });
        const next: NoticeIntent = {
          ...current,
          state: "delivered",
          version: current.version + 1,
        };
        await transaction.saveIntent(next);
        const inbox = await transaction.getInboxItemByIntent(next.id);
        if (!inbox) throw new Error("COMMUNICATIONS_INBOX_INVARIANT");
        await transaction.saveInboxItem({
          ...inbox,
          deliveryState: "delivered",
          version: inbox.version + 1,
        });
        await transaction.appendOutbox({
          envelope: event(this.nextId("event"), "NoticeDelivered", next, now),
          state: "pending",
          publishAttempts: 0,
        });
        return next;
      },
    );
    this.record("notice.delivered", delivered, prepared.attempt.attemptNumber);
    return {
      state: "delivered",
      noticeIntentId: delivered.id,
      equivalentRetry: false,
    };
  }

  async readAccessInbox(
    actor: CommunicationsActor,
    recipientAccountId: string,
  ): Promise<Readonly<{ items: readonly InboxItem[] }>> {
    if (actor.accountId !== recipientAccountId) {
      throw new CommunicationsError(
        "RECIPIENT_UNAUTHORIZED",
        "the requested inbox is unavailable",
      );
    }
    return this.options.store.transaction(async (transaction) => ({
      items: await transaction.listInboxItems(recipientAccountId),
    }));
  }

  deleteExpired(): Promise<
    Readonly<{
      intents: number;
      attempts: number;
      inboxItems: number;
    }>
  > {
    return this.options.store.deleteExpired(this.now().toISOString());
  }

  private record(
    name: Parameters<SafeCommunicationsTelemetry["record"]>[0]["name"],
    intent: NoticeIntent,
    attempt?: number,
    providerCode?: string,
  ): void {
    this.telemetry.record({
      name,
      correlationId: intent.correlationId,
      noticeReference: pseudonym(intent.id),
      state: intent.state,
      ...(attempt === undefined ? {} : { attempt }),
      ...(providerCode === undefined ? {} : { providerCode }),
    });
  }
}

interface InMemoryState {
  intents: Map<string, NoticeIntent>;
  receipts: Map<string, NoticeReceipt>;
  outbox: Map<string, StoredOutboxMessage>;
  inbox: Map<string, InboxItem>;
  attempts: Map<string, DeliveryAttempt>;
}

function copyState(state: InMemoryState): InMemoryState {
  return {
    intents: new Map(
      [...state.intents].map(([key, value]) => [key, clone(value)]),
    ),
    receipts: new Map(
      [...state.receipts].map(([key, value]) => [key, clone(value)]),
    ),
    outbox: new Map(
      [...state.outbox].map(([key, value]) => [key, clone(value)]),
    ),
    inbox: new Map([...state.inbox].map(([key, value]) => [key, clone(value)])),
    attempts: new Map(
      [...state.attempts].map(([key, value]) => [key, clone(value)]),
    ),
  };
}

function inMemoryTransaction(state: InMemoryState): CommunicationsTransaction {
  return {
    getIntent: (id) => Promise.resolve(clone(state.intents.get(id))),
    saveIntent: (intent) => {
      state.intents.set(intent.id, clone(intent));
      return Promise.resolve();
    },
    getReceipt: (key) => Promise.resolve(clone(state.receipts.get(key))),
    saveReceipt: (key, receipt) => {
      if (state.receipts.has(key)) {
        return Promise.reject(
          new CommunicationsError(
            "IDEMPOTENCY_CONFLICT",
            "the receipt already exists",
          ),
        );
      }
      state.receipts.set(key, clone(receipt));
      return Promise.resolve();
    },
    appendOutbox: (message) => {
      if (state.outbox.has(message.envelope.id)) {
        return Promise.reject(
          new CommunicationsError(
            "IDEMPOTENCY_CONFLICT",
            "the outbox event already exists",
          ),
        );
      }
      state.outbox.set(message.envelope.id, clone(message));
      return Promise.resolve();
    },
    getInboxItemByIntent: (intentId) =>
      Promise.resolve(
        clone(
          [...state.inbox.values()].find(
            (item) => item.noticeIntentId === intentId,
          ),
        ),
      ),
    saveInboxItem: (item) => {
      state.inbox.set(item.id, clone(item));
      return Promise.resolve();
    },
    listInboxItems: (recipientAccountId) =>
      Promise.resolve(
        [...state.inbox.values()]
          .filter((item) => item.recipientAccountId === recipientAccountId)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
          .map(clone),
      ),
    listAttempts: (intentId) =>
      Promise.resolve(
        [...state.attempts.values()]
          .filter((attempt) => attempt.noticeIntentId === intentId)
          .sort((left, right) => left.attemptNumber - right.attemptNumber)
          .map(clone),
      ),
    saveAttempt: (attempt) => {
      state.attempts.set(attempt.id, clone(attempt));
      return Promise.resolve();
    },
  };
}

export class InMemoryCommunicationsStore implements CommunicationsStore {
  private state: InMemoryState = {
    intents: new Map(),
    receipts: new Map(),
    outbox: new Map(),
    inbox: new Map(),
    attempts: new Map(),
  };
  private failBeforeCommit = false;

  failNextTransaction(): void {
    this.failBeforeCommit = true;
  }

  async transaction<T>(
    work: (transaction: CommunicationsTransaction) => T | Promise<T>,
  ): Promise<T> {
    const pending = copyState(this.state);
    const result = await work(inMemoryTransaction(pending));
    if (this.failBeforeCommit) {
      this.failBeforeCommit = false;
      throw new Error("SIMULATED_TRANSACTION_ROLLBACK");
    }
    this.state = pending;
    return clone(result);
  }

  deleteExpired(now: string) {
    let intents = 0;
    let attempts = 0;
    let inboxItems = 0;
    const expiredIds = new Set<string>();
    for (const [id, intent] of this.state.intents) {
      if (intent.retainedUntil <= now) {
        this.state.intents.delete(id);
        expiredIds.add(id);
        intents += 1;
      }
    }
    for (const [id, attempt] of this.state.attempts) {
      if (expiredIds.has(attempt.noticeIntentId)) {
        this.state.attempts.delete(id);
        attempts += 1;
      }
    }
    for (const [id, item] of this.state.inbox) {
      if (expiredIds.has(item.noticeIntentId)) {
        this.state.inbox.delete(id);
        inboxItems += 1;
      }
    }
    return Promise.resolve({ intents, attempts, inboxItems });
  }

  snapshot(): Readonly<{
    intents: readonly NoticeIntent[];
    receipts: readonly NoticeReceipt[];
    outbox: readonly StoredOutboxMessage[];
    inbox: readonly InboxItem[];
    attempts: readonly DeliveryAttempt[];
  }> {
    return {
      intents: [...this.state.intents.values()].map(clone),
      receipts: [...this.state.receipts.values()].map(clone),
      outbox: [...this.state.outbox.values()].map(clone),
      inbox: [...this.state.inbox.values()].map(clone),
      attempts: [...this.state.attempts.values()].map(clone),
    };
  }
}
