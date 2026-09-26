import { connectDatabaseSession, type DatabaseSession } from "@docket/database";
import {
  IdentityError,
  type Account,
  type AccountSecurityHistory,
  type ClerkIdentityLink,
  type CommandReceipt,
  type DocketSession,
  type DisplayNameHistory,
  type IdentityEvent,
  type IdentityStore,
  type IdentityTransaction,
  type SessionResult,
} from "./identity-service.js";

type Row = Record<string, unknown>;

function date(value: unknown, field: string): Date {
  const result = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(result.getTime())) {
    throw new TypeError(`IDENTITY_PERSISTENCE_INVALID: ${field}`);
  }
  return result;
}

function string(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`IDENTITY_PERSISTENCE_INVALID: ${field}`);
  }
  return value;
}

function account(row: Row): Account {
  const displayNameChangedAt = row.display_name_changed_at;
  return {
    id: String(row.account_id),
    displayName: String(row.display_name),
    verifiedEmail: String(row.verified_email),
    version: Number(row.record_version),
    createdAt: date(row.created_at, "identity_accounts.created_at"),
    updatedAt: date(row.updated_at, "identity_accounts.updated_at"),
    ...(displayNameChangedAt === null || displayNameChangedAt === undefined
      ? {}
      : {
          displayNameChangedAt: date(
            displayNameChangedAt,
            "identity_accounts.display_name_changed_at",
          ),
        }),
  };
}

function securityHistory(row: Row): AccountSecurityHistory {
  const device = row.device;
  const approximateLocation = row.approximate_location;
  const suspensionStatus = row.suspension_status;
  const kind = row.history_kind;
  if (
    kind !== "accepted_sign_in" &&
    kind !== "clerk_reverification" &&
    kind !== "account_suspension"
  ) {
    throw new TypeError(
      "IDENTITY_PERSISTENCE_INVALID: identity_account_security_history.history_kind",
    );
  }
  return {
    id: String(row.history_id),
    accountId: String(row.account_id),
    kind,
    occurredAt: date(
      row.occurred_at,
      "identity_account_security_history.occurred_at",
    ),
    retainedUntil: date(
      row.retained_until,
      "identity_account_security_history.retained_until",
    ),
    legalHold: row.legal_hold === true,
    ...(device === null || device === undefined
      ? {}
      : {
          device: string(device, "identity_account_security_history.device"),
        }),
    ...(approximateLocation === null || approximateLocation === undefined
      ? {}
      : {
          approximateLocation: string(
            approximateLocation,
            "identity_account_security_history.approximate_location",
          ),
        }),
    ...(suspensionStatus === null || suspensionStatus === undefined
      ? {}
      : {
          suspensionStatus: suspensionStatus as
            | "imposed"
            | "reinstated"
            | "expired",
        }),
  };
}

function displayNameHistory(row: Row): DisplayNameHistory {
  const reviewId = row.review_id;
  const approvedByAccountId = row.approved_by_account_id;
  const changeKind = row.change_kind;
  if (
    changeKind !== "initial" &&
    changeKind !== "self_service" &&
    changeKind !== "reviewed_correction"
  ) {
    throw new TypeError(
      "IDENTITY_PERSISTENCE_INVALID: identity_display_name_history.change_kind",
    );
  }
  return {
    id: String(row.history_id),
    accountId: String(row.account_id),
    displayName: String(row.display_name),
    effectiveAt: date(
      row.effective_at,
      "identity_display_name_history.effective_at",
    ),
    changeKind,
    ...(reviewId === null || reviewId === undefined
      ? {}
      : {
          reviewId: string(reviewId, "identity_display_name_history.review_id"),
        }),
    ...(approvedByAccountId === null || approvedByAccountId === undefined
      ? {}
      : {
          approvedByAccountId: string(
            approvedByAccountId,
            "identity_display_name_history.approved_by_account_id",
          ),
        }),
  };
}

function link(row: Row): ClerkIdentityLink {
  return {
    clerkUserId: String(row.clerk_user_id),
    accountId: String(row.account_id),
    verifiedEmail: String(row.verified_email),
    profileName: String(row.profile_name),
    version: Number(row.record_version),
    createdAt: date(row.created_at, "identity_clerk_links.created_at"),
    updatedAt: date(row.updated_at, "identity_clerk_links.updated_at"),
  };
}

