export type IdentityErrorCode =
  | "AUTHORITY_STALE"
  | "IDENTITY_INVALID"
  | "SESSION_EXPIRED"
  | "SESSION_LIMIT_REACHED"
  | "FIXED_IDENTITY_FORBIDDEN";

export class IdentityError extends Error {
  constructor(
    readonly code: IdentityErrorCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "IdentityError";
  }
}

export type ClerkSessionEvidence = Readonly<{
  signatureValid: boolean;
  issuer: string;
  audience: readonly string[];
  authorizedParty: string;
  tokenExpiresAt: Date;
  sessionExpiresAt: Date;
  notBefore?: Date;
  sessionStatus: "active" | "inactive";
  userId: string;
  sessionId: string;
  origin: string;
  verifiedEmail: string;
  profileName: string;
  signInMethod: "google" | "verified_email_code";
}>;

export type ClerkSessionPolicy = Readonly<{
  issuer: string;
  audience: string;
  authorizedParties: readonly string[];
  allowedOrigins: readonly string[];
}>;

export type ClerkIdentity = Readonly<{
  userId: string;
  sessionId: string;
  verifiedEmail: string;
  profileName: string;
  signInMethod: ClerkSessionEvidence["signInMethod"] | "unknown";
  expiresAt: Date;
}>;

export function authenticateClerkSession(
  evidence: ClerkSessionEvidence,
  policy: ClerkSessionPolicy,
  now: Date,
): ClerkIdentity {
  if (evidence.tokenExpiresAt.getTime() <= now.getTime()) {
    throw new IdentityError("SESSION_EXPIRED", "the Clerk token expired");
  }
  if (evidence.sessionExpiresAt.getTime() <= now.getTime()) {
    throw new IdentityError("SESSION_EXPIRED", "the Clerk session expired");
  }
  const valid =
    evidence.signatureValid &&
    evidence.issuer === policy.issuer &&
    evidence.audience.includes(policy.audience) &&
    policy.authorizedParties.includes(evidence.authorizedParty) &&
    (!evidence.notBefore || evidence.notBefore.getTime() <= now.getTime()) &&
    evidence.sessionStatus === "active" &&
    evidence.userId.length > 0 &&
    evidence.sessionId.length > 0 &&
    policy.allowedOrigins.includes(evidence.origin) &&
    evidence.verifiedEmail.length > 0;
  if (!valid) {
    throw new IdentityError(
      "IDENTITY_INVALID",
      "the Clerk identity evidence was not accepted",
    );
  }
  return {
    userId: evidence.userId,
    sessionId: evidence.sessionId,
    verifiedEmail: evidence.verifiedEmail,
    profileName: evidence.profileName,
    signInMethod: evidence.signInMethod,
    expiresAt: evidence.sessionExpiresAt,
  };
}

export function authenticateFixedIdentity(
  environment: "development" | "test" | "staging" | "production",
  identity: ClerkIdentity,
): ClerkIdentity {
  if (environment !== "development" && environment !== "test") {
    throw new IdentityError(
      "FIXED_IDENTITY_FORBIDDEN",
      "fixed identity is unavailable outside development and test",
    );
  }
  return identity;
}

