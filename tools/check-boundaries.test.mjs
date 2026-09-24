import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeWorkspace } from "./check-boundaries.mjs";

async function materializeFixture(name) {
  const fixture = JSON.parse(
    await readFile(
      new URL(`./fixtures/boundaries/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
  const root = await mkdtemp(path.join(tmpdir(), "docket-boundary-"));
  for (const [relativePath, content] of Object.entries(fixture.files)) {
    const filePath = path.join(root, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");
  }
  return root;
}

describe("workspace boundary enforcement", () => {
  it("accepts public package-root imports with declared dependencies", async () => {
    const result = await analyzeWorkspace(await materializeFixture("valid"), {
      enforceTopology: false,
    });
    expect(result.problems).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it("rejects a domain implementation import", async () => {
    const result = await analyzeWorkspace(
      await materializeFixture("forbidden-import"),
      { enforceTopology: false },
    );
    expect(result.problems.map(({ code }) => code)).toContain(
      "FORBIDDEN_DEEP_IMPORT",
    );
    expect(result.passed).toBe(false);
  });

  it("rejects an undeclared external dependency", async () => {
    const result = await analyzeWorkspace(
      await materializeFixture("undeclared-dependency"),
      { enforceTopology: false },
    );
    expect(result.problems.map(({ code }) => code)).toContain(
      "UNDECLARED_DEPENDENCY",
    );
    expect(result.passed).toBe(false);
  });
});
