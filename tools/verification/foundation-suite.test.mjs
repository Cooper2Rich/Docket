import path from "node:path";
import { describe, expect, it } from "vitest";
import { executeSuite, loadContract, validateSuiteContract } from "./core.mjs";
import { loadRegisteredSuite, registeredItemIds } from "./registry.mjs";

describe("R1-FND-001-A committed verification suite", () => {
  it("is registered against the exact independent contract", async () => {
    const itemId = "R1-FND-001-A";
    const { item } = await loadContract(
      path.resolve("docs/implementation/queue-contract.json"),
      itemId,
    );
    const suite = await loadRegisteredSuite(itemId);

    expect(() => validateSuiteContract(item, suite)).not.toThrow();
    expect(registeredItemIds()).toContain(itemId);
    expect(suite.criteria.map(({ id }) => id)).toEqual(item.acceptance_ids);
    expect(suite.criteria.every(({ scenarios }) => scenarios.length > 0)).toBe(
      true,
    );
  });

  it("executes every committed behavioral scenario", async () => {
    const itemId = "R1-FND-001-A";
    const { item } = await loadContract(
      path.resolve("docs/implementation/queue-contract.json"),
      itemId,
    );
    const suite = await loadRegisteredSuite(itemId);
    const criteria = await executeSuite(item, suite, {
      item,
      testedHead: "unit-test-head",
      workspaceRoot: process.cwd(),
    });

    expect(criteria.map(({ id }) => id)).toEqual(item.acceptance_ids);
    expect(criteria.every(({ assertions }) => assertions > 0)).toBe(true);
    expect(criteria.every(({ skipped }) => skipped === 0)).toBe(true);
  }, 120_000);
});

describe("R1-FND-002-A committed verification suite", () => {
  it("is registered against the exact independent contract", async () => {
    const itemId = "R1-FND-002-A";
    const { item } = await loadContract(
      path.resolve("docs/implementation/queue-contract.json"),
      itemId,
    );
    const suite = await loadRegisteredSuite(itemId);

    expect(() => validateSuiteContract(item, suite)).not.toThrow();
    expect(registeredItemIds()).toContain(itemId);
    expect(suite.criteria.map(({ id }) => id)).toEqual(item.acceptance_ids);
    expect(suite.criteria.every(({ scenarios }) => scenarios.length > 0)).toBe(
      true,
    );
  });
});

describe("R1-FND-002-B committed verification suite", () => {
  it("is registered against the exact independent contract", async () => {
    const itemId = "R1-FND-002-B";
    const { item } = await loadContract(
      path.resolve("docs/implementation/queue-contract.json"),
      itemId,
    );
    const suite = await loadRegisteredSuite(itemId);

    expect(() => validateSuiteContract(item, suite)).not.toThrow();
    expect(registeredItemIds()).toContain(itemId);
    expect(suite.criteria.map(({ id }) => id)).toEqual(item.acceptance_ids);
    expect(suite.criteria.every(({ scenarios }) => scenarios.length > 0)).toBe(
      true,
    );
  });
});

describe("R1-FND-004-A committed verification suite", () => {
  it("is registered against the exact independent contract", async () => {
    const itemId = "R1-FND-004-A";
    const { item } = await loadContract(
      path.resolve("docs/implementation/queue-contract.json"),
      itemId,
    );
    const suite = await loadRegisteredSuite(itemId);

    expect(() => validateSuiteContract(item, suite)).not.toThrow();
    expect(registeredItemIds()).toContain(itemId);
    expect(suite.criteria.map(({ id }) => id)).toEqual(item.acceptance_ids);
    expect(suite.criteria.every(({ scenarios }) => scenarios.length > 0)).toBe(
      true,
    );
  });

  it("executes every committed behavioral scenario", async () => {
    const itemId = "R1-FND-004-A";
    const { item } = await loadContract(
      path.resolve("docs/implementation/queue-contract.json"),
      itemId,
    );
    const suite = await loadRegisteredSuite(itemId);
    const criteria = await executeSuite(item, suite, {
      item,
      testedHead: "unit-test-head",
      workspaceRoot: process.cwd(),
    });

    expect(criteria.map(({ id }) => id)).toEqual(item.acceptance_ids);
    expect(criteria.every(({ assertions }) => assertions > 0)).toBe(true);
    expect(criteria.every(({ skipped }) => skipped === 0)).toBe(true);
  }, 120_000);
});

describe("R1-FND-004-B committed verification suite", () => {
  it("is registered against the exact independent contract", async () => {
    const itemId = "R1-FND-004-B";
    const { item, criterionRegistry } = await loadContract(
      path.resolve("docs/implementation/queue-contract.json"),
      itemId,
    );
    const suite = await loadRegisteredSuite(itemId);

    expect(() =>
      validateSuiteContract(
        item,
        suite,
        criterionRegistry.acceptanceIdsForItem(itemId),
      ),
    ).not.toThrow();
    expect(registeredItemIds()).toContain(itemId);
    expect(suite.criteria.map(({ id }) => id)).toEqual(item.acceptance_ids);
    expect(suite.criteria.every(({ scenarios }) => scenarios.length > 0)).toBe(
      true,
    );
  });
});
