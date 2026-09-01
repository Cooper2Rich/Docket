# Project instructions

## Storage

- Store every Docket Markdown file inside this repository; the junction at `C:\Coding Vault\Docket` exposes the repository to Obsidian.
- Preserve that junction and keep project documentation and notes in the repository tree unless the user requests another location.

## LLM wiki schema

- Treat `raw/` as curated source material. An agent may add a source during ingest, then must leave it immutable.
- Treat `wiki/` as the LLM-maintained knowledge layer. Integrate new knowledge into existing pages, add useful cross-references, and record contradictions or superseded claims rather than creating disconnected summaries.
- Use Obsidian `[[wikilinks]]` between wiki pages and relative links back to evidence in `raw/`.
- Start every wiki operation by reading `wiki/index.md`. After changing the wiki, update that index and append one entry to `wiki/log.md` using `## [YYYY-MM-DD] operation | subject`.
- Automatically checkpoint durable Docket context at major milestones and whenever a conversation becomes long or tool-heavy enough that compaction or handoff may occur. Exact context-window usage may be unavailable, so use those observable triggers without waiting for another user prompt.

## Operations

- **Ingest:** add one source to `raw/`, read it fully, discuss material ambiguity with the user when needed, then update every affected wiki page, the index, and the log.
- **Query:** search the index and relevant wiki pages first, verify claims against raw sources when accuracy matters, cite the supporting files, and file durable new synthesis back into the wiki when it will help future work.
- **Lint:** check for contradictions, stale claims, orphan pages, missing links, duplicated concepts, and knowledge gaps; repair what the available evidence supports and log the pass.
- **Checkpoint:** integrate non-sensitive, verified decisions and their reasons, requirements, completed actions, active assumptions, tool outcomes, unresolved blockers, and the next concrete goal into the relevant wiki pages. Update the index and log only when durable knowledge changed; keep transient chatter, secrets, unverified speculation, and verbatim chat transcripts out of the wiki.