export type Account = Readonly<{
  id: string;
  displayName: string;
  verifiedEmail: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ClerkIdentityLink = Readonly<{
  clerkUserId: string;
  accountId: string;
  verifiedEmail: string;
  profileName: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}>;

export type DocketSession = Readonly<{
  id: string;
  accountId: string;
  clerkUserId: string;
  clerkSessionId: string;
  status: "active" | "revoked";
  version: number;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
}>;

export type IdentityEvent = Readonly<{
  id: string;
  name: "AccountCreated" | "SessionCreated" | "SessionRevoked";
  aggregateId: string;
  occurredAt: Date;
  actorAccountId: string;
  version: 1;
}>;

export type CommandReceipt = Readonly<{
  digest: string;
  result: SessionResult;
}>;

export interface IdentityTransaction {
  getLink(clerkUserId: string): Promise<ClerkIdentityLink | undefined>;
  getAccount(accountId: string): Promise<Account | undefined>;
  getSession(sessionId: string): Promise<DocketSession | undefined>;
  findSessionByClerkSessionId(
    clerkSessionId: string,
  ): Promise<DocketSession | undefined>;
  listSessions(accountId: string): Promise<readonly DocketSession[]>;
  getReceipt(key: string): Promise<CommandReceipt | undefined>;
  saveAccount(account: Account): Promise<void>;
  saveLink(link: ClerkIdentityLink): Promise<void>;
  saveSession(session: DocketSession): Promise<void>;
  saveReceipt(key: string, receipt: CommandReceipt): Promise<void>;
  appendEvent(event: IdentityEvent): Promise<void>;
}

export interface IdentityStore {
  transaction<T>(
    work: (transaction: IdentityTransaction) => T | Promise<T>,
  ): Promise<T>;
}

export type IdentityServiceDependencies = Readonly<{
  store: IdentityStore;
  now: () => Date;
  nextId: (kind: "account" | "session" | "event") => string;
}>;

export type AccountProjection = Readonly<{
  id: string;
  displayName: string;
  verifiedEmail: string;
  authority: readonly never[];
  version: number;
}>;

export type SessionProjection = Readonly<{
  id: string;
  status: DocketSession["status"];
  version: number;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
}>;

export type SessionResult = Readonly<{
  account: AccountProjection;
  session: SessionProjection;
  events: readonly IdentityEvent[];
}>;

function accountProjection(account: Account): AccountProjection {
  return {
    id: account.id,
    displayName: account.displayName,
    verifiedEmail: account.verifiedEmail,
    authority: [],
    version: account.version,
  };
}

function sessionProjection(session: DocketSession): SessionProjection {
  return {
    id: session.id,
    status: session.status,
    version: session.version,
    createdAt: session.createdAt.toISOString(),
    lastActivityAt: session.lastActivityAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
  };
}

function commandDigest(value: unknown): string {
  return JSON.stringify(value);
}

function requireMatchingReceipt(
  receipt: CommandReceipt,
  digest: string,
): SessionResult {
  if (receipt.digest !== digest) {
    throw new IdentityError(
      "IDENTITY_INVALID",
      "the idempotency key was reused for a different command",
    );
  }
  return receipt.result;
}

function isActiveSession(session: DocketSession, now: Date): boolean {
  return (
    session.status === "active" && session.expiresAt.getTime() > now.getTime()
  );
}

async function requireCurrentSession(
  transaction: IdentityTransaction,
  identity: ClerkIdentity,
  accountId: string,
  now: Date,
): Promise<DocketSession> {
  const current = await transaction.findSessionByClerkSessionId(
    identity.sessionId,
  );
  if (
    current?.accountId !== accountId ||
    current.clerkUserId !== identity.userId ||
    !isActiveSession(current, now) ||
    identity.expiresAt.getTime() <= now.getTime()
  ) {
    throw new IdentityError(
      "SESSION_EXPIRED",
      "the acting Docket Session is not active",
    );
  }
  return current;
}

export class IdentityService {
  constructor(private readonly dependencies: IdentityServiceDependencies) {}

  async resumeDocketSession(
    input: Readonly<{ userId: string; sessionId: string }>,
  ): Promise<ClerkIdentity> {
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      const link = await transaction.getLink(input.userId);
      const account = link
        ? await transaction.getAccount(link.accountId)
        : undefined;
      const session = await transaction.findSessionByClerkSessionId(
        input.sessionId,
      );
      if (
        !link ||
        !account ||
        session?.accountId !== account.id ||
        session.clerkUserId !== input.userId
      ) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the existing Docket Session is not available",
        );
      }
      if (!isActiveSession(session, now)) {
        throw new IdentityError(
          "SESSION_EXPIRED",
          "the existing Docket Session is not active",
        );
      }
      return {
        userId: input.userId,
        sessionId: input.sessionId,
        verifiedEmail: link.verifiedEmail,
        profileName: link.profileName,
        signInMethod: "unknown",
        expiresAt: session.expiresAt,
      };
    });
  }

  async createDocketSession(
    input: Readonly<{
      identity: ClerkIdentity;
      idempotencyKey: string;
    }>,
  ): Promise<SessionResult> {
    const digest = commandDigest({
      command: "CreateDocketSession",
      userId: input.identity.userId,
      sessionId: input.identity.sessionId,
    });
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      if (input.identity.expiresAt.getTime() <= now.getTime()) {
        throw new IdentityError("SESSION_EXPIRED", "the Clerk session expired");
      }
      const prior = await transaction.getReceipt(input.idempotencyKey);
      if (prior) {
        const link = await transaction.getLink(input.identity.userId);
        if (!link) {
          throw new IdentityError(
            "IDENTITY_INVALID",
            "the Account does not exist",
          );
        }
        await requireCurrentSession(
          transaction,
          input.identity,
          link.accountId,
          now,
        );
        return requireMatchingReceipt(prior, digest);
      }

      let link = await transaction.getLink(input.identity.userId);
      let account: Account;
      const events: IdentityEvent[] = [];
      if (link) {
        const existingAccount = await transaction.getAccount(link.accountId);
        if (!existingAccount) {
          throw new IdentityError(
            "IDENTITY_INVALID",
            "the Clerk identity link has no Account",
          );
        }
        account = existingAccount;
        if (account.verifiedEmail !== input.identity.verifiedEmail) {
          account = {
            ...account,
            verifiedEmail: input.identity.verifiedEmail,
            version: account.version + 1,
            updatedAt: now,
          };
          await transaction.saveAccount(account);
        }
        if (
          link.profileName !== input.identity.profileName ||
          link.verifiedEmail !== input.identity.verifiedEmail
        ) {
          link = {
            ...link,
            profileName: input.identity.profileName,
            verifiedEmail: input.identity.verifiedEmail,
            version: link.version + 1,
            updatedAt: now,
          };
          await transaction.saveLink(link);
        }
      } else {
        const accountId = this.dependencies.nextId("account");
        account = {
          id: accountId,
          displayName: input.identity.profileName,
          verifiedEmail: input.identity.verifiedEmail,
          version: 1,
          createdAt: now,
          updatedAt: now,
        };
        link = {
          clerkUserId: input.identity.userId,
          accountId,
          verifiedEmail: input.identity.verifiedEmail,
          profileName: input.identity.profileName,
          version: 1,
          createdAt: now,
          updatedAt: now,
        };
        await transaction.saveAccount(account);
        await transaction.saveLink(link);
        const event: IdentityEvent = {
          id: this.dependencies.nextId("event"),
          name: "AccountCreated",
          aggregateId: accountId,
          occurredAt: now,
          actorAccountId: accountId,
          version: 1,
        };
        await transaction.appendEvent(event);
        events.push(event);
      }

      const existingSession = await transaction.findSessionByClerkSessionId(
        input.identity.sessionId,
      );
      if (existingSession) {
        if (
          existingSession.accountId !== account.id ||
          existingSession.clerkUserId !== input.identity.userId
        ) {
          throw new IdentityError(
            "IDENTITY_INVALID",
            "the Clerk session is already bound to another Account",
          );
        }
        if (!isActiveSession(existingSession, now)) {
          throw new IdentityError(
            "SESSION_EXPIRED",
            "the Docket Session is not active",
          );
        }
        const result = {
          account: accountProjection(account),
          session: sessionProjection(existingSession),
          events,
        } as const;
        await transaction.saveReceipt(input.idempotencyKey, { digest, result });
        return result;
      }

      const activeSessions = (
        await transaction.listSessions(account.id)
      ).filter((session) => isActiveSession(session, now));
      if (activeSessions.length >= 5) {
        throw new IdentityError(
          "SESSION_LIMIT_REACHED",
          "the Account already has five active ordinary sessions",
        );
      }
      const session: DocketSession = {
        id: this.dependencies.nextId("session"),
        accountId: account.id,
        clerkUserId: input.identity.userId,
        clerkSessionId: input.identity.sessionId,
        status: "active",
        version: 1,
        createdAt: now,
        lastActivityAt: now,
        expiresAt: input.identity.expiresAt,
      };
      await transaction.saveSession(session);
      const event: IdentityEvent = {
        id: this.dependencies.nextId("event"),
        name: "SessionCreated",
        aggregateId: session.id,
        occurredAt: now,
        actorAccountId: account.id,
        version: 1,
      };
      await transaction.appendEvent(event);
      events.push(event);
      const result = {
        account: accountProjection(account),
        session: sessionProjection(session),
        events,
      } as const;
      await transaction.saveReceipt(input.idempotencyKey, { digest, result });
      return result;
    });
  }

  async listDocketSessions(
    identity: ClerkIdentity,
  ): Promise<readonly SessionProjection[]> {
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      const link = await transaction.getLink(identity.userId);
      if (!link) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the Account does not exist",
        );
      }
      await requireCurrentSession(transaction, identity, link.accountId, now);
      return (await transaction.listSessions(link.accountId))
        .map(sessionProjection)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    });
  }

  async revokeDocketSession(
    input: Readonly<{
      identity: ClerkIdentity;
      sessionId: string;
      expectedVersion: number;
      idempotencyKey: string;
    }>,
  ): Promise<SessionResult> {
    const digest = commandDigest({
      command: "RevokeDocketSession",
      actor: input.identity.userId,
      sessionId: input.sessionId,
      expectedVersion: input.expectedVersion,
    });
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      const link = await transaction.getLink(input.identity.userId);
      const account = link
        ? await transaction.getAccount(link.accountId)
        : undefined;
      const target = await transaction.getSession(input.sessionId);
      if (!account || target?.accountId !== account.id) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the session is not available",
        );
      }
      await requireCurrentSession(transaction, input.identity, account.id, now);
      const prior = await transaction.getReceipt(input.idempotencyKey);
      if (prior) return requireMatchingReceipt(prior, digest);
      if (target.version !== input.expectedVersion) {
        throw new IdentityError(
          "AUTHORITY_STALE",
          "the session version is stale",
        );
      }
      if (!isActiveSession(target, now)) {
        throw new IdentityError("SESSION_EXPIRED", "the session is not active");
      }
      const revoked: DocketSession = {
        ...target,
        status: "revoked",
        version: target.version + 1,
        revokedAt: now,
      };
      await transaction.saveSession(revoked);
      const event: IdentityEvent = {
        id: this.dependencies.nextId("event"),
        name: "SessionRevoked",
        aggregateId: revoked.id,
        occurredAt: now,
        actorAccountId: account.id,
        version: 1,
      };
      await transaction.appendEvent(event);
      const result = {
        account: accountProjection(account),
        session: sessionProjection(revoked),
        events: [event],
      } as const;
      await transaction.saveReceipt(input.idempotencyKey, { digest, result });
      return result;
    });
  }
}

