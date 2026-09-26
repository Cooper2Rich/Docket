import { connectDatabaseSession, type DatabaseSession } from "@docket/database";
import type { ClerkSessionTermination } from "./identity-service.js";

export type ClerkSessionTerminationDelivery = Readonly<{
  status: "delivered" | "failed" | "idle";
  sessionId?: string;
}>;

export interface ClerkSessionTerminationStore {
  claim(
    now: Date,
    leaseUntil: Date,
  ): Promise<ClerkSessionTermination | undefined>;
  complete(sessionId: string, attemptCount: number, now: Date): Promise<void>;
  retry(
    sessionId: string,
    attemptCount: number,
    availableAt: Date,
    errorCode: "DELIVERY_FAILED",
  ): Promise<void>;
}

export class ClerkSessionTerminationConflictError extends Error {
  readonly code = "CLERK_SESSION_TERMINATION_CONFLICT";

  constructor() {
    super("the Clerk session termination delivery changed concurrently");
    this.name = "ClerkSessionTerminationConflictError";
  }
}

export class ClerkSessionTerminationService {
  constructor(
    private readonly store: ClerkSessionTerminationStore,
    private readonly now: () => Date,
  ) {}

  async deliverNext(
    terminate: (clerkSessionId: string) => Promise<void>,
  ): Promise<ClerkSessionTerminationDelivery> {
    const now = this.now();
    const termination = await this.store.claim(
      now,
      new Date(now.getTime() + 30_000),
    );
    if (!termination) return { status: "idle" };
    try {
      await terminate(termination.clerkSessionId);
      await this.store.complete(
        termination.sessionId,
        termination.attemptCount,
        this.now(),
      );
      return { status: "delivered", sessionId: termination.sessionId };
    } catch {
      await this.store.retry(
        termination.sessionId,
        termination.attemptCount,
        new Date(this.now().getTime() + 60_000),
        "DELIVERY_FAILED",
      );
      return { status: "failed", sessionId: termination.sessionId };
    }
  }
}

type StoredTermination = ClerkSessionTermination & {
  availableAt: Date;
  deliveredAt?: Date;
  lastErrorCode?: "DELIVERY_FAILED";
};

export class InMemoryClerkSessionTerminationStore
  implements ClerkSessionTerminationStore
{
  private readonly terminations = new Map<string, StoredTermination>();

  enqueue(termination: ClerkSessionTermination): void {
    this.terminations.set(termination.sessionId, {
      ...termination,
      availableAt: termination.requestedAt,
    });
  }

  claim(
    now: Date,
    leaseUntil: Date,
  ): Promise<ClerkSessionTermination | undefined> {
    const candidate = [...this.terminations.values()]
      .filter(
        (termination) =>
          !termination.deliveredAt && termination.availableAt <= now,
      )
      .sort(
        (left, right) =>
          left.requestedAt.getTime() - right.requestedAt.getTime() ||
          left.sessionId.localeCompare(right.sessionId),
      )[0];
    if (!candidate) return Promise.resolve(undefined);
    const claimed = {
      ...candidate,
      attemptCount: candidate.attemptCount + 1,
      availableAt: leaseUntil,
    };
    this.terminations.set(candidate.sessionId, claimed);
    return Promise.resolve(claimed);
  }

  complete(sessionId: string, attemptCount: number, now: Date): Promise<void> {
    const termination = this.terminations.get(sessionId);
    if (termination?.attemptCount !== attemptCount || termination.deliveredAt) {
      throw new ClerkSessionTerminationConflictError();
    }
    const completed = { ...termination };
    delete completed.lastErrorCode;
    this.terminations.set(sessionId, { ...completed, deliveredAt: now });
    return Promise.resolve();
  }

  retry(
    sessionId: string,
    attemptCount: number,
    availableAt: Date,
    errorCode: "DELIVERY_FAILED",
  ): Promise<void> {
    const termination = this.terminations.get(sessionId);
    if (termination?.attemptCount !== attemptCount || termination.deliveredAt) {
      throw new ClerkSessionTerminationConflictError();
    }
    this.terminations.set(sessionId, {
      ...termination,
      availableAt,
      lastErrorCode: errorCode,
    });
    return Promise.resolve();
  }

  snapshot(): readonly StoredTermination[] {
    return [...this.terminations.values()];
  }
}

type TerminationRow = Readonly<Record<string, unknown>>;

function rowTermination(row: TerminationRow): ClerkSessionTermination {
  return {
    sessionId: String(row.session_id),
    clerkSessionId: String(row.clerk_session_id),
    requestedAt: new Date(String(row.requested_at)),
    attemptCount: Number(row.attempt_count),
  };
}

export class PostgresClerkSessionTerminationStore
  implements ClerkSessionTerminationStore
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

  async claim(
    now: Date,
    leaseUntil: Date,
  ): Promise<ClerkSessionTermination | undefined> {
    return this.session(async (connection) => {
      const result = await connection.query<TerminationRow>(
        "with candidate as (select session_id from identity_clerk_session_terminations where delivered_at is null and available_at <= $1 order by requested_at, session_id for update skip locked limit 1) update identity_clerk_session_terminations as termination set attempt_count = termination.attempt_count + 1, available_at = $2 from candidate where termination.session_id = candidate.session_id returning termination.*",
        [now, leaseUntil],
      );
      return result.rows[0] ? rowTermination(result.rows[0]) : undefined;
    });
  }

  async complete(
    sessionId: string,
    attemptCount: number,
    now: Date,
  ): Promise<void> {
    await this.session(async (connection) => {
      const result = await connection.query(
        "update identity_clerk_session_terminations set delivered_at = $3, last_error_code = null where session_id = $1 and attempt_count = $2 and delivered_at is null",
        [sessionId, attemptCount, now],
      );
      if (result.rowCount !== 1) {
        throw new ClerkSessionTerminationConflictError();
      }
    });
  }

  async retry(
    sessionId: string,
    attemptCount: number,
    availableAt: Date,
    errorCode: "DELIVERY_FAILED",
  ): Promise<void> {
    await this.session(async (connection) => {
      const result = await connection.query(
        "update identity_clerk_session_terminations set available_at = $3, last_error_code = $4 where session_id = $1 and attempt_count = $2 and delivered_at is null",
        [sessionId, attemptCount, availableAt, errorCode],
      );
      if (result.rowCount !== 1) {
        throw new ClerkSessionTerminationConflictError();
      }
    });
  }
}
