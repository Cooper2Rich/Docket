import { getAuth } from "@clerk/react-router/server";
import {
  ContractClientError,
  createDocketClient,
  type InboxItem,
} from "@docket/contracts";
import { useNavigation, useRevalidator } from "react-router";
import {
  Bell,
  CircleAlert,
  Clock3,
  Inbox,
  Loader2,
  RefreshCw,
  Send,
  ShieldX,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { validateWebRuntime } from "~/runtime.server";
import type { Route } from "./+types/communications-inbox.js";

export const communicationsInboxViewStates = {
  ready: {
    heading: "Your Docket notices",
    detail: "Only notices addressed to this Account appear here.",
  },
  loading: {
    heading: "Loading your notices",
    detail: "Checking the authoritative recipient projection.",
  },
  empty: {
    heading: "No notices yet",
    detail: "Required tournament and Account notices will appear here.",
  },
  error: {
    heading: "Notices unavailable",
    detail: "Docket could not load the inbox. No notice was changed.",
  },
  denied: {
    heading: "Notice access denied",
    detail: "Sign in as the addressed Account holder to read these notices.",
  },
  stale: {
    heading: "This inbox is out of date",
    detail: "Reload after your Account authority is refreshed.",
  },
} as const;

export type CommunicationsInboxViewState =
  keyof typeof communicationsInboxViewStates;

const icons = {
  ready: Bell,
  loading: Loader2,
  empty: Inbox,
  error: CircleAlert,
  denied: ShieldX,
  stale: Clock3,
} as const;

export type CommunicationsInboxLoaderData = Readonly<{
  state: CommunicationsInboxViewState;
  items: readonly InboxItem[];
}>;

function stateForError(error: unknown): CommunicationsInboxViewState {
  if (!(error instanceof ContractClientError)) return "error";
  if (error.code === "STALE_VERSION" || error.code === "AUTHORITY_STALE") {
    return "stale";
  }
  if (
    [
      "AUTHENTICATION_REQUIRED",
      "IDENTITY_INVALID",
      "RECIPIENT_UNAUTHORIZED",
      "SESSION_EXPIRED",
    ].includes(error.code)
  ) {
    return "denied";
  }
  return "error";
}

async function clientFor(args: Route.LoaderArgs) {
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
): Promise<CommunicationsInboxLoaderData> {
  try {
    const context = await clientFor(args);
    if (!context) return { state: "denied", items: [] };
    const session = await context.client.createDocketSession({
      idempotencyKey: `web-inbox-${context.actorSessionId}`,
    });
    const result = await context.client.readAccessInbox({
      recipientAccountId: session.account.id,
    });
    return {
      state: result.items.length === 0 ? "empty" : "ready",
      items: result.items,
    };
  } catch (error) {
    return { state: stateForError(error), items: [] };
  }
}

export function CommunicationsInboxView({
  loaderData,
}: Readonly<{ loaderData: CommunicationsInboxLoaderData }>) {
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const state =
    navigation.state !== "idle" || revalidator.state !== "idle"
      ? "loading"
      : loaderData.state;
  const content = communicationsInboxViewStates[state];
  const StateIcon = icons[state];
  return (
    <main className="page-shell communications-inbox-shell" id="main-content">
      <section
        className="communications-inbox-panel"
        aria-labelledby="communications-inbox-heading"
        aria-busy={state === "loading"}
      >
        <header className="communications-inbox-header">
          <div>
            <p className="eyebrow">Docket · Account inbox</p>
            <h1 id="communications-inbox-heading">{content.heading}</h1>
            <p className="hero-copy">{content.detail}</p>
          </div>
          <StateIcon className="state-icon" aria-hidden="true" />
        </header>
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          data-testid="communications-inbox-view-state"
        >
          {state}
        </p>
        {state === "ready" ? (
          <ul className="communications-inbox-list" aria-label="Docket notices">
            {loaderData.items.map((item) => (
              <li className="communications-inbox-item" key={item.id}>
                <Send aria-hidden="true" />
                <div>
                  <h2>{item.subject}</h2>
                  <p>{item.body}</p>
                  <p className="notice-delivery-state" role="status">
                    {item.deliveryState === "pending"
                      ? "In-app notice available; provider delivery is pending."
                      : item.deliveryState === "delivery_failed"
                        ? "In-app notice available; provider delivery needs attention."
                        : "Delivered in Docket."}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="state-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => void revalidator.revalidate()}
            disabled={state === "loading"}
          >
            <RefreshCw aria-hidden="true" />
            Refresh notices
          </Button>
        </div>
      </section>
    </main>
  );
}

export default function CommunicationsInbox({
  loaderData,
}: Route.ComponentProps) {
  return <CommunicationsInboxView loaderData={loaderData} />;
}
