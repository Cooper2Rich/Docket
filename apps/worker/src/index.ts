import { createClerkClient, type ClerkClient } from "@clerk/backend";
import {
  CommunicationsService,
  PostgresCommunicationsStore,
  type DeliveryProvider,
  type OutboxEnvelope,
} from "@docket/communications";
import {
  ClerkSessionTerminationService,
  IdentityService,
  IdentityWebhookHintService,
  PostgresClerkSessionTerminationStore,
  PostgresAccountSecurityAlertPublisher,
  PostgresIdentityStore,
  PostgresIdentityWebhookHintStore,
  PostgresPrivilegedContextAlertStore,
  PrivilegedContextAlertService,
  type ClerkWebhookHint,
  type WebhookHintDelivery,
  type PrivilegedContextRestoredAlert,
} from "@docket/identity-access";
import { parseRuntimeConfig } from "@docket/runtime";
import { PgBoss } from "pg-boss";

export const communicationsNoticeQueue = "communications-notice-v1";

export interface CommunicationsBoss {
  createQueue(
    name: string,
    options?: Readonly<Record<string, unknown>>,
  ): Promise<void>;
  send(
    name: string,
    data: object,
    options?: Readonly<Record<string, unknown>>,
  ): Promise<string | null>;
  work(
    name: string,
    options: Readonly<Record<string, unknown>>,
    handler: (
      jobs: readonly Readonly<{ data: OutboxEnvelope }>[],
    ) => Promise<void>,
  ): Promise<string>;
}

export function createCommunicationsQueueWorker(
  boss: CommunicationsBoss,
  store: Pick<
    PostgresCommunicationsStore,
    "claimOutbox" | "markOutboxPublished" | "releaseOutboxClaim"
  >,
  service: Pick<CommunicationsService, "deliverNotice">,
  options: Readonly<{
    owner: string;
    now?: () => Date;
    leaseMilliseconds?: number;
  }>,
) {
  const now = options.now ?? (() => new Date());
  return {
    start: async () => {
      await boss.createQueue(communicationsNoticeQueue, {
        retryLimit: 4,
        retryDelay: 1,
        retryBackoff: true,
        expireInSeconds: 30,
        retentionSeconds: 14 * 24 * 60 * 60,
        deleteAfterSeconds: 7 * 24 * 60 * 60,
      });
      return boss.work(
        communicationsNoticeQueue,
        { localConcurrency: 2, pollingIntervalSeconds: 1 },
        async (jobs) => {
          for (const job of jobs) await service.deliverNotice(job.data);
        },
      );
    },
    dispatchOnce: async () => {
      const message = await store.claimOutbox(
        options.owner,
        now(),
        options.leaseMilliseconds,
      );
      if (!message) return { status: "idle" } as const;
      try {
        const jobId = await boss.send(
          communicationsNoticeQueue,
          message.envelope,
          {
            retryLimit: 4,
            retryDelay: 1,
            retryBackoff: true,
            expireInSeconds: 30,
          },
        );
        if (!jobId) throw new Error("PG_BOSS_SEND_REJECTED");
        await store.markOutboxPublished(
          message.envelope.id,
          options.owner,
          now(),
        );
        return {
          status: "published",
          eventId: message.envelope.id,
          jobId,
        } as const;
      } catch (error) {
        await store.releaseOutboxClaim(
          message.envelope.id,
          options.owner,
          error,
        );
        throw error;
      }
    },
  };
}

export function createInAppDeliveryProvider(): DeliveryProvider {
  const delivered = new Map<string, string>();
  return {
    deliver: (input) => {
      const providerMessageId =
        delivered.get(input.idempotencyKey) ??
        `inbox-delivery:${input.idempotencyKey}`;
      delivered.set(input.idempotencyKey, providerMessageId);
      return Promise.resolve({ providerMessageId });
    },
  };
}

export async function createConfiguredCommunicationsWorker(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  const config = validateWorkerRuntime(environment);
  const databaseUrl = config.databaseUrl ?? "";
  const boss = await new PgBoss({ connectionString: databaseUrl }).start();
  const store = new PostgresCommunicationsStore(databaseUrl);
  const service = new CommunicationsService({
    store,
    authority: {
      resolve: () => Promise.resolve({ allowed: false, authorityVersion: 0 }),
    },
    provider: createInAppDeliveryProvider(),
  });
  const worker = createCommunicationsQueueWorker(boss, store, service, {
    owner: `worker-${String(process.pid)}`,
  });
  await worker.start();
  return { boss, worker };
}

