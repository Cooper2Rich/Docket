# Bootstrap baseline

Status: preserved build inputs; application implementation removed September 9, 2026.

Use the accepted stack in ADRs 0032 and 0033 and the [development contract](../development.md). The former workspace pinned Node.js 24 and pnpm 11.19.0. The following exact dependency choices are retained from its manifests so deleting the implementation does not lose the build inputs. They are not a new compatibility or security verification. The foundation item must resolve and verify a compatible pinned graph and create a new lockfile; document any necessary change against the accepted contracts.

No package manifest, lockfile, application command, service configuration, or generated component currently exists. The required shadcn configuration remains in ADR 0033: Base UI, `base-nova`, Tailwind CSS v4, neutral color, CSS variables, Lucide icons, TypeScript, and no React Server Components.

The preserved manifest predates the revised [ADR 0029](../adr/0029-use-clerk-for-managed-authentication.md) and [ADR 0034](../adr/0034-deploy-release-1-on-aws.md), so it contains no authoritative pins for Clerk or Vercel. The foundation item must add and compatibly pin the current `@clerk/react-router`, `@clerk/fastify`, and `@vercel/react-router` packages, configure Clerk's React Router framework-mode integration and Fastify token validation, and configure the Vercel React Router preset. Those resolved versions become build inputs only after lockfile and integration verification.

| Dependency | Previously pinned version |
| --- | --- |
| `@aws-sdk/client-sesv2` | `3.1127.0` |
| `@base-ui/react` | `1.8.0` |
| `@eslint/js` | `10.0.1` |
| `@playwright/test` | `1.63.0` |
| `@react-router/dev` | `7.18.3` |
| `@react-router/node` | `7.18.3` |
| `@react-router/serve` | `7.18.3` |
| `@sinclair/typebox` | `0.34.52` |
| `@tailwindcss/vite` | `4.3.3` |
| `@testcontainers/postgresql` | `12.1.0` |
| `@types/node` | `24.10.1` |
| `@types/nodemailer` | `8.0.1` |
| `@types/pg` | `8.20.0, 8.23.1` |
| `@types/react` | `19.2.18` |
| `@types/react-dom` | `19.2.3` |
| `axe-core` | `4.13.0` |
| `class-variance-authority` | `0.7.1` |
| `clsx` | `2.1.1` |
| `eslint` | `10.9.1` |
| `fastify` | `5.11.3` |
| `isbot` | `5.2.2` |
| `jsdom` | `27.0.1` |
| `kysely` | `0.29.5` |
| `lucide-react` | `1.41.0` |
| `nodemailer` | `9.1.1` |
| `nx` | `23.2.0` |
| `pg` | `8.23.0` |
| `pg-boss` | `12.30.0` |
| `prettier` | `3.6.2` |
| `react` | `catalog:` |
| `react-dom` | `catalog:` |
| `react-router` | `7.18.3` |
| `shadcn` | `4.21.0` |
| `tailwind-merge` | `3.6.0` |
| `tailwindcss` | `4.3.3` |
| `typescript` | `6.0.2` |
| `typescript-eslint` | `8.69.0` |
| `vite` | `8.2.2` |
| `vitest` | `4.1.11` |
| `yaml` | `2.9.0` |
