import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createRequiredWorkflow,
  REQUIRED_CHECKS,
  validateRequiredWorkflow,
  validateRequiredWorkflowFile,
} from "./policy.mjs";

const workspaceRoot = process.cwd();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

describe("required-check workflow policy", () => {
  it("publishes every exact context with frozen local-command parity", async () => {
    const result = await validateRequiredWorkflowFile(workspaceRoot);

    expect(result.checkNames).toEqual(REQUIRED_CHECKS.map(({ name }) => name));
    expect(result.commands).toEqual(
      REQUIRED_CHECKS.map(({ command }) => command),
    );
  });

  it("rejects each omitted required context with REQUIRED_CHECK_MISSING", async () => {
    const fixture = JSON.parse(
      await readFile(
        path.join(
          workspaceRoot,
          "tools/fixtures/ci-policy/negative-cases.json",
        ),
        "utf8",
      ),
    );
    expect(fixture.missing_checks).toEqual(REQUIRED_CHECKS.map(({ id }) => id));

    for (const jobId of fixture.missing_checks) {
      const workflow = createRequiredWorkflow();
      workflow.jobs = Object.fromEntries(
        Object.entries(workflow.jobs).filter(([id]) => id !== jobId),
      );
      expect(() => validateRequiredWorkflow(workflow), jobId).toThrowError(
        expect.objectContaining({ code: "REQUIRED_CHECK_MISSING" }),
      );
    }
  });

  it("rejects each substituted local command with CI_LOCAL_PARITY_FAILED", async () => {
    const fixture = JSON.parse(
      await readFile(
        path.join(
          workspaceRoot,
          "tools/fixtures/ci-policy/negative-cases.json",
        ),
        "utf8",
      ),
    );
    expect(fixture.parity_checks).toEqual(REQUIRED_CHECKS.map(({ id }) => id));

    for (const jobId of fixture.parity_checks) {
      const workflow = createRequiredWorkflow();
      const check = REQUIRED_CHECKS.find(({ id }) => id === jobId);
      const commandStep = workflow.jobs[jobId].steps.find(
        ({ run }) => run === check.command,
      );
      commandStep.run = `${check.command} --permissive`;
      expect(() => validateRequiredWorkflow(workflow), jobId).toThrowError(
        expect.objectContaining({ code: "CI_LOCAL_PARITY_FAILED" }),
      );
    }
  });

  it("rejects mutable actions, broader permissions, unsafe caches, and weakened artifacts", () => {
    const mutableAction = createRequiredWorkflow();
    mutableAction.jobs.build.steps[0].uses = "actions/checkout@v4";
    expect(() => validateRequiredWorkflow(mutableAction)).toThrowError(
      expect.objectContaining({ code: "CI_ACTION_NOT_PINNED" }),
    );

    const broadPermissions = createRequiredWorkflow();
    broadPermissions.permissions.contents = "write";
    expect(() => validateRequiredWorkflow(broadPermissions)).toThrowError(
      expect.objectContaining({ code: "CI_PERMISSIONS_INVALID" }),
    );

    const unsafeCache = createRequiredWorkflow();
    const setup = unsafeCache.jobs.unit.steps.find(({ uses }) =>
      uses?.startsWith("actions/setup-node@"),
    );
    setup.with.cache = "npm";
    expect(() => validateRequiredWorkflow(unsafeCache)).toThrowError(
      expect.objectContaining({ code: "CI_CACHE_POLICY_INVALID" }),
    );

    const weakArtifact = createRequiredWorkflow();
    const upload = weakArtifact.jobs.artifacts.steps.find(({ uses }) =>
      uses?.startsWith("actions/upload-artifact@"),
    );
    upload.with["retention-days"] = 90;
    upload.with["include-hidden-files"] = true;
    expect(() => validateRequiredWorkflow(weakArtifact)).toThrowError(
      expect.objectContaining({ code: "CI_ARTIFACT_POLICY_INVALID" }),
    );
  });

  it("matches the generated workflow byte-for-byte", async () => {
    const workflow = JSON.parse(
      await readFile(
        path.join(workspaceRoot, ".github/workflows/required-checks.yml"),
        "utf8",
      ),
    );
    expect(clone(workflow)).toEqual(createRequiredWorkflow());
  });
});
