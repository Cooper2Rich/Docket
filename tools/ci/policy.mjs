import { readFile } from "node:fs/promises";
import path from "node:path";

export const REQUIRED_CHECKS = Object.freeze([
  {
    id: "frozen_install",
    name: "Required / Frozen install",
    command: "pnpm install --frozen-lockfile",
    timeoutMinutes: 15,
  },
  {
    id: "build",
    name: "Required / Build",
    command: "pnpm build",
    timeoutMinutes: 20,
  },
  {
    id: "check",
    name: "Required / Check",
    command: "pnpm check",
    timeoutMinutes: 20,
  },
  {
    id: "unit",
    name: "Required / Unit",
    command: "pnpm test:unit",
    timeoutMinutes: 20,
  },
  {
    id: "integration",
    name: "Required / Integration",
    command: "pnpm test:integration",
    timeoutMinutes: 30,
  },
  {
    id: "end_to_end",
    name: "Required / End-to-end",
    command: "pnpm test:e2e",
    timeoutMinutes: 30,
    provision: "pnpm exec playwright install --with-deps chromium",
  },
  {
    id: "contracts",
    name: "Required / Contracts",
    command: "pnpm contracts check",
    timeoutMinutes: 20,
  },
  {
    id: "migrations",
    name: "Required / Migrations",
    command: "pnpm migration:check",
    timeoutMinutes: 20,
  },
  {
    id: "security",
    name: "Required / Security",
    command: "pnpm security:check",
    timeoutMinutes: 20,
  },
  {
    id: "accessibility",
    name: "Required / Accessibility",
    command: "pnpm accessibility:check",
    timeoutMinutes: 30,
    provision: "pnpm exec playwright install --with-deps chromium",
  },
  {
    id: "artifacts",
    name: "Required / Artifacts",
    command: "pnpm artifacts:check",
    timeoutMinutes: 30,
    artifact: true,
  },
]);

const ACTIONS = Object.freeze({
  checkout: "actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683",
  setupNode: "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020",
  uploadArtifact:
    "actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02",
});

export class CiPolicyError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CiPolicyError";
    this.code = code;
  }
}

function installSteps() {
  return [
    {
      name: "Check out the candidate",
      uses: ACTIONS.checkout,
    },
    {
      name: "Enable the repository package manager",
      run: "corepack enable",
    },
    {
      name: "Set up the pinned Node runtime and pnpm store",
      uses: ACTIONS.setupNode,
      with: {
        "node-version-file": ".node-version",
        cache: "pnpm",
        "cache-dependency-path": "pnpm-lock.yaml",
      },
    },
    {
      name: "Install frozen dependencies",
      run: "pnpm install --frozen-lockfile",
    },
  ];
}

function jobFor(check) {
  const steps = installSteps();
  if (check.provision) {
    steps.push({
      name: "Provision the hosted browser dependency",
      run: check.provision,
    });
  }
  if (check.id !== "frozen_install") {
    steps.push({
      name: `Run ${check.name}`,
      run: check.command,
    });
  }
  if (check.artifact) {
    steps.push({
      name: "Upload the verified build evidence",
      uses: ACTIONS.uploadArtifact,
      with: {
        name: "docket-build-${{ github.sha }}",
        path: "build-artifacts/",
        "if-no-files-found": "error",
        "include-hidden-files": false,
        "retention-days": 7,
      },
    });
  }
  return {
    name: check.name,
    "runs-on": "ubuntu-latest",
    "timeout-minutes": check.timeoutMinutes,
    steps,
  };
}

export function createRequiredWorkflow() {
  return {
    name: "Required",
    on: {
      pull_request: { branches: ["main"] },
      push: { branches: ["main"] },
      workflow_dispatch: {},
    },
    permissions: { contents: "read" },
    jobs: Object.fromEntries(
      REQUIRED_CHECKS.map((check) => [check.id, jobFor(check)]),
    ),
  };
}

