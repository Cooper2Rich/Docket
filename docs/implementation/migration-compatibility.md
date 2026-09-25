# Migration compatibility and forward repair

Status: implementation evidence for `R1-FND-003-B`; the executable checks remain authoritative.

## Adjacent-release rule

Docket migrations use expand-and-contract deployment. A migration may add structures that the current application needs, but it must leave the immediately previous application able to read its existing schema contract. `pnpm migration:check` rejects destructive SQL, foreign-owner writes, mutable verification queries, reordered history, and altered checksums before a database connection is opened. `pnpm test:integration` then applies the real plan to pinned ephemeral PostgreSQL and proves both empty-to-head and previous-to-head operation.

The adjacent-version scenario applies the released `0001_platform_migration_journal` plan, advances to a synthetic additive head through the production runner, and executes the previous application's explicit journal projection against the advanced schema. A type change that would make that projection unreadable is rejected as `SCHEMA_INCOMPATIBLE` before application. This evidence supports an application rollback only while the advanced schema remains readable by the previous application; it does not claim that reversing schema history is safe.

## Failure and repair rule

Each migration runs in its own transaction. A failed statement or verification query rolls back that migration's schema writes and retains a checksummed failure outcome in the immutable migration journal. Released migration files and applied rows are never edited or deleted. The repair is a reviewed new forward migration with a new global order, compatibility statement, read-only verification query, and adjacent-release evidence.

There is deliberately no destructive down-migration command. If a rollout fails after a compatible migration, operators may roll the application artifact back and prepare a forward repair. If compatibility with the previous application cannot be demonstrated, deployment is blocked before the migration runs.

## Executable evidence map

| Obligation                                             | Executable evidence                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Isolated real databases and failure cleanup            | `packages/testkit/src/database.integration.test.ts`                                           |
| Empty-to-head and equivalent retry                     | `migrates an empty database once and treats an equivalent retry as a no-op`                   |
| Previous-to-head and previous-reader compatibility     | `migrates the previous schema to head while preserving the previous application read`         |
| Incompatible adjacent schema rejection                 | `rejects an adjacent-incompatible schema change before it can break the previous application` |
| Transaction rollback and retained immutable evidence   | `rolls back a failed migration and retains immutable failure evidence`                        |
| Allowed, denied, stale, concurrent, and retry behavior | `packages/testkit/src/migrations.integration.test.ts`                                         |

The migration runner and TestDatabase harness are developer and release-operator boundaries. They publish no rendered route and dispatch no recipient delivery, so delivery-failure and loading/empty/error/denied/stale/mobile/keyboard UI states are inapplicable to this leaf under the accepted repository map. The integration suite still exercises infrastructure failure cleanup rather than treating that inapplicability as a skipped test.
