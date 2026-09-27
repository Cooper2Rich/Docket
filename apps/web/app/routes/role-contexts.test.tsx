// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import {
  RoleContextsView,
  roleContextViewStates,
  shouldRevalidate,
  type RoleContextActionData,
  type RoleContextsLoaderData,
  type RoleContextViewState,
} from "./role-contexts.js";

let root: Root | undefined;
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const contexts: RoleContextsLoaderData["contexts"] = [
  {
    grantId: "grant-school",
    contextKind: "school",
    scopeId: "school-1",
    scopeLabel: "Central High School",
    privileged: false,
    authorityVersion: 1,
  },
  {
    grantId: "grant-platform",
    contextKind: "platform_administrator",
    scopeId: "docket-platform",
    scopeLabel: "Docket platform",
    privileged: true,
    authorityVersion: 2,
  },
];
const current: NonNullable<RoleContextsLoaderData["current"]> = {
  id: "context-school",
  grantId: "grant-school",
  contextKind: "school",
  scopeId: "school-1",
  scopeLabel: "Central High School",
  privileged: false,
  authorityVersion: 1,
  version: 3,
};

function data(
  state: RoleContextViewState,
  overrides: Partial<RoleContextsLoaderData> = {},
): RoleContextsLoaderData {
  return {
    state,
    tabId: "tab-test-1",
    contexts: state === "ready" ? contexts : [],
    ...(state === "ready" ? { current } : {}),
    ...overrides,
  };
}

function renderRoute(
  loaderData: RoleContextsLoaderData,
  actionData?: RoleContextActionData,
  width = 1280,
) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const router = createMemoryRouter(
    [
      {
        path: "/account/role-contexts",
        element: (
          <RoleContextsView
            loaderData={loaderData}
            {...(actionData ? { actionData } : {})}
          />
        ),
        action: () => ({ ok: true, message: "changed" }),
      },
    ],
    { initialEntries: ["/account/role-contexts"] },
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
  sessionStorage.clear();
});

describe("rendered Active Role Context route", () => {
  it("uses only the tab-aware selector refresh after route actions", () => {
    const common = {
      currentUrl: new URL("http://docket.test/account/role-contexts"),
      currentParams: {},
      nextUrl: new URL("http://docket.test/account/role-contexts"),
      nextParams: {},
    };

    expect(
      shouldRevalidate({
        ...common,
        formMethod: "POST",
        defaultShouldRevalidate: true,
      }),
    ).toBe(false);
    expect(shouldRevalidate({ ...common, defaultShouldRevalidate: true })).toBe(
      true,
    );
  });

  for (const [state, content] of Object.entries(roleContextViewStates)) {
    it(`renders the ${state} state`, () => {
      const route = renderRoute(data(state as RoleContextViewState));
      expect(route.querySelector("h1")?.textContent).toBe(content[0]);
      expect(route.querySelector("main")?.id).toBe("main-content");
      expect(
        route.querySelector("[data-testid='role-context-view-state']")
          ?.textContent,
      ).toBe(state);
    });
  }

  it("persistently identifies the active role and exact scope", () => {
    const route = renderRoute(data("ready"));
    const banner = route.querySelector(".active-context-banner");
    expect(banner?.textContent).toContain("Active in this tab");
    expect(banner?.textContent).toContain("School · Central High School");
    expect(
      banner?.querySelector<HTMLInputElement>(
        "[name='expectedCurrentContextId']",
      )?.value,
    ).toBe("context-school");
    expect(
      banner?.querySelector<HTMLInputElement>("[name='expectedCurrentVersion']")
        ?.value,
    ).toBe("3");
  });

  it("gives a privileged context distinct treatment and termination control", () => {
    const route = renderRoute(
      data("ready", {
        current: {
          id: "context-platform",
          grantId: "grant-platform",
          contextKind: "platform_administrator",
          scopeId: "docket-platform",
          scopeLabel: "Docket platform",
          privileged: true,
          authorityVersion: 2,
          version: 1,
        },
      }),
    );
    const banner = route.querySelector(".active-context-banner-privileged");
    expect(banner?.textContent).toContain(
      "Platform Administrator · Docket platform",
    );
    expect(banner?.textContent).toContain("Leave context");
  });

  it("prompts for a deep-link switch before any protected workspace is opened", () => {
    const route = renderRoute(
      data("ready", {
        deepLinkDecision: "switch_required",
        requiredGrantId: "grant-platform",
      }),
    );
    expect(route.textContent).toContain("Switch context to open this link");
    expect(route.textContent).toContain(
      "has not loaded the protected resource",
    );
    expect(route.querySelector(".deep-link-prompt")?.textContent).toContain(
      "Docket platform",
    );
    expect(route.textContent).not.toContain("Protected workspace open");
  });

  it("offers save, discard, and cancel when a context-scoped draft is dirty", () => {
    const route = renderRoute(data("ready"));
    const draft = route.querySelector<HTMLTextAreaElement>("#context-draft");
    if (!draft) throw new Error("Expected context draft");
    act(() => {
      const descriptor = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      );
      descriptor?.set?.apply(draft, ["unfinished notes"]);
      draft.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const switchButton = [...route.querySelectorAll("button")].find(
      (button) => button.textContent === "Switch",
    );
    if (!switchButton) throw new Error("Expected switch button");
    act(() => {
      switchButton.click();
    });

    const dialog = route.querySelector("[role='dialog']");
    expect(dialog?.textContent).toContain("Save draft and switch");
    expect(dialog?.textContent).toContain("Discard draft and switch");
    const cancel = [...(dialog?.querySelectorAll("button") ?? [])].find(
      (button) => button.textContent === "Cancel switch",
    );
    act(() => cancel?.click());
    expect(route.querySelector("[role='dialog']")).toBeNull();
    expect(route.textContent).toContain("School · Central High School");
  });

  it("destroys the previous protected cache when the server confirms invalidation", () => {
    sessionStorage.setItem(
      "docket:role-context:cache:context-school",
      "private projection",
    );
    renderRoute(data("ready", { tabId: "" }), {
      ok: true,
      message: "switched",
      cacheInvalidation: {
        previousContextId: "context-school",
        destroyProtectedCache: true,
        closeOpenViews: true,
      },
    });
    expect(
      sessionStorage.getItem("docket:role-context:cache:context-school"),
    ).toBeNull();
  });

  it("uses native keyboard-focusable controls in a narrow mobile viewport", () => {
    const route = renderRoute(data("ready"), undefined, 320);
    const buttons = [...route.querySelectorAll("button")];
    expect(buttons.length).toBeGreaterThan(1);
    for (const button of buttons) {
      button.focus();
      expect(document.activeElement).toBe(button);
    }
    expect(route.querySelector("main")?.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
  });
});