interface StoreState {
  accounts: Map<string, Account>;
  links: Map<string, ClerkIdentityLink>;
  sessions: Map<string, DocketSession>;
  receipts: Map<string, CommandReceipt>;
  events: IdentityEvent[];
}

function cloneState(state: StoreState): StoreState {
  return {
    accounts: new Map(state.accounts),
    links: new Map(state.links),
    sessions: new Map(state.sessions),
    receipts: new Map(state.receipts),
    events: [...state.events],
  };
}

export class InMemoryIdentityStore implements IdentityStore {
  private state: StoreState = {
    accounts: new Map(),
    links: new Map(),
    sessions: new Map(),
    receipts: new Map(),
    events: [],
  };
  private tail: Promise<void> = Promise.resolve();
  failBeforeCommit = false;

  async transaction<T>(
    work: (transaction: IdentityTransaction) => T | Promise<T>,
  ): Promise<T> {
    const previous = this.tail;
    let release = (): void => undefined;
    this.tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    const pending = cloneState(this.state);
    const transaction: IdentityTransaction = {
      getLink: (clerkUserId) => Promise.resolve(pending.links.get(clerkUserId)),
      getAccount: (accountId) =>
        Promise.resolve(pending.accounts.get(accountId)),
      getSession: (sessionId) =>
        Promise.resolve(pending.sessions.get(sessionId)),
      findSessionByClerkSessionId: (clerkSessionId) =>
        Promise.resolve(
          [...pending.sessions.values()].find(
            (session) => session.clerkSessionId === clerkSessionId,
          ),
        ),
      listSessions: (accountId) =>
        Promise.resolve(
          [...pending.sessions.values()].filter(
            (session) => session.accountId === accountId,
          ),
        ),
      getReceipt: (key) => Promise.resolve(pending.receipts.get(key)),
      saveAccount: (account) => {
        pending.accounts.set(account.id, account);
        return Promise.resolve();
      },
      saveLink: (link) => {
        const collision = [...pending.links.values()].find(
          (candidate) =>
            candidate.accountId === link.accountId &&
            candidate.clerkUserId !== link.clerkUserId,
        );
        if (collision) {
          throw new IdentityError(
            "IDENTITY_INVALID",
            "one Account cannot be linked to two Clerk identities",
          );
        }
        pending.links.set(link.clerkUserId, link);
        return Promise.resolve();
      },
      saveSession: (session) => {
        pending.sessions.set(session.id, session);
        return Promise.resolve();
      },
      saveReceipt: (key, receipt) => {
        pending.receipts.set(key, receipt);
        return Promise.resolve();
      },
      appendEvent: (event) => {
        pending.events.push(event);
        return Promise.resolve();
      },
    };
    try {
      const result = await work(transaction);
      if (this.failBeforeCommit) {
        throw new Error("simulated persistence failure before commit");
      }
      this.state = pending;
      return result;
    } finally {
      release();
    }
  }

  snapshot(): Readonly<{
    accounts: readonly Account[];
    links: readonly ClerkIdentityLink[];
    sessions: readonly DocketSession[];
    events: readonly IdentityEvent[];
  }> {
    return {
      accounts: [...this.state.accounts.values()],
      links: [...this.state.links.values()],
      sessions: [...this.state.sessions.values()],
      events: [...this.state.events],
    };
  }
}
