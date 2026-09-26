// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AccountSessionsView,
  action,
  accountSessionViewStates,
  getClerkSessionToken,
  hasTrustedMutationOrigin,
  type AccountSessionViewState,
  type AccountSessionsLoaderData,
} from "./account-sessions.js";

let root: Root | undefined;
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const sessions: AccountSessionsLoaderData["sessions"] = [
  {
    id: "session-current",
    sessionClass: "ordinary",
    device: "Chrome on Windows",
    approximateLocation: "Austin, Texas",
    status: "active",
    version: 1,
    createdAt: "2026-09-25T18:00:00.000Z",
    lastActivityAt: "2026-09-25T19:00:00.000Z",
    inactivityExpiresAt: "2026-09-26T07:00:00.000Z",
    expiresAt: "2026-10-02T18:00:00.000Z",
  },
  {
    id: "session-other",
    sessionClass: "privileged",
    device: "Safari on macOS",
    approximateLocation: "Dallas, Texas",
    status: "active",
    version: 1,
    createdAt: "2026-09-24T18:00:00.000Z",
    lastActivityAt: "2026-09-25T18:45:00.000Z",
    privilegedActivatedAt: "2026-09-25T18:30:00.000Z",
    inactivityExpiresAt: "2026-09-25T19:15:00.000Z",
    expiresAt: "2026-10-01T18:00:00.000Z",
  },
];

function renderRoute(
  state: AccountSessionViewState,
  width = 1280,
  currentSessionId = "session-current",
) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const loaderData: AccountSessionsLoaderData = {
    state,
    sessions: state === "ready" ? sessions : [],
    ...(state === "ready"
      ? {
          account: {
            id: "account-local",
            displayName: "Local Docket Account",
            verifiedEmail: "local@identity.example.test",
            authority: [],
            version: 4,
          },
          history: [
            {
              id: "history-sign-in",
              kind: "accepted_sign_in" as const,
              occurredAt: "2026-09-25T19:00:00.000Z",
              device: "Chrome on Windows",
              approximateLocation: "Austin, Texas",
            },
          ],
        }
      : {}),
    currentSessionId,
  };
  const router = createMemoryRouter(
    [
      {
        path: "/account/sessions",
        element: <AccountSessionsView loaderData={loaderData} />,
        action: () => ({ ok: true, message: "Session revoked." }),
      },
    ],
    { initialEntries: ["/account/sessions"] },
  );
  act(() => {
    root?.render(<RouterProvider router={router} />);
  });
  return container;
}

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
    root = undefined;
  }
  document.body.replaceChildren();
});

