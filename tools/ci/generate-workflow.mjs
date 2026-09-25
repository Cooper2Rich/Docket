import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequiredWorkflow } from "./policy.mjs";

const workflowPath = path.join(
  process.cwd(),
  ".github",
  "workflows",
  "required-checks.yml",
);
await mkdir(path.dirname(workflowPath), { recursive: true });
await writeFile(
  workflowPath,
  `${JSON.stringify(createRequiredWorkflow(), null, 2)}\n`,
  "utf8",
);
console.log(`Generated ${path.relative(process.cwd(), workflowPath)}`);
