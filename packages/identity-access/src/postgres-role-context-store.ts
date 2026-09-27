import { connectDatabaseSession, type DatabaseSession } from "@docket/database";
import {
  RoleContextError,
  type ActiveRoleContext,
  type AuthorityGrant,
  type EnterRoleContextResult,
  type PrivilegedContextRestoredAlert,
  type ReauthenticationEvent,
  type RoleContextEvent,
  type RoleContextStore,
  type RoleContextTransaction,
} from "./role-context.js";

type Row = Record<string, unknown>;

function date(value: unknown, field: string): Date {
  const result = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(result.getTime())) {
    throw new TypeError(`ROLE_CONTEXT_PERSISTENCE_INVALID: ${field}`);
  }
  return result;
}

function grant(row: Row): AuthorityGrant {
  const contextKind = row.context_kind as AuthorityGrant["contextKind"];
  const status = row.status as AuthorityGrant["status"];
  const permissions = row.permissions;
  if (
    !Array.isArray(permissions) ||
    !permissions.every((item) => typeof item === "string")
  ) {
    throw new TypeError(
      "ROLE_CONTEXT_PERSISTENCE_INVALID: identity_authority_grants.permissions",
    );
  }
  return {
    id: String(row.grant_id),
    accountId: String(row.account_id),
    contextKind,
    scopeId: String(row.scope_id),
    scopeLabel: String(row.scope_label),
    permissions,
    privileged: row.privileged === true,
    status,
    version: Number(row.record_version),
    createdAt: date(row.created_at, "identity_authority_grants.created_at"),
    updatedAt: date(row.updated_at, "identity_authority_grants.updated_at"),
  };
}

function context(row: Row): ActiveRoleContext {
  const exitedAt = row.exited_at;
  return {
    id: String(row.role_context_id),
    accountId: String(row.account_id),
    docketSessionId: String(row.session_id),
    tabId: String(row.tab_id),
    grantId: String(row.grant_id),
    authorityVersion: Number(row.authority_version),
    status: row.status === "exited" ? "exited" : "active",
    version: Number(row.record_version),
    enteredAt: date(row.entered_at, "identity_role_contexts.entered_at"),
    ...(exitedAt === null || exitedAt === undefined
      ? {}
      : { exitedAt: date(exitedAt, "identity_role_contexts.exited_at") }),
  };
}

function reauthentication(row: Row): ReauthenticationEvent {
  return {
    id: String(row.reauthentication_event_id),
    accountId: String(row.account_id),
    docketSessionId: String(row.session_id),
    clerkSessionId: String(row.clerk_session_id),
    verificationId: String(row.verification_id),
    commandId: String(row.command_id),
    occurredAt: date(
      row.occurred_at,
      "identity_reauthentication_events.occurred_at",
    ),
    retainedUntil: date(
      row.retained_until,
      "identity_reauthentication_events.retained_until",
    ),
  };
}

function receiptResult(value: unknown): EnterRoleContextResult {
  const result = value as EnterRoleContextResult;
  return {
    ...result,
    events: result.events.map((event) => ({
      ...event,
      occurredAt: date(
        event.occurredAt,
        "identity_role_context_events.occurred_at",
      ),
    })),
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
    throw new RoleContextError(
      "CONTEXT_STALE",
      `${subject} changed concurrently`,
    );
  }
}

