import { connectDatabaseSession, type DatabaseSession } from "@docket/database";
import type { PrivilegedContextRestoredAlert } from "./role-context.js";

export type PrivilegedContextAlertDelivery = Readonly<{
  status: "delivered" | "failed" | "idle";
  alertId?: string;
}>;

export interface PrivilegedContextAlertStore {
  claim(
    now: Date,
    leaseUntil: Date,
  ): Promise<PrivilegedContextRestoredAlert | undefined>;
  complete(alertId: string, attemptCount: number, now: Date): Promise<void>;
  retry(
    alertId: string,
    attemptCount: number,
    availableAt: Date,
    errorCode: "DELIVERY_FAILED",
  ): Promise<void>;
}

export class PrivilegedContextAlertConflictError extends Error {
  readonly code = "PRIVILEGED_CONTEXT_ALERT_CONFLICT";

  constructor() {
    super("the privileged-context alert delivery changed concurrently");
    this.name = "PrivilegedContextAlertConflictError";
  }
}

export class PrivilegedContextAlertService {
  constructor(
    private readonly store: PrivilegedContextAlertStore,
    private readonly now: () => Date,
  ) {}

  async deliverNext(
    publish: (alert: PrivilegedContextRestoredAlert) => Promise<void>,
  ): Promise<PrivilegedContextAlertDelivery> {
    const now = this.now();
    const alert = await this.store.claim(now, new Date(now.getTime() + 30_000));
    if (!alert) return { status: "idle" };
    try {
      await publish(alert);
      await this.store.complete(alert.id, alert.attemptCount, this.now());
      return { status: "delivered", alertId: alert.id };
    } catch {
      await this.store.retry(
        alert.id,
        alert.attemptCount,
        new Date(this.now().getTime() + 60_000),
        "DELIVERY_FAILED",
      );
      return { status: "failed", alertId: alert.id };
    }
  }
}

type StoredAlert = PrivilegedContextRestoredAlert & {
  availableAt: Date;
  deliveredAt?: Date;
  lastErrorCode?: "DELIVERY_FAILED";
};

export class InMemoryPrivilegedContextAlertStore
  implements PrivilegedContextAlertStore
{
  private readonly alerts = new Map<string, StoredAlert>();

  enqueue(alert: PrivilegedContextRestoredAlert): void {
    this.alerts.set(alert.id, { ...alert, availableAt: alert.restoredAt });
  }

  claim(
    now: Date,
    leaseUntil: Date,
  ): Promise<PrivilegedContextRestoredAlert | undefined> {
    const candidate = [...this.alerts.values()]
      .filter((alert) => !alert.deliveredAt && alert.availableAt <= now)
      .sort(
        (left, right) =>
          left.restoredAt.getTime() - right.restoredAt.getTime() ||
          left.id.localeCompare(right.id),
      )[0];
    if (!candidate) return Promise.resolve(undefined);
    const claimed = {
      ...candidate,
      attemptCount: candidate.attemptCount + 1,
      availableAt: leaseUntil,
    };
    this.alerts.set(candidate.id, claimed);
    return Promise.resolve(claimed);
  }

  complete(alertId: string, attemptCount: number, now: Date): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert?.attemptCount !== attemptCount || alert.deliveredAt) {
      throw new PrivilegedContextAlertConflictError();
    }
    const completed = { ...alert };
    delete completed.lastErrorCode;
    this.alerts.set(alertId, { ...completed, deliveredAt: now });
    return Promise.resolve();
  }

  retry(
    alertId: string,
    attemptCount: number,
    availableAt: Date,
    errorCode: "DELIVERY_FAILED",
  ): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert?.attemptCount !== attemptCount || alert.deliveredAt) {
      throw new PrivilegedContextAlertConflictError();
    }
    this.alerts.set(alertId, {
      ...alert,
      availableAt,
      lastErrorCode: errorCode,
    });
    return Promise.resolve();
  }

  snapshot(): readonly StoredAlert[] {
    return [...this.alerts.values()];
  }
}

type AlertRow = Readonly<Record<string, unknown>>;

function date(value: unknown): Date {
  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new TypeError("PRIVILEGED_CONTEXT_ALERT_PERSISTENCE_INVALID");
  }
  return parsed;
}

