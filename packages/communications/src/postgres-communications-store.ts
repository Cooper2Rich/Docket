import { connectDatabaseSession, type DatabaseSession } from "@docket/database";
import type {
  DeliveryAttempt,
  InboxItem,
  NoticeIntent,
  OutboxEnvelope,
} from "./contracts.js";
import {
  CommunicationsError,
  type CommunicationsStore,
  type CommunicationsTransaction,
  type NoticeReceipt,
  type StoredOutboxMessage,
} from "./communications-service.js";

type Row = Record<string, unknown>;

function text(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`COMMUNICATIONS_PERSISTENCE_INVALID: ${field}`);
  }
  return value;
}

function iso(value: unknown, field: string): string {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`COMMUNICATIONS_PERSISTENCE_INVALID: ${field}`);
  }
  return date.toISOString();
}

function intent(row: Row): NoticeIntent {
  return {
    id: String(row.notice_intent_id),
    initiatingActorId: String(row.initiating_actor_id),
    recipientAccountId: String(row.recipient_account_id),
    audience: "authorized_recipient",
    subject: String(row.subject),
    body: String(row.body),
    state: row.delivery_state as NoticeIntent["state"],
    version: Number(row.record_version),
    correlationId: String(row.correlation_id),
    causationId: String(row.causation_id),
    eventVersion: 1,
    createdAt: iso(row.created_at, "communications_notice_intents.created_at"),
    retainedUntil: iso(
      row.retained_until,
      "communications_notice_intents.retained_until",
    ),
  };
}

function inboxItem(row: Row): InboxItem {
  return {
    id: String(row.inbox_item_id),
    noticeIntentId: String(row.notice_intent_id),
    recipientAccountId: String(row.recipient_account_id),
    subject: String(row.subject),
    body: String(row.body),
    deliveryState: row.delivery_state as InboxItem["deliveryState"],
    version: Number(row.record_version),
    createdAt: iso(row.created_at, "communications_inbox_items.created_at"),
  };
}

function attempt(row: Row): DeliveryAttempt {
  const completedAt = row.completed_at;
  const nextAttemptAt = row.next_attempt_at;
  const providerCode = row.provider_code;
  return {
    id: String(row.delivery_attempt_id),
    noticeIntentId: String(row.notice_intent_id),
    attemptNumber: Number(row.attempt_number),
    state: row.delivery_state as DeliveryAttempt["state"],
    startedAt: iso(
      row.started_at,
      "communications_delivery_attempts.started_at",
    ),
    ...(completedAt === null || completedAt === undefined
      ? {}
      : {
          completedAt: iso(
            completedAt,
            "communications_delivery_attempts.completed_at",
          ),
        }),
    ...(nextAttemptAt === null || nextAttemptAt === undefined
      ? {}
      : {
          nextAttemptAt: iso(
            nextAttemptAt,
            "communications_delivery_attempts.next_attempt_at",
          ),
        }),
    ...(providerCode === null || providerCode === undefined
      ? {}
      : {
          providerCode: text(providerCode, "delivery_attempts.provider_code"),
        }),
  };
}

function envelope(value: unknown): OutboxEnvelope {
  return structuredClone(value) as OutboxEnvelope;
}

function outbox(row: Row): StoredOutboxMessage {
  const claimOwner = row.claim_owner;
  const claimExpiresAt = row.claim_expires_at;
  const lastFailureCode = row.last_failure_code;
  return {
    envelope: envelope(row.envelope_json),
    state: row.publish_state as StoredOutboxMessage["state"],
    publishAttempts: Number(row.publish_attempts),
    ...(claimOwner === null || claimOwner === undefined
      ? {}
      : { claimOwner: text(claimOwner, "module_outbox.claim_owner") }),
    ...(claimExpiresAt === null || claimExpiresAt === undefined
      ? {}
      : {
          claimExpiresAt: iso(
            claimExpiresAt,
            "communications_module_outbox.claim_expires_at",
          ),
        }),
    ...(lastFailureCode === null || lastFailureCode === undefined
      ? {}
      : {
          lastFailureCode: text(
            lastFailureCode,
            "module_outbox.last_failure_code",
          ),
        }),
  };
}

async function one(
  connection: DatabaseSession,
  text: string,
  values: readonly unknown[],
): Promise<Row | undefined> {
  return (await connection.query<Row>(text, values)).rows[0];
}

function requireWrite(
  result: Readonly<{ rowCount: number | null }>,
  subject: string,
): void {
  if (result.rowCount !== 1) {
    throw new CommunicationsError("STALE_VERSION", `${subject} changed`);
  }
}