describe("rendered Account Session route", () => {
  it("forwards the native Clerk session token without requesting a custom JWT template", async () => {
    const getToken = vi.fn(() => Promise.resolve("native-session-token"));

    await expect(getClerkSessionToken({ getToken })).resolves.toBe(
      "native-session-token",
    );
    expect(getToken).toHaveBeenCalledOnce();
    expect(getToken).toHaveBeenCalledWith();
  });

  it("rejects a hostile browser origin before parsing or dispatching the mutation", async () => {
    const request = new Request("http://127.0.0.1:3000/account/sessions", {
      method: "POST",
      headers: { origin: "https://hostile.example.test" },
    });
    const formData = vi.spyOn(request, "formData");

    expect(hasTrustedMutationOrigin(request, ["http://127.0.0.1:3000"])).toBe(
      false,
    );
    await expect(
      action({ request } as Parameters<typeof action>[0]),
    ).resolves.toEqual({ ok: false, message: "Session access denied." });
    expect(formData).not.toHaveBeenCalled();
  });

  for (const [state, content] of Object.entries(accountSessionViewStates)) {
    it(`renders the ${state} state`, () => {
      const route = renderRoute(state as AccountSessionViewState);
      expect(route.querySelector("h1")?.textContent).toBe(content.heading);
      expect(route.querySelector("main")?.id).toBe("main-content");
      expect(
        route.querySelector("[data-testid='session-view-state']")?.textContent,
      ).toBe(state);
    });
  }

  it("submits another session's authoritative id and version with a native keyboard-focusable control", () => {
    const route = renderRoute("ready");
    const button = [...route.querySelectorAll("button")].find((candidate) =>
      candidate.textContent.includes("Revoke signed-in session"),
    );
    expect(button).toBeDefined();
    if (!button) throw new Error("Expected the session revoke button");
    button.focus();
    expect(document.activeElement).toBe(button);
    const form = button.closest("form");
    expect(
      form?.querySelector<HTMLInputElement>("[name='sessionId']")?.value,
    ).toBe("session-other");
    expect(
      form?.querySelector<HTMLInputElement>("[name='expectedVersion']")?.value,
    ).toBe("1");
  });

  it("offers keyboard controls for current-device and all-session logout", () => {
    const route = renderRoute("ready");
    const buttons = [...route.querySelectorAll("button")];
    const current = buttons.find((candidate) =>
      candidate.textContent.includes("Log out this device"),
    );
    const everywhere = buttons.find((candidate) =>
      candidate.textContent.includes("Log out everywhere"),
    );

    expect(current).toBeDefined();
    expect(everywhere).toBeDefined();
    current?.focus();
    expect(document.activeElement).toBe(current);
    expect(
      everywhere
        ?.closest("form")
        ?.querySelector<HTMLInputElement>("[name='intent']")?.value,
    ).toBe("revoke-all");
  });

  it("renders a prominent privileged banner with immediate session termination", () => {
    const route = renderRoute("ready", 1280, "session-other");
    const banner = route.querySelector(".privileged-session-banner");
    expect(banner?.textContent).toContain("Privileged context active");
    expect(banner?.textContent).toContain("Safari on macOS");
    expect(banner?.textContent).toContain("Dallas, Texas");
    expect(banner?.textContent).toContain(
      new Date("2026-09-25T18:30:00.000Z").toLocaleString(),
    );
    expect(banner?.textContent).not.toContain(
      new Date("2026-09-25T18:45:00.000Z").toLocaleString(),
    );
    const button = [...(banner?.querySelectorAll("button") ?? [])].find(
      (candidate) => candidate.textContent.includes("End privileged session"),
    );
    expect(button).toBeDefined();
    expect(
      button
        ?.closest("form")
        ?.querySelector<HTMLInputElement>("[name='sessionId']")?.value,
    ).toBe("session-other");
  });

  it("renders the fresh Account version, editable Display Name, and permitted Security History", () => {
    const route = renderRoute("ready");
    const displayName = route.querySelector<HTMLInputElement>(
      "input[name='displayName']",
    );
    const profileForm = displayName?.closest("form");

    expect(displayName?.value).toBe("Local Docket Account");
    expect(
      profileForm?.querySelector<HTMLInputElement>("[name='expectedVersion']")
        ?.value,
    ).toBe("4");
    expect(route.textContent).toContain("local@identity.example.test");
    expect(route.textContent).toContain("Accepted sign-in");
    expect(route.textContent).toContain("Chrome on Windows");
    expect(route.textContent).toContain("Austin, Texas");
    expect(route.textContent).not.toContain("history-sign-in");
  });

  it("offers a native keyboard-focusable Display Name control", () => {
    const route = renderRoute("ready");
    const button = [...route.querySelectorAll("button")].find((candidate) =>
      candidate.textContent.includes("Update Display Name"),
    );
    expect(button).toBeDefined();
    button?.focus();
    expect(document.activeElement).toBe(button);
  });

  it("keeps the session journey within a narrow mobile viewport", () => {
    const route = renderRoute("ready", 320);
    expect(window.innerWidth).toBe(320);
    expect(route.querySelectorAll(".session-row")).toHaveLength(2);
    expect(route.querySelector("main")?.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
  });
});
