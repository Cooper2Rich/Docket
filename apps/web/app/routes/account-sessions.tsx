import { getAuth } from "@clerk/react-router/server";
import {
  ContractClientError,
  createDocketClient,
  type DocketSessionList,
} from "@docket/contracts";
import { Form, useNavigation, useRevalidator } from "react-router";
import {
  CircleAlert,
  Clock3,
  Inbox,
  Laptop,
  Loader2,
  RotateCcw,
  ShieldX,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { validateWebRuntime } from "~/runtime.server";
import type { Route } from "./+types/account-sessions.js";

export const accountSessionViewStates = {
  ready: {
    heading: "Your Docket sessions",
    detail: "Review the sessions currently signed in to your Account.",
  },
  loading: {
    heading: "Loading your sessions",
    detail: "Checking the authoritative session record.",
  },
  empty: {
    heading: "No active sessions",
    detail: "There are no Docket sessions to manage for this Account.",
  },
  error: {
    heading: "Sessions unavailable",
    detail: "Docket could not load your sessions. No session was changed.",
  },
  denied: {
    heading: "Session access denied",
    detail: "Sign in as the Account holder to manage these sessions.",
  },
  stale: {
    heading: "Session list is out of date",
    detail: "Reload the current record before revoking another session.",
  },
} as const;

export type AccountSessionViewState = keyof typeof accountSessionViewStates;

const stateIcons = {
  ready: Laptop,
  loading: Loader2,
  empty: Inbox,
  error: CircleAlert,
  denied: ShieldX,
  stale: Clock3,
} as const;

type ApiContext = Readonly<{
  actorSessionId: string;
  client: ReturnType<typeof createDocketClient>;
}>;

export async function getClerkSessionToken(auth: {
  getToken(): Promise<string | null>;
}): Promise<string | null> {
  return auth.getToken();
}

export function hasTrustedMutationOrigin(
  request: Request,
  allowedOrigins: readonly string[],
): boolean {
  const origin = request.headers.get("origin");
  return origin !== null && allowedOrigins.includes(origin);
}

export type AccountSessionsLoaderData = Readonly<{
  state: AccountSessionViewState;
  sessions: DocketSessionList["sessions"];
  currentSessionId?: string;
}>;

function stateForError(error: unknown): AccountSessionViewState {
  if (!(error instanceof ContractClientError)) return "error";
  if (error.code === "AUTHORITY_STALE") return "stale";
  if (
    error.code === "AUTHENTICATION_REQUIRED" ||
    error.code === "IDENTITY_INVALID" ||
    error.code === "SESSION_EXPIRED"
  ) {
    return "denied";
  }
  return "error";
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
    token = await getClerkSessionToken(auth);
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
): Promise<AccountSessionsLoaderData> {
  try {
    const context = await apiContext(args);
    if (!context) return { state: "denied", sessions: [] };
    const current = await context.client.createDocketSession({
      idempotencyKey: `web-create-${context.actorSessionId}`,
    });
    const { sessions } = await context.client.listDocketSessions({
      audience: "self",
    });
    return {
      state: sessions.length === 0 ? "empty" : "ready",
      sessions,
      currentSessionId: current.session.id,
    };
  } catch (error) {
    return { state: stateForError(error), sessions: [] };
  }
}

export async function action(args: Route.ActionArgs) {
  const config = validateWebRuntime();
  if (
    !hasTrustedMutationOrigin(args.request, config.clerkAllowedOrigins ?? [])
  ) {
    return { ok: false, message: "Session access denied." };
  }

  const form = await args.request.formData();
  const sessionId = form.get("sessionId");
  const expectedVersion = Number(form.get("expectedVersion"));
  if (
    typeof sessionId !== "string" ||
    sessionId.length === 0 ||
    !Number.isInteger(expectedVersion) ||
    expectedVersion < 1
  ) {
    return { ok: false, message: "The revocation request was invalid." };
  }

  try {
    const context = await apiContext(args);
    if (!context) return { ok: false, message: "Session access denied." };
    await context.client.revokeDocketSession({
      sessionId,
      expectedVersion,
      idempotencyKey: `web-revoke-${context.actorSessionId}-${sessionId}-${String(expectedVersion)}`,
    });
    return { ok: true, message: "Session revoked." };
  } catch (error) {
    const state = stateForError(error);
    return {
      ok: false,
      message:
        state === "stale"
          ? "The session changed. Reload before trying again."
          : "The session could not be revoked.",
    };
  }
}

function sessionDetail(session: DocketSessionList["sessions"][number]): string {
  const lastActive = new Date(session.lastActivityAt).toLocaleString();
  const expires = new Date(session.expiresAt).toLocaleString();
  return `Last active ${lastActive} · expires ${expires}`;
}

export function AccountSessionsView({
  loaderData,
  actionData,
}: Readonly<{
  loaderData: AccountSessionsLoaderData;
  actionData?: Awaited<ReturnType<typeof action>>;
}>) {
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const state =
    navigation.state === "loading" || revalidator.state === "loading"
      ? "loading"
      : loaderData.state;
  const content = accountSessionViewStates[state];
  const StateIcon = stateIcons[state];
  const activeSessions = loaderData.sessions.filter(
    (session) => session.status === "active",
  );

  return (
    <main className="page-shell account-session-shell" id="main-content">
      <section
        className="session-panel"
        aria-labelledby="session-heading"
        aria-busy={state === "loading"}
      >
        <header className="session-header">
          <div>
            <p className="eyebrow">Account security</p>
            <h1 id="session-heading">{content.heading}</h1>
            <p className="hero-copy">{content.detail}</p>
          </div>
          <StateIcon className="state-icon" aria-hidden="true" />
        </header>

        {state === "ready" ? (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={revalidator.state !== "idle"}
              onClick={() => {
                void revalidator.revalidate();
              }}
            >
              <RotateCcw aria-hidden="true" />
              Refresh sessions
            </Button>
            <ul className="session-list" aria-label="Active Docket sessions">
              {activeSessions.map((session) => {
                const current = session.id === loaderData.currentSessionId;
                return (
                  <li className="session-row" key={session.id}>
                    <Laptop className="session-device" aria-hidden="true" />
                    <div className="session-copy">
                      <h2>{current ? "This device" : "Signed-in session"}</h2>
                      <p>{sessionDetail(session)}</p>
                      <p className="session-status">
                        Active{current ? " · current session" : ""}
                      </p>
                    </div>
                    {current ? (
                      <span className="current-badge">Current</span>
                    ) : (
                      <Form method="post">
                        <input
                          type="hidden"
                          name="sessionId"
                          value={session.id}
                        />
                        <input
                          type="hidden"
                          name="expectedVersion"
                          value={session.version}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          disabled={navigation.state !== "idle"}
                        >
                          Revoke signed-in session
                        </Button>
                      </Form>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div
            className="session-state"
            role={state === "error" ? "alert" : undefined}
          >
            <StateIcon className="session-state-icon" aria-hidden="true" />
            <p>{content.detail}</p>
            {state === "error" || state === "stale" ? (
              <Button
                onClick={() => {
                  void revalidator.revalidate();
                }}
              >
                <RotateCcw aria-hidden="true" />
                {state === "error" ? "Try again" : "Reload sessions"}
              </Button>
            ) : null}
          </div>
        )}

        <span hidden data-testid="session-view-state">
          {state}
        </span>
        <p className="sr-only" role="status" aria-live="polite">
          {navigation.state === "submitting"
            ? "Revoking session."
            : (actionData?.message ?? "")}
        </p>
      </section>
    </main>
  );
}

export default function AccountSessions({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <AccountSessionsView
      loaderData={loaderData}
      {...(actionData ? { actionData } : {})}
    />
  );
}