function transactionFor(connection: DatabaseSession): RoleContextTransaction {
  return {
    getGrant: async (grantId) => {
      const row = await one(
        connection,
        "select * from identity_authority_grants where grant_id = $1",
        [grantId],
      );
      return row ? grant(row) : undefined;
    },
    listGrants: async (accountId) =>
      (
        await connection.query<Row>(
          "select * from identity_authority_grants where account_id = $1 order by context_kind, scope_label, grant_id",
          [accountId],
        )
      ).rows.map(grant),
    getActiveContext: async (accountId, docketSessionId, tabId) => {
      const row = await one(
        connection,
        "select * from identity_role_contexts where account_id = $1 and session_id = $2 and tab_id = $3 and status = 'active' for update",
        [accountId, docketSessionId, tabId],
      );
      return row ? context(row) : undefined;
    },
    getContext: async (contextId) => {
      const row = await one(
        connection,
        "select * from identity_role_contexts where role_context_id = $1",
        [contextId],
      );
      return row ? context(row) : undefined;
    },
    saveContext: async (value) => {
      const existing = await one(
        connection,
        "select record_version from identity_role_contexts where role_context_id = $1",
        [value.id],
      );
      if (!existing) {
        const result = await connection.query(
          "insert into identity_role_contexts (role_context_id, account_id, session_id, tab_id, grant_id, authority_version, status, record_version, entered_at, exited_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [
            value.id,
            value.accountId,
            value.docketSessionId,
            value.tabId,
            value.grantId,
            value.authorityVersion,
            value.status,
            value.version,
            value.enteredAt,
            value.exitedAt ?? null,
          ],
        );
        requireWrite(result, "Active Role Context");
        return;
      }
      const result = await connection.query(
        "update identity_role_contexts set status = $2, record_version = $3, exited_at = $4 where role_context_id = $1 and record_version = $5",
        [
          value.id,
          value.status,
          value.version,
          value.exitedAt ?? null,
          value.version - 1,
        ],
      );
      requireWrite(result, "Active Role Context");
    },
    getRememberedGrant: async (accountId) => {
      const row = await one(
        connection,
        "select remembered_role_context_grant_id from identity_accounts where account_id = $1",
        [accountId],
      );
      const value = row?.remembered_role_context_grant_id;
      if (value === null || value === undefined) return undefined;
      if (typeof value !== "string") {
        throw new TypeError(
          "ROLE_CONTEXT_PERSISTENCE_INVALID: identity_accounts.remembered_role_context_grant_id",
        );
      }
      return value;
    },
    saveRememberedGrant: async (accountId, grantId) => {
      const result = await connection.query(
        "update identity_accounts set remembered_role_context_grant_id = $2 where account_id = $1",
        [accountId, grantId ?? null],
      );
      requireWrite(result, "remembered role context");
    },
    getReauthenticationEvent: async (verificationId) => {
      const row = await one(
        connection,
        "select * from identity_reauthentication_events where verification_id = $1",
        [verificationId],
      );
      return row ? reauthentication(row) : undefined;
    },
    saveReauthenticationEvent: async (value) => {
      await connection.query(
        "insert into identity_reauthentication_events (reauthentication_event_id, account_id, session_id, clerk_session_id, verification_id, command_id, occurred_at, retained_until) values ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          value.id,
          value.accountId,
          value.docketSessionId,
          value.clerkSessionId,
          value.verificationId,
          value.commandId,
          value.occurredAt,
          value.retainedUntil,
        ],
      );
    },
    getEnterReceipt: async (key) => {
      const row = await one(
        connection,
        "select input_digest, result_json from identity_role_context_receipts where idempotency_key = $1",
        [key],
      );
      return row
        ? {
            digest: String(row.input_digest),
            result: receiptResult(row.result_json),
          }
        : undefined;
    },
    saveEnterReceipt: async (key, receipt) => {
      await connection.query(
        "insert into identity_role_context_receipts (idempotency_key, input_digest, result_json) values ($1, $2, $3)",
        [key, receipt.digest, JSON.stringify(receipt.result)],
      );
    },
    appendEvent: async (value: RoleContextEvent) => {
      await connection.query(
        "insert into identity_role_context_events (event_id, event_name, account_id, role_context_id, grant_id, occurred_at, retention_class) values ($1, $2, $3, $4, $5, $6, $7)",
        [
          value.id,
          value.name,
          value.accountId,
          value.contextId,
          value.grantId,
          value.occurredAt,
          value.retentionClass,
        ],
      );
    },
    enqueuePrivilegedContextRestoredAlert: async (
      value: PrivilegedContextRestoredAlert,
    ) => {
      await connection.query(
        "insert into identity_privileged_context_alert_outbox (alert_id, account_id, session_id, role_context_id, context_kind, scope_label, device, approximate_location, restored_at, termination_path, attempt_count, available_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $9)",
        [
          value.id,
          value.accountId,
          value.docketSessionId,
          value.contextId,
          value.contextKind,
          value.scopeLabel,
          value.device,
          value.approximateLocation,
          value.restoredAt,
          value.terminationPath,
          value.attemptCount,
        ],
      );
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

export class PostgresRoleContextStore implements RoleContextStore {
  constructor(
    private readonly databaseUrl: string,
    private readonly connect: (
      databaseUrl: string,
    ) => Promise<DatabaseSession> = connectDatabaseSession,
  ) {}

  async transaction<T>(
    work: (transaction: RoleContextTransaction) => T | Promise<T>,
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
        throw new RoleContextError(
          "CONTEXT_STALE",
          "the role context changed concurrently",
        );
      }
      throw error;
    } finally {
      await connection.release();
    }
  }
}
