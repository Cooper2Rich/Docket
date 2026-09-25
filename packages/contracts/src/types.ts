import type { TSchema } from "@sinclair/typebox";

export type ContractSchema = Readonly<{
  name: string;
  schema: TSchema;
}>;

export type ContractOperation = Readonly<{
  operationId: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  summary: string;
  requirements: readonly string[];
  inputSchema: string;
  successSchema: string;
  errorCodes: readonly string[];
  audience: string;
}>;

export type StateTransition = Readonly<{
  from: string;
  command: string;
  guard: string;
  to: string;
  rejectedFrom: readonly string[];
}>;

export type AuthorizationCell = Readonly<{
  actor: string;
  operationId: string;
  resource: string;
  condition: string;
  decision: "allow" | "deny";
  errorCode?: string;
}>;

export type ContractError = Readonly<{
  code: string;
  status: number;
  safeMessage: string;
}>;

export type GoldenVector = Readonly<{
  id: string;
  contractVersion: string;
  requirements: readonly string[];
  input: unknown;
  expected: unknown;
  provenance: string;
}>;

export interface ContractSource {
  readonly module: string;
  readonly version: string;
  readonly requirements: readonly string[];
  readonly schemas: readonly ContractSchema[];
  readonly operations: readonly ContractOperation[];
  readonly transitions: readonly StateTransition[];
  readonly authorization: readonly AuthorizationCell[];
  readonly errors: readonly ContractError[];
  readonly goldenVectors: readonly GoldenVector[];
}

export interface GeneratorResult {
  readonly artifacts: ReadonlyMap<string, string>;
  readonly sourceModules: readonly string[];
}

export interface TraceabilityManifest {
  readonly schemaVersion: 1;
  readonly requirements: Readonly<
    Record<
      string,
      Readonly<{
        module: string;
        operations: readonly string[];
        vectors: readonly string[];
        artifacts: readonly string[];
      }>
    >
  >;
}
