import {
  assertFixtureAllowed,
  createUuidV7Generator,
  redactedAdapterLogRecord,
  type AdapterLogRecord,
  type Clock,
  type IdGenerator,
  type RuntimeEnvironment,
} from "@docket/runtime";

export const testkitPackage = "@docket/testkit" as const;

export interface DeterministicClock extends Clock {
  advance(milliseconds: number): Date;
  set(instant: string | Date): void;
}

export function createDeterministicClock(
  initialInstant: string | Date,
): DeterministicClock {
  let current = new Date(initialInstant);
  if (Number.isNaN(current.getTime())) throw new TypeError("CLOCK_INVALID");
  return {
    now: () => new Date(current),
    advance: (milliseconds) => {
      if (!Number.isSafeInteger(milliseconds))
        throw new TypeError("CLOCK_ADVANCE_INVALID");
      current = new Date(current.getTime() + milliseconds);
      return new Date(current);
    },
    set: (instant) => {
      const next = new Date(instant);
      if (Number.isNaN(next.getTime())) throw new TypeError("CLOCK_INVALID");
      current = next;
    },
  };
}

function seededRandomBytes(seed: number): (size: number) => Uint8Array {
  if (!Number.isInteger(seed)) throw new TypeError("FIXTURE_SEED_INVALID");
  let state = seed >>> 0;
  if (state === 0) state = 0x6d2b79f5;
  return (size) => {
    const bytes = new Uint8Array(size);
    for (let index = 0; index < size; index += 1) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      bytes[index] = state & 0xff;
    }
    return bytes;
  };
}

export function createDeterministicIdGenerator(
  clock: Clock,
  seed = 1,
): IdGenerator {
  return createUuidV7Generator({
    clock,
    randomBytes: seededRandomBytes(seed),
  });
}

export interface FixedIdentityEvidence {
  readonly clerkUserId: string;
  readonly clerkSessionId: string;
  readonly verifiedEmail: string;
  readonly reverificationId: string;
  readonly authorities: readonly [];
}

export interface FixedIdentityAdapter {
  authenticate(identityKey: "competitor" | "coach"): FixedIdentityEvidence;
}

export function createFixedIdentityAdapter(
  environment: RuntimeEnvironment,
): FixedIdentityAdapter {
  const identities = {
    competitor: {
      clerkUserId: "user_fixture_competitor_001",
      clerkSessionId: "session_fixture_competitor_001",
      verifiedEmail: "competitor-001@identity.example.test",
      reverificationId: "reverification_fixture_001",
      authorities: [],
    },
    coach: {
      clerkUserId: "user_fixture_coach_001",
      clerkSessionId: "session_fixture_coach_001",
      verifiedEmail: "coach-001@identity.example.test",
      reverificationId: "reverification_fixture_002",
      authorities: [],
    },
  } as const;
  assertFixtureAllowed(environment, {
    adapter: "fixed-identity",
    fixtureId: "fixed-identities-v1",
    payload: identities,
  });
  return { authenticate: (identityKey) => identities[identityKey] };
}

export interface CompetitorFixture {
  readonly fixtureId: string;
  readonly competitorId: string;
  readonly displayName: string;
  readonly email: string;
  readonly phone: string;
  readonly canAuthenticate: false;
  readonly authorities: readonly [];
}

export function createCompetitorFixture(
  environment: RuntimeEnvironment,
  idGenerator: IdGenerator,
): CompetitorFixture {
  const fixture: CompetitorFixture = {
    fixtureId: "synthetic-competitor-v1",
    competitorId: idGenerator.next(),
    displayName: "Synthetic Competitor One",
    email: "competitor-001@example.test",
    phone: "+15550101",
    canAuthenticate: false,
    authorities: [],
  };
  assertFixtureAllowed(environment, {
    adapter: "synthetic-competitor",
    fixtureId: fixture.fixtureId,
    payload: fixture,
  });
  return fixture;
}

export interface FakeMailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
}

export interface FakeMailAdapter {
  readonly messages: readonly FakeMailMessage[];
  send(message: FakeMailMessage, correlationId: string): string;
}

export function createFakeMailAdapter(
  environment: RuntimeEnvironment,
  idGenerator: IdGenerator,
  writeLog: (record: AdapterLogRecord) => void = () => undefined,
): FakeMailAdapter {
  assertFixtureAllowed(environment, {
    adapter: "fake-mail",
    fixtureId: "fake-mail-v1",
    payload: {},
  });
  const messages: FakeMailMessage[] = [];
  return {
    messages,
    send: (message, correlationId) => {
      assertFixtureAllowed(environment, {
        adapter: "fake-mail",
        fixtureId: "fake-mail-v1",
        payload: message,
      });
      const messageId = idGenerator.next();
      messages.push({ ...message });
      writeLog(redactedAdapterLogRecord("fake-mail", correlationId));
      return messageId;
    },
  };
}

export interface ProviderFixture {
  complete(
    attemptId: string,
    correlationId: string,
  ): Readonly<{
    attemptId: string;
    providerAccountId: string;
    result: "passed";
  }>;
}

export function createProviderFixture(
  environment: RuntimeEnvironment,
  writeLog: (record: AdapterLogRecord) => void = () => undefined,
): ProviderFixture {
  assertFixtureAllowed(environment, {
    adapter: "provider-fixture",
    fixtureId: "assessment-provider-v1",
    payload: {},
  });
  return {
    complete: (attemptId, correlationId) => {
      const result = {
        attemptId,
        providerAccountId: "provider_fixture_account_001",
        result: "passed" as const,
      };
      assertFixtureAllowed(environment, {
        adapter: "provider-fixture",
        fixtureId: "assessment-provider-v1",
        payload: result,
      });
      writeLog(redactedAdapterLogRecord("provider-fixture", correlationId));
      return result;
    },
  };
}
