# Wiki Log

This file is append-only. Each entry records a completed wiki operation.

## [2026-08-31] schema | Initialize the LLM wiki

- Established the `raw/`, `wiki/`, and `AGENTS.md` layers.
- Added the content index and chronological log.
- Defined ingest, query, and lint workflows for future updates.

## [2026-08-31] schema | Enable automatic context checkpoints

- Authorized automatic wiki updates when durable Docket knowledge changes.
- Defined major milestones and long or tool-heavy phases as observable checkpoint triggers.
- Limited checkpoints to useful project state rather than raw conversation transcripts.
