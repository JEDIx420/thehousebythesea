import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { begin, state, walk, npc } from "../tests/browser/input";
// @ts-ignore local evidence utility
import { installAudioCapture, record } from "./record-browser.mjs";
test("final viewport, prompt and expressive dialogue recording", async ({
  page,
  baseURL,
  browser,
}) => {
  const dir = process.env.PIXEL_FINAL_EVIDENCE_DIR || "docs/evidence/p15/after",
    errors: string[] = [],
    requests: string[] = [];
  await fs.mkdir(dir, { recursive: true });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  await installAudioCapture(page);
  await page.goto(baseURL!);
  await begin(page);
  await page.waitForTimeout(5500);
  await page.screenshot({ path: `${dir}/26-final-harbour-prompt.png` });
  const hud = await page.evaluate(() => {
    const app = document.querySelector("#app")!.getBoundingClientRect();
    return {
      coverage:
        [".fund", ".objective", "footer", ".place", "#context"].reduce(
          (sum, q) => {
            const e = document.querySelector(q) as HTMLElement;
            if (e.hidden || getComputedStyle(e).opacity === "0") return sum;
            const b = e.getBoundingClientRect();
            return sum + b.width * b.height;
          },
          0,
        ) /
        (app.width * app.height),
      app: { width: app.width, height: app.height },
    };
  });
  expect(hud.coverage).toBeLessThan(0.1);
  await walk(page, 40, 0);
  await walk(page, 32, -1);
  await walk(page, 32, -12);
  await npc(page, "mira");
  const stop = await record(page, `${dir}/mira-expressions-audible`);
  await page.keyboard.press("e");
  const expressions = [];
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(4400);
    expressions.push(
      await page
        .locator("#dialogue .active .portrait")
        .getAttribute("aria-label"),
    );
    const next = page.getByRole("button", {
      name: "Continue dialogue",
      exact: true,
    });
    if (!(await next.isVisible())) break;
    await next.click();
  }
  const recording = await stop();
  await page.screenshot({ path: `${dir}/27-final-mira-choices.png` });
  for (const [width, height] of [
    [1280, 720],
    [1024, 720],
    [840, 640],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(500);
    const box = await page.locator("#dialogue").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    for (const button of await page.locator("#dialogue button").all()) {
      const b = await button.boundingBox();
      expect(b!.x + b!.width).toBeLessThanOrEqual(width);
      expect(b!.y + b!.height).toBeLessThanOrEqual(height);
    }
    if (width < 1000) {
      const name = await page.locator("#dialogue-name").boundingBox(),
        strip = await page.locator(".dialogue-strip").boundingBox();
      expect(name!.y).toBeGreaterThanOrEqual(strip!.y);
    }
    await page.screenshot({
      path: `${dir}/28-dialogue-${width}x${height}.png`,
    });
  }
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Settings & controls", exact: true })
    .click();
  await page.screenshot({ path: `${dir}/29-audio-settings.png` });
  await page.keyboard.press("Escape");
  await page.keyboard.press("m");
  const chartPanel = await page.locator("#panel").boundingBox(),
    chartTitle = await page
      .getByRole("heading", { name: "The Saltglass channel", exact: true })
      .boundingBox(),
    fold = await page
      .getByRole("button", { name: "Fold the chart", exact: true })
      .boundingBox();
  expect(chartTitle!.y).toBeGreaterThanOrEqual(chartPanel!.y);
  expect(fold!.y + fold!.height).toBeLessThanOrEqual(
    chartPanel!.y + chartPanel!.height,
  );
  await page.screenshot({ path: `${dir}/30-final-chart.png` });
  await page.keyboard.press("Escape");
  const result = {
    browser: browser.version(),
    errors,
    requests,
    hud,
    expressions,
    recording,
    state: await state(page),
    metrics: await page.evaluate(() => (window as any).voyage.getMetrics()),
    bundle: await page.locator('script[type="module"]').getAttribute("src"),
  };
  await fs.writeFile(
    `${dir}/final-smoke.json`,
    JSON.stringify(result, null, 2) + "\n",
  );
  expect(errors).toEqual([]);
  expect(result.metrics.audio.track).toBe("havenport");
  expect(result.metrics.audio.musicRms).toBeGreaterThan(0.00005);
  expect(
    requests.every((u) => new URL(u).origin === new URL(baseURL!).origin),
  ).toBe(true);
  console.log({ hud, expressions, errors });
});
