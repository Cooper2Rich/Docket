import { createHash } from "node:crypto";
import { connectDatabaseSession, type DatabaseSession } from "@docket/database";

export const clerkWebhookHintTypes = [
  "session.revoked",
  "user.deleted",
  "user.updated",
] as const;

export type ClerkWebhookHintType = (typeof clerkWebhookHintTypes)[number];

export type ClerkWebhookHint = Readonly<{
  deliveryId: string;
  type: ClerkWebhookHintType;
  clerkObjectId: string;
  occurredAt: Date;
  digest: string;
  attemptCount: number;
}>;

export type WebhookHintDelivery = Readonly<{
  status: "delivered" | "failed" | "idle";
  deliveryId?: string;
}>;

export interface IdentityWebhookHintStore {
  enqueue(hint: ClerkWebhookHint): Promise<"accepted" | "duplicate">;
  claim(now: Date, leaseUntil: Date): Promise<ClerkWebhookHint | undefined>;
  complete(deliveryId: string, attemptCount: number, now: Date): Promise<void>;
  retry(
    deliveryId: string,
    attemptCount: number,
    availableAt: Date,
    errorCode: "DELIVERY_FAILED",
  ): Promise<void>;
}

export class WebhookHintConflictError extends Error {
  readonly code = "WEBHOOK_HINT_CONFLICT";

  constructor() {
    super("the webhook delivery identifier was reused for another hint");
    this.name = "WebhookHintConflictError";
  }
}

function digest(
  input: Readonly<{
    type: ClerkWebhookHintType;
    clerkObjectId: string;
    occurredAt: Date;
  }>,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        type: input.type,
        clerkObjectId: input.clerkObjectId,
        occurredAt: input.occurredAt.toISOString(),
      }),
    )
    .digest("hex");
}

export class IdentityWebhookHintService {
  constructor(
    private readonly store: IdentityWebhookHintStore,
    private readonly now: () => Date,
  ) {}

  async enqueueVerifiedHint(
    input: Readonly<{
      deliveryId: string;
      type: ClerkWebhookHintType;
      clerkObjectId: string;
      occurredAt: Date;
    }>,
  ): Promise<"accepted" | "duplicate"> {
    if (!input.deliveryId || !input.clerkObjectId) {
      throw new TypeError("WEBHOOK_HINT_INVALID");
    }
    return this.store.enqueue({
      ...input,
      digest: digest(input),
      attemptCount: 0,
    });
  }

  async deliverNext(
    revalidate: (hint: ClerkWebhookHint) => Promise<void>,
  ): Promise<WebhookHintDelivery> {
    const now = this.now();
    const leaseUntil = new Date(now.getTime() + 30_000);
    const hint = await this.store.claim(now, leaseUntil);
    if (!hint) return { status: "idle" };
    try {
      await revalidate(hint);
      await this.store.complete(hint.deliveryId, hint.attemptCount, this.now());
      return { status: "delivered", deliveryId: hint.deliveryId };
    } catch {
      await this.store.retry(
        hint.deliveryId,
        hint.attemptCount,
        new Date(this.now().getTime() + 60_000),
        "DELIVERY_FAILED",
      );
      return { status: "failed", deliveryId: hint.deliveryId };
    }
  }
}

type StoredHint = ClerkWebhookHint & {
  availableAt: Date;
  deliveredAt?: Date;
  lastErrorCode?: "DELIVERY_FAILED";
};

export class InMemoryIdentityWebhookHintStore
  implements IdentityWebhookHintStore
{
  private readonly hints = new Map<string, StoredHint>();

  enqueue(hint: ClerkWebhookHint): Promise<"accepted" | "duplicate"> {
    const existing = this.hints.get(hint.deliveryId);
    if (existing) {
      if (existing.digest !== hint.digest) throw new WebhookHintConflictError();
      return Promise.resolve("duplicate");
    }
    this.hints.set(hint.deliveryId, {
      ...hint,
      availableAt: hint.occurredAt,
    });
    return Promise.resolve("accepted");
  }

  claim(now: Date, leaseUntil: Date): Promise<ClerkWebhookHint | undefined> {
    const candidate = [...this.hints.values()]
      .filter((hint) => !hint.deliveredAt && hint.availableAt <= now)
      .sort(
        (left, right) =>
          left.occurredAt.getTime() - right.occurredAt.getTime() ||
          left.deliveryId.localeCompare(right.deliveryId),
      )[0];
    if (!candidate) return Promise.resolve(undefined);
    const claimed = {
      ...candidate,
      attemptCount: candidate.attemptCount + 1,
      availableAt: leaseUntil,
    };
    this.hints.set(candidate.deliveryId, claimed);
    return Promise.resolve(claimed);
  }

  complete(deliveryId: string, attemptCount: number, now: Date): Promise<void> {
    const hint = this.hints.get(deliveryId);
    if (hint?.attemptCount !== attemptCount || hint.deliveredAt) {
      throw new WebhookHintConflictError();
    }
    const completed = { ...hint };
    delete completed.lastErrorCode;
    this.hints.set(deliveryId, { ...completed, deliveredAt: now });
    return Promise.resolve();
  }

  retry(
    deliveryId: string,
    attemptCount: number,
    availableAt: Date,
    errorCode: "DELIVERY_FAILED",
  ): Promise<void> {
    const hint = this.hints.get(deliveryId);
    if (hint?.attemptCount !== attemptCount || hint.deliveredAt) {
      throw new WebhookHintConflictError();
    }
    this.hints.set(deliveryId, {
      ...hint,
      availableAt,
      lastErrorCode: errorCode,
    });
    return Promise.resolve();
  }

  snapshot(): readonly StoredHint[] {
    return [...this.hints.values()];
  }
}

