# Product Experience Contract

Status: accepted baseline; route and screen design catalog pending

## Delivery model

Docket uses React with React Router framework mode, Vite, and shadcn/ui. Public tournament discovery, invitations, Pairings, schedules, results, Correction Notices, and archive pages are server-rendered and provide useful HTML without client JavaScript where practical. Authenticated operations may use richer client behavior but must retain URL-addressable workflows and recoverable navigation.

The web application consumes only generated OpenAPI clients and audience-specific backend projections. It cannot query PostgreSQL, reconstruct authority from identifiers, infer hidden fields, or reproduce authoritative tournament calculations in the browser.

## Information architecture

The route catalog will separate:

- public tournament discovery and publications;
- Account identity, session, security, and notification settings;
- School roster and Entry work;
- Judge participation, assignments, Ballots, and Feedback;
- Competitor schedules, Pairings, results, and corrections;
- tournament configuration and live operations;
- restricted Platform governance required by Release 1.

Every authenticated screen belongs to an explicit Active Role Context and scope. Role and scope remain persistently visible, privileged contexts use distinct styling, cross-context navigation requires the accepted confirmation behavior, and switching destroys context-scoped client caches.

## Required screen states

Each route or operation specifies applicable loading, empty, validation-error, authorization-denied, not-found-without-disclosure, stale-version, concurrent-conflict, pending-delivery, degraded-provider, destructive-confirmation, success, and recovery states. A design is incomplete when it specifies only the successful state.

## Design system

shadcn/ui is the mandatory component foundation for Release 1. Initialize it in `apps/web` with the Base UI component base, `base-nova` style, Tailwind CSS v4, neutral base color, semantic CSS variables, Lucide icons, TypeScript, and `rsc: false`. Check in `apps/web/components.json`, the generated component source, and all dependency locks. Use the repository-pinned CLI for additions or updates; an unpinned `shadcn@latest` command is not a reproducible build step.

Generated primitives live in `apps/web/app/components/ui`. Docket-specific components and domain compositions must wrap or compose those primitives outside that directory so registry-derived code and product semantics remain distinguishable. Registry refreshes must preserve the required keyboard, screen-reader, browser, and visual behavior.

Docket owns semantic design tokens for color, type, spacing, elevation, motion, breakpoints, and status meaning. Docket maps those tokens onto shadcn/ui's semantic CSS-variable convention and may adapt the checked-in source. shadcn/ui does not define Docket's domain language, authorization, audience rules, or visual hierarchy. Status must never rely on color alone, tournament-critical actions remain visually distinct from routine administration, and reduced-motion preferences are honored.

## Accessibility

Release 1 targets WCAG 2.2 AA. All workflows must support keyboard-only operation, visible focus, meaningful landmarks and headings, screen-reader names and status announcements, error identification and recovery, accessible tables, non-pointer alternatives for reordering or selection, zoom and reflow, and contrast-compliant states.

## Responsive and browser support

Participant-critical reads and actions support narrow mobile viewports; tournament operations support responsive desktop and tablet layouts without making mobile access impossible. Release 1 supports the current and previous major versions of evergreen Chrome, Edge, Firefox, and Safari. Unsupported clients receive an honest compatibility notice rather than silent malfunction.

## Design catalog

The route, screen, content, and notification catalogs must describe each included user journey by role, viewport class, and applicable state, and link to the governing Release 1 requirements.
