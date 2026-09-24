import { describe, expect, it } from "vitest";
import { assertFixtureAllowed, ConfigValidationError } from "@docket/runtime";
import {
  createCompetitorFixture,
  createDeterministicClock,
  createDeterministicIdGenerator,
  createFakeMailAdapter,
  createFixedIdentityAdapter,
  createProviderFixture,
} from "./index.js";

function deterministicRun() {
  const clock = createDeterministicClock("2026-09-24T12:00:00.000Z");
  const ids = createDeterministicIdGenerator(clock, 52);
  const first = { instant: clock.now().toISOString(), id: ids.next() };
  clock.advance(1_000);
  const second = { instant: clock.now().toISOString(), id: ids.next() };
  return [first, second];
}

describe("deterministic runtime fixtures", () => {
  it("reproduces instants and UUIDv7 identifiers across fresh runs", () => {
    const firstRun = deterministicRun();
    const secondRun = deterministicRun();
    expect(firstRun).toEqual(secondRun);
    expect(firstRun.map(({ id }) => id)).toEqual([
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
      ),
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
      ),
    ]);
  });

  it("keeps fixed identities and synthetic Competitors authority-free", () => {
    const identity =
      createFixedIdentityAdapter("test").authenticate("competitor");
    const competitor = createCompetitorFixture(
      "test",
      createDeterministicIdGenerator(
        createDeterministicClock("2026-09-24T12:00:00.000Z"),
      ),
    );
    expect(identity.authorities).toEqual([]);
    expect(competitor).toMatchObject({
      canAuthenticate: false,
      authorities: [],
    });
  });

  it("rejects every test adapter boundary in staging and production", () => {
    for (const environment of ["staging", "production"] as const) {
      expect(() => createFixedIdentityAdapter(environment)).toThrow(
        /ADAPTER_FORBIDDEN_IN_ENVIRONMENT/u,
      );
      expect(() =>
        createCompetitorFixture(
          environment,
          createDeterministicIdGenerator(
            createDeterministicClock("2026-09-24T12:00:00.000Z"),
          ),
        ),
      ).toThrow(/ADAPTER_FORBIDDEN_IN_ENVIRONMENT/u);
      expect(() =>
        createFakeMailAdapter(
          environment,
          createDeterministicIdGenerator(
            createDeterministicClock("2026-09-24T12:00:00.000Z"),
          ),
        ),
      ).toThrow(/ADAPTER_FORBIDDEN_IN_ENVIRONMENT/u);
      expect(() => createProviderFixture(environment)).toThrow(
        /ADAPTER_FORBIDDEN_IN_ENVIRONMENT/u,
      );
    }
  });

  it("rejects real contact data and authority at every fixture boundary", () => {
    expect(() => {
      assertFixtureAllowed("test", {
        adapter: "synthetic-competitor",
        fixtureId: "unsafe-contact",
        payload: { email: "real.person@school.edu" },
      });
    }).toThrow(ConfigValidationError);
    expect(() => {
      assertFixtureAllowed("development", {
        adapter: "fixed-identity",
        fixtureId: "unsafe-authority",
        payload: { roles: ["platform-administrator"] },
      });
    }).toThrow(/test_authority_forbidden/u);
  });

  it("logs only adapter identity and correlation data", () => {
    const records: unknown[] = [];
    const ids = createDeterministicIdGenerator(
      createDeterministicClock("2026-09-24T12:00:00.000Z"),
    );
    const mail = createFakeMailAdapter("test", ids, (record) =>
      records.push(record),
    );
    mail.send(
      {
        to: "competitor-001@example.test",
        subject: "Private fixture subject",
        text: "Private fixture body",
      },
      "request-52",
    );
    createProviderFixture("test", (record) => records.push(record)).complete(
      "attempt-private",
      "request-53",
    );
    expect(records).toEqual([
      {
        adapter_identity: "fake-mail",
        correlation_id: "request-52",
      },
      {
        adapter_identity: "provider-fixture",
        correlation_id: "request-53",
      },
    ]);
    expect(JSON.stringify(records)).not.toContain("Private fixture");
    expect(JSON.stringify(records)).not.toContain("attempt-private");
  });
});
