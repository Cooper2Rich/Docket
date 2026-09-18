# Previous build archive

Status: superseded by the owner-requested implementation reset on September 9, 2026.

The owner requested deletion of already-built code while retaining requirements, design, and build instructions, followed by repository and Obsidian organization. No build was requested or started.

Automatic approval review rejected the bulk permanent-deletion command without executing it. The removal used the Windows Recycle Bin instead, preserving a recovery option outside the repository.

## Removed

Application and module source, application tests and fixtures, migrations, generated contracts and clients, local infrastructure and CI implementation, package manifests and lockfile, compiler and test configuration, installed dependencies, caches, generated outputs, prior Ralph run output, obsolete Luna profiles, and cached third-party comparison code and archives.

## Preserved

The accepted Release 1 requirements, all ADRs, domain vocabulary and wiki knowledge, immutable curated source, build and quality contracts, dependency-ordered work definitions, repository-owned skills and their launcher tooling, Sol-only settings, Git metadata, and the Obsidian junction. Version choices from the removed manifests are retained as [bootstrap instructions](../../implementation/bootstrap-baseline.md).

The work graph was reset to zero done, `R1-FND-001` ready, and 39 dependent items blocked. Its requirement IDs, objectives, dependencies, inputs, outputs, and evidence expectations were preserved. No Git history was rewritten and no remote repository or hosted infrastructure was changed.

## Historical reports

`evidence/` contains reports from the removed implementation. Each is superseded and cannot be used to mark a new item done. [Implementation notes](implementation-notes.md) preserve prior checkpoint prose removed from current domain pages. Source paths quoted in these records refer to deleted files. Generated-artifact links were converted to historical path text where their targets no longer exist.

The root `.ignore` excludes this archive from default ripgrep discovery. Read an explicit path or use `rg --no-ignore` for a historical investigation.

Return to [BUILD.md](../../../BUILD.md) for current authority and future implementation procedure. Recreate fresh evidence under `docs/implementation/evidence/` only during an authorized future build.
