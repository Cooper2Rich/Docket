import {
  createConfiguredIdentityHintWorker,
  runIdentityHintConsumer,
} from "./index.js";

const shutdown = new AbortController();
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    shutdown.abort();
  });
}

await runIdentityHintConsumer(
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
);
