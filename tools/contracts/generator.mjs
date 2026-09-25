import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { format } from "prettier";

export class ContractGenerationError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = "ContractGenerationError";
    this.code = code;
    this.details = details;
  }
}

function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sorted(child)]),
    );
  }
  return value;
}

export function stableJson(value) {
  return `${JSON.stringify(sorted(value), null, 2)}\n`;
}

function typeBoxExpression(schema) {
  const options = Object.fromEntries(
    Object.entries(schema).filter(
      ([key]) =>
        !["anyOf", "const", "items", "properties", "required", "type"].includes(
          key,
        ),
    ),
  );
  const withOptions = (expression) => {
    const serialized = JSON.stringify(sorted(options));
    if (Object.keys(options).length === 0) return expression;
    return expression.endsWith("()")
      ? `${expression.slice(0, -2)}(${serialized})`
      : `${expression.slice(0, -1)}, ${serialized})`;
  };
  if (schema.const !== undefined) {
    return withOptions(`Type.Literal(${JSON.stringify(schema.const)})`);
  }
  if (Array.isArray(schema.anyOf)) {
    return withOptions(
      `Type.Union([${schema.anyOf.map(typeBoxExpression).join(", ")}])`,
    );
  }
  if (schema.type === "string") return withOptions("Type.String()");
  if (schema.type === "number") return withOptions("Type.Number()");
  if (schema.type === "integer") return withOptions("Type.Integer()");
  if (schema.type === "boolean") return withOptions("Type.Boolean()");
  if (schema.type === "array") {
    return withOptions(`Type.Array(${typeBoxExpression(schema.items)})`);
  }
  if (schema.type === "object") {
    const required = new Set(schema.required ?? []);
    const properties = Object.entries(schema.properties ?? {})
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, child]) => {
        const expression = typeBoxExpression(child);
        return `${JSON.stringify(name)}: ${required.has(name) ? expression : `Type.Optional(${expression})`}`;
      })
      .join(", ");
    return withOptions(`Type.Object({ ${properties} })`);
  }
  throw new ContractGenerationError(
    "CONTRACT_SCHEMA_INVALID",
    `cannot generate TypeBox source for schema ${schema.$id ?? "<anonymous>"}`,
  );
}

