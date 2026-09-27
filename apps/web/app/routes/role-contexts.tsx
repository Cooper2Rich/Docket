import { getAuth } from "@clerk/react-router/server";
import {
  ContractClientError,
  createDocketClient,
  type ActiveRoleContext,
  type RoleContextOption,
} from "@docket/contracts";
import {
  Form,
  type ShouldRevalidateFunctionArgs,
  useFetcher,
  useNavigation,
  useRevalidator,
  useSubmit,
} from "react-router";
import {
  Building2,
  CircleAlert,
  Clock3,
  Gavel,
  Inbox,
  Landmark,
  Loader2,
  LogOut,
  RotateCcw,
  Scale,
  ShieldCheck,
  ShieldX,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { validateWebRuntime } from "~/runtime.server";
import { hasTrustedMutationOrigin } from "./account-sessions.js";
import type { Route } from "./+types/role-contexts.js";

export const roleContextViewStates = {
  ready: [
    "Choose your Docket role",
    "Each browser tab keeps one role and scope active. Docket checks current authority on every protected request.",
  ],
  loading: [
    "Loading role contexts",
    "Checking this tab against current server-side authority.",
  ],
  empty: [
    "No role contexts available",
    "This Account does not currently hold a School, tournament, Judge, or platform role.",
  ],
  error: [
    "Role contexts unavailable",
    "Docket could not load the selector. No role context or protected data was changed.",
  ],
  denied: [
    "Role context access denied",
    "The requested role context is unavailable. Docket has not loaded the linked resource.",
  ],
  stale: [
    "Role context is out of date",
    "Authority changed while this tab was open. Return to the selector before continuing.",
  ],
} as const;
export type RoleContextViewState = keyof typeof roleContextViewStates;

const stateIcons = {
  ready: ShieldCheck,
  loading: Loader2,
  empty: Inbox,
  error: CircleAlert,
  denied: ShieldX,
  stale: Clock3,
} as const;
const contextIcons = {
  school: Building2,
  tournament: Landmark,
  judge: Gavel,
  platform_administrator: ShieldCheck,
  legal_and_privacy_operations: Scale,
} as const;
const contextLabels = {
  school: "School",
  tournament: "Tournament",
  judge: "Judge",
  platform_administrator: "Platform Administrator",
  legal_and_privacy_operations: "Legal and Privacy Operations",
} as const;

type ApiContext = Readonly<{
  actorSessionId: string;
  client: ReturnType<typeof createDocketClient>;
}>;
export type RoleContextsLoaderData = Readonly<{
  state: RoleContextViewState;
  tabId?: string;
  contexts: readonly RoleContextOption[];
  current?: ActiveRoleContext;
  deepLinkDecision?: "current" | "switch_required" | "denied";
  requiredGrantId?: string;
}>;
export type RoleContextActionData = Readonly<{
  ok: boolean;
  message: string;
  state?: RoleContextViewState;
  cacheInvalidation?: Readonly<{
    previousContextId?: string;
    destroyProtectedCache: true;
    closeOpenViews: true;
  }>;
}>;

function stateForError(error: unknown): RoleContextViewState {
  if (!(error instanceof ContractClientError)) return "error";
  if (error.code === "CONTEXT_STALE") return "stale";
  if (
    [
      "AUTHENTICATION_REQUIRED",
      "AUTHORITY_DENIED",
      "IDENTITY_INVALID",
      "SESSION_EXPIRED",
    ].includes(error.code)
  )
    return "denied";
  return "error";
}
function validIdentifier(value: string | null): value is string {
  return value !== null && value.length > 0 && value.length <= 128;
}
async function apiContext(
  args: Route.LoaderArgs | Route.ActionArgs,
): Promise<ApiContext | null> {
  const config = validateWebRuntime();
  const origin = new URL(args.request.url).origin;
  let actorSessionId = "session_fixture_local_001";
  let token: string | null = null;
  if (config.adapters.identity !== "fixed") {
    const auth = await getAuth(args, { acceptsToken: "session_token" });
    if (!auth.userId || !auth.sessionId) return null;
    actorSessionId = auth.sessionId;
    token = await auth.getToken();
    if (!token) return null;
  }
  const client = createDocketClient(async ({ method, path, body }) => {
    const response = await fetch(new URL(path, config.apiBaseUrl ?? ""), {
      method,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        origin,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, body: await response.json() };
  });
  return { actorSessionId, client };
}

export async function loader(
  args: Route.LoaderArgs,
): Promise<RoleContextsLoaderData> {
  const url = new URL(args.request.url);
  const tabId = url.searchParams.get("tab");
  const requiredGrantId = url.searchParams.get("requiredGrant");
  if (!validIdentifier(tabId)) return { state: "loading", contexts: [] };
  try {
    const context = await apiContext(args);
    if (!context) return { state: "denied", tabId, contexts: [] };
    if (requiredGrantId !== null) {
      if (!validIdentifier(requiredGrantId))
        return { state: "denied", tabId, contexts: [] };
      const deepLink = await context.client.inspectRoleContextDeepLink({
        tabId,
        requiredGrantId,
      });
      if (deepLink.decision === "denied")
        return {
          state: "denied",
          tabId,
          contexts: [],
          deepLinkDecision: "denied",
          requiredGrantId,
        };
      const selector = await context.client.listRoleContexts({ tabId });
      return {
        state: selector.contexts.length === 0 ? "empty" : "ready",
        tabId,
        contexts: selector.contexts,
        ...(selector.current ? { current: selector.current } : {}),
        deepLinkDecision: deepLink.decision,
        requiredGrantId,
      };
    }
    let selector = await context.client.listRoleContexts({ tabId });
    if (!selector.current && selector.contexts.length > 0) {
      selector = await context.client.restoreMostRecentRoleContext({
        tabId,
        idempotencyKey: `web-restore-${context.actorSessionId}-${tabId}`.slice(
          0,
          128,
        ),
      });
    }
    return {
      state: selector.contexts.length === 0 ? "empty" : "ready",
      tabId,
      contexts: selector.contexts,
      ...(selector.current ? { current: selector.current } : {}),
    };
  } catch (error) {
    return {
      state: stateForError(error),
      tabId,
      contexts: [],
      ...(validIdentifier(requiredGrantId) ? { requiredGrantId } : {}),
    };
  }
}

export function shouldRevalidate({
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs): boolean {
  // Actions are followed by one tab-aware fetch in RoleContextsView. Letting
  // the router also revalidate here issues a competing request without the tab
  // query and can replace the authoritative selector state with SSR loading.
  return formMethod?.toUpperCase() === "POST" ? false : defaultShouldRevalidate;
}

function createTabId(): string {
  return `tab-${globalThis.crypto.randomUUID()}`.slice(0, 128);
}
function dataUrl(tabId: string, requiredGrantId?: string): string {
  const params = new URLSearchParams({ tab: tabId });
  if (requiredGrantId) params.set("requiredGrant", requiredGrantId);
  return `/account/role-contexts?${params.toString()}`;
}
function RoleContextFormFields({
  tabId,
  current,
  grantId,
  switchDecision,
}: Readonly<{
  tabId: string;
  current?: ActiveRoleContext;
  grantId?: string;
  switchDecision?: "save" | "discard";
}>) {
  return (
    <>
      <input type="hidden" name="tabId" value={tabId} />
      {grantId ? <input type="hidden" name="grantId" value={grantId} /> : null}
      {switchDecision ? (
        <input type="hidden" name="switchDecision" value={switchDecision} />
      ) : null}
      {current ? (
        <>
          <input
            type="hidden"
            name="expectedCurrentContextId"
            value={current.id}
          />
          <input
            type="hidden"
            name="expectedCurrentVersion"
            value={current.version}
          />
        </>
      ) : null}
    </>
  );
}

export function RoleContextsView({
  loaderData,
  actionData,
}: Readonly<{
  loaderData: RoleContextsLoaderData;
  actionData?: RoleContextActionData;
}>) {
  const fetcher = useFetcher<RoleContextsLoaderData>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const submit = useSubmit();
  const processedAction = useRef<RoleContextActionData | undefined>(undefined);
  const [draft, setDraft] = useState("");
  const [draftDirty, setDraftDirty] = useState(false);
  const [pendingGrantId, setPendingGrantId] = useState<string>();
  const [openContextId, setOpenContextId] = useState<string>();
  const requiredGrantId =
    typeof window === "undefined"
      ? loaderData.requiredGrantId
      : (new URL(window.location.href).searchParams.get("requiredGrant") ??
        undefined);
  const effectiveData = fetcher.data ?? loaderData;

  useEffect(() => {
    if (loaderData.tabId || fetcher.state !== "idle" || fetcher.data) return;
    const key = "docket:active-role-context:tab-id";
    let tabId = sessionStorage.getItem(key);
    if (!tabId) {
      tabId = createTabId();
      sessionStorage.setItem(key, tabId);
    }
    void fetcher.load(dataUrl(tabId, requiredGrantId));
  }, [fetcher, loaderData.tabId, requiredGrantId]);

  useEffect(() => {
    if (!actionData || processedAction.current === actionData) return;
    processedAction.current = actionData;
    const invalidation = actionData.cacheInvalidation;
    if (invalidation?.destroyProtectedCache && invalidation.previousContextId) {
      sessionStorage.removeItem(
        `docket:role-context:cache:${invalidation.previousContextId}`,
      );
    }
    if (invalidation?.closeOpenViews) {
      setOpenContextId(undefined);
      setDraft("");
      setDraftDirty(false);
      setPendingGrantId(undefined);
    }
    const tabId =
      effectiveData.tabId ??
      sessionStorage.getItem("docket:active-role-context:tab-id");
    if (tabId) void fetcher.load(dataUrl(tabId, requiredGrantId));
  }, [actionData, effectiveData.tabId, fetcher, requiredGrantId]);

  const state =
    navigation.state !== "idle" ||
    revalidator.state === "loading" ||
    fetcher.state === "loading"
      ? "loading"
      : (fetcher.data?.state ?? actionData?.state ?? loaderData.state);
  const [heading, detail] = roleContextViewStates[state];
  const StateIcon = stateIcons[state];
  const current = effectiveData.current;
  const requiredContext = effectiveData.contexts.find(
    (context) => context.grantId === effectiveData.requiredGrantId,
  );

  function submitSwitch(form: HTMLFormElement, decision: "save" | "discard") {
    if (current) {
      const key = `docket:role-context:draft:${current.id}`;
      if (decision === "save") sessionStorage.setItem(key, draft);
      else sessionStorage.removeItem(key);
    }
    void submit(form, { method: "post" });
    setPendingGrantId(undefined);
  }

  return (
    <main className="page-shell role-context-shell" id="main-content">
      <section
        className="role-context-panel"
        aria-labelledby="role-context-heading"
        aria-busy={state === "loading"}
      >
        <header className="role-context-header">
          <div>
            <p className="eyebrow">Active Role Context</p>
            <h1 id="role-context-heading">{heading}</h1>
            <p className="hero-copy">{detail}</p>
          </div>
          <StateIcon className="state-icon" aria-hidden="true" />
        </header>
        {state === "ready" ? (
          <>
            {current ? (
              <aside
                className={
                  current.privileged
                    ? "active-context-banner active-context-banner-privileged"
                    : "active-context-banner"
                }
                aria-labelledby="active-context-heading"
              >
                <ShieldCheck aria-hidden="true" />
                <div>
                  <p className="context-kicker">Active in this tab</p>
                  <h2 id="active-context-heading">
                    {contextLabels[current.contextKind]} · {current.scopeLabel}
                  </h2>
                  <p>
                    Every protected request is checked against the current
                    server-side grant.
                  </p>
                </div>
                <Form method="post">
                  <input type="hidden" name="intent" value="leave" />
                  <RoleContextFormFields
                    tabId={effectiveData.tabId ?? ""}
                    current={current}
                  />
                  <Button type="submit" variant="outline">
                    <LogOut aria-hidden="true" />
                    Leave context
                  </Button>
                </Form>
              </aside>
            ) : null}
            {effectiveData.deepLinkDecision === "switch_required" ? (
              <section
                className="deep-link-prompt"
                aria-labelledby="deep-link-heading"
              >
                <ShieldCheck aria-hidden="true" />
                <div>
                  <h2 id="deep-link-heading">
                    Switch context to open this link
                  </h2>
                  <p>
                    Docket has not loaded the protected resource. Confirm the
                    role context first.
                  </p>
                  {requiredContext ? (
                    <strong>
                      {contextLabels[requiredContext.contextKind]} ·{" "}
                      {requiredContext.scopeLabel}
                    </strong>
                  ) : null}
                </div>
              </section>
            ) : null}

            <section
              className="context-list-section"
              aria-labelledby="available-contexts-heading"
            >
              <div className="section-heading">
                <UserRound aria-hidden="true" />
                <div>
                  <h2 id="available-contexts-heading">Available contexts</h2>
                  <p>Choose one role and exact scope for this browser tab.</p>
                </div>
              </div>
              <ul
                className="role-context-list"
                aria-label="Available role contexts"
              >
                {effectiveData.contexts.map((context) => {
                  const ContextIcon = contextIcons[context.contextKind];
                  const active = context.grantId === current?.grantId;
                  const required =
                    context.grantId === effectiveData.requiredGrantId;
                  return (
                    <li
                      className={
                        context.privileged
                          ? "role-context-row role-context-row-privileged"
                          : "role-context-row"
                      }
                      key={context.grantId}
                    >
                      <ContextIcon aria-hidden="true" />
                      <div className="role-context-copy">
                        <h3>
                          {contextLabels[context.contextKind]} ·{" "}
                          {context.scopeLabel}
                        </h3>
                        <p>
                          {context.privileged
                            ? "Privileged session limits apply."
                            : "Scoped to this role and workspace."}
                        </p>
                      </div>
                      {active ? (
                        <span className="current-badge">Active</span>
                      ) : (
                        <Form method="post">
                          <RoleContextFormFields
                            tabId={effectiveData.tabId ?? ""}
                            {...(current ? { current } : {})}
                            grantId={context.grantId}
                            switchDecision="discard"
                          />
                          <Button
                            type="submit"
                            variant={required ? "default" : "outline"}
                            onClick={(event) => {
                              if (!draftDirty) return;
                              event.preventDefault();
                              setPendingGrantId(context.grantId);
                            }}
                          >
                            {required ? "Switch to required context" : "Switch"}
                          </Button>
                        </Form>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            {pendingGrantId ? (
              <section
                className="unsaved-work-prompt"
                role="dialog"
                aria-modal="false"
                aria-labelledby="unsaved-work-heading"
              >
                <h2 id="unsaved-work-heading">Unsaved work in this context</h2>
                <p>
                  Save the draft, discard it, or cancel before switching role
                  contexts.
                </p>
                <div className="state-actions">
                  {(["save", "discard"] as const).map((decision) => (
                    <Form method="post" key={decision}>
                      <RoleContextFormFields
                        tabId={effectiveData.tabId ?? ""}
                        {...(current ? { current } : {})}
                        grantId={pendingGrantId}
                        switchDecision={decision}
                      />
                      <Button
                        type="submit"
                        variant={decision === "save" ? "default" : "outline"}
                        onClick={(event) => {
                          event.preventDefault();
                          const form = event.currentTarget.form;
                          if (form) submitSwitch(form, decision);
                        }}
                      >
                        {decision === "save"
                          ? "Save draft and switch"
                          : "Discard draft and switch"}
                      </Button>
                    </Form>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPendingGrantId(undefined);
                    }}
                  >
                    Cancel switch
                  </Button>
                </div>
              </section>
            ) : null}

            {current ? (
              <section
                className="context-workspace"
                aria-labelledby="context-workspace-heading"
              >
                <div className="section-heading">
                  <ShieldCheck aria-hidden="true" />
                  <div>
                    <h2 id="context-workspace-heading">Context workspace</h2>
                    <p>
                      This preview represents tab-local protected cache and open
                      views.
                    </p>
                  </div>
                </div>
                <label htmlFor="context-draft">Context-scoped draft</label>
                <textarea
                  id="context-draft"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.currentTarget.value);
                    setDraftDirty(true);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    sessionStorage.setItem(
                      `docket:role-context:cache:${current.id}`,
                      current.scopeLabel,
                    );
                    setOpenContextId(current.id);
                  }}
                >
                  Open context workspace
                </Button>
                {openContextId === current.id ? (
                  <p role="status">
                    Protected workspace open for {current.scopeLabel}.
                  </p>
                ) : null}
              </section>
            ) : null}
          </>
        ) : (
          <div
            className="session-state"
            role={state === "error" || state === "denied" ? "alert" : undefined}
          >
            <StateIcon className="session-state-icon" aria-hidden="true" />
            <p>{detail}</p>
            {state === "error" || state === "stale" ? (
              <Button
                onClick={() => {
                  const tabId =
                    effectiveData.tabId ??
                    sessionStorage.getItem("docket:active-role-context:tab-id");
                  if (tabId) void fetcher.load(dataUrl(tabId, requiredGrantId));
                  else void revalidator.revalidate();
                }}
              >
                <RotateCcw aria-hidden="true" />
                {state === "error" ? "Try again" : "Reload selector"}
              </Button>
            ) : null}
          </div>
        )}
        <span hidden data-testid="role-context-view-state">
          {state}
        </span>
        <p className="sr-only" role="status" aria-live="polite">
          {navigation.state === "submitting"
            ? "Changing Active Role Context."
            : (actionData?.message ?? "")}
        </p>
      </section>
    </main>
  );
}

export default function RoleContexts({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <RoleContextsView
      loaderData={loaderData}
      {...(actionData ? { actionData } : {})}
    />
  );
}

export async function action(
  args: Route.ActionArgs,
): Promise<RoleContextActionData> {
  const config = validateWebRuntime();
  if (!hasTrustedMutationOrigin(args.request, config.clerkAllowedOrigins ?? []))
    return {
      ok: false,
      state: "denied",
      message: "Role context access denied.",
    };
  const form = await args.request.formData();
  const intent = form.get("intent");
  const tabId = form.get("tabId");
  if (typeof tabId !== "string" || !validIdentifier(tabId))
    return {
      ok: false,
      state: "error",
      message: "The tab context is invalid.",
    };
  try {
    const context = await apiContext(args);
    if (!context)
      return {
        ok: false,
        state: "denied",
        message: "Role context access denied.",
      };
    if (intent === "leave") {
      const expectedCurrentContextId = form.get("expectedCurrentContextId");
      const expectedCurrentVersion = Number(form.get("expectedCurrentVersion"));
      if (
        !validIdentifier(
          typeof expectedCurrentContextId === "string"
            ? expectedCurrentContextId
            : null,
        ) ||
        !Number.isInteger(expectedCurrentVersion) ||
        expectedCurrentVersion < 1
      )
        return {
          ok: false,
          state: "error",
          message: "The role-context request is invalid.",
        };
      const result = await context.client.leaveActiveRoleContext({
        tabId,
        expectedCurrentContextId,
        expectedCurrentVersion,
      });
      return {
        ok: true,
        message: "Returned to the role selector.",
        cacheInvalidation: result.cacheInvalidation,
      };
    }
    const grantId = form.get("grantId");
    const requestedGrantId = typeof grantId === "string" ? grantId : "";
    const switchDecision = form.get("switchDecision");
    const currentContextValue = form.get("expectedCurrentContextId");
    const expectedCurrentContextId =
      typeof currentContextValue === "string" ? currentContextValue : null;
    const expectedCurrentVersion = Number(form.get("expectedCurrentVersion"));
    if (
      !validIdentifier(requestedGrantId) ||
      (switchDecision !== "save" && switchDecision !== "discard") ||
      (expectedCurrentContextId !== null &&
        !validIdentifier(expectedCurrentContextId)) ||
      (expectedCurrentContextId !== null &&
        (!Number.isInteger(expectedCurrentVersion) ||
          expectedCurrentVersion < 1))
    )
      return {
        ok: false,
        state: "error",
        message: "The role-context request is invalid.",
      };
    const idempotencyKey = [
      "web-enter",
      context.actorSessionId.slice(0, 24),
      tabId.slice(0, 24),
      requestedGrantId.slice(0, 24),
      (expectedCurrentContextId ?? "none").slice(0, 24),
      String(
        Number.isInteger(expectedCurrentVersion) ? expectedCurrentVersion : 0,
      ),
      switchDecision,
    ]
      .join("-")
      .slice(0, 128);
    const result = await context.client.enterActiveRoleContext({
      tabId,
      grantId: requestedGrantId,
      switchDecision,
      idempotencyKey,
      ...(expectedCurrentContextId !== null
        ? { expectedCurrentContextId, expectedCurrentVersion }
        : {}),
    });
    return {
      ok: true,
      message: `${contextLabels[result.context.contextKind]} context active for ${result.context.scopeLabel}.`,
      cacheInvalidation: result.cacheInvalidation,
    };
  } catch (error) {
    const state = stateForError(error);
    return {
      ok: false,
      state,
      message:
        state === "stale"
          ? "Authority changed. Reload the selector before continuing."
          : state === "denied"
            ? "The requested role context is unavailable."
            : "The role context could not be changed.",
    };
  }
}
