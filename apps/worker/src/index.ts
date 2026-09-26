import { createClerkClient, type ClerkClient } from "@clerk/backend";
import {
  ClerkSessionTerminationService,
  IdentityService,
  IdentityWebhookHintService,
  PostgresClerkSessionTerminationStore,
  PostgresIdentityStore,
  PostgresIdentityWebhookHintStore,
  type ClerkWebhookHint,
  type WebhookHintDelivery,
} from "@docket/identity-access";
import { parseRuntimeConfig } from "@docket/runtime";

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
) {
  return {
    runOnce: async () => {
      try {
        await retentionWorker.runOnce();
      } catch (error) {
        options.onRetentionError?.(error);
      }
      const termination = await terminationWorker.runOnce();
      return termination.status === "idle" ? hintWorker.runOnce() : termination;
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
  return createIdentityMaintenanceWorker(
    retentionWorker,
    terminationWorker,
    hintWorker,
    options,
  );
}
