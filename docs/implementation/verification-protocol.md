# Leaf verification and integration protocol

Status: engineering contract for issue setup; application verification has not run.

The Project Resource Document remains product-only. This protocol defines implementation evidence and does not add product scope. [queue-contract.json](queue-contract.json) is the independently generated expected contract for every leaf. The YAML graph remains authoritative; its exact hash and execution projection must match the manifest.

## Executable evidence

`R1-FND-001-A` creates `pnpm verify:item --id <leaf> --contract docs/implementation/queue-contract.json`. It validates the exact expected acceptance and check ID sets. An unknown ID, duplicate ID, omitted criterion, stale contract, empty selected suite, skipped required scenario, failed assertion or missing artifact must exit nonzero. Future command names in issue specifications are requirements, not evidence that those commands already exist.

The verification dispatcher selects committed behavioral tests through a registry. Each criterion names its scenarios and observable assertions. Merely reading a document, returning exit zero, matching a marker, importing a module or asserting a constant cannot establish the promised behavior. Source coverage is ownership, not executed test coverage. Every applicable behavior in a cited mixed paragraph must be exercised; excluded Practice/export behavior stays excluded.

Write `.ralph/evidence/<leaf>/acceptance.json` with this structure and actual values:

```json
{
  "item_id": "R1-FND-001-A",
  "contract_sha256": "<exact manifest contract hash>",
  "tested_head": "<full current PR head SHA>",
  "pr_number": 1,
  "acceptance_criteria": [
    {
      "id": "R1-FND-001-A/AC-01",
      "passed": true,
      "scenario_ids": ["clean-install", "forbidden-import"],
      "assertions": 2,
      "skipped": 0,
      "artifact": ".ralph/evidence/R1-FND-001-A/ac-01.json",
      "sha256": "<artifact SHA-256>"
    }
  ],
  "checks": [
    {
      "id": "item",
      "command": "pnpm verify:item --id R1-FND-001-A --contract docs/implementation/queue-contract.json",
      "passed": true,
      "exit_code": 0,
      "artifact": ".ralph/evidence/R1-FND-001-A/item.json",
      "sha256": "<artifact SHA-256>"
    }
  ]
}
```

The example intentionally contains only one criterion/check to explain the shape. A real receipt must contain **every** ID in the leaf's manifest. Artifacts stay inside the workspace, contain observed results and are hashed after execution. Evidence must identify fixture, environment, command, revision, scenario and result without credentials or private data. If the final commit changes after testing, regenerate current-head evidence; do not edit an old receipt's SHA to make it appear current.

Manual acceptance requires real attributed reviewer evidence in the corresponding artifact. Automation can check its presence and provenance, but cannot claim to have performed a human review. Real provider, infrastructure, recovery, load and production criteria require their named environments; fake launcher fixtures prove only launcher behavior.

## Integration

One leaf produces one reviewable PR. Its body references the issue without automatic closing keywords. Proposed graph completion may be part of the PR; branch-local `done` is not integrated completion. The controller compares the selected contract to the independently captured pre-run manifest and verifies the actual PR head, complete local evidence, all eleven exact successful CI contexts, current base, and at least one valid current-head approval by a nonauthor reviewer. Missing, skipped, cancelled, neutral or stale checks fail.

The controller also reads the live `main` protection. Required contexts, strict base currency, stale-review dismissal, review count, administrator enforcement, and no force/deletion/bypass must match the accepted protection contract. An inaccessible or unsupported protection API is a blocker.

The issue closes and its dependent becomes eligible only after the verified PR is merged into `main` and the merge commit is in current `main` history. A completion receipt preserves both tested head and merge commit. On restart, reconcile a merged PR from independently read evidence before doing any new work. A closed issue without this evidence is not done. A failure stops the queue.

## Bootstrap decision

[GATE-BOOTSTRAP](gates/GATE-BOOTSTRAP.md) records the unresolved integration cycle: the first leaves create the eleven checks required before main integration. The proposed protected bootstrap branch is a decision proposal, not an effective exception. There is currently no runnable first leaf. Resolve the policy in a reviewed engineering change and extend controller fixtures for its exact semantics before activation. Do not silently omit checks or promote branch-local completion to satisfy dependencies.

After the foundation transition, every item uses the full established local/CI command set. Foundational commands must prove their own real capability before they can verify subsequent product work.

## Contract changes

Regenerate and synchronize specifications, source coverage, graph projection, manifest and issue bodies together. Review any acceptance reduction or gate resolution. Changes to a governing source or issue body block activation until synchronized. Status labels are projections; editing a GitHub checkbox never changes the execution contract.