function validateSources(sources) {
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new ContractGenerationError(
      "CONTRACT_SCHEMA_INVALID",
      "at least one module-owned contract source is required",
    );
  }
  const modules = new Set();
  const operationIds = new Set();
  const vectorIds = new Set();
  for (const source of sources) {
    if (
      !source?.module ||
      !/^[a-z][a-z0-9-]*$/u.test(source.module) ||
      !source.version ||
      modules.has(source.module)
    ) {
      throw new ContractGenerationError(
        "CONTRACT_SCHEMA_INVALID",
        `invalid or duplicate module contract source: ${source?.module ?? "<missing>"}`,
      );
    }
    modules.add(source.module);
    const moduleOperationIds = new Set();
    const requirements = new Set(source.requirements ?? []);
    if (
      requirements.size === 0 ||
      requirements.size !== (source.requirements ?? []).length
    ) {
      throw new ContractGenerationError(
        "CONTRACT_SCHEMA_INVALID",
        `${source.module} must declare unique governing requirements`,
      );
    }
    const schemaNames = new Set();
    for (const entry of source.schemas ?? []) {
      if (
        !entry?.name ||
        schemaNames.has(entry.name) ||
        !entry.schema ||
        typeof entry.schema !== "object" ||
        typeof entry.schema.$id !== "string" ||
        (!entry.schema.type && !entry.schema.anyOf)
      ) {
        throw new ContractGenerationError(
          "CONTRACT_SCHEMA_INVALID",
          `${source.module} contains an invalid or duplicate schema ${entry?.name ?? "<missing>"}`,
        );
      }
      schemaNames.add(entry.name);
    }
    for (const operation of source.operations ?? []) {
      if (
        !operation.operationId ||
        operationIds.has(operation.operationId) ||
        !schemaNames.has(operation.inputSchema) ||
        !schemaNames.has(operation.successSchema) ||
        !operation.path.startsWith("/")
      ) {
        throw new ContractGenerationError(
          "CONTRACT_SCHEMA_INVALID",
          `${source.module} contains an invalid operation ${operation.operationId ?? "<missing>"}`,
        );
      }
      operationIds.add(operation.operationId);
      moduleOperationIds.add(operation.operationId);
      for (const requirement of operation.requirements ?? []) {
        if (!requirements.has(requirement)) {
          throw new ContractGenerationError(
            "REQUIREMENT_UNTRACED",
            `${operation.operationId} references undeclared requirement ${requirement}`,
          );
        }
      }
      for (const errorCode of operation.errorCodes ?? []) {
        if (!(source.errors ?? []).some(({ code }) => code === errorCode)) {
          throw new ContractGenerationError(
            "CONTRACT_SCHEMA_INVALID",
            `${operation.operationId} references unknown error ${errorCode}`,
          );
        }
      }
    }
    for (const cell of source.authorization ?? []) {
      if (!moduleOperationIds.has(cell.operationId)) {
        throw new ContractGenerationError(
          "CONTRACT_SCHEMA_INVALID",
          `${source.module} authorization references unknown operation ${cell.operationId}`,
        );
      }
    }
    for (const vector of source.goldenVectors ?? []) {
      if (!vector?.id || vectorIds.has(vector.id)) {
        throw new ContractGenerationError(
          "CONTRACT_SCHEMA_INVALID",
          `${source.module} contains an invalid or duplicate vector ${vector?.id ?? "<missing>"}`,
        );
      }
      vectorIds.add(vector.id);
      for (const requirement of vector.requirements ?? []) {
        if (!requirements.has(requirement)) {
          throw new ContractGenerationError(
            "REQUIREMENT_UNTRACED",
            `${vector.id} references undeclared requirement ${requirement}`,
          );
        }
      }
    }
    const traced = new Set([
      ...(source.operations ?? []).flatMap(({ requirements: ids }) => ids),
      ...(source.goldenVectors ?? []).flatMap(({ requirements: ids }) => ids),
    ]);
    const untraced = [...requirements].filter(
      (requirement) => !traced.has(requirement),
    );
    if (untraced.length > 0) {
      throw new ContractGenerationError(
        "REQUIREMENT_UNTRACED",
        `${source.module} requirements have no executable operation or vector: ${untraced.join(", ")}`,
        untraced,
      );
    }
  }
}

function addArtifact(artifacts, owners, relativePath, content, owner) {
  const normalized = relativePath.replaceAll("\\", "/");
  if (
    normalized !== relativePath ||
    normalized.startsWith("/") ||
    normalized.includes("../") ||
    owners.has(normalized)
  ) {
    throw new ContractGenerationError(
      "ARTIFACT_UNOWNED",
      `generated artifact has no unique valid owner: ${relativePath}`,
    );
  }
  owners.set(normalized, owner);
  artifacts.set(normalized, content);
}

function allSchemas(sources) {
  return Object.fromEntries(
    sources
      .flatMap((source) => source.schemas)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(({ name, schema }) => [name, schema]),
  );
}

