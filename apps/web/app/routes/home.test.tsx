// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import Home, { foundationViewStates } from "./home.js";

let root: Root | undefined;
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function renderRoute(entry: string, width = 1280) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => {
    root?.render(
      <MemoryRouter initialEntries={[entry]}>
        <Home />
      </MemoryRouter>,
    );
  });
  return container;
}

afterEach(() => {
  if (root) {
    act(() => {
      root?.unmount();
    });
    root = undefined;
  }
  document.body.replaceChildren();
});

describe("rendered foundation route", () => {
  for (const [state, content] of Object.entries(foundationViewStates)) {
    it(`renders the ${state} state through the real route`, () => {
      const entry = state === "ready" ? "/" : `/?state=${state}`;
      const route = renderRoute(entry);

      expect(route.querySelector("h1")?.textContent).toBe(content.heading);
      expect(route.querySelector('[role="status"]')?.textContent).toContain(
        state,
      );
      expect(route.querySelector("main")?.id).toBe("main-content");
    });
  }

  it("fails an unknown state into the rendered error state", () => {
    const route = renderRoute("/?state=not-a-state");
    expect(route.querySelector("h1")?.textContent).toBe(
      foundationViewStates.error.heading,
    );
  });

  it("keeps every state action available at a narrow mobile viewport", () => {
    const route = renderRoute("/?state=empty", 320);
    const buttons = [...route.querySelectorAll("button")];

    expect(window.innerWidth).toBe(320);
    expect(buttons.map((button) => button.textContent)).toEqual(
      Object.keys(foundationViewStates),
    );
    expect(route.querySelector("main")?.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
  });

  it("uses native keyboard-focusable controls in deterministic order", () => {
    const route = renderRoute("/");
    const buttons = [...route.querySelectorAll("button")];

    for (const button of buttons) {
      button.focus();
      expect(document.activeElement).toBe(button);
    }
    expect(buttons.every((button) => button.tabIndex === 0)).toBe(true);
  });
});
