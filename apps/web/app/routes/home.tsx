import { useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  CircleAlert,
  CircleCheck,
  Clock3,
  Inbox,
  Loader2,
  ShieldX,
} from "lucide-react";

export const foundationViewStates = {
  ready: {
    heading: "Tournament operations, built on explicit boundaries.",
    detail:
      "The Release 1 workspace is being assembled from independently verified foundation slices.",
  },
  loading: {
    heading: "Loading workspace",
    detail: "Checking the current foundation state.",
  },
  empty: {
    heading: "No tournaments yet",
    detail:
      "Eligible tournaments will appear here when discovery is implemented.",
  },
  error: {
    heading: "Workspace unavailable",
    detail: "The request failed safely. No operation was applied.",
  },
  denied: {
    heading: "Access denied",
    detail: "This role context cannot perform that operation.",
  },
  stale: {
    heading: "This view is out of date",
    detail: "Reload before attempting the operation again.",
  },
} as const;

export type FoundationViewState = keyof typeof foundationViewStates;

const stateIcons = {
  ready: CircleCheck,
  loading: Loader2,
  empty: Inbox,
  error: CircleAlert,
  denied: ShieldX,
  stale: Clock3,
} as const;

export function resolveFoundationViewState(
  requested: string | null,
): FoundationViewState {
  const candidate = requested ?? "ready";
  return candidate in foundationViewStates
    ? (candidate as FoundationViewState)
    : "error";
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = resolveFoundationViewState(searchParams.get("state"));
  const content = foundationViewStates[state];
  const StateIcon = stateIcons[state];

  return (
    <main className="page-shell" id="main-content">
      <section
        className="hero"
        aria-labelledby="workspace-heading"
        aria-busy={state === "loading"}
      >
        <p className="eyebrow">Docket · Release 1 foundation</p>
        <StateIcon className="state-icon" aria-hidden="true" />
        <h1 id="workspace-heading">{content.heading}</h1>
        <p className="hero-copy">{content.detail}</p>
        <div
          className="state-actions"
          role="group"
          aria-label="Preview foundation route state"
        >
          {(Object.keys(foundationViewStates) as FoundationViewState[]).map(
            (nextState) => (
              <Button
                key={nextState}
                variant={state === nextState ? "default" : "outline"}
                aria-pressed={state === nextState}
                aria-label={`Show ${nextState} state`}
                onClick={() => {
                  setSearchParams(
                    nextState === "ready" ? {} : { state: nextState },
                  );
                }}
              >
                {nextState}
              </Button>
            ),
          )}
        </div>
        <p className="state-note" role="status" aria-live="polite">
          Current rendered state: {state}
        </p>
        {state === "loading" ? (
          <p className="sr-only" role="status">
            Foundation state request is in progress.
          </p>
        ) : null}
      </section>
    </main>
  );
}
