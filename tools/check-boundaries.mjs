import { readdir, readFile } from "node:fs/promises";
import { builtinModules } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readJson } from "./lib/workspace.mjs";

export const acceptedApps = ["api", "migrate", "web", "worker"];
export const domainPackages = [
  "communications",
  "competition",
  "governance",
  "identity-access",
  "publication",
  "registration",
  "schools",
  "tournaments",
  "workflows",
];
export const foundationPackages = [
  "contracts",
  "database",
  "observability",
  "runtime",
  "testkit",
];
export const acceptedPackages = [
  ...domainPackages,
  ...foundationPackages,
].sort();

const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
]);
const sourceExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
]);
const ignoredDirectories = new Set([
  ".git",
  ".nx",
  ".react-router",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|require\s*\(\s*["']([^"']+)["']\s*\)/g;

function packageName(specifier) {
  if (specifier.startsWith("@")) {
    return specifier.split("/").slice(0, 2).join("/");
  }
  return specifier.split("/")[0];
}

function sortedNames(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sameSet(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

async function directories(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter(
        (entry) => entry.isDirectory() && !ignoredDirectories.has(entry.name),
      )
      .map((entry) => entry.name);
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function sourceFiles(directory) {
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await sourceFiles(entryPath)));
    } else if (
      entry.isFile() &&
      sourceExtensions.has(path.extname(entry.name))
    ) {
      results.push(entryPath);
    }
  }
  return results;
}

function importsFrom(source) {
  const imports = [];
  for (const match of source.matchAll(importPattern)) {
    imports.push(match[1] ?? match[2] ?? match[3]);
  }
  return imports;
}

function declaredDependencies(manifest) {
  return new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ]);
}

function addProblem(problems, code, detail, file) {
  problems.push({ code, detail, ...(file ? { file } : {}) });
}