function session(row: Row): DocketSession {
  const revokedAt = row.revoked_at;
  const privilegedActivatedAt = row.privileged_activated_at;
  return {
    id: String(row.session_id),
    accountId: String(row.account_id),
    clerkUserId: String(row.clerk_user_id),
    clerkSessionId: String(row.clerk_session_id),
    sessionClass:
      row.session_class === "privileged" ? "privileged" : "ordinary",
    device: String(row.device),
    approximateLocation: String(row.approximate_location),
    status: row.status === "revoked" ? "revoked" : "active",
    version: Number(row.record_version),
    createdAt: date(row.created_at, "identity_sessions.created_at"),
    lastActivityAt: date(
      row.last_activity_at,
      "identity_sessions.last_activity_at",
    ),
    ...(privilegedActivatedAt === null || privilegedActivatedAt === undefined
      ? {}
      : {
          privilegedActivatedAt: date(
            privilegedActivatedAt,
            "identity_sessions.privileged_activated_at",
          ),
        }),
    expiresAt: date(row.expires_at, "identity_sessions.expires_at"),
    ...(revokedAt === null || revokedAt === undefined
      ? {}
      : { revokedAt: date(revokedAt, "identity_sessions.revoked_at") }),
  };
}

function receipt(value: unknown, digest: string): CommandReceipt {
  const result = value as SessionResult;
  return {
    digest,
    result: {
      ...result,
      events: result.events.map((event) => ({
        ...event,
        occurredAt: date(event.occurredAt, "identity_events.occurred_at"),
      })),
    },
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
    throw new IdentityError(
      "AUTHORITY_STALE",
      `${subject} changed concurrently`,
    );
  }
}

function isPostgresConcurrencyFailure(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "40001" || error.code === "40P01")
  );
}

