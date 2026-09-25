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
  await page.goto("/");

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

for (const state of states) {
  test(`${state} state has no automated WCAG 2.2 AA violation`, async ({
    page,
  }) => {
    await page.addInitScript({ content: axe.source });
    await page.goto(state === "ready" ? "/" : `/?state=${state}`);
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