function findCycles(graph) {
  const cycles = [];
  const visiting = new Set();
  const visited = new Set();
  const stack = [];

  function visit(node) {
    if (visiting.has(node)) {
      const start = stack.indexOf(node);
      cycles.push([...stack.slice(start), node]);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    stack.push(node);
    for (const dependency of graph.get(node) ?? []) visit(dependency);
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of graph.keys()) visit(node);
  return cycles;
}

export async function analyzeWorkspace(workspaceRoot, options = {}) {
  const enforceTopology = options.enforceTopology ?? true;
  const problems = [];
  const appNames = sortedNames(
    await directories(path.join(workspaceRoot, "apps")),
  );
  const packageNames = sortedNames(
    await directories(path.join(workspaceRoot, "packages")),
  );

  if (enforceTopology && !sameSet(appNames, sortedNames(acceptedApps))) {
    addProblem(
      problems,
      "WORKSPACE_APP_TOPOLOGY",
      `expected ${acceptedApps.join(", ")}; found ${appNames.join(", ")}`,
    );
  }
  if (enforceTopology && !sameSet(packageNames, acceptedPackages)) {
    addProblem(
      problems,
      "WORKSPACE_PACKAGE_TOPOLOGY",
      `expected ${acceptedPackages.join(", ")}; found ${packageNames.join(", ")}`,
    );
  }
  for (const prohibited of ["shared", "common", "utils"]) {
    if (packageNames.includes(prohibited))
      addProblem(problems, "PROHIBITED_GENERIC_PACKAGE", prohibited);
  }

  const projects = [];
  for (const [kind, names] of [
    ["app", appNames],
    ["package", packageNames],
  ]) {
    for (const name of names) {
      const projectRoot = path.join(
        workspaceRoot,
        kind === "app" ? "apps" : "packages",
        name,
      );
      const manifestPath = path.join(projectRoot, "package.json");
      try {
        const manifest = await readJson(manifestPath);
        projects.push({ kind, name, projectRoot, manifestPath, manifest });
      } catch (error) {
        addProblem(
          problems,
          "PROJECT_MANIFEST_INVALID",
          `${error.message}`,
          path.relative(workspaceRoot, manifestPath),
        );
      }
    }
  }

  const internalProjects = new Map(
    projects.map((project) => [project.manifest.name, project]),
  );
  const graph = new Map(
    projects.map((project) => [project.manifest.name, new Set()]),
  );

  for (const project of projects) {
    const relativeManifest = path.relative(workspaceRoot, project.manifestPath);
    if (project.manifest.type !== "module")
      addProblem(
        problems,
        "STRICT_ESM_REQUIRED",
        project.manifest.name,
        relativeManifest,
      );

    if (project.kind === "package") {
      const rootExport = project.manifest.exports?.["."];
      if (
        !rootExport ||
        typeof rootExport !== "object" ||
        !rootExport.import ||
        !rootExport.types
      ) {
        addProblem(
          problems,
          "PUBLIC_ROOT_EXPORT_REQUIRED",
          project.manifest.name,
          relativeManifest,
        );
      }
      for (const exportName of Object.keys(project.manifest.exports ?? {})) {
        if (exportName !== ".")
          addProblem(
            problems,
            "NON_ROOT_PACKAGE_EXPORT",
            `${project.manifest.name}:${exportName}`,
            relativeManifest,
          );
      }
    }

    const declared = declaredDependencies(project.manifest);
    let files = [];
    try {
      files = await sourceFiles(project.projectRoot);
    } catch (error) {
      addProblem(
        problems,
        "PROJECT_SOURCE_UNREADABLE",
        error.message,
        path.relative(workspaceRoot, project.projectRoot),
      );
    }

    for (const filePath of files) {
      const relativeFile = path.relative(workspaceRoot, filePath);
      const source = await readFile(filePath, "utf8");
      for (const specifier of importsFrom(source)) {
        if (specifier.startsWith("~/")) continue;
        if (specifier.startsWith(".") || specifier.startsWith("/")) {
          const target = path.resolve(path.dirname(filePath), specifier);
          const relativeTarget = path.relative(project.projectRoot, target);
          if (
            relativeTarget.startsWith("..") &&
            target.startsWith(path.resolve(workspaceRoot))
          ) {
            addProblem(
              problems,
              "CROSS_PROJECT_RELATIVE_IMPORT",
              specifier,
              relativeFile,
            );
          }
          continue;
        }
        if (builtins.has(specifier)) continue;

        const dependencyName = packageName(specifier);
        if (!declared.has(dependencyName)) {
          addProblem(
            problems,
            "UNDECLARED_DEPENDENCY",
            `${specifier} (${dependencyName})`,
            relativeFile,
          );
        }

        if (specifier.startsWith("@docket/")) {
          const targetProject = internalProjects.get(dependencyName);
          if (!targetProject) {
            addProblem(
              problems,
              "UNKNOWN_INTERNAL_PACKAGE",
              specifier,
              relativeFile,
            );
            continue;
          }
          graph.get(project.manifest.name)?.add(dependencyName);
          if (specifier !== dependencyName)
            addProblem(
              problems,
              "FORBIDDEN_DEEP_IMPORT",
              specifier,
              relativeFile,
            );

          if (
            project.kind === "package" &&
            foundationPackages.includes(project.name) &&
            domainPackages.includes(targetProject.name)
          ) {
            addProblem(
              problems,
              "FOUNDATION_TO_DOMAIN_DEPENDENCY",
              `${project.manifest.name} -> ${dependencyName}`,
              relativeFile,
            );
          }
          if (
            project.kind === "package" &&
            domainPackages.includes(project.name) &&
            targetProject.name === "testkit" &&
            !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(filePath)
          ) {
            addProblem(
              problems,
              "PRODUCTION_TESTKIT_DEPENDENCY",
              `${project.manifest.name} -> ${dependencyName}`,
              relativeFile,
            );
          }
          if (
            project.kind === "package" &&
            domainPackages.includes(project.name) &&
            targetProject.name === "workflows" &&
            project.name !== "workflows"
          ) {
            addProblem(
              problems,
              "DOMAIN_TO_WORKFLOW_DEPENDENCY",
              `${project.manifest.name} -> ${dependencyName}`,
              relativeFile,
            );
          }
        }
      }
    }
  }

  for (const cycle of findCycles(graph))
    addProblem(problems, "INTERNAL_DEPENDENCY_CYCLE", cycle.join(" -> "));

  return {
    passed: problems.length === 0,
    assertions: projects.length + 4,
    projects: projects.map((project) => project.manifest.name).sort(),
    problems,
  };
}

async function main() {
  const workspaceRoot = path.resolve(process.argv[2] ?? ".");
  const result = await analyzeWorkspace(workspaceRoot);
  if (!result.passed) {
    for (const problem of result.problems) {
      console.error(
        `${problem.code}: ${problem.file ? `${problem.file}: ` : ""}${problem.detail}`,
      );
    }
    process.exitCode = 1;
    return;
  }
  console.log(
    `BOUNDARIES_OK: ${result.projects.length} projects; ${result.assertions} assertions`,
  );
}

if (
  import.meta.url ===
  pathToFileURL(process.argv[1] ? path.resolve(process.argv[1]) : "").href
) {
  await main();
}
