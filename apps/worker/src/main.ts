import {
  createConfiguredCommunicationsWorker,
  createConfiguredIdentityHintWorker,
  runCommunicationsOutboxDispatcher,
  runIdentityHintConsumer,
} from "./index.js";

const shutdown = new AbortController();
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    shutdown.abort();
  });
}

const communications = await createConfiguredCommunicationsWorker(process.env);
try {
  await Promise.all([
    runIdentityHintConsumer(
      createConfiguredIdentityHintWorker(process.env, {
        onRetentionError: () => {
          console.error("Account Security History retention cleanup failed");
        },
      }),
      {
        signal: shutdown.signal,
        onError: () => {
          console.error("identity hint worker poll failed");
        },
      },
    ),
    runCommunicationsOutboxDispatcher(communications.worker, {
      signal: shutdown.signal,
      onError: () => {
        console.error("communications outbox dispatch failed");
      },
    }),
  ]);
} finally {
  await communications.boss.stop({ graceful: true, timeout: 30_000 });
}