function transactionFor(
  connection: DatabaseSession,
): CommunicationsTransaction {
  return {
    getIntent: async (id) => {
      const row = await one(
        connection,
        "select * from communications_notice_intents where notice_intent_id = $1 for update",
        [id],
      );
      return row ? intent(row) : undefined;
    },
    saveIntent: async (value) => {
      const existing = await one(
        connection,
        "select record_version from communications_notice_intents where notice_intent_id = $1",
        [value.id],
      );
      if (!existing) {
        const result = await connection.query(
          "insert into communications_notice_intents (notice_intent_id, initiating_actor_id, recipient_account_id, audience, subject, body, delivery_state, record_version, correlation_id, causation_id, event_version, created_at, retained_until) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)",
          [
            value.id,
            value.initiatingActorId,
            value.recipientAccountId,
            value.audience,
            value.subject,
            value.body,
            value.state,
            value.version,
            value.correlationId,
            value.causationId,
            value.eventVersion,
            value.createdAt,
            value.retainedUntil,
          ],
        );
        requireWrite(result, "notice intent");
        return;
      }
      const result = await connection.query(
        "update communications_notice_intents set delivery_state=$2, record_version=$3 where notice_intent_id=$1 and record_version=$4",
        [value.id, value.state, value.version, value.version - 1],
      );
      requireWrite(result, "notice intent");
    },
    getReceipt: async (key) => {
      const row = await one(
        connection,
        "select input_digest, result_json from communications_notice_receipts where idempotency_key = $1",
        [key],
      );
      return row
        ? {
            digest: String(row.input_digest),
            result: structuredClone(row.result_json) as NoticeReceipt["result"],
          }
        : undefined;
    },
    saveReceipt: async (key, receipt) => {
      await connection.query(
        "insert into communications_notice_receipts (idempotency_key, notice_intent_id, input_digest, result_json) values ($1,$2,$3,$4)",
        [
          key,
          receipt.result.intent.id,
          receipt.digest,
          JSON.stringify(receipt.result),
        ],
      );
    },
    appendOutbox: async (message) => {
      const value = message.envelope;
      await connection.query(
        "insert into communications_module_outbox (event_id, aggregate_id, event_name, event_version, correlation_id, causation_id, occurred_at, envelope_json, publish_state, claim_owner, claim_expires_at, publish_attempts, last_failure_code) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)",
        [
          value.id,
          value.aggregateId,
          value.eventName,
          value.eventVersion,
          value.correlationId,
          value.causationId,
          value.occurredAt,
          JSON.stringify(value),
          message.state,
          message.claimOwner ?? null,
          message.claimExpiresAt ?? null,
          message.publishAttempts,
          message.lastFailureCode ?? null,
        ],
      );
    },
    getInboxItemByIntent: async (intentId) => {
      const row = await one(
        connection,
        "select * from communications_inbox_items where notice_intent_id = $1 for update",
        [intentId],
      );
      return row ? inboxItem(row) : undefined;
    },
    saveInboxItem: async (value) => {
      const existing = await one(
        connection,
        "select record_version from communications_inbox_items where inbox_item_id = $1",
        [value.id],
      );
      if (!existing) {
        const result = await connection.query(
          "insert into communications_inbox_items (inbox_item_id, notice_intent_id, recipient_account_id, subject, body, delivery_state, record_version, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8)",
          [
            value.id,
            value.noticeIntentId,
            value.recipientAccountId,
            value.subject,
            value.body,
            value.deliveryState,
            value.version,
            value.createdAt,
          ],
        );
        requireWrite(result, "inbox item");
        return;
      }
      const result = await connection.query(
        "update communications_inbox_items set delivery_state=$2, record_version=$3 where inbox_item_id=$1 and record_version=$4",
        [value.id, value.deliveryState, value.version, value.version - 1],
      );
      requireWrite(result, "inbox item");
    },
    listInboxItems: async (recipientAccountId) =>
      (
        await connection.query<Row>(
          "select * from communications_inbox_items where recipient_account_id=$1 order by created_at desc, inbox_item_id",
          [recipientAccountId],
        )
      ).rows.map(inboxItem),
    listAttempts: async (intentId) =>
      (
        await connection.query<Row>(
          "select * from communications_delivery_attempts where notice_intent_id=$1 order by attempt_number",
          [intentId],
        )
      ).rows.map(attempt),
    saveAttempt: async (value) => {
      const result = await connection.query(
        "insert into communications_delivery_attempts (delivery_attempt_id, notice_intent_id, attempt_number, delivery_state, provider_code, started_at, completed_at, next_attempt_at) values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict (delivery_attempt_id) do update set delivery_state=excluded.delivery_state, provider_code=excluded.provider_code, completed_at=excluded.completed_at, next_attempt_at=excluded.next_attempt_at",
        [
          value.id,
          value.noticeIntentId,
          value.attemptNumber,
          value.state,
          value.providerCode ?? null,
          value.startedAt,
          value.completedAt ?? null,
          value.nextAttemptAt ?? null,
        ],
      );
      requireWrite(result, "delivery attempt");
    },
  };
}

