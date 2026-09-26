import { createHash } from "node:crypto";

export type RoleContextErrorCode =
  | "AUTHORITY_DENIED"
  | "CONTEXT_STALE"
  | "REAUTHENTICATION_REQUIRED"
  | "ROLE_SWITCH_BLOCKED";

export class RoleContextError extends Error {
  constructor(
    readonly code: RoleContextErrorCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "RoleContextError";
  }
}

export type RoleContextKind =
  | "school"
  | "tournament"
  | "judge"
  | "platform_administrator"
  | "legal_and_privacy_operations";

export type AuthorityGrant = Readonly<{
  id: string;
  accountId: string;
  contextKind: RoleContextKind;
  scopeId: string;
  scopeLabel: string;
  permissions: readonly string[];
  privileged: boolean;
  status: "active" | "revoked";
  version: number;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ActiveRoleContext = Readonly<{
  id: string;
  accountId: string;
  docketSessionId: string;
  tabId: string;
  grantId: string;
  authorityVersion: number;
  status: "active" | "exited";
  version: number;
  enteredAt: Date;
  exitedAt?: Date;
}>;

export type RoleContextEvent = Readonly<{
  id: string;
  name: "RoleContextEntered" | "RoleContextExited" | "AuthorityInvalidated";
  accountId: string;
  contextId: string;
  grantId: string;
  occurredAt: Date;
  retentionClass: "routine_two_year" | "restricted_seven_year";
}>;

export type ClerkReverificationEvidence = Readonly<{
  verificationId: string;
  clerkSessionId: string;
  signatureValidated: boolean;
  verifiedAt: Date;
}>;

export type ReauthenticationEvent = Readonly<{
  id: string;
  accountId: string;
  docketSessionId: string;
  clerkSessionId: string;
  verificationId: string;
  commandId: string;
  occurredAt: Date;
  retainedUntil: Date;
}>;

export type PrivilegedContextRestoredAlert = Readonly<{
  id: string;
  accountId: string;
  docketSessionId: string;
  contextId: string;
  contextKind: "platform_administrator" | "legal_and_privacy_operations";
  scopeLabel: string;
  device: string;
  approximateLocation: string;
  restoredAt: Date;
  terminationPath: "/account/sessions";
  attemptCount: number;
}>;

export type RoleContextActor = Readonly<{
  accountId: string;
  docketSessionId: string;
  clerkSessionId: string;
  device: string;
  approximateLocation: string;
}>;

export type RoleContextProjection = Readonly<{
  id: string;
  grantId: string;
  contextKind: RoleContextKind;
  scopeId: string;
  scopeLabel: string;
  privileged: boolean;
  authorityVersion: number;
  version: number;
}>;

export type RoleContextOption = Readonly<{
  grantId: string;
  contextKind: RoleContextKind;
  scopeId: string;
  scopeLabel: string;
  privileged: boolean;
  authorityVersion: number;
}>;

export type RoleContextState = Readonly<{
  contexts: readonly RoleContextOption[];
  current?: RoleContextProjection;
}>;

export type EnterRoleContextResult = Readonly<{
  context: RoleContextProjection;
  cacheInvalidation: Readonly<{
    previousContextId?: string;
    destroyProtectedCache: true;
    closeOpenViews: true;
  }>;
  events: readonly RoleContextEvent[];
}>;

export type LeaveRoleContextResult = Readonly<{
  cacheInvalidation: Readonly<{
    previousContextId: string;
    destroyProtectedCache: true;
    closeOpenViews: true;
  }>;
  events: readonly RoleContextEvent[];
}>;

type EnterReceipt = Readonly<{
  digest: string;
  result: EnterRoleContextResult;
}>;

export interface RoleContextTransaction {
  getGrant(grantId: string): Promise<AuthorityGrant | undefined>;
  listGrants(accountId: string): Promise<readonly AuthorityGrant[]>;
  getActiveContext(
    accountId: string,
    docketSessionId: string,
    tabId: string,
  ): Promise<ActiveRoleContext | undefined>;
  getContext(contextId: string): Promise<ActiveRoleContext | undefined>;
  saveContext(context: ActiveRoleContext): Promise<void>;
  getRememberedGrant(accountId: string): Promise<string | undefined>;
  saveRememberedGrant(
    accountId: string,
    grantId: string | undefined,
  ): Promise<void>;
  getReauthenticationEvent(
    verificationId: string,
  ): Promise<ReauthenticationEvent | undefined>;
  saveReauthenticationEvent(event: ReauthenticationEvent): Promise<void>;
  getEnterReceipt(key: string): Promise<EnterReceipt | undefined>;
  saveEnterReceipt(key: string, receipt: EnterReceipt): Promise<void>;
  appendEvent(event: RoleContextEvent): Promise<void>;
  enqueuePrivilegedContextRestoredAlert(
    alert: PrivilegedContextRestoredAlert,
  ): Promise<void>;
}

export interface RoleContextStore {
  transaction<T>(
    work: (transaction: RoleContextTransaction) => T | Promise<T>,
  ): Promise<T>;
}

export type RoleContextServiceDependencies = Readonly<{
  store: RoleContextStore;
  now: () => Date;
  nextId: (
    kind: "context" | "event" | "reauthentication" | "security-alert",
  ) => string;
}>;

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function project(
  context: ActiveRoleContext,
  grant: AuthorityGrant,
): RoleContextProjection {
  return {
    id: context.id,
    grantId: grant.id,
    contextKind: grant.contextKind,
    scopeId: grant.scopeId,
    scopeLabel: grant.scopeLabel,
    privileged: grant.privileged,
    authorityVersion: grant.version,
    version: context.version,
  };
}

function requireCurrentGrant(
  grant: AuthorityGrant | undefined,
  actor: RoleContextActor,
): AuthorityGrant {
  if (grant?.accountId !== actor.accountId) {
    throw new RoleContextError(
      "AUTHORITY_DENIED",
      "the requested role context is unavailable",
    );
  }
  if (grant.status !== "active") {
    throw new RoleContextError(
      "CONTEXT_STALE",
      "the role-context authority is no longer current",
    );
  }
  return grant;
}

function retentionClass(grant: AuthorityGrant) {
  return grant.privileged
    ? ("restricted_seven_year" as const)
    : ("routine_two_year" as const);
}

function addUtcYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setUTCFullYear(result.getUTCFullYear() + years);
  return result;
}

