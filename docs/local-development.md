# Local development services

The local stack is deterministic and uses the pinned images in `compose.yaml`.
Install Node.js 24, enable the repository-pinned pnpm through Corepack, start
Docker Engine, and run:

```text
pnpm bootstrap
```

Bootstrap validates Node, pnpm, Docker Engine, Docker Compose, and the
secret-free local configuration before starting PostgreSQL, MinIO, and Mailpit.
It waits for container health and probes the dependencies required by the API,
worker, and migration processes. Re-running it is safe: the named volumes are
preserved and no manual cleanup is required.

Use `pnpm infra:down` to stop the stack while preserving data. Run
`pnpm infra:up` to restore it; readiness will fail closed with
`DEPENDENCY_UNREADY` while a required dependency is stopped and will recover
after that dependency is healthy again. `pnpm config:validate` reports only
configuration keys and reasons, never values.

`pnpm infra:reset` is the explicit destructive operation. It removes only the
containers, networks, and named volumes owned by the fixed `docket-local`
Compose project. This permanently deletes its local PostgreSQL, MinIO, and
Mailpit data; it does not target another Compose project.