export async function runCommunicationsOutboxDispatcher(
  worker: Readonly<{ dispatchOnce(): Promise<unknown> }>,
  options: Readonly<{
    signal: AbortSignal;
    pollIntervalMilliseconds?: number;
    wait?: ConsumerWait;
    onError?: (error: unknown) => void;
  }>,
): Promise<void> {
  const wait = options.wait ?? waitForPoll;
  while (!options.signal.aborted) {
    try {
      await worker.dispatchOnce();
    } catch (error) {
      options.onError?.(error);
    }
    await wait(options.pollIntervalMilliseconds ?? 1_000, options.signal);
  }
}

export function validateWorkerRuntime(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  return parseRuntimeConfig("worker", environment);
}

export const workerRuntimeConfig = validateWorkerRuntime();

export const workerAdapterStatus = {
  available: true,
  owningWorkItem: "R1-IDA-001-A",
} as const;

export type IdentityHintObserver = (hint: ClerkWebhookHint) => Promise<void>;
export type ClerkSessionTerminator = (clerkSessionId: string) => Promise<void>;
export type PrivilegedContextAlertPublisher = (
  alert: PrivilegedContextRestoredAlert,
) => Promise<void>;

export function createIdentityHintWorker(
  service: Pick<IdentityWebhookHintService, "deliverNext">,
  observe: IdentityHintObserver,
): Readonly<{ runOnce(): Promise<WebhookHintDelivery> }> {
  return { runOnce: () => service.deliverNext(observe) };
}

export type IdentityHintWorker = ReturnType<typeof createIdentityHintWorker>;

export function createClerkSessionTerminationWorker(
  service: Pick<ClerkSessionTerminationService, "deliverNext">,
  terminate: ClerkSessionTerminator,
) {
  return { runOnce: () => service.deliverNext(terminate) };
}

export function createPrivilegedContextAlertWorker(
  service: Pick<PrivilegedContextAlertService, "deliverNext">,
  publish: PrivilegedContextAlertPublisher,
) {
  return { runOnce: () => service.deliverNext(publish) };
}

export function createAccountSecurityHistoryRetentionWorker(
  service: Pick<IdentityService, "deleteExpiredAccountSecurityHistory">,
  options: Readonly<{
    now?: () => Date;
    intervalMilliseconds?: number;
  }> = {},
) {
  const now = options.now ?? (() => new Date());
  const intervalMilliseconds =
    options.intervalMilliseconds ?? 24 * 60 * 60 * 1_000;
  let nextRunAt = Number.NEGATIVE_INFINITY;
  return {
    runOnce: async () => {
      const currentTime = now().getTime();
      if (currentTime < nextRunAt) {
        return { status: "idle", deleted: 0 } as const;
      }
      const deleted = await service.deleteExpiredAccountSecurityHistory();
      nextRunAt = currentTime + intervalMilliseconds;
      return { status: "completed", deleted } as const;
    },
  };
}

export function createIdentityMaintenanceWorker(
  retentionWorker: Readonly<{ runOnce(): Promise<unknown> }>,
  terminationWorker: Readonly<{
    runOnce(): ReturnType<ClerkSessionTerminationService["deliverNext"]>;
  }>,
  hintWorker: IdentityHintWorker,
  options: Readonly<{
    onRetentionError?: (error: unknown) => void;
  }> = {},
  privilegedContextAlertWorker?: Readonly<{
    runOnce(): ReturnType<PrivilegedContextAlertService["deliverNext"]>;
  }>,
) {
  return {
    runOnce: async () => {
      try {
        await retentionWorker.runOnce();
      } catch (error) {
        options.onRetentionError?.(error);
      }
      const termination = await terminationWorker.runOnce();
      if (termination.status !== "idle") return termination;
      if (privilegedContextAlertWorker) {
        const alert = await privilegedContextAlertWorker.runOnce();
        if (alert.status !== "idle") return alert;
      }
      return hintWorker.runOnce();
    },
  };
}

type ConsumerWait = (
  milliseconds: number,
  signal: AbortSignal,
) => Promise<void>;