export class RoleContextService {
  constructor(private readonly dependencies: RoleContextServiceDependencies) {}

  async listAvailableContexts(
    actor: RoleContextActor,
  ): Promise<readonly AuthorityGrant[]> {
    return this.dependencies.store.transaction(async (transaction) =>
      (await transaction.listGrants(actor.accountId)).filter(
        (grant) => grant.status === "active",
      ),
    );
  }

  async getRoleContextState(
    actor: RoleContextActor,
    tabId: string,
  ): Promise<RoleContextState> {
    return this.dependencies.store.transaction(async (transaction) => {
      const contexts = (await transaction.listGrants(actor.accountId))
        .filter((grant) => grant.status === "active")
        .map((grant) => ({
          grantId: grant.id,
          contextKind: grant.contextKind,
          scopeId: grant.scopeId,
          scopeLabel: grant.scopeLabel,
          privileged: grant.privileged,
          authorityVersion: grant.version,
        }));
      const current = await transaction.getActiveContext(
        actor.accountId,
        actor.docketSessionId,
        tabId,
      );
      if (!current) return { contexts };
      const grant = requireCurrentGrant(
        await transaction.getGrant(current.grantId),
        actor,
      );
      if (grant.version !== current.authorityVersion) {
        throw new RoleContextError(
          "CONTEXT_STALE",
          "the active role context no longer matches current authority",
        );
      }
      return { contexts, current: project(current, grant) };
    });
  }

  async inspectDeepLink(
    actor: RoleContextActor,
    tabId: string,
    requiredGrantId: string,
  ): Promise<"current" | "switch_required" | "denied"> {
    return this.dependencies.store.transaction(async (transaction) => {
      const required = await transaction.getGrant(requiredGrantId);
      if (
        required?.accountId !== actor.accountId ||
        required.status !== "active"
      ) {
        return "denied";
      }
      const current = await transaction.getActiveContext(
        actor.accountId,
        actor.docketSessionId,
        tabId,
      );
      return current?.grantId === required.id ? "current" : "switch_required";
    });
  }

  async restoreMostRecentContext(
    actor: RoleContextActor,
    tabId: string,
    idempotencyKey: string,
  ): Promise<EnterRoleContextResult | undefined> {
    const remembered = await this.dependencies.store.transaction(
      (transaction) => transaction.getRememberedGrant(actor.accountId),
    );
    if (!remembered) return undefined;
    try {
      return await this.enterActiveRoleContext({
        actor,
        tabId,
        grantId: remembered,
        switchDecision: "discard",
        activation: "restore",
        idempotencyKey,
      });
    } catch (error) {
      if (
        error instanceof RoleContextError &&
        (error.code === "AUTHORITY_DENIED" || error.code === "CONTEXT_STALE")
      ) {
        await this.dependencies.store.transaction((transaction) =>
          transaction.saveRememberedGrant(actor.accountId, undefined),
        );
        return undefined;
      }
      throw error;
    }
  }

