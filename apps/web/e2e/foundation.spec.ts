import { expect, test } from "@playwright/test";
import axe from "axe-core";

const states = [
  "ready",
  "loading",
  "empty",
  "error",
  "denied",
  "stale",
] as const;

const apiBaseUrl = "http://127.0.0.1:3001";

test.beforeEach(async ({ request }) => {
  const response = await request.post(`${apiBaseUrl}/__e2e/mode`, {
    data: { mode: "normal" },
  });
  expect(response.ok()).toBe(true);
});

test("server renders useful state-specific HTML without server secrets", async ({
  request,
}) => {
  const response = await request.get("/?state=empty");
  const html = await response.text();

  expect(response.ok()).toBe(true);
  expect(html).toContain("No tournaments yet");
  expect(html).toContain('id="main-content"');
  expect(html).not.toContain("CLERK_SECRET_KEY");
  expect(html).not.toContain("sk_test_");
  expect(html).not.toContain("sk_live_");
  expect(html).not.toContain("docket_e2e_fixture");
});

test("hydrates and navigates every required route state with the keyboard", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  for (const state of states) {
    const control = page.getByRole("button", { name: `Show ${state} state` });
    await control.focus();
    await expect(control).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status").first()).toContainText(
      `Current rendered state: ${state}`,
    );
    await expect(page).toHaveURL(state === "ready" ? "/" : `/?state=${state}`);
  }

  await expect(page.locator("section[aria-busy='false']")).toHaveCount(1);
});

test("preserves the route at a narrow mobile viewport without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/?state=denied");

  await expect(
    page.getByRole("heading", { name: "Access denied" }),
  ).toBeVisible();
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});

test("server renders the Account Session journey without server secrets", async ({
  request,
}) => {
  const response = await request.get("/account/sessions");
  const html = await response.text();

  expect(response.ok()).toBe(true);
  expect(html).toContain("Your Docket sessions");
  expect(html).toContain("This device");
  expect(html).toContain('id="main-content"');
  expect(html).not.toContain("CLERK_SECRET_KEY");
  expect(html).not.toContain("sk_live_docket_e2e_fixture");
});

test("Account Session revocation persists through PostgreSQL after reload and a fresh API connection", async ({
  page,
}) => {
  await page.goto("/account/sessions");
  await expect(
    page.getByRole("listitem").filter({ hasText: "Signed-in session" }),
  ).toBeVisible();
  const revoke = page.getByRole("button", {
    name: "Revoke signed-in session",
  });
  await revoke.focus();
  await expect(revoke).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Session revoked.");
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Revoke signed-in session" }),
  ).toHaveCount(0);
});

test("Account Session renders its loading state", async ({ page, request }) => {
  await page.goto("/account/sessions");
  const mode = await request.post(`${apiBaseUrl}/__e2e/mode`, {
    data: { mode: "delay" },
  });
  expect(mode.ok()).toBe(true);
  await page.getByRole("button", { name: "Refresh sessions" }).click();
  await expect(
    page.getByRole("heading", { name: "Loading your sessions" }),
  ).toBeVisible();
  await expect(page.getByTestId("session-view-state")).toContainText("ready");
});

for (const [mode, heading] of [
  ["empty", "No active sessions"],
  ["error", "Sessions unavailable"],
  ["denied", "Session access denied"],
  ["stale", "Session list is out of date"],
] as const) {
  test(`Account Session renders its ${mode} state`, async ({
    page,
    request,
  }) => {
    const response = await request.post(`${apiBaseUrl}/__e2e/mode`, {
      data: { mode },
    });
    expect(response.ok()).toBe(true);
    await page.goto("/account/sessions");
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByTestId("session-view-state")).toContainText(mode);
  });
}

test("Account Session reflows at a narrow mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/account/sessions");
  await expect(
    page.getByRole("list", { name: "Active Docket sessions" }),
  ).toBeVisible();
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});

for (const state of states) {
  test(`${state} state has no automated WCAG 2.2 AA violation`, async ({
    page,
  }) => {
    await page.addInitScript({ content: axe.source });
    await page.goto(state === "ready" ? "/" : `/?state=${state}`, {
      waitUntil: "networkidle",
    });
    await expect(page.getByRole("status").first()).toContainText(
      `Current rendered state: ${state}`,
    );
    const violations = await page.evaluate(async () => {
      const engine = (
        globalThis as typeof globalThis & {
          axe: {
            run: (
              context: Document,
              options: { runOnly: { type: string; values: string[] } },
            ) => Promise<{ violations: { id: string }[] }>;
          };
        }
      ).axe;
      const result = await engine.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] },
      });
      return result.violations.map(({ id }) => id);
    });

    expect(violations).toEqual([]);
  });
}

test("API-backed Account Session route has no automated WCAG 2.2 AA violation", async ({
  page,
}) => {
  await page.addInitScript({ content: axe.source });
  await page.goto("/account/sessions", { waitUntil: "networkidle" });
  await expect(page.getByTestId("session-view-state")).toContainText("ready");
  const violations = await page.evaluate(async () => {
    const engine = (
      globalThis as typeof globalThis & {
        axe: {
          run: (
            context: Document,
            options: { runOnly: { type: string; values: string[] } },
          ) => Promise<{ violations: { id: string }[] }>;
        };
      }
    ).axe;
    const result = await engine.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] },
    });
    return result.violations.map(({ id }) => id);
  });

  expect(violations).toEqual([]);
});