function openApi(sources) {
  const schemas = allSchemas(sources);
  const errorDefinitions = new Map(
    sources.flatMap((source) =>
      source.errors.map((error) => [error.code, error]),
    ),
  );
  const paths = {};
  for (const operation of sources
    .flatMap((source) => source.operations)
    .sort((left, right) =>
      `${left.path}:${left.method}`.localeCompare(
        `${right.path}:${right.method}`,
      ),
    )) {
    const input = schemas[operation.inputSchema];
    const parameters = Object.entries(input.properties ?? {})
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, schema]) => ({
        in: "query",
        name,
        required: (input.required ?? []).includes(name),
        schema,
      }));
    const responses = {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${operation.successSchema}` },
          },
        },
      },
    };
    for (const errorCode of operation.errorCodes) {
      const definition = errorDefinitions.get(errorCode);
      if (!definition) {
        throw new ContractGenerationError(
          "CONTRACT_SCHEMA_INVALID",
          `${operation.operationId} references unknown error ${errorCode}`,
        );
      }
      const status = String(definition.status);
      responses[status] ??= {
        description: definition.safeMessage,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/StableErrorEnvelope" },
          },
        },
      };
    }
    paths[operation.path] = {
      ...(paths[operation.path] ?? {}),
      [operation.method]: {
        operationId: operation.operationId,
        summary: operation.summary,
        "x-audience": operation.audience,
        "x-requirements": [...operation.requirements].sort(),
        parameters,
        responses,
      },
    };
  }
  return {
    openapi: "3.1.0",
    info: { title: "Docket API", version: "1.0.0" },
    paths,
    components: { schemas },
  };
}

function markdownTable(headers, rows) {
  const header = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  return `${header}\n${divider}\n${rows
    .map(
      (row) =>
        `| ${row.map((cell) => String(cell).replaceAll("|", "\\|")).join(" | ")} |`,
    )
    .join("\n")}\n`;
}

function authorizationMatrix(source) {
  return `# ${source.module} authorization matrix\n\n${markdownTable(
    ["Actor", "Operation", "Resource", "Condition", "Decision", "Error"],
    [...source.authorization]
      .sort((left, right) =>
        `${left.operationId}:${left.actor}`.localeCompare(
          `${right.operationId}:${right.actor}`,
        ),
      )
      .map((cell) => [
        cell.actor,
        cell.operationId,
        cell.resource,
        cell.condition,
        cell.decision,
        cell.errorCode ?? "—",
      ]),
  )}`;
}

function transitionMatrix(source) {
  return `# ${source.module} state transition matrix\n\n${markdownTable(
    ["From", "Command", "Guard", "To", "Rejected from"],
    [...source.transitions]
      .sort((left, right) =>
        `${left.from}:${left.command}`.localeCompare(
          `${right.from}:${right.command}`,
        ),
      )
      .map((transition) => [
        transition.from,
        transition.command,
        transition.guard,
        transition.to,
        [...transition.rejectedFrom].sort().join(", "),
      ]),
  )}`;
}

function audienceMatrix(source) {
  return `# ${source.module} audience matrix\n\n${markdownTable(
    ["Operation", "Audience", "Projection"],
    [...source.operations]
      .sort((left, right) => left.operationId.localeCompare(right.operationId))
      .map((operation) => [
        operation.operationId,
        operation.audience,
        operation.successSchema,
      ]),
  )}`;
}

function readableReference(source) {
  const schemas = [...source.schemas]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(({ name, schema }) => {
      const required = new Set(schema.required ?? []);
      const fields = Object.keys(schema.properties ?? {})
        .sort()
        .map(
          (field) =>
            `- \`${field}\`${required.has(field) ? " (required)" : " (optional)"}`,
        )
        .join("\n");
      return `## ${name}\n\nContract ID: \`${schema.$id}\`\n\n${fields || "No object fields."}`;
    })
    .join("\n\n");
  return `# ${source.module} contract reference\n\nGenerated from the module-owned executable definition at contract version \`${source.version}\`.\n\n${schemas}\n`;
}

function traceabilityManifest(sources, artifactOwners) {
  const requirements = {};
  for (const source of sources) {
    const ownedArtifacts = [...artifactOwners]
      .filter(([, owner]) => owner === source.module || owner === "root")
      .map(([artifact]) => artifact)
      .sort();
    for (const requirement of [...source.requirements].sort()) {
      if (requirements[requirement]) {
        throw new ContractGenerationError(
          "REQUIREMENT_UNTRACED",
          `${requirement} is owned by more than one module`,
        );
      }
      requirements[requirement] = {
        module: source.module,
        operations: source.operations
          .filter((operation) => operation.requirements.includes(requirement))
          .map(({ operationId }) => operationId)
          .sort(),
        vectors: source.goldenVectors
          .filter((vector) => vector.requirements.includes(requirement))
          .map(({ id }) => id)
          .sort(),
        artifacts: ownedArtifacts,
      };
    }
  }
  return { schemaVersion: 1, requirements };
}

function stateDiagram(source) {
  const edges = [...source.transitions]
    .sort((left, right) =>
      `${left.from}:${left.command}`.localeCompare(
        `${right.from}:${right.command}`,
      ),
    )
    .map(
      (transition) =>
        `  ${transition.from} --> ${transition.to}: ${transition.command} [${transition.guard}]`,
    );
  return `stateDiagram-v2\n${edges.join("\n")}\n`;
}

