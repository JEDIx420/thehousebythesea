import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { assets } from "../../src/data/assets";
const metrics: Record<string, unknown> = {};
import { state, navigate, installInputProbe } from "./input";
async function snapshot(page: Page, name: string, settleMs = 1000) {
  if (settleMs) await page.waitForTimeout(settleMs);
  metrics[name] = await page.evaluate(() => ({
    ...(window as any).voyage.metrics(),
    userAgent: navigator.userAgent,
    renderScale: devicePixelRatio,
    memory: (performance as any).memory?.usedJSHeapSize,
    transfer: performance
      .getEntriesByType("resource")
      .map((r: any) => ({ name: r.name, bytes: r.transferSize })),
  }));
  const evidenceDirectory = process.env.CI ? "test-results/checkpoints" : "docs/evidence";
  mkdirSync(evidenceDirectory, { recursive: true });
  writeFileSync(
    `${evidenceDirectory}/gameplay-metrics.json`,
    JSON.stringify(metrics, null, 2),
  );
  await page.screenshot({ path: `${evidenceDirectory}/${name}.png` });
}
test("First Voyage through real movement and contextual interactions", async ({
  page,
}) => {
  // Hosted software rendering completed Saltglass and reached the return sea
  // at 600s. Allow measured finite headroom; local budget/assertions stay fixed.
  test.setTimeout(process.env.CI ? 900000 : 240000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await installInputProbe(page);
  await page.goto("./");
  await page
    .getByRole("button", { name: "Begin your voyage", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip memory", exact: true }).click();
  await snapshot(page, "01-havenport");
  await navigate(page, 44, 4);
  await page.keyboard.press("e");
  await page.getByRole("button", { name: /Take the parcel/ }).click();
  expect((await state(page)).delivery).toBe("active");
  // Leave the cove through its visible inland ramp, not the shallow beach edge.
  await navigate(page, 37, 0);
  await navigate(page, 37, -11);
  await navigate(page, 37, -12);
  await page.keyboard.press("e");
  await snapshot(page, "02-mira");
  await page
    .getByRole("button", { name: "Invite Mira to sketch Saltglass" })
    .click();
  await navigate(page, 37, 0);
  await navigate(page, 48, 0);
  await navigate(page, 54, 0);
  await page.keyboard.press("e");
  expect((await state(page)).player.mode).toBe("boat");
  await navigate(page, 68, -20, 3);
  await navigate(page, 68, -110, 5);
  await snapshot(page, "03-sailing");
  await navigate(page, 66, -218, 6);
  await page.keyboard.press("e");
  expect((await state(page)).player.island).toBe("saltglass-bay");
  expect((await state(page)).player.mode).toBe("walk");
  await snapshot(page, "04-landing");
  await navigate(page, 47, -217);
  await page.keyboard.press("e");
  await page.getByRole("button", { name: /Hand over the parcel/ }).click();
  expect((await state(page)).wallet).toBe(145);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("button", { name: /Hand over the parcel/ }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await navigate(page, 54, -220);
  await page.keyboard.press("f");
  // A new cast must leave the previous bite frame before its own bite is ready.
  await expect(page.locator("#hint")).toContainText("Watching the float");
  await expect(page.locator("#hint")).toContainText("A bite!");
  // The visible bite is the ready signal; do not spend its short reel window
  // on an unrelated screenshot-settling delay on software renderers.
  await snapshot(page, "05-fishing", 0);
  await page.keyboard.press("Space");
  expect((await state(page)).inventory.sardine).toBe(1);
  await page.keyboard.press("f");
  // A new cast must leave the previous bite frame before its own bite is ready.
  await expect(page.locator("#hint")).toContainText("Watching the float");
  await expect(page.locator("#hint")).toContainText("A bite!");
  await page.keyboard.press("Space");
  expect((await state(page)).inventory.bream).toBe(1);
  await page.keyboard.press("f");
  await page.keyboard.press("f");
  expect((await state(page)).inventory.bream).toBe(1);
  await navigate(page, 47, -217);
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Sell my catch", exact: true })
    .click();
  expect((await state(page)).wallet).toBe(195);
  await navigate(page, 37, -220);
  await navigate(page, 32, -232);
  await navigate(page, 25, -241);
  await page.keyboard.press("e");
  await snapshot(page, "06-saltglass");
  await page.keyboard.press("Escape");
  await navigate(page, 32, -232);
  await navigate(page, 37, -220);
  await navigate(page, 48, -220);
  await navigate(page, 54, -220);
  await page.keyboard.press("e");
  await navigate(page, 70, -195, 4);
  await navigate(page, 70, -100, 5);
  await navigate(page, 66, -3, 6);
  await page.keyboard.press("e");
  await navigate(page, 37, 0);
  await navigate(page, 37, -11);
  await navigate(page, 37, -12);
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Share the memory of the crossing" })
    .click();
  expect((await state(page)).story.outingComplete).toBe(true);
  await navigate(page, 33, -28);
  await navigate(page, 24, -31);
  await page.keyboard.press("e");
  await snapshot(page, "07-home-fund");
  await page.keyboard.press("Escape");
  await page.keyboard.press("j");
  await snapshot(page, "08-journal");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Save voyage", exact: true }).click();
  await page.waitForTimeout(1000);
  const before = await state(page);
  await page.reload();
  await page
    .getByRole("button", { name: "Continue your voyage", exact: true })
    .click();
  const after = await state(page);
  expect(after.wallet).toBe(195);
  expect(after.delivery).toBe("complete");
  expect(after.story.outingComplete).toBe(true);
  expect(after.story.homeSeen).toBe(true);
  expect(
    Math.hypot(
      after.player.x - before.player.x,
      after.player.z - before.player.z,
    ),
  ).toBeLessThan(0.1);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Credits & provenance", exact: true })
    .click();
  await snapshot(page, "09-credits");
  await expect(
    page.getByRole("link", { name: "Source", exact: true }),
  ).toHaveCount(assets.length);
  await expect(page.getByRole("dialog")).toContainText(/CC-BY-4.0|CC0/);
  expect(assets.length).toBeGreaterThan(0);
  expect(
    assets.every(
      (asset) => /^https:\/\//.test(asset.source) && asset.license.length > 0,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  console.log(
    "BROWSER_METRICS",
    JSON.stringify(await page.evaluate(() => (window as any).voyage.metrics())),
  );
});
