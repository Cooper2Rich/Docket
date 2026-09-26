import { VerificationError } from "./core.mjs";

const suiteLoaders = new Map();

registerSuite("R1-FND-001-A", () => import("./suites/r1-fnd-001-a.mjs"));
registerSuite("R1-FND-001-B", () => import("./suites/r1-fnd-001-b.mjs"));
registerSuite("R1-FND-002-A", () => import("./suites/r1-fnd-002-a.mjs"));
registerSuite("R1-FND-002-B", () => import("./suites/r1-fnd-002-b.mjs"));
registerSuite("R1-FND-003-A", () => import("./suites/r1-fnd-003-a.mjs"));
registerSuite("R1-FND-003-B", () => import("./suites/r1-fnd-003-b.mjs"));
registerSuite("R1-FND-004-A", () => import("./suites/r1-fnd-004-a.mjs"));
registerSuite("R1-FND-004-B", () => import("./suites/r1-fnd-004-b.mjs"));
registerSuite("R1-FND-005-A", () => import("./suites/r1-fnd-005-a.mjs"));
registerSuite("R1-FND-005-B", () => import("./suites/r1-fnd-005-b.mjs"));
registerSuite("R1-IDA-001-A", () => import("./suites/r1-ida-001-a.mjs"));
registerSuite("R1-IDA-001-B", () => import("./suites/r1-ida-001-b.mjs"));

export function registerSuite(itemId, loader) {
  if (!itemId || typeof loader !== "function") {
    throw new VerificationError(
      "REGISTRY_INVALID",
      "a suite registration requires an item ID and loader",
    );
  }
  if (suiteLoaders.has(itemId)) {
    throw new VerificationError(
      "REGISTRY_DUPLICATE",
      `${itemId} is already registered`,
    );
  }
  suiteLoaders.set(itemId, loader);
}

export async function loadRegisteredSuite(itemId) {
  const loader = suiteLoaders.get(itemId);
  if (!loader)
    throw new VerificationError(
      "SUITE_NOT_REGISTERED",
      `No committed suite is registered for ${itemId}`,
    );
  const loaded = await loader();
  const suite = loaded.default ?? loaded.suite ?? loaded;
  if (!suite || typeof suite !== "object") {
    throw new VerificationError(
      "SUITE_INVALID",
      `${itemId} did not export a suite object`,
    );
  }
  return suite;
}

export function registeredItemIds() {
  return [...suiteLoaders.keys()].sort();
}

export async function registeredSuiteContracts() {
  return Promise.all(
    registeredItemIds().map(async (itemId) => {
      const suite = await loadRegisteredSuite(itemId);
      return {
        itemId,
        contractSha256: suite.contractSha256,
        acceptanceIds: suite.criteria?.map(({ id }) => id) ?? [],
      };
    }),
  );
}