function generatedClient(sources) {
  const schemas = allSchemas(sources);
  const schemaExports = Object.entries(schemas)
    .map(
      ([name, schema]) =>
        `export const ${name}Schema = ${typeBoxExpression(schema)};\nexport type ${name} = Static<typeof ${name}Schema>;`,
    )
    .join("\n\n");
  const clients = sources
    .flatMap((source) =>
      source.operations.map((operation) => {
        return `  async ${operation.operationId}(input: unknown): Promise<${operation.successSchema}> {
    if (!Value.Check(${operation.inputSchema}Schema, input)) {
      throw new ContractClientError("REQUEST_INVALID", "The request is invalid.");
    }
    const query = new URLSearchParams(input).toString();
    const response = await transport({ method: ${JSON.stringify(operation.method.toUpperCase())}, path: ${JSON.stringify(operation.path)} + (query ? \`?\${query}\` : "") });
    if (response.status === 200) {
      if (!Value.Check(${operation.successSchema}Schema, response.body)) {
        throw new ContractClientError("RESPONSE_INVALID", "The response did not match its contract.");
      }
      return response.body;
    }
    if (!Value.Check(StableErrorEnvelopeSchema, response.body)) {
      throw new ContractClientError("RESPONSE_INVALID", "The error response did not match its contract.");
    }
    const error = response.body;
    throw new ContractClientError(error.code, error.message, error.requestId);
  }`;
      }),
    )
    .join("\n\n");
  return `// Generated by tools/contracts/generator.mjs. Do not edit.\nimport { Type, type Static } from "@sinclair/typebox";\nimport { Value } from "@sinclair/typebox/value";\n\n${schemaExports}\n\nexport interface ContractTransportResponse { readonly status: number; readonly body: unknown; }\nexport type ContractTransport = (request: Readonly<{ method: string; path: string }>) => Promise<ContractTransportResponse>;\n\nexport class ContractClientError extends Error {\n  constructor(public readonly code: string, message: string, public readonly requestId?: string) {\n    super(message);\n    this.name = "ContractClientError";\n  }\n}\n\nexport function createDocketClient(transport: ContractTransport) {\n  return {\n${clients}\n  };\n}\n`;
}

export function generateArtifacts(sources) {
  validateSources(sources);
  const orderedSources = [...sources].sort((left, right) =>
    left.module.localeCompare(right.module),
  );
  const artifacts = new Map();
  const artifactOwners = new Map();
  addArtifact(
    artifacts,
    artifactOwners,
    "contracts/openapi/v1.json",
    stableJson(openApi(orderedSources)),
    "root",
  );
  for (const source of orderedSources) {
    addArtifact(
      artifacts,
      artifactOwners,
      `contracts/json-schema/${source.module}.v1.json`,
      stableJson({
        $schema: "https://json-schema.org/draft/2020-12/schema",
        module: source.module,
        version: source.version,
        schemas: Object.fromEntries(
          [...source.schemas]
            .sort((left, right) => left.name.localeCompare(right.name))
            .map(({ name, schema }) => [name, schema]),
        ),
      }),
      source.module,
    );
    addArtifact(
      artifacts,
      artifactOwners,
      `contracts/matrices/${source.module}-authorization.md`,
      authorizationMatrix(source),
      source.module,
    );
    addArtifact(
      artifacts,
      artifactOwners,
      `contracts/matrices/${source.module}-states.md`,
      transitionMatrix(source),
      source.module,
    );
    addArtifact(
      artifacts,
      artifactOwners,
      `contracts/matrices/${source.module}-audiences.md`,
      audienceMatrix(source),
      source.module,
    );
    addArtifact(
      artifacts,
      artifactOwners,
      `contracts/diagrams/${source.module}-states.mmd`,
      stateDiagram(source),
      source.module,
    );
    addArtifact(
      artifacts,
      artifactOwners,
      `contracts/reference/${source.module}.md`,
      readableReference(source),
      source.module,
    );
  }
  addArtifact(
    artifacts,
    artifactOwners,
    "contracts/vectors/index.json",
    stableJson({
      schemaVersion: 1,
      vectors: orderedSources
        .flatMap((source) =>
          source.goldenVectors.map((vector) => ({
            ...vector,
            module: source.module,
          })),
        )
        .sort((left, right) => left.id.localeCompare(right.id)),
    }),
    "root",
  );
  addArtifact(
    artifacts,
    artifactOwners,
    "packages/contracts/src/generated.ts",
    generatedClient(orderedSources),
    "root",
  );
  addArtifact(
    artifacts,
    artifactOwners,
    "contracts/traceability.json",
    stableJson(traceabilityManifest(orderedSources, artifactOwners)),
    "root",
  );
  return {
    artifacts,
    sourceModules: orderedSources.map(({ module }) => module),
  };
}

