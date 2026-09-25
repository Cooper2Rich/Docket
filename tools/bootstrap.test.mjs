import { describe, expect, it } from "vitest";
import { bootstrapCommands, prerequisiteCommands } from "./bootstrap.mjs";

describe("local bootstrap command plan", () => {
  it("validates Docker and Compose before changing local infrastructure", () => {
    expect(prerequisiteCommands()).toEqual([
      ["docker", ["version", "--format", "{{.Server.Version}}"]],
      ["docker", ["compose", "version"]],
    ]);
  });

  it("preserves volumes while validating every service-dependent process", () => {
    const commands = bootstrapCommands().map(
      ([command, arguments_]) => `${command} ${arguments_.join(" ")}`,
    );
    expect(commands).toEqual([
      "pnpm install --frozen-lockfile",
      "pnpm config:validate",
      "pnpm infra:up",
      "pnpm health:check --process api",
      "pnpm health:check --process worker",
      "pnpm health:check --process migration",
    ]);
    expect(commands.join(" ")).not.toContain("infra:reset");
    expect(commands.join(" ")).not.toContain("--volumes");
  });
});
