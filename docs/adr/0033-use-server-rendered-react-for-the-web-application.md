# Use server-rendered React for the web application

Status: accepted

Docket's web application will use React with React Router framework mode and Vite, server-render public routes, and consume the backend only through clients generated from the accepted OpenAPI contract. The frontend component foundation is shadcn/ui. Its generated component source is checked into and owned by Docket rather than treated as an opaque runtime component library. This supports searchable and resilient public tournament pages alongside complex role-scoped operations without allowing the web framework or component foundation to own domain behavior or authorization.

## Consequences

Domain calculations and authority remain behind backend module interfaces. The initial shadcn/ui configuration uses the Base UI component base, `base-nova` style, Tailwind CSS v4, neutral base color, semantic CSS variables, Lucide icons, TypeScript components, and no React Server Components. `apps/web/components.json` and the lockfile pin that configuration and the CLI version. Repeatable repository commands use the pinned CLI and never an unreviewed `shadcn@latest` invocation.

Generated primitives live under `apps/web/app/components/ui`; Docket-specific compositions live outside that directory. Docket owns and may adapt both the checked-in primitives and its semantic tokens, but registry updates are explicit reviewed changes with accessibility and visual-regression evidence. shadcn/ui supplies components, not Docket's domain language, authorization, audience rules, or information hierarchy. Public routes return useful HTML without client JavaScript where practical; authenticated workflows must explicitly represent loading, empty, validation, conflict, stale, unauthorized, degraded, and success states. Release 1 targets WCAG 2.2 AA and the current and previous major versions of evergreen browsers.

Official implementation references: [React Router installation](https://ui.shadcn.com/docs/installation/react-router), [`components.json`](https://ui.shadcn.com/docs/components-json), [theming](https://ui.shadcn.com/docs/theming), and [Base UI default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default).