function transactionFor(connection: DatabaseSession): IdentityTransaction {
  return {
    getLink: async (clerkUserId) => {
      const row = await one(
        connection,
        "select * from identity_clerk_links where clerk_user_id = $1",
        [clerkUserId],
      );
      return row ? link(row) : undefined;
    },
    getAccount: async (accountId) => {
      const row = await one(
        connection,
        "select * from identity_accounts where account_id = $1",
        [accountId],
      );
      return row ? account(row) : undefined;
    },
    getSession: async (sessionId) => {
      const row = await one(
        connection,
        "select * from identity_sessions where session_id = $1",
        [sessionId],
      );
      return row ? session(row) : undefined;
    },
    findSessionByClerkSessionId: async (clerkSessionId) => {
      const row = await one(
        connection,
        "select * from identity_sessions where clerk_session_id = $1",
        [clerkSessionId],
      );
      return row ? session(row) : undefined;
    },
    listSessions: async (accountId) =>
      (
        await connection.query<Row>(
          "select * from identity_sessions where account_id = $1 order by created_at desc, session_id",
          [accountId],
        )
      ).rows.map(session),
    listSecurityHistory: async (accountId, retainedAfter) =>
      (
        await connection.query<Row>(
          "select * from identity_account_security_history where account_id = $1 and retained_until > $2 order by occurred_at desc, history_id",
          [accountId, retainedAfter],
        )
      ).rows.map(securityHistory),
    getSecurityHistory: async (historyId) => {
      const row = await one(
        connection,
        "select * from identity_account_security_history where history_id = $1",
        [historyId],
      );
      return row ? securityHistory(row) : undefined;
    },
    getDisplayNameHistory: async (historyId) => {
      const row = await one(
        connection,
        "select * from identity_display_name_history where history_id = $1",
        [historyId],
      );
      return row ? displayNameHistory(row) : undefined;
    },
    getReceipt: async (key) => {
      const row = await one(
        connection,
        "select input_digest, result_json from identity_command_receipts where idempotency_key = $1",
        [key],
      );
      return row
        ? receipt(row.result_json, String(row.input_digest))
        : undefined;
    },
    saveAccount: async (value) => {
      const result = await connection.query(
        "insert into identity_accounts (account_id, display_name, verified_email, record_version, created_at, updated_at, display_name_changed_at) values ($1, $2, $3, $4, $5, $6, $7) on conflict (account_id) do update set display_name = excluded.display_name, verified_email = excluded.verified_email, record_version = excluded.record_version, updated_at = excluded.updated_at, display_name_changed_at = excluded.display_name_changed_at where identity_accounts.record_version = excluded.record_version - 1",
        [
          value.id,
          value.displayName,
          value.verifiedEmail,
          value.version,
          value.createdAt,
          value.updatedAt,
          value.displayNameChangedAt ?? null,
        ],
      );
      requireWrite(result, "Account");
    },
    saveLink: async (value) => {
      const result = await connection.query(
        "insert into identity_clerk_links (clerk_user_id, account_id, verified_email, profile_name, record_version, created_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7) on conflict (clerk_user_id) do update set verified_email = excluded.verified_email, profile_name = excluded.profile_name, record_version = excluded.record_version, updated_at = excluded.updated_at where identity_clerk_links.account_id = excluded.account_id and identity_clerk_links.record_version = excluded.record_version - 1",
        [
          value.clerkUserId,
          value.accountId,
          value.verifiedEmail,
          value.profileName,
          value.version,
          value.createdAt,
          value.updatedAt,
        ],
      );
      requireWrite(result, "Clerk identity link");
    },
    saveSession: async (value) => {
      const result = await connection.query(
        "insert into identity_sessions (session_id, account_id, clerk_user_id, clerk_session_id, session_class, device, approximate_location, status, record_version, created_at, last_activity_at, privileged_activated_at, expires_at, revoked_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) on conflict (session_id) do update set session_class = excluded.session_class, device = excluded.device, approximate_location = excluded.approximate_location, status = excluded.status, record_version = excluded.record_version, last_activity_at = excluded.last_activity_at, privileged_activated_at = excluded.privileged_activated_at, expires_at = excluded.expires_at, revoked_at = excluded.revoked_at where identity_sessions.account_id = excluded.account_id and identity_sessions.clerk_user_id = excluded.clerk_user_id and identity_sessions.clerk_session_id = excluded.clerk_session_id and identity_sessions.record_version = excluded.record_version - 1",
        [
          value.id,
          value.accountId,
          value.clerkUserId,
          value.clerkSessionId,
          value.sessionClass,
          value.device,
          value.approximateLocation,
          value.status,
          value.version,
          value.createdAt,
          value.lastActivityAt,
          value.privilegedActivatedAt ?? null,
          value.expiresAt,
          value.revokedAt ?? null,
        ],
      );
      requireWrite(result, "Docket Session");
    },
    saveSessionActivity: async (value) => {
      const result = await connection.query(
        "update identity_sessions set last_activity_at = greatest(last_activity_at, $1) where session_id = $2 and account_id = $3 and clerk_user_id = $4 and clerk_session_id = $5 and status = 'active' and record_version = $6",
        [
          value.lastActivityAt,
          value.id,
          value.accountId,
          value.clerkUserId,
          value.clerkSessionId,
          value.version,
        ],
      );
      requireWrite(result, "Docket Session activity");
    },
    appendDisplayNameHistory: async (value) => {
      await connection.query(
        "insert into identity_display_name_history (history_id, account_id, display_name, effective_at, change_kind, review_id, approved_by_account_id) values ($1, $2, $3, $4, $5, $6, $7)",
        [
          value.id,
          value.accountId,
          value.displayName,
          value.effectiveAt,
          value.changeKind,
          value.reviewId ?? null,
          value.approvedByAccountId ?? null,
        ],
      );
    },
    appendSecurityHistory: async (value) => {
      await connection.query(
        "insert into identity_account_security_history (history_id, account_id, history_kind, occurred_at, retained_until, legal_hold, device, approximate_location, suspension_status) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          value.id,
          value.accountId,
          value.kind,
          value.occurredAt,
          value.retainedUntil,
          value.legalHold,
          value.device ?? null,
          value.approximateLocation ?? null,
          value.suspensionStatus ?? null,
        ],
      );
    },
    deleteExpiredSecurityHistory: async (now) => {
      const result = await connection.query(
        "delete from identity_account_security_history where retained_until <= $1 and legal_hold = false",
        [now],
      );
      return result.rowCount ?? 0;
    },
    saveReceipt: async (key, value) => {
      const occurredAt =
        value.result.events.at(-1)?.occurredAt ??
        new Date(value.result.session.createdAt);
      await connection.query(
        "insert into identity_command_receipts (idempotency_key, input_digest, session_id, result_json, created_at) values ($1, $2, $3, $4::jsonb, $5)",
        [
          key,
          value.digest,
          value.result.session.id,
          JSON.stringify(value.result),
          occurredAt,
        ],
      );
    },
    appendEvent: async (value: IdentityEvent) => {
      await connection.query(
        "insert into identity_events (event_id, event_name, aggregate_id, occurred_at, actor_account_id, event_version) values ($1, $2, $3, $4, $5, $6)",
        [
          value.id,
          value.name,
          value.aggregateId,
          value.occurredAt,
          value.actorAccountId,
          value.version,
        ],
      );
    },
    enqueueClerkSessionTermination: async (value) => {
      await connection.query(
        "insert into identity_clerk_session_terminations (session_id, clerk_session_id, requested_at, attempt_count, available_at) values ($1, $2, $3, $4, $3) on conflict (session_id) do nothing",
        [
          value.sessionId,
          value.clerkSessionId,
          value.requestedAt,
          value.attemptCount,
        ],
      );
    },
  };
}

export class PostgresIdentityStore implements IdentityStore {
  constructor(
    private readonly databaseUrl: string,
    private readonly connect: (
      databaseUrl: string,
    ) => Promise<DatabaseSession> = connectDatabaseSession,
  ) {}

  async transaction<T>(
    work: (transaction: IdentityTransaction) => T | Promise<T>,
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
      if (isPostgresConcurrencyFailure(error)) {
        throw new IdentityError(
          "AUTHORITY_STALE",
          "the identity record changed concurrently",
        );
      }
      throw error;
    } finally {
      await connection.release();
    }
  }
}
