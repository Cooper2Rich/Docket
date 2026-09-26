import { createClerkClient, type ClerkClient } from "@clerk/backend";
import {
  IdentityWebhookHintService,
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

export function createIdentityHintWorker(
  service: Pick<IdentityWebhookHintService, "deliverNext">,
  observe: IdentityHintObserver,
): Readonly<{ runOnce(): Promise<WebhookHintDelivery> }> {
  return { runOnce: () => service.deliverNext(observe) };
}

export type IdentityHintWorker = ReturnType<typeof createIdentityHintWorker>;

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

export function createConfiguredIdentityHintWorker(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  const config = validateWorkerRuntime(environment);
  const service = new IdentityWebhookHintService(
    new PostgresIdentityWebhookHintStore(config.databaseUrl ?? ""),
    () => new Date(),
  );
  const clerk = createClerkClient({ secretKey: config.clerkSecretKey ?? "" });
  return createIdentityHintWorker(
    service,
    createClerkIdentityHintObserver(clerk),
  );
}
