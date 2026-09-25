import { describe, expect, it, vi } from "vitest";
import { REQUIRED_LOCAL_COMMANDS, runFullCi } from "./full.mjs";

describe("serial full CI", () => {
  it("runs the frozen install and all ten required local gates in order", async () => {
    const observed = [];
    await expect(
      runFullCi("workspace", {
        run: async (_root, command) => {
          observed.push(command);
          return 0;
        },
        stdout: vi.fn(),
      }),
    ).resolves.toBe(11);
    expect(observed).toEqual(REQUIRED_LOCAL_COMMANDS);
  });

  it("stops at the deliberately failing check and does not supersede it", async () => {
    const observed = [];
    await expect(
      runFullCi("workspace", {
        run: async (_root, command) => {
          observed.push(command);
          return command[0] === "test:unit" ? 1 : 0;
        },
        stdout: vi.fn(),
      }),
    ).rejects.toThrow("CI_FULL_FAILED: pnpm test:unit exited 1");
    expect(observed.at(-1)).toEqual(["test:unit"]);
    expect(observed).toHaveLength(4);
  });
});
