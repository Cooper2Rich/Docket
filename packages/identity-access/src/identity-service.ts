export type IdentityErrorCode =
  | "AUTHORITY_STALE"
  | "DISPLAY_NAME_CHANGE_TOO_SOON"
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
  sessionMetadata?: ClerkSessionMetadata;
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
  sessionMetadata?: ClerkSessionMetadata;
}>;

export type ClerkSessionMetadata = Readonly<{
  device: string;
  approximateLocation: string;
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
    ...(evidence.sessionMetadata
      ? { sessionMetadata: evidence.sessionMetadata }
      : {}),
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
  displayNameChangedAt?: Date;
}>;

export type DisplayNameHistory = Readonly<{
  id: string;
  accountId: string;
  displayName: string;
  effectiveAt: Date;
  changeKind: "initial" | "self_service" | "reviewed_correction";
  reviewId?: string;
  approvedByAccountId?: string;
}>;

export type AccountSecurityHistoryKind =
  | "accepted_sign_in"
  | "clerk_reverification"
  | "account_suspension";

export type AccountSecurityHistory = Readonly<{
  id: string;
  accountId: string;
  kind: AccountSecurityHistoryKind;
  occurredAt: Date;
  retainedUntil: Date;
  legalHold: boolean;
  device?: string;
  approximateLocation?: string;
  suspensionStatus?: "imposed" | "reinstated" | "expired";
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

export type DocketSessionClass = "ordinary" | "privileged";

export type PrivilegedContextKind =
  | "platform_administrator"
  | "legal_and_privacy_operations";

/**
 * Trusted output from the Active Role Context owner. The identity module never
 * infers this authority from Clerk data or a client-supplied role name.
 */
export type PrivilegedContextActivationDecision = Readonly<{
  decisionId: string;
  accountId: string;
  clerkSessionId: string;
  contextId: string;
  contextKind: PrivilegedContextKind;
  authorityVersion: number;
  currentAuthorityVersion: number;
  status: "active";
  activation: "switch" | "restore";
}>;

/** Trusted output from the separately owned Platform Administrator review. */
export type ReviewedDisplayNameCorrectionApproval = Readonly<{
  reviewId: string;
  targetAccountId: string;
  approvedByAccountId: string;
  permission: "platform_administrator";
  authorityVersion: number;
  currentAuthorityVersion: number;
  status: "approved";
  decidedAt: Date;
}>;

export type TrustedAccountSecurityHistoryEvidence =
  | Readonly<{
      eventId: string;
      accountId: string;
      kind: "clerk_reverification";
      source: "validated_clerk_reverification";
      signatureValidated: true;
      occurredAt: Date;
    }>
  | Readonly<{
      eventId: string;
      accountId: string;
      kind: "account_suspension";
      source: "account_suspension_workflow";
      decisionVersion: number;
      currentDecisionVersion: number;
      suspensionStatus: "imposed" | "reinstated" | "expired";
      occurredAt: Date;
    }>;

export type DocketSession = Readonly<{
  id: string;
  accountId: string;
  clerkUserId: string;
  clerkSessionId: string;
  sessionClass: DocketSessionClass;
  device: string;
  approximateLocation: string;
  status: "active" | "revoked";
  version: number;
  createdAt: Date;
  lastActivityAt: Date;
  privilegedActivatedAt?: Date;
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

export type ClerkSessionTermination = Readonly<{
  sessionId: string;
  clerkSessionId: string;
  requestedAt: Date;
  attemptCount: number;
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
  listSecurityHistory(
    accountId: string,
    retainedAfter: Date,
  ): Promise<readonly AccountSecurityHistory[]>;
  getSecurityHistory(
    historyId: string,
  ): Promise<AccountSecurityHistory | undefined>;
  getDisplayNameHistory(
    historyId: string,
  ): Promise<DisplayNameHistory | undefined>;
  getReceipt(key: string): Promise<CommandReceipt | undefined>;
  saveAccount(account: Account): Promise<void>;
  saveLink(link: ClerkIdentityLink): Promise<void>;
  saveSession(session: DocketSession): Promise<void>;
  saveSessionActivity(session: DocketSession): Promise<void>;
  appendDisplayNameHistory(history: DisplayNameHistory): Promise<void>;
  appendSecurityHistory(history: AccountSecurityHistory): Promise<void>;
  deleteExpiredSecurityHistory(now: Date): Promise<number>;
  saveReceipt(key: string, receipt: CommandReceipt): Promise<void>;
  appendEvent(event: IdentityEvent): Promise<void>;
  enqueueClerkSessionTermination(
    termination: ClerkSessionTermination,
  ): Promise<void>;
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
  sessionClass: DocketSessionClass;
  device: string;
  approximateLocation: string;
  status: DocketSession["status"] | "expired";
  version: number;
  createdAt: string;
  lastActivityAt: string;
  privilegedActivatedAt?: string;
  inactivityExpiresAt: string;
  expiresAt: string;
}>;

export type SessionResult = Readonly<{
  account: AccountProjection;
  session: SessionProjection;
  events: readonly IdentityEvent[];
  privilegedActivation?: Readonly<{
    decisionId: string;
    contextId: string;
    contextKind: PrivilegedContextKind;
    activation: "switch" | "restore";
    activatedAt: string;
    securityAlert: Readonly<{
      device: string;
      approximateLocation: string;
      occurredAt: string;
    }>;
  }>;
}>;

export type ReviewedDisplayNameCorrectionResult = Readonly<{
  account: AccountProjection;
  history: DisplayNameHistory;
}>;

export type AccountSecurityHistoryProjection = Readonly<{
  id: string;
  kind: AccountSecurityHistoryKind;
  occurredAt: string;
  device?: string;
  approximateLocation?: string;
  suspensionStatus?: "imposed" | "reinstated" | "expired";
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

const sessionPolicy = {
  ordinary: {
    inactivityMilliseconds: 12 * 60 * 60 * 1_000,
    absoluteMilliseconds: 7 * 24 * 60 * 60 * 1_000,
    concurrency: 5,
  },
  privileged: {
    inactivityMilliseconds: 30 * 60 * 1_000,
    absoluteMilliseconds: 12 * 60 * 60 * 1_000,
    concurrency: 1,
  },
} as const satisfies Record<
  DocketSessionClass,
  Readonly<{
    inactivityMilliseconds: number;
    absoluteMilliseconds: number;
    concurrency: number;
  }>
>;

function inactivityExpiresAt(session: DocketSession): Date {
  return new Date(
    session.lastActivityAt.getTime() +
      sessionPolicy[session.sessionClass].inactivityMilliseconds,
  );
}

function absoluteExpiresAt(session: DocketSession): Date {
  return new Date(
    Math.min(
      session.expiresAt.getTime(),
      session.createdAt.getTime() +
        sessionPolicy[session.sessionClass].absoluteMilliseconds,
    ),
  );
}

function sessionProjection(
  session: DocketSession,
  now: Date,
): SessionProjection {
  return {
    id: session.id,
    sessionClass: session.sessionClass,
    device: session.device,
    approximateLocation: session.approximateLocation,
    status:
      session.status === "active" && !isActiveSession(session, now)
        ? "expired"
        : session.status,
    version: session.version,
    createdAt: session.createdAt.toISOString(),
    lastActivityAt: session.lastActivityAt.toISOString(),
    ...(session.privilegedActivatedAt
      ? { privilegedActivatedAt: session.privilegedActivatedAt.toISOString() }
      : {}),
    inactivityExpiresAt: inactivityExpiresAt(session).toISOString(),
    expiresAt: absoluteExpiresAt(session).toISOString(),
  };
}

function commandDigest(value: unknown): string {
  return JSON.stringify(value);
}

function hasLiteral(value: unknown, expected: string): boolean {
  return value === expected;
}

function hasTrustedTrue(value: unknown): boolean {
  return value === true;
}

const displayNameChangeMilliseconds = 30 * 24 * 60 * 60 * 1_000;

function securityHistoryRetentionEnd(occurredAt: Date): Date {
  const targetYear = occurredAt.getUTCFullYear() + 2;
  const month = occurredAt.getUTCMonth();
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetYear, month + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(
      targetYear,
      month,
      Math.min(occurredAt.getUTCDate(), lastDayOfTargetMonth),
      occurredAt.getUTCHours(),
      occurredAt.getUTCMinutes(),
      occurredAt.getUTCSeconds(),
      occurredAt.getUTCMilliseconds(),
    ),
  );
}

function securityHistoryProjection(
  history: AccountSecurityHistory,
): AccountSecurityHistoryProjection {
  return {
    id: history.id,
    kind: history.kind,
    occurredAt: history.occurredAt.toISOString(),
    ...(history.device ? { device: history.device } : {}),
    ...(history.approximateLocation
      ? { approximateLocation: history.approximateLocation }
      : {}),
    ...(history.suspensionStatus
      ? { suspensionStatus: history.suspensionStatus }
      : {}),
  };
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

function requireCurrentDecision(
  authorityVersion: number,
  currentAuthorityVersion: number,
): void {
  if (
    !Number.isInteger(authorityVersion) ||
    authorityVersion < 1 ||
    authorityVersion !== currentAuthorityVersion
  ) {
    throw new IdentityError(
      "AUTHORITY_STALE",
      "the trusted authority decision is stale",
    );
  }
}

function sameSecurityHistoryEvent(
  left: AccountSecurityHistory,
  right: AccountSecurityHistory,
): boolean {
  return (
    left.id === right.id &&
    left.accountId === right.accountId &&
    left.kind === right.kind &&
    left.occurredAt.getTime() === right.occurredAt.getTime() &&
    left.device === right.device &&
    left.approximateLocation === right.approximateLocation &&
    left.suspensionStatus === right.suspensionStatus
  );
}

function isActiveSession(session: DocketSession, now: Date): boolean {
  return (
    session.status === "active" &&
    absoluteExpiresAt(session).getTime() > now.getTime() &&
    inactivityExpiresAt(session).getTime() > now.getTime()
  );
}

function effectiveAbsoluteExpiry(
  identity: ClerkIdentity,
  sessionClass: DocketSessionClass,
  now: Date,
): Date {
  return new Date(
    Math.min(
      identity.expiresAt.getTime(),
      now.getTime() + sessionPolicy[sessionClass].absoluteMilliseconds,
    ),
  );
}

async function touchActiveSession(
  transaction: IdentityTransaction,
  session: DocketSession,
  now: Date,
): Promise<DocketSession> {
  if (session.lastActivityAt.getTime() >= now.getTime()) return session;
  const touched = {
    ...session,
    lastActivityAt: now,
  } satisfies DocketSession;
  await transaction.saveSessionActivity(touched);
  return touched;
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
  return touchActiveSession(transaction, current, now);
}

async function revokeSession(
  transaction: IdentityTransaction,
  session: DocketSession,
  actorAccountId: string,
  now: Date,
  nextEventId: () => string,
): Promise<Readonly<{ session: DocketSession; event: IdentityEvent }>> {
  const revoked: DocketSession = {
    ...session,
    status: "revoked",
    version: session.version + 1,
    revokedAt: now,
  };
  await transaction.saveSession(revoked);
  await transaction.enqueueClerkSessionTermination({
    sessionId: revoked.id,
    clerkSessionId: revoked.clerkSessionId,
    requestedAt: now,
    attemptCount: 0,
  });
  const event: IdentityEvent = {
    id: nextEventId(),
    name: "SessionRevoked",
    aggregateId: revoked.id,
    occurredAt: now,
    actorAccountId,
    version: 1,
  };
  await transaction.appendEvent(event);
  return { session: revoked, event };
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
      const touched = await touchActiveSession(transaction, session, now);
      return {
        userId: input.userId,
        sessionId: input.sessionId,
        verifiedEmail: link.verifiedEmail,
        profileName: link.profileName,
        signInMethod: "unknown",
        expiresAt: touched.expiresAt,
      };
    });
  }

  async createDocketSession(
    input: Readonly<{
      identity: ClerkIdentity;
      idempotencyKey: string;
      device?: string;
      approximateLocation?: string;
    }>,
  ): Promise<SessionResult> {
    const sessionClass = "ordinary" as const;
    const device =
      input.device ??
      input.identity.sessionMetadata?.device ??
      "Unknown device";
    const approximateLocation =
      input.approximateLocation ??
      input.identity.sessionMetadata?.approximateLocation ??
      "Approximate location unavailable";
    const digest = commandDigest({
      command: "CreateDocketSession",
      userId: input.identity.userId,
      sessionId: input.identity.sessionId,
      sessionClass,
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
        await transaction.appendDisplayNameHistory({
          id: this.dependencies.nextId("event"),
          accountId,
          displayName: account.displayName,
          effectiveAt: now,
          changeKind: "initial",
        });
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
        const touched = await touchActiveSession(
          transaction,
          existingSession,
          now,
        );
        const result = {
          account: accountProjection(account),
          session: sessionProjection(touched, now),
          events,
        } as const;
        await transaction.saveReceipt(input.idempotencyKey, { digest, result });
        return result;
      }

      const activeSessions = (await transaction.listSessions(account.id))
        .filter(
          (session) =>
            session.sessionClass === sessionClass &&
            isActiveSession(session, now),
        )
        .sort(
          (left, right) =>
            left.createdAt.getTime() - right.createdAt.getTime() ||
            left.id.localeCompare(right.id),
        );
      const sessionsToEnd = Math.max(
        0,
        activeSessions.length - sessionPolicy[sessionClass].concurrency + 1,
      );
      for (const oldest of activeSessions.slice(0, sessionsToEnd)) {
        const { event } = await revokeSession(
          transaction,
          oldest,
          account.id,
          now,
          () => this.dependencies.nextId("event"),
        );
        events.push(event);
      }
      const session: DocketSession = {
        id: this.dependencies.nextId("session"),
        accountId: account.id,
        clerkUserId: input.identity.userId,
        clerkSessionId: input.identity.sessionId,
        sessionClass,
        device,
        approximateLocation,
        status: "active",
        version: 1,
        createdAt: now,
        lastActivityAt: now,
        expiresAt: effectiveAbsoluteExpiry(input.identity, sessionClass, now),
      };
      await transaction.saveSession(session);
      await transaction.appendSecurityHistory({
        id: this.dependencies.nextId("event"),
        accountId: account.id,
        kind: "accepted_sign_in",
        occurredAt: now,
        retainedUntil: securityHistoryRetentionEnd(now),
        legalHold: false,
        device,
        approximateLocation,
      });
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
        session: sessionProjection(session, now),
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
        .map((session) => sessionProjection(session, now))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    });
  }

  async listAccountSecurityHistory(
    identity: ClerkIdentity,
  ): Promise<readonly AccountSecurityHistoryProjection[]> {
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
      return (await transaction.listSecurityHistory(link.accountId, now)).map(
        securityHistoryProjection,
      );
    });
  }

  async getAccountProfile(identity: ClerkIdentity): Promise<AccountProjection> {
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      const link = await transaction.getLink(identity.userId);
      const account = link
        ? await transaction.getAccount(link.accountId)
        : undefined;
      if (!account) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the Account does not exist",
        );
      }
      await requireCurrentSession(transaction, identity, account.id, now);
      return accountProjection(account);
    });
  }

  async changeDisplayName(
    input: Readonly<{
      identity: ClerkIdentity;
      displayName: string;
      expectedVersion: number;
      idempotencyKey: string;
    }>,
  ): Promise<SessionResult> {
    const displayName = input.displayName.trim();
    const digest = commandDigest({
      command: "ChangeDisplayName",
      actor: input.identity.userId,
      displayName,
      expectedVersion: input.expectedVersion,
    });
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      const link = await transaction.getLink(input.identity.userId);
      const account = link
        ? await transaction.getAccount(link.accountId)
        : undefined;
      if (!account) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the Account does not exist",
        );
      }
      const current = await requireCurrentSession(
        transaction,
        input.identity,
        account.id,
        now,
      );
      const prior = await transaction.getReceipt(input.idempotencyKey);
      if (prior) return requireMatchingReceipt(prior, digest);
      if (
        displayName.length < 1 ||
        displayName.length > 128 ||
        displayName === account.displayName
      ) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the requested Docket Display Name is invalid",
        );
      }
      if (account.version !== input.expectedVersion) {
        throw new IdentityError(
          "AUTHORITY_STALE",
          "the Account version is stale",
        );
      }
      if (
        account.displayNameChangedAt &&
        account.displayNameChangedAt.getTime() + displayNameChangeMilliseconds >
          now.getTime()
      ) {
        throw new IdentityError(
          "DISPLAY_NAME_CHANGE_TOO_SOON",
          "the Docket Display Name may be changed once every 30 days",
        );
      }
      const changed: Account = {
        ...account,
        displayName,
        version: account.version + 1,
        updatedAt: now,
        displayNameChangedAt: now,
      };
      await transaction.saveAccount(changed);
      await transaction.appendDisplayNameHistory({
        id: this.dependencies.nextId("event"),
        accountId: account.id,
        displayName,
        effectiveAt: now,
        changeKind: "self_service",
      });
      const result = {
        account: accountProjection(changed),
        session: sessionProjection(current, now),
        events: [],
      } as const;
      await transaction.saveReceipt(input.idempotencyKey, { digest, result });
      return result;
    });
  }

  async changeDisplayNameAfterReviewedCorrection(
    input: Readonly<{
      displayName: string;
      expectedVersion: number;
      approval: ReviewedDisplayNameCorrectionApproval;
    }>,
  ): Promise<ReviewedDisplayNameCorrectionResult> {
    const displayName = input.displayName.trim();
    const historyId = `display-name-review:${input.approval.reviewId}`;
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      requireCurrentDecision(
        input.approval.authorityVersion,
        input.approval.currentAuthorityVersion,
      );
      if (
        !hasLiteral(input.approval.status, "approved") ||
        !hasLiteral(input.approval.permission, "platform_administrator") ||
        input.approval.decidedAt.getTime() > now.getTime()
      ) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the reviewed Display Name correction was not accepted",
        );
      }
      const account = await transaction.getAccount(
        input.approval.targetAccountId,
      );
      if (!account) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the Account does not exist",
        );
      }
      const prior = await transaction.getDisplayNameHistory(historyId);
      if (prior) {
        if (
          prior.accountId !== account.id ||
          prior.displayName !== displayName ||
          prior.changeKind !== "reviewed_correction" ||
          prior.reviewId !== input.approval.reviewId ||
          prior.approvedByAccountId !== input.approval.approvedByAccountId
        ) {
          throw new IdentityError(
            "IDENTITY_INVALID",
            "the review identifier was reused for a different correction",
          );
        }
        return { account: accountProjection(account), history: prior };
      }
      if (
        displayName.length < 1 ||
        displayName.length > 128 ||
        displayName === account.displayName
      ) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the requested Docket Display Name is invalid",
        );
      }
      if (account.version !== input.expectedVersion) {
        throw new IdentityError(
          "AUTHORITY_STALE",
          "the Account version is stale",
        );
      }
      const changed: Account = {
        ...account,
        displayName,
        version: account.version + 1,
        updatedAt: now,
        displayNameChangedAt: now,
      };
      const history: DisplayNameHistory = {
        id: historyId,
        accountId: account.id,
        displayName,
        effectiveAt: now,
        changeKind: "reviewed_correction",
        reviewId: input.approval.reviewId,
        approvedByAccountId: input.approval.approvedByAccountId,
      };
      await transaction.saveAccount(changed);
      await transaction.appendDisplayNameHistory(history);
      return { account: accountProjection(changed), history };
    });
  }

  async recordTrustedAccountSecurityHistory(
    evidence: TrustedAccountSecurityHistoryEvidence,
  ): Promise<AccountSecurityHistoryProjection> {
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      if (
        !evidence.eventId ||
        !evidence.accountId ||
        evidence.occurredAt.getTime() > now.getTime()
      ) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the Account Security History evidence was not accepted",
        );
      }
      if (evidence.kind === "clerk_reverification") {
        if (
          !hasLiteral(evidence.source, "validated_clerk_reverification") ||
          !hasTrustedTrue(evidence.signatureValidated)
        ) {
          throw new IdentityError(
            "IDENTITY_INVALID",
            "the Clerk reverification evidence was not accepted",
          );
        }
      } else {
        if (!hasLiteral(evidence.source, "account_suspension_workflow")) {
          throw new IdentityError(
            "IDENTITY_INVALID",
            "the Account suspension evidence was not accepted",
          );
        }
        requireCurrentDecision(
          evidence.decisionVersion,
          evidence.currentDecisionVersion,
        );
      }
      if (!(await transaction.getAccount(evidence.accountId))) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the Account does not exist",
        );
      }
      const history: AccountSecurityHistory = {
        id: evidence.eventId,
        accountId: evidence.accountId,
        kind: evidence.kind,
        occurredAt: evidence.occurredAt,
        retainedUntil: securityHistoryRetentionEnd(evidence.occurredAt),
        legalHold: false,
        ...(evidence.kind === "account_suspension"
          ? { suspensionStatus: evidence.suspensionStatus }
          : {}),
      };
      const prior = await transaction.getSecurityHistory(history.id);
      if (prior) {
        if (!sameSecurityHistoryEvent(prior, history)) {
          throw new IdentityError(
            "IDENTITY_INVALID",
            "the history event identifier was reused for different evidence",
          );
        }
        return securityHistoryProjection(prior);
      }
      await transaction.appendSecurityHistory(history);
      return securityHistoryProjection(history);
    });
  }

  async activatePrivilegedDocketSession(
    input: Readonly<{
      identity: ClerkIdentity;
      authorization: PrivilegedContextActivationDecision;
      expectedVersion: number;
      idempotencyKey: string;
    }>,
  ): Promise<SessionResult> {
    const digest = commandDigest({
      command: "ActivatePrivilegedDocketSession",
      actor: input.identity.userId,
      authorization: input.authorization,
      expectedVersion: input.expectedVersion,
    });
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      const link = await transaction.getLink(input.identity.userId);
      const account = link
        ? await transaction.getAccount(link.accountId)
        : undefined;
      if (!account) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the Account does not exist",
        );
      }
      const current = await requireCurrentSession(
        transaction,
        input.identity,
        account.id,
        now,
      );
      const authorization = input.authorization;
      requireCurrentDecision(
        authorization.authorityVersion,
        authorization.currentAuthorityVersion,
      );
      if (
        !hasLiteral(authorization.status, "active") ||
        authorization.accountId !== account.id ||
        authorization.clerkSessionId !== input.identity.sessionId ||
        !authorization.decisionId ||
        !authorization.contextId
      ) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the privileged context decision was not accepted",
        );
      }
      const prior = await transaction.getReceipt(input.idempotencyKey);
      if (prior) return requireMatchingReceipt(prior, digest);
      if (current.version !== input.expectedVersion) {
        throw new IdentityError(
          "AUTHORITY_STALE",
          "the Docket Session version is stale",
        );
      }
      const privilegedExpiry = new Date(
        Math.min(
          current.expiresAt.getTime(),
          current.createdAt.getTime() +
            sessionPolicy.privileged.absoluteMilliseconds,
        ),
      );
      if (privilegedExpiry.getTime() <= now.getTime()) {
        throw new IdentityError(
          "SESSION_EXPIRED",
          "the Docket Session is too old for privileged activation",
        );
      }
      const events: IdentityEvent[] = [];
      for (const session of await transaction.listSessions(account.id)) {
        if (
          session.id === current.id ||
          session.sessionClass !== "privileged" ||
          !isActiveSession(session, now)
        ) {
          continue;
        }
        const revoked = await revokeSession(
          transaction,
          session,
          account.id,
          now,
          () => this.dependencies.nextId("event"),
        );
        events.push(revoked.event);
      }
      const activated: DocketSession = {
        ...current,
        sessionClass: "privileged",
        version: current.version + 1,
        lastActivityAt: now,
        privilegedActivatedAt: now,
        expiresAt: privilegedExpiry,
      };
      await transaction.saveSession(activated);
      const activatedAt = now.toISOString();
      const result: SessionResult = {
        account: accountProjection(account),
        session: sessionProjection(activated, now),
        events,
        privilegedActivation: {
          decisionId: authorization.decisionId,
          contextId: authorization.contextId,
          contextKind: authorization.contextKind,
          activation: authorization.activation,
          activatedAt,
          securityAlert: {
            device: activated.device,
            approximateLocation: activated.approximateLocation,
            occurredAt: activatedAt,
          },
        },
      };
      await transaction.saveReceipt(input.idempotencyKey, { digest, result });
      return result;
    });
  }

  async deleteExpiredAccountSecurityHistory(): Promise<number> {
    return this.dependencies.store.transaction((transaction) =>
      transaction.deleteExpiredSecurityHistory(this.dependencies.now()),
    );
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
      const { session: revoked, event } = await revokeSession(
        transaction,
        target,
        account.id,
        now,
        () => this.dependencies.nextId("event"),
      );
      const result = {
        account: accountProjection(account),
        session: sessionProjection(revoked, now),
        events: [event],
      } as const;
      await transaction.saveReceipt(input.idempotencyKey, { digest, result });
      return result;
    });
  }

  async revokeAllDocketSessions(
    input: Readonly<{
      identity: ClerkIdentity;
      idempotencyKey: string;
    }>,
  ): Promise<SessionResult> {
    const digest = commandDigest({
      command: "RevokeAllDocketSessions",
      actor: input.identity.userId,
    });
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      const link = await transaction.getLink(input.identity.userId);
      const account = link
        ? await transaction.getAccount(link.accountId)
        : undefined;
      if (!account) {
        throw new IdentityError(
          "IDENTITY_INVALID",
          "the Account does not exist",
        );
      }
      const current = await requireCurrentSession(
        transaction,
        input.identity,
        account.id,
        now,
      );
      const prior = await transaction.getReceipt(input.idempotencyKey);
      if (prior) return requireMatchingReceipt(prior, digest);
      const events: IdentityEvent[] = [];
      let revokedCurrent: DocketSession | undefined;
      for (const session of await transaction.listSessions(account.id)) {
        if (session.status !== "active") continue;
        const revoked = await revokeSession(
          transaction,
          session,
          account.id,
          now,
          () => this.dependencies.nextId("event"),
        );
        events.push(revoked.event);
        if (session.id === current.id) revokedCurrent = revoked.session;
      }
      if (!revokedCurrent) {
        throw new IdentityError(
          "AUTHORITY_STALE",
          "the acting Docket Session changed concurrently",
        );
      }
      const result = {
        account: accountProjection(account),
        session: sessionProjection(revokedCurrent, now),
        events,
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
  clerkSessionTerminations: Map<string, ClerkSessionTermination>;
  displayNameHistory: DisplayNameHistory[];
  securityHistory: AccountSecurityHistory[];
}

function cloneState(state: StoreState): StoreState {
  return {
    accounts: new Map(state.accounts),
    links: new Map(state.links),
    sessions: new Map(state.sessions),
    receipts: new Map(state.receipts),
    events: [...state.events],
    clerkSessionTerminations: new Map(state.clerkSessionTerminations),
    displayNameHistory: [...state.displayNameHistory],
    securityHistory: [...state.securityHistory],
  };
}

export class InMemoryIdentityStore implements IdentityStore {
  private state: StoreState = {
    accounts: new Map(),
    links: new Map(),
    sessions: new Map(),
    receipts: new Map(),
    events: [],
    clerkSessionTerminations: new Map(),
    displayNameHistory: [],
    securityHistory: [],
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
      listSecurityHistory: (accountId, retainedAfter) =>
        Promise.resolve(
          pending.securityHistory
            .filter(
              (history) =>
                history.accountId === accountId &&
                history.retainedUntil.getTime() > retainedAfter.getTime(),
            )
            .sort(
              (left, right) =>
                right.occurredAt.getTime() - left.occurredAt.getTime() ||
                left.id.localeCompare(right.id),
            ),
        ),
      getSecurityHistory: (historyId) =>
        Promise.resolve(
          pending.securityHistory.find((history) => history.id === historyId),
        ),
      getDisplayNameHistory: (historyId) =>
        Promise.resolve(
          pending.displayNameHistory.find(
            (history) => history.id === historyId,
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
      saveSessionActivity: (session) => {
        const current = pending.sessions.get(session.id);
        if (
          current?.status !== "active" ||
          current.version !== session.version
        ) {
          throw new IdentityError(
            "AUTHORITY_STALE",
            "Docket Session changed concurrently",
          );
        }
        pending.sessions.set(session.id, session);
        return Promise.resolve();
      },
      appendDisplayNameHistory: (history) => {
        pending.displayNameHistory.push(history);
        return Promise.resolve();
      },
      appendSecurityHistory: (history) => {
        pending.securityHistory.push(history);
        return Promise.resolve();
      },
      deleteExpiredSecurityHistory: (retentionTime) => {
        const retained = pending.securityHistory.filter(
          (history) =>
            history.legalHold ||
            history.retainedUntil.getTime() > retentionTime.getTime(),
        );
        const deleted = pending.securityHistory.length - retained.length;
        pending.securityHistory = retained;
        return Promise.resolve(deleted);
      },
      saveReceipt: (key, receipt) => {
        pending.receipts.set(key, receipt);
        return Promise.resolve();
      },
      appendEvent: (event) => {
        pending.events.push(event);
        return Promise.resolve();
      },
      enqueueClerkSessionTermination: (termination) => {
        pending.clerkSessionTerminations.set(
          termination.sessionId,
          termination,
        );
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
    clerkSessionTerminations: readonly ClerkSessionTermination[];
    displayNameHistory: readonly DisplayNameHistory[];
    securityHistory: readonly AccountSecurityHistory[];
  }> {
    return {
      accounts: [...this.state.accounts.values()],
      links: [...this.state.links.values()],
      sessions: [...this.state.sessions.values()],
      events: [...this.state.events],
      clerkSessionTerminations: [
        ...this.state.clerkSessionTerminations.values(),
      ],
      displayNameHistory: [...this.state.displayNameHistory],
      securityHistory: [...this.state.securityHistory],
    };
  }
}