function rowAlert(row: AlertRow): PrivilegedContextRestoredAlert {
  const contextKind = row.context_kind;
  if (
    contextKind !== "platform_administrator" &&
    contextKind !== "legal_and_privacy_operations"
  ) {
    throw new TypeError("PRIVILEGED_CONTEXT_ALERT_PERSISTENCE_INVALID");
  }
  if (row.termination_path !== "/account/sessions") {
    throw new TypeError("PRIVILEGED_CONTEXT_ALERT_PERSISTENCE_INVALID");
  }
  return {
    id: String(row.alert_id),
    accountId: String(row.account_id),
    docketSessionId: String(row.session_id),
    contextId: String(row.role_context_id),
    contextKind,
    scopeLabel: String(row.scope_label),
    device: String(row.device),
    approximateLocation: String(row.approximate_location),
    restoredAt: date(row.restored_at),
    terminationPath: "/account/sessions",
    attemptCount: Number(row.attempt_count),
  };
}

abstract class PostgresAlertAdapter {
  constructor(
    protected readonly databaseUrl: string,
    private readonly connect: (
      databaseUrl: string,
    ) => Promise<DatabaseSession> = connectDatabaseSession,
  ) {}

  protected async session<T>(
    work: (connection: DatabaseSession) => Promise<T>,
  ): Promise<T> {
    const connection = await this.connect(this.databaseUrl);
    try {
      return await work(connection);
    } finally {
      await connection.release();
    }
  }
}

export class PostgresPrivilegedContextAlertStore
  extends PostgresAlertAdapter
  implements PrivilegedContextAlertStore
{
  async claim(
    now: Date,
    leaseUntil: Date,
  ): Promise<PrivilegedContextRestoredAlert | undefined> {
    return this.session(async (connection) => {
      const result = await connection.query<AlertRow>(
        "with candidate as (select alert_id from identity_privileged_context_alert_outbox where delivered_at is null and available_at <= $1 order by restored_at, alert_id for update skip locked limit 1) update identity_privileged_context_alert_outbox as alert set attempt_count = alert.attempt_count + 1, available_at = $2 from candidate where alert.alert_id = candidate.alert_id returning alert.*",
        [now, leaseUntil],
      );
      return result.rows[0] ? rowAlert(result.rows[0]) : undefined;
    });
  }

  async complete(
    alertId: string,
    attemptCount: number,
    now: Date,
  ): Promise<void> {
    await this.session(async (connection) => {
      const result = await connection.query(
        "update identity_privileged_context_alert_outbox set delivered_at = $3, last_error_code = null where alert_id = $1 and attempt_count = $2 and delivered_at is null",
        [alertId, attemptCount, now],
      );
      if (result.rowCount !== 1) {
        throw new PrivilegedContextAlertConflictError();
      }
    });
  }

  async retry(
    alertId: string,
    attemptCount: number,
    availableAt: Date,
    errorCode: "DELIVERY_FAILED",
  ): Promise<void> {
    await this.session(async (connection) => {
      const result = await connection.query(
        "update identity_privileged_context_alert_outbox set available_at = $3, last_error_code = $4 where alert_id = $1 and attempt_count = $2 and delivered_at is null",
        [alertId, attemptCount, availableAt, errorCode],
      );
      if (result.rowCount !== 1) {
        throw new PrivilegedContextAlertConflictError();
      }
    });
  }
}

export class PostgresAccountSecurityAlertPublisher extends PostgresAlertAdapter {
  constructor(
    databaseUrl: string,
    private readonly now: () => Date,
    connect?: (databaseUrl: string) => Promise<DatabaseSession>,
  ) {
    super(databaseUrl, connect);
  }

  async publish(alert: PrivilegedContextRestoredAlert): Promise<void> {
    await this.session(async (connection) => {
      await connection.query(
        "insert into identity_account_security_alerts (alert_id, account_id, session_id, role_context_id, context_kind, scope_label, device, approximate_location, occurred_at, termination_path, published_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) on conflict (alert_id) do nothing",
        [
          alert.id,
          alert.accountId,
          alert.docketSessionId,
          alert.contextId,
          alert.contextKind,
          alert.scopeLabel,
          alert.device,
          alert.approximateLocation,
          alert.restoredAt,
          alert.terminationPath,
          this.now(),
        ],
      );
    });
  }
}