function waitForPoll(milliseconds: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", done);
      resolve();
    };
    const timeout = setTimeout(done, milliseconds);
    signal.addEventListener("abort", done, { once: true });
  });
}

export async function runIdentityHintConsumer(
  worker: IdentityHintWorker,
  options: Readonly<{
    signal: AbortSignal;
    pollIntervalMilliseconds?: number;
    wait?: ConsumerWait;
    onError?: (error: unknown) => void;
  }>,
): Promise<void> {
  const pollIntervalMilliseconds = options.pollIntervalMilliseconds ?? 1_000;
  const wait = options.wait ?? waitForPoll;
  while (!options.signal.aborted) {
    let shouldWait = true;
    try {
      const delivery = await worker.runOnce();
      shouldWait = delivery.status !== "delivered";
    } catch (error) {
      options.onError?.(error);
    }
    if (shouldWait) {
      await wait(pollIntervalMilliseconds, options.signal);
    }
  }
}

type ClerkHintBackend = Pick<ClerkClient, "sessions" | "users">;
type ClerkSessionBackend = Pick<ClerkClient, "sessions">;

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 404
  );
}

/**
 * Webhooks only schedule this check. A delivery completes after Clerk's
 * backend interface confirms the hinted current state; the webhook payload
 * itself never becomes authentication or authorization evidence.
 */
export function createClerkIdentityHintObserver(
  clerk: ClerkHintBackend,
): IdentityHintObserver {
  return async (hint) => {
    if (hint.type === "user.updated") {
      const user = await clerk.users.getUser(hint.clerkObjectId);
      if (user.id !== hint.clerkObjectId)
        throw new Error("CLERK_USER_MISMATCH");
      return;
    }

    try {
      if (hint.type === "user.deleted") {
        await clerk.users.getUser(hint.clerkObjectId);
        throw new Error("CLERK_USER_STILL_PRESENT");
      }
      const session = await clerk.sessions.getSession(hint.clerkObjectId);
      if (session.id !== hint.clerkObjectId || session.status === "active") {
        throw new Error("CLERK_SESSION_STILL_ACTIVE");
      }
    } catch (error) {
      if (isNotFound(error)) return;
      throw error;
    }
  };
}

export function createClerkSessionTerminator(
  clerk: ClerkSessionBackend,
): ClerkSessionTerminator {
  return async (clerkSessionId) => {
    try {
      await clerk.sessions.revokeSession(clerkSessionId);
    } catch (error) {
      if (isNotFound(error)) return;
      throw error;
    }
  };
}

export function createConfiguredIdentityHintWorker(
  environment: Readonly<Record<string, string | undefined>> = process.env,
  options: Readonly<{
    onRetentionError?: (error: unknown) => void;
  }> = {},
) {
  const config = validateWorkerRuntime(environment);
  const now = () => new Date();
  const service = new IdentityWebhookHintService(
    new PostgresIdentityWebhookHintStore(config.databaseUrl ?? ""),
    now,
  );
  const clerk = createClerkClient({ secretKey: config.clerkSecretKey ?? "" });
  const retentionWorker = createAccountSecurityHistoryRetentionWorker(
    new IdentityService({
      store: new PostgresIdentityStore(config.databaseUrl ?? ""),
      now,
      nextId: (kind) => `${kind}_worker_retention_unused`,
    }),
    { now },
  );
  const terminationWorker = createClerkSessionTerminationWorker(
    new ClerkSessionTerminationService(
      new PostgresClerkSessionTerminationStore(config.databaseUrl ?? ""),
      now,
    ),
    createClerkSessionTerminator(clerk),
  );
  const hintWorker = createIdentityHintWorker(
    service,
    createClerkIdentityHintObserver(clerk),
  );
  const alertPublisher = new PostgresAccountSecurityAlertPublisher(
    config.databaseUrl ?? "",
    now,
  );
  const privilegedContextAlertWorker = createPrivilegedContextAlertWorker(
    new PrivilegedContextAlertService(
      new PostgresPrivilegedContextAlertStore(config.databaseUrl ?? ""),
      now,
    ),
    (alert) => alertPublisher.publish(alert),
  );
  return createIdentityMaintenanceWorker(
    retentionWorker,
    terminationWorker,
    hintWorker,
    options,
    privilegedContextAlertWorker,
  );
}
