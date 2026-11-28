import { test, expect, type Page } from "@playwright/test";
import { begin, walk, state } from "./input";
test("real keyboard waypoint arrivals remain precise with250ms stale readbacks", async ({
  page,
}) => {
  await page.goto("./");
  await begin(page);
  const evaluate = page.evaluate.bind(page);
  // Delay only the test-side observation delivery. No game clock/state/input hook.
  page.evaluate = (async (...args: any[]) => {
    const value = await (evaluate as any)(...args);
    await new Promise((resolve) => setTimeout(resolve, 250));
    return value;
  }) as Page["evaluate"];
  for (const [x, z] of [
    [40, 0],
    [32, -1],
    [32, -12],
  ]) {
    await test.step(`Precise arrival ${x},${z}`, () => walk(page, x, z));
    const p = (await state(page)).player;
    expect(Math.hypot(p.x - x, p.z - z)).toBeLessThan(0.75);
  }
  const settled = (await state(page)).player;
  await page.waitForTimeout(400);
  expect((await state(page)).player).toEqual(settled);
  expect((await state(page)).wallet).toBe(25);
  console.info(
    "All three arrivals within0.75 with250ms delayed readbacks; no drift/reward changes.",
  );
});