  async enterActiveRoleContext(
    input: Readonly<{
      actor: RoleContextActor;
      tabId: string;
      grantId: string;
      switchDecision: "save" | "discard" | "cancel";
      activation?: "switch" | "restore";
      expectedCurrentContextId?: string;
      expectedCurrentVersion?: number;
      idempotencyKey: string;
    }>,
  ): Promise<EnterRoleContextResult> {
    if (input.switchDecision === "cancel") {
      throw new RoleContextError(
        "ROLE_SWITCH_BLOCKED",
        "the role-context switch was cancelled with unsaved work",
      );
    }
    const commandDigest = digest({
      command: "EnterActiveRoleContext",
      actor: input.actor.accountId,
      session: input.actor.docketSessionId,
      tabId: input.tabId,
      grantId: input.grantId,
      switchDecision: input.switchDecision,
      activation: input.activation ?? "switch",
      expectedCurrentContextId: input.expectedCurrentContextId,
      expectedCurrentVersion: input.expectedCurrentVersion,
    });
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      const grant = requireCurrentGrant(
        await transaction.getGrant(input.grantId),
        input.actor,
      );
      const current = await transaction.getActiveContext(
        input.actor.accountId,
        input.actor.docketSessionId,
        input.tabId,
      );
      if (
        (input.expectedCurrentContextId !== undefined &&
          current?.id !== input.expectedCurrentContextId) ||
        (input.expectedCurrentVersion !== undefined &&
          current?.version !== input.expectedCurrentVersion)
      ) {
        throw new RoleContextError(
          "CONTEXT_STALE",
          "the active role context changed concurrently",
        );
      }
      const prior = await transaction.getEnterReceipt(input.idempotencyKey);
      if (prior) {
        if (prior.digest !== commandDigest) {
          throw new RoleContextError(
            "ROLE_SWITCH_BLOCKED",
            "the idempotency key was reused for another role-context switch",
          );
        }
        return prior.result;
      }
      if (current?.grantId === grant.id) {
        const result: EnterRoleContextResult = {
          context: project(current, grant),
          cacheInvalidation: {
            destroyProtectedCache: true,
            closeOpenViews: true,
          },
          events: [],
        };
        await transaction.saveEnterReceipt(input.idempotencyKey, {
          digest: commandDigest,
          result,
        });
        return result;
      }

      const events: RoleContextEvent[] = [];
      if (current) {
        const priorGrant = await transaction.getGrant(current.grantId);
        const exited: ActiveRoleContext = {
          ...current,
          status: "exited",
          version: current.version + 1,
          exitedAt: now,
        };
        await transaction.saveContext(exited);
        const event: RoleContextEvent = {
          id: this.dependencies.nextId("event"),
          name: "RoleContextExited",
          accountId: input.actor.accountId,
          contextId: current.id,
          grantId: current.grantId,
          occurredAt: now,
          retentionClass: priorGrant?.privileged
            ? "restricted_seven_year"
            : "routine_two_year",
        };
        await transaction.appendEvent(event);
        events.push(event);
      }
      const entered: ActiveRoleContext = {
        id: this.dependencies.nextId("context"),
        accountId: input.actor.accountId,
        docketSessionId: input.actor.docketSessionId,
        tabId: input.tabId,
        grantId: grant.id,
        authorityVersion: grant.version,
        status: "active",
        version: 1,
        enteredAt: now,
      };
      await transaction.saveContext(entered);
      await transaction.saveRememberedGrant(input.actor.accountId, grant.id);
      const event: RoleContextEvent = {
        id: this.dependencies.nextId("event"),
        name: "RoleContextEntered",
        accountId: input.actor.accountId,
        contextId: entered.id,
        grantId: grant.id,
        occurredAt: now,
        retentionClass: retentionClass(grant),
      };
      await transaction.appendEvent(event);
      events.push(event);
      if (input.activation === "restore" && grant.privileged) {
        await transaction.enqueuePrivilegedContextRestoredAlert({
          id: this.dependencies.nextId("security-alert"),
          accountId: input.actor.accountId,
          docketSessionId: input.actor.docketSessionId,
          contextId: entered.id,
          contextKind:
            grant.contextKind as PrivilegedContextRestoredAlert["contextKind"],
          scopeLabel: grant.scopeLabel,
          device: input.actor.device,
          approximateLocation: input.actor.approximateLocation,
          restoredAt: now,
          terminationPath: "/account/sessions",
          attemptCount: 0,
        });
      }
      const result: EnterRoleContextResult = {
        context: project(entered, grant),
        cacheInvalidation: {
          ...(current ? { previousContextId: current.id } : {}),
          destroyProtectedCache: true,
          closeOpenViews: true,
        },
        events,
      };
      await transaction.saveEnterReceipt(input.idempotencyKey, {
        digest: commandDigest,
        result,
      });
      return result;
    });
  }

  async leaveActiveRoleContext(
    input: Readonly<{
      actor: RoleContextActor;
      tabId: string;
      expectedCurrentContextId: string;
      expectedCurrentVersion: number;
    }>,
  ): Promise<LeaveRoleContextResult> {
    return this.dependencies.store.transaction(async (transaction) => {
      const current = await transaction.getActiveContext(
        input.actor.accountId,
        input.actor.docketSessionId,
        input.tabId,
      );
      if (!current) {
        return {
          cacheInvalidation: {
            previousContextId: input.expectedCurrentContextId,
            destroyProtectedCache: true,
            closeOpenViews: true,
          },
          events: [],
        };
      }
      if (
        current.id !== input.expectedCurrentContextId ||
        current.version !== input.expectedCurrentVersion
      ) {
        throw new RoleContextError(
          "CONTEXT_STALE",
          "the active role context changed concurrently",
        );
      }
      const grant = requireCurrentGrant(
        await transaction.getGrant(current.grantId),
        input.actor,
      );
      const now = this.dependencies.now();
      await transaction.saveContext({
        ...current,
        status: "exited",
        version: current.version + 1,
        exitedAt: now,
      });
      const event: RoleContextEvent = {
        id: this.dependencies.nextId("event"),
        name: "RoleContextExited",
        accountId: input.actor.accountId,
        contextId: current.id,
        grantId: current.grantId,
        occurredAt: now,
        retentionClass: retentionClass(grant),
      };
      await transaction.appendEvent(event);
      return {
        cacheInvalidation: {
          previousContextId: current.id,
          destroyProtectedCache: true,
          closeOpenViews: true,
        },
        events: [event],
      };
    });
  }

  async resolveAuthority(
    input: Readonly<{
      actor: RoleContextActor;
      tabId: string;
      permission: string;
      scopeId: string;
    }>,
  ): Promise<RoleContextProjection> {
    return this.dependencies.store.transaction(async (transaction) => {
      const current = await transaction.getActiveContext(
        input.actor.accountId,
        input.actor.docketSessionId,
        input.tabId,
      );
      if (!current) {
        throw new RoleContextError(
          "AUTHORITY_DENIED",
          "an active role context is required",
        );
      }
      const grant = requireCurrentGrant(
        await transaction.getGrant(current.grantId),
        input.actor,
      );
      if (grant.version !== current.authorityVersion) {
        throw new RoleContextError(
          "CONTEXT_STALE",
          "the active role context no longer matches current authority",
        );
      }
      if (
        grant.scopeId !== input.scopeId ||
        !grant.permissions.includes(input.permission)
      ) {
        throw new RoleContextError(
          "AUTHORITY_DENIED",
          "the active role context does not authorize this operation",
        );
      }
      return project(current, grant);
    });
  }

  async requireRecentClerkReverification(
    input: Readonly<{
      actor: RoleContextActor;
      commandId: string;
      evidence: ClerkReverificationEvidence;
    }>,
  ): Promise<ReauthenticationEvent> {
    return this.dependencies.store.transaction(async (transaction) => {
      const now = this.dependencies.now();
      const earliest = now.getTime() - 10 * 60 * 1_000;
      if (
        !input.evidence.signatureValidated ||
        input.evidence.clerkSessionId !== input.actor.clerkSessionId ||
        input.evidence.verifiedAt.getTime() < earliest ||
        input.evidence.verifiedAt.getTime() > now.getTime()
      ) {
        throw new RoleContextError(
          "REAUTHENTICATION_REQUIRED",
          "fresh Clerk Reverification is required",
        );
      }
      if (
        await transaction.getReauthenticationEvent(
          input.evidence.verificationId,
        )
      ) {
        throw new RoleContextError(
          "REAUTHENTICATION_REQUIRED",
          "the Clerk Reverification evidence was already used",
        );
      }
      const event: ReauthenticationEvent = {
        id: this.dependencies.nextId("reauthentication"),
        accountId: input.actor.accountId,
        docketSessionId: input.actor.docketSessionId,
        clerkSessionId: input.actor.clerkSessionId,
        verificationId: input.evidence.verificationId,
        commandId: input.commandId,
        occurredAt: now,
        retainedUntil: addUtcYears(now, 7),
      };
      await transaction.saveReauthenticationEvent(event);
      return event;
    });
  }
}

