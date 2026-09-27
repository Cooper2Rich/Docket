// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import {
  CommunicationsInboxView,
  communicationsInboxViewStates,
  type CommunicationsInboxLoaderData,
  type CommunicationsInboxViewState,
} from "./communications-inbox.js";

let root: Root | undefined;
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const items: CommunicationsInboxLoaderData["items"] = [
  {
    id: "inbox_pending_001",
    noticeIntentId: "notice_pending_001",
    recipientAccountId: "account_local_001",
    subject: "Pairing update",
    body: "Round two pairings are ready.",
    deliveryState: "pending",
    version: 1,
    createdAt: "2026-09-26T18:00:00.000Z",
  },
  {
    id: "inbox_failed_001",
    noticeIntentId: "notice_failed_001",
    recipientAccountId: "account_local_001",
    subject: "Delivery follow-up",
    body: "The in-app notice remains available.",
    deliveryState: "delivery_failed",
    version: 2,
    createdAt: "2026-09-26T18:01:00.000Z",
  },
];

function renderRoute(state: CommunicationsInboxViewState) {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const loaderData: CommunicationsInboxLoaderData = {
    state,
    items: state === "ready" ? items : [],
  };
  const router = createMemoryRouter(
    [
      {
        path: "/account/inbox",
        element: <CommunicationsInboxView loaderData={loaderData} />,
      },
    ],
    { initialEntries: ["/account/inbox"] },
  );
  act(() => root?.render(<RouterProvider router={router} />));
  return container;
}

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
    root = undefined;
  }
  document.body.replaceChildren();
});

describe("rendered Communications Inbox route", () => {
  for (const [state, content] of Object.entries(
    communicationsInboxViewStates,
  )) {
    it(`renders the ${state} state`, () => {
      const route = renderRoute(state as CommunicationsInboxViewState);
      expect(route.querySelector("h1")?.textContent).toBe(content.heading);
      expect(route.querySelector("main")?.id).toBe("main-content");
      expect(
        route.querySelector("[data-testid='communications-inbox-view-state']")
          ?.textContent,
      ).toBe(state);
    });
  }

  it("keeps the in-app projection available for pending and failed provider delivery", () => {
    const route = renderRoute("ready");
    expect(route.textContent).toContain("Round two pairings are ready.");
    expect(route.textContent).toContain("provider delivery is pending");
    expect(route.textContent).toContain("provider delivery needs attention");
  });

  it("provides a native keyboard-focusable refresh control", () => {
    const route = renderRoute("ready");
    const button = [...route.querySelectorAll("button")].find((candidate) =>
      candidate.textContent.includes("Refresh notices"),
    );
    expect(button).toBeDefined();
    button?.focus();
    expect(document.activeElement).toBe(button);
  });
});