function isConcurrencyFailure(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "40001" || error.code === "40P01" || error.code === "23505")
  );
}

function failureCode(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && /^[A-Z0-9_]{1,64}$/u.test(code)
    ? code
    : "OUTBOX_PUBLISH_FAILED";
}

export class PostgresCommunicationsStore implements CommunicationsStore {
  constructor(
    readonly databaseUrl: string,
    private readonly connect: (
      databaseUrl: string,
    ) => Promise<DatabaseSession> = connectDatabaseSession,
  ) {}

  async transaction<T>(
    work: (transaction: CommunicationsTransaction) => T | Promise<T>,
  ): Promise<T> {
    const connection = await this.connect(this.databaseUrl);
    let begun = false;
    try {
      await connection.query("begin isolation level serializable");
      begun = true;
      const result = await work(transactionFor(connection));
      await connection.query("commit");
      begun = false;
      return result;
    } catch (error) {
      if (begun) await connection.query("rollback");
      if (isConcurrencyFailure(error)) {
        throw new CommunicationsError(
          "IDEMPOTENCY_CONFLICT",
          "the communications command conflicted concurrently",
          { cause: error },
        );
      }
      throw error;
    } finally {
      await connection.release();
    }
  }

  async claimOutbox(
    owner: string,
    now: Date,
    leaseMilliseconds = 30_000,
  ): Promise<StoredOutboxMessage | undefined> {
    const connection = await this.connect(this.databaseUrl);
    try {
      await connection.query("begin");
      const row = await one(
        connection,
        "with candidate as (select event_id from communications_module_outbox where event_name='NoticeRequested' and (publish_state='pending' or (publish_state='claimed' and claim_expires_at <= $1)) order by occurred_at, event_id for update skip locked limit 1) update communications_module_outbox o set publish_state='claimed', claim_owner=$2, claim_expires_at=$3, publish_attempts=o.publish_attempts+1 from candidate where o.event_id=candidate.event_id returning o.*",
        [now.toISOString(), owner, new Date(now.getTime() + leaseMilliseconds)],
      );
      await connection.query("commit");
      return row ? outbox(row) : undefined;
    } catch (error) {
      await connection.query("rollback");
      throw error;
    } finally {
      await connection.release();
    }
  }

  async markOutboxPublished(
    eventId: string,
    owner: string,
    now: Date,
  ): Promise<void> {
    const connection = await this.connect(this.databaseUrl);
    try {
      const result = await connection.query(
        "update communications_module_outbox set publish_state='published', claim_owner=null, claim_expires_at=null, published_at=$3, last_failure_code=null where event_id=$1 and publish_state='claimed' and claim_owner=$2",
        [eventId, owner, now.toISOString()],
      );
      requireWrite(result, "outbox message");
    } finally {
      await connection.release();
    }
  }

  async releaseOutboxClaim(
    eventId: string,
    owner: string,
    error: unknown,
  ): Promise<void> {
    const connection = await this.connect(this.databaseUrl);
    try {
      const result = await connection.query(
        "update communications_module_outbox set publish_state='pending', claim_owner=null, claim_expires_at=null, last_failure_code=$3 where event_id=$1 and publish_state='claimed' and claim_owner=$2",
        [eventId, owner, failureCode(error)],
      );
      requireWrite(result, "outbox message");
    } finally {
      await connection.release();
    }
  }

  async deleteExpired(now: string) {
    const connection = await this.connect(this.databaseUrl);
    try {
      await connection.query("begin");
      const counts = await one(
        connection,
        "select count(*)::int as intents, (select count(*)::int from communications_delivery_attempts a join communications_notice_intents i using (notice_intent_id) where i.retained_until <= $1 and not i.legal_hold) as attempts, (select count(*)::int from communications_inbox_items b join communications_notice_intents i using (notice_intent_id) where i.retained_until <= $1 and not i.legal_hold) as inbox_items from communications_notice_intents where retained_until <= $1 and not legal_hold",
        [now],
      );
      await connection.query(
        "delete from communications_notice_intents where retained_until <= $1 and not legal_hold",
        [now],
      );
      await connection.query("commit");
      return {
        intents: Number(counts?.intents ?? 0),
        attempts: Number(counts?.attempts ?? 0),
        inboxItems: Number(counts?.inbox_items ?? 0),
      };
    } catch (error) {
      await connection.query("rollback");
      throw error;
    } finally {
      await connection.release();
    }
  }
}