async function materializeArtifacts(sources) {
  const result = generateArtifacts(sources);
  const artifacts = new Map(result.artifacts);
  for (const [relativePath, content] of artifacts) {
    if (relativePath.endsWith(".ts")) {
      artifacts.set(
        relativePath,
        await format(content, { parser: "typescript" }),
      );
    }
  }
  return { ...result, artifacts };
}

function requiredProperties(schema) {
  return new Set(schema?.required ?? []);
}

export function assertBackwardCompatible(previous, next) {
  const breaks = [];
  for (const [route, previousMethods] of Object.entries(previous.paths ?? {})) {
    const nextMethods = next.paths?.[route];
    if (!nextMethods) {
      breaks.push(`removed path ${route}`);
      continue;
    }
    for (const [method, previousOperation] of Object.entries(previousMethods)) {
      const nextOperation = nextMethods[method];
      if (!nextOperation) {
        breaks.push(`removed operation ${method.toUpperCase()} ${route}`);
        continue;
      }
      const previousSuccess =
        previousOperation.responses?.["200"]?.content?.["application/json"]
          ?.schema?.$ref;
      const nextSuccess =
        nextOperation.responses?.["200"]?.content?.["application/json"]?.schema
          ?.$ref;
      if (previousSuccess !== nextSuccess)
        breaks.push(
          `changed success schema for ${method.toUpperCase()} ${route}`,
        );
    }
  }
  for (const [name, previousSchema] of Object.entries(
    previous.components?.schemas ?? {},
  )) {
    const nextSchema = next.components?.schemas?.[name];
    if (!nextSchema) {
      breaks.push(`removed schema ${name}`);
      continue;
    }
    for (const property of requiredProperties(previousSchema)) {
      if (!requiredProperties(nextSchema).has(property))
        breaks.push(`removed required property ${name}.${property}`);
    }
    for (const property of requiredProperties(nextSchema)) {
      if (!requiredProperties(previousSchema).has(property))
        breaks.push(`added required property ${name}.${property}`);
    }
  }
  if (breaks.length > 0) {
    throw new ContractGenerationError(
      "CONTRACT_BREAKING_CHANGE",
      `public contract is not backward compatible: ${breaks.join("; ")}`,
      breaks,
    );
  }
}

async function readExisting(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function checkArtifacts(workspaceRoot, sources) {
  const result = await materializeArtifacts(sources);
  const expectedOpenApi = result.artifacts.get("contracts/openapi/v1.json");
  const existingOpenApi = await readExisting(
    path.join(workspaceRoot, "contracts/openapi/v1.json"),
  );
  if (existingOpenApi && expectedOpenApi) {
    try {
      assertBackwardCompatible(
        JSON.parse(existingOpenApi),
        JSON.parse(expectedOpenApi),
      );
    } catch (error) {
      if (error instanceof ContractGenerationError) throw error;
      throw new ContractGenerationError(
        "CONTRACT_SCHEMA_INVALID",
        `checked-in OpenAPI is invalid: ${error.message}`,
      );
    }
  }
  const drift = [];
  for (const [relativePath, expected] of result.artifacts) {
    const actual = await readExisting(path.join(workspaceRoot, relativePath));
    if (actual !== expected) drift.push(relativePath);
  }
  if (drift.length > 0) {
    throw new ContractGenerationError(
      "CONTRACT_DRIFT",
      `generated artifacts are stale: ${drift.join(", ")}`,
      drift,
    );
  }
  return result;
}

export async function writeArtifacts(workspaceRoot, sources) {
  const result = await materializeArtifacts(sources);
  for (const [relativePath, content] of result.artifacts) {
    const destination = path.join(workspaceRoot, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    const temporary = `${destination}.tmp-${process.pid}`;
    await writeFile(temporary, content, "utf8");
    try {
      await rename(temporary, destination);
    } finally {
      await rm(temporary, { force: true });
    }
  }
  return result;
}
