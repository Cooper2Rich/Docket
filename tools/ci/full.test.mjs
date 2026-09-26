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

  it("attributes child receipts to the selected leaf without leaking metadata to application commands", async () => {
    const observed = [];
    await runFullCi("workspace", {
      environment: {
        DOCKET_PR_NUMBER: "170",
        DOCKET_VERIFY_ITEM: "R1-IDA-001-A",
        DOCKET_ENV: "test",
        PATH: "synthetic-path",
      },
      run: async (_root, command, environment) => {
        observed.push({ command, environment });
        return 0;
      },
      stdout: vi.fn(),
    });

    for (const { command, environment } of observed) {
      expect(environment.DOCKET_PR_NUMBER).toBeUndefined();
      if (
        [
          "build",
          "check",
          "test:unit",
          "test:integration",
          "test:e2e",
          "contracts",
        ].includes(command[0])
      ) {
        expect(environment.DOCKET_VERIFY_ITEM, command.join(" ")).toBe(
          "R1-IDA-001-A",
        );
      } else {
        expect(
          environment.DOCKET_VERIFY_ITEM,
          command.join(" "),
        ).toBeUndefined();
      }
    }
  });
});