function exactSet(actual, expected) {
  const left = [...actual].sort();
  const right = [...expected].sort();
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function serialized(value) {
  return JSON.stringify(value);
}

function allSteps(workflow) {
  return Object.values(workflow.jobs ?? {}).flatMap((job) => job.steps ?? []);
}

export function validateRequiredWorkflow(workflow) {
  if (!workflow || typeof workflow !== "object" || Array.isArray(workflow)) {
    throw new CiPolicyError(
      "CI_WORKFLOW_INVALID",
      "workflow must be an object",
    );
  }
  if (serialized(workflow.permissions) !== serialized({ contents: "read" })) {
    throw new CiPolicyError(
      "CI_PERMISSIONS_INVALID",
      "workflow permissions must be exactly contents: read",
    );
  }

  const expectedIds = REQUIRED_CHECKS.map(({ id }) => id);
  const actualIds = Object.keys(workflow.jobs ?? {});
  if (!exactSet(actualIds, expectedIds)) {
    const missing = expectedIds.filter((id) => !actualIds.includes(id));
    throw new CiPolicyError(
      "REQUIRED_CHECK_MISSING",
      missing.length > 0
        ? `missing required jobs: ${missing.join(", ")}`
        : "the workflow contains an unexpected required-job replacement",
    );
  }

  for (const check of REQUIRED_CHECKS) {
    const job = workflow.jobs[check.id];
    if (job.name !== check.name) {
      throw new CiPolicyError(
        "REQUIRED_CHECK_MISSING",
        `${check.id} must publish the exact context ${check.name}`,
      );
    }
    const commands = (job.steps ?? [])
      .filter(({ run }) => typeof run === "string")
      .map(({ run }) => run);
    if (!commands.includes("pnpm install --frozen-lockfile")) {
      throw new CiPolicyError(
        "CI_LOCAL_PARITY_FAILED",
        `${check.name} omitted the frozen install`,
      );
    }
    if (!commands.includes(check.command)) {
      throw new CiPolicyError(
        "CI_LOCAL_PARITY_FAILED",
        `${check.name} omitted ${check.command}`,
      );
    }
  }

  const actions = allSteps(workflow).filter(({ uses }) => uses);
  for (const step of actions) {
    if (!/^[^@\s]+@[0-9a-f]{40}$/u.test(step.uses)) {
      throw new CiPolicyError(
        "CI_ACTION_NOT_PINNED",
        `${step.uses} is not pinned to an immutable revision`,
      );
    }
  }

  const setupSteps = actions.filter(({ uses }) =>
    uses.startsWith("actions/setup-node@"),
  );
  if (
    setupSteps.length !== REQUIRED_CHECKS.length ||
    setupSteps.some(
      (step) =>
        serialized(step.with) !==
        serialized({
          "node-version-file": ".node-version",
          cache: "pnpm",
          "cache-dependency-path": "pnpm-lock.yaml",
        }),
    ) ||
    actions.some(({ uses }) => uses.startsWith("actions/cache@"))
  ) {
    throw new CiPolicyError(
      "CI_CACHE_POLICY_INVALID",
      "only the exact-lock pnpm store cache is permitted",
    );
  }

  const uploadSteps = actions.filter(({ uses }) =>
    uses.startsWith("actions/upload-artifact@"),
  );
  const expectedUpload = {
    name: "docket-build-${{ github.sha }}",
    path: "build-artifacts/",
    "if-no-files-found": "error",
    "include-hidden-files": false,
    "retention-days": 7,
  };
  if (
    uploadSteps.length !== 1 ||
    serialized(uploadSteps[0].with) !== serialized(expectedUpload)
  ) {
    throw new CiPolicyError(
      "CI_ARTIFACT_POLICY_INVALID",
      "build evidence must be SHA-named, required, visible-only, and retained for seven days",
    );
  }

  const expected = createRequiredWorkflow();
  if (serialized(workflow) !== serialized(expected)) {
    throw new CiPolicyError(
      "CI_WORKFLOW_INVALID",
      "workflow differs from the reviewed required-check policy",
    );
  }
  return {
    checkNames: REQUIRED_CHECKS.map(({ name }) => name),
    commands: REQUIRED_CHECKS.map(({ command }) => command),
    actionPins: actions.map(({ uses }) => uses),
  };
}

export async function loadRequiredWorkflow(workspaceRoot) {
  const workflowPath = path.join(
    workspaceRoot,
    ".github",
    "workflows",
    "required-checks.yml",
  );
  let workflow;
  try {
    workflow = JSON.parse(await readFile(workflowPath, "utf8"));
  } catch (error) {
    throw new CiPolicyError("CI_WORKFLOW_INVALID", error.message);
  }
  return { workflow, workflowPath };
}

export async function validateRequiredWorkflowFile(workspaceRoot) {
  const { workflow, workflowPath } = await loadRequiredWorkflow(workspaceRoot);
  return { ...validateRequiredWorkflow(workflow), workflowPath };
}
