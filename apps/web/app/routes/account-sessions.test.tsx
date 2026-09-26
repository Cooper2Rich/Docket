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
    status: "active",
    version: 1,
    createdAt: "2026-09-25T18:00:00.000Z",
    lastActivityAt: "2026-09-25T19:00:00.000Z",
    expiresAt: "2026-10-02T18:00:00.000Z",
  },
  {
    id: "session-other",
    status: "active",
    version: 1,
    createdAt: "2026-09-24T18:00:00.000Z",
    lastActivityAt: "2026-09-25T18:45:00.000Z",
    expiresAt: "2026-10-01T18:00:00.000Z",
  },
];

function renderRoute(state: AccountSessionViewState, width = 1280) {
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
    currentSessionId: "session-current",
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

  it("keeps the session journey within a narrow mobile viewport", () => {
    const route = renderRoute("ready", 320);
    expect(window.innerWidth).toBe(320);
    expect(route.querySelectorAll(".session-row")).toHaveLength(2);
    expect(route.querySelector("main")?.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
  });
});