interface MemoryState {
  grants: Map<string, AuthorityGrant>;
  contexts: Map<string, ActiveRoleContext>;
  remembered: Map<string, string>;
  reauthenticationEvents: Map<string, ReauthenticationEvent>;
  enterReceipts: Map<string, EnterReceipt>;
  events: RoleContextEvent[];
  privilegedContextRestoredAlerts: PrivilegedContextRestoredAlert[];
}

function cloneState(state: MemoryState): MemoryState {
  return {
    grants: new Map(state.grants),
    contexts: new Map(state.contexts),
    remembered: new Map(state.remembered),
    reauthenticationEvents: new Map(state.reauthenticationEvents),
    enterReceipts: new Map(state.enterReceipts),
    events: [...state.events],
    privilegedContextRestoredAlerts: [...state.privilegedContextRestoredAlerts],
  };
}

export class InMemoryRoleContextStore implements RoleContextStore {
  private state: MemoryState = {
    grants: new Map(),
    contexts: new Map(),
    remembered: new Map(),
    reauthenticationEvents: new Map(),
    enterReceipts: new Map(),
    events: [],
    privilegedContextRestoredAlerts: [],
  };

  seedGrant(grant: AuthorityGrant): void {
    this.state.grants.set(grant.id, grant);
  }

  replaceGrant(grant: AuthorityGrant): void {
    this.state.grants.set(grant.id, grant);
  }