type HintRow = Readonly<Record<string, unknown>>;

function rowHint(row: HintRow): ClerkWebhookHint {
  return {
    deliveryId: String(row.delivery_id),
    type: String(row.event_type) as ClerkWebhookHintType,
    clerkObjectId: String(row.clerk_object_id),
    occurredAt: new Date(String(row.occurred_at)),
    digest: String(row.input_digest),
    attemptCount: Number(row.attempt_count),
  };
}

export class PostgresIdentityWebhookHintStore
  implements IdentityWebhookHintStore
{
  constructor(
    private readonly databaseUrl: string,
    private readonly connect: (
      databaseUrl: string,
    ) => Promise<DatabaseSession> = connectDatabaseSession,
  ) {}

  private async session<T>(
    work: (connection: DatabaseSession) => Promise<T>,
  ): Promise<T> {
    const connection = await this.connect(this.databaseUrl);
    try {
      return await work(connection);
    } finally {
      await connection.release();
    }
  }

  async enqueue(hint: ClerkWebhookHint): Promise<"accepted" | "duplicate"> {
    return this.session(async (connection) => {
      const result = await connection.query<HintRow>(
        "insert into identity_webhook_hints (delivery_id, event_type, clerk_object_id, occurred_at, input_digest, attempt_count, available_at) values ($1, $2, $3, $4, $5, 0, $4) on conflict (delivery_id) do nothing returning delivery_id",
        [
          hint.deliveryId,
          hint.type,
          hint.clerkObjectId,
          hint.occurredAt,
          hint.digest,
        ],
      );
      if (result.rowCount === 1) return "accepted";
      const existing = await connection.query<HintRow>(
        "select input_digest from identity_webhook_hints where delivery_id = $1",
        [hint.deliveryId],
      );
      if (String(existing.rows[0]?.input_digest) !== hint.digest) {
        throw new WebhookHintConflictError();
      }
      return "duplicate";
    });
  }

  async claim(
    now: Date,
    leaseUntil: Date,
  ): Promise<ClerkWebhookHint | undefined> {
    return this.session(async (connection) => {
      const result = await connection.query<HintRow>(
        "with candidate as (select delivery_id from identity_webhook_hints where delivered_at is null and available_at <= $1 order by occurred_at, delivery_id for update skip locked limit 1) update identity_webhook_hints as hint set attempt_count = hint.attempt_count + 1, available_at = $2 from candidate where hint.delivery_id = candidate.delivery_id returning hint.*",
        [now, leaseUntil],
      );
      return result.rows[0] ? rowHint(result.rows[0]) : undefined;
    });
  }

  async complete(
    deliveryId: string,
    attemptCount: number,
    now: Date,
  ): Promise<void> {
    await this.session(async (connection) => {
      const result = await connection.query(
        "update identity_webhook_hints set delivered_at = $3, last_error_code = null where delivery_id = $1 and attempt_count = $2 and delivered_at is null",
        [deliveryId, attemptCount, now],
      );
      if (result.rowCount !== 1) throw new WebhookHintConflictError();
    });
  }

  async retry(
    deliveryId: string,
    attemptCount: number,
    availableAt: Date,
    errorCode: "DELIVERY_FAILED",
  ): Promise<void> {
    await this.session(async (connection) => {
      const result = await connection.query(
        "update identity_webhook_hints set available_at = $3, last_error_code = $4 where delivery_id = $1 and attempt_count = $2 and delivered_at is null",
        [deliveryId, attemptCount, availableAt, errorCode],
      );
      if (result.rowCount !== 1) throw new WebhookHintConflictError();
    });
  }
}
