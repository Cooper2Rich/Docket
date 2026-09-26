import {
  IdentityWebhookHintService,
  PostgresIdentityWebhookHintStore,
} from "@docket/identity-access";
import { withTestDatabase } from "@docket/testkit";
import { describe, expect, it } from "vitest";
import { createIdentityHintWorker, runIdentityHintConsumer } from "./index.js";

describe("executable identity hint consumer", () => {
  it("retries and completes a durable PostgreSQL hint through the polling lifecycle", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        let now = new Date("2026-09-25T19:00:00.000Z");
        const service = new IdentityWebhookHintService(
          new PostgresIdentityWebhookHintStore(database.databaseUrl),
          () => now,
        );
        await service.enqueueVerifiedHint({
          deliveryId: "msg_worker_consumer_001",
          type: "user.updated",
          clerkObjectId: "user_worker_consumer_001",
          occurredAt: now,
        });

        const shutdown = new AbortController();
        let attempts = 0;
        const worker = createIdentityHintWorker(service, () => {
          attempts += 1;
          if (attempts === 1) {
            return Promise.reject(new Error("simulated provider outage"));
          }
          shutdown.abort();
          return Promise.resolve();
        });

        await runIdentityHintConsumer(worker, {
          signal: shutdown.signal,
          wait: () => {
            now = new Date(now.getTime() + 60_000);
            return Promise.resolve();
          },
        });

        const persisted = await database.query<{
          attempt_count: number;
          delivered_at: Date | null;
          last_error_code: string | null;
        }>(
          "select attempt_count, delivered_at, last_error_code from identity_webhook_hints where delivery_id = $1",
          ["msg_worker_consumer_001"],
        );
        expect(attempts).toBe(2);
        expect(persisted.rows[0]).toMatchObject({
          attempt_count: 2,
          last_error_code: null,
        });
        expect(persisted.rows[0]?.delivered_at).toBeInstanceOf(Date);
      },
    );
  });
});