  remember(accountId: string, grantId: string): void {
    this.state.remembered.set(accountId, grantId);
  }

  snapshot(): Readonly<MemoryState> {
    return cloneState(this.state);
  }

  async transaction<T>(
    work: (transaction: RoleContextTransaction) => T | Promise<T>,
  ): Promise<T> {
    const next = cloneState(this.state);
    const transaction: RoleContextTransaction = {
      getGrant: (grantId) => Promise.resolve(next.grants.get(grantId)),
      listGrants: (accountId) =>
        Promise.resolve(
          [...next.grants.values()].filter(
            (grant) => grant.accountId === accountId,
          ),
        ),
      getActiveContext: (accountId, docketSessionId, tabId) =>
        Promise.resolve(
          [...next.contexts.values()].find(
            (context) =>
              context.accountId === accountId &&
              context.docketSessionId === docketSessionId &&
              context.tabId === tabId &&
              context.status === "active",
          ),
        ),
      getContext: (contextId) => Promise.resolve(next.contexts.get(contextId)),
      saveContext: (context) => {
        const previous = next.contexts.get(context.id);
        if (previous && context.version !== previous.version + 1) {
          throw new RoleContextError(
            "CONTEXT_STALE",
            "the role context changed concurrently",
          );
        }
        next.contexts.set(context.id, context);
        return Promise.resolve();
      },
      getRememberedGrant: (accountId) =>
        Promise.resolve(next.remembered.get(accountId)),
      saveRememberedGrant: (accountId, grantId) => {
        if (grantId) next.remembered.set(accountId, grantId);
        else next.remembered.delete(accountId);
        return Promise.resolve();
      },
      getReauthenticationEvent: (verificationId) =>
        Promise.resolve(next.reauthenticationEvents.get(verificationId)),
      saveReauthenticationEvent: (event) => {
        if (next.reauthenticationEvents.has(event.verificationId)) {
          throw new RoleContextError(
            "REAUTHENTICATION_REQUIRED",
            "the Clerk Reverification evidence was already used",
          );
        }
        next.reauthenticationEvents.set(event.verificationId, event);
        return Promise.resolve();
      },
      getEnterReceipt: (key) => Promise.resolve(next.enterReceipts.get(key)),
      saveEnterReceipt: (key, receipt) => {
        next.enterReceipts.set(key, receipt);
        return Promise.resolve();
      },
      appendEvent: (event) => {
        next.events.push(event);
        return Promise.resolve();
      },
      enqueuePrivilegedContextRestoredAlert: (alert) => {
        next.privilegedContextRestoredAlerts.push(alert);
        return Promise.resolve();
      },
    };
    const result = await work(transaction);
    this.state = next;
    return result;
  }
}
