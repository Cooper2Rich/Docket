# Future PRD Question Lines

Status: planning aid only; not accepted scope or a source of requirements

Use this page to guide discovery for a future Docket Project Resource Document (PRD). Keep questions here until the owner makes a decision; record accepted product knowledge in the applicable wiki page or ADR before promoting it into a release PRD.

## Question lines

- **Purpose:** What user or operational outcome justifies the release?
- **Actors:** Who participates, who has authority, and who may only view?
- **Lifecycle:** Where does each included workflow begin, change state, and end?
- **Boundaries:** What is explicitly included, deferred, or prohibited?
- **Rules and exceptions:** Which decisions must be deterministic, governed, corrected, or appealed?
- **Information:** What is authoritative, public, restricted, retained, or deleted?
- **Experience:** What must each actor be able to understand and complete?
- **Capabilities:** What capacity, reliability, privacy, security, accessibility, and recovery outcomes are required?
- **Dependencies:** Which accepted domain decisions, ADRs, and earlier releases constrain this release?

## Future PRD setup

When the questions are settled, create `docs/releases/release-N.md` with:

1. release title, status, intent, and governing sources;
2. included actors and lifecycle;
3. explicit non-goals;
4. uniquely identified release requirements;
5. required product outcomes and capability targets; and
6. links to the supporting domain, experience, architecture, and operations documents.

Testing methods, runnable verification, coverage, and implementation evidence remain in later engineering documents, outside the PRD.
