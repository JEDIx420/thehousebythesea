import { expect, type Page } from "@playwright/test";
import { walkDirection } from "../../src/world/projection";
import type { GameState } from "../../src/state/game";
export async function state(page: Page): Promise<GameState> {
  return page.evaluate(() => (window as any).voyage.getState());
}
export async function ready(page: Page) {
  await page.waitForFunction(() => Boolean((window as any).voyage));
  const metrics = await page.evaluate(() =>
    (window as any).voyage.getMetrics(),
  );
  expect(metrics.renderer).toBe("WebGL");
  expect(metrics.scene).toBe("first-voyage");
}
export async function begin(page: Page) {
  await ready(page);
  await page
    .getByRole("button", {
      name: /Begin your voyage|Continue voyage|Play a temporary voyage/,
      exact: true,
    })
    .click();
  if (
    await page
      .getByRole("button", { name: "Skip memory", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Skip memory", exact: true })
      .click();
}
const options = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
].map(([h, v]) => ({
  h,
  v,
  unit: walkDirection(h, v),
  keys: [
    ...(h < 0 ? ["a"] : h > 0 ? ["d"] : []),
    ...(v < 0 ? ["w"] : v > 0 ? ["s"] : []),
  ],
}));
async function modal(page: Page) {
  return page.locator("#cover").isVisible();
}
export async function walk(page: Page, x: number, z: number, tolerance = 1.3) {
  let held: string[] = [],
    previous: { x: number; z: number } | undefined,
    blocked = 0;
  try {
    for (let i = 0; i < 400; i++) {
      const s = await state(page);
      expect(s.player.mode).toBe("walk");
      if (await modal(page)) throw new Error("A modal paused walking");
      const dx = x - s.player.x,
        dz = z - s.player.z,
        distance = Math.hypot(dx, dz);
      if (distance < tolerance) return;
      if (
        previous &&
        Math.hypot(s.player.x - previous.x, s.player.z - previous.z) < 0.003
      )
        blocked++;
      else blocked = 0;
      if (blocked > 25)
        throw new Error(
          `Blocked walking to ${x},${z}: ${JSON.stringify(s.player)}`,
        );
      previous = s.player;
      const choice = options.reduce((best, o) =>
        o.unit.x * dx + o.unit.z * dz > best.unit.x * dx + best.unit.z * dz
          ? o
          : best,
      );
      for (const key of held)
        if (!choice.keys.includes(key)) await page.keyboard.up(key);
      for (const key of choice.keys)
        if (!held.includes(key)) await page.keyboard.down(key);
      held = choice.keys;
      await page.waitForTimeout(70);
    }
    throw new Error(
      `Walk timed out to ${x},${z}: ${JSON.stringify((await state(page)).player)}`,
    );
  } finally {
    for (const key of held) await page.keyboard.up(key).catch(() => {});
  }
}
export async function sail(page: Page, x: number, z: number, tolerance = 6) {
  let forward = false,
    previous: { x: number; z: number } | undefined,
    blocked = 0;
  try {
    for (let i = 0; i < 700; i++) {
      const s = await state(page);
      expect(s.player.mode).toBe("boat");
      if (await modal(page)) throw new Error("A modal paused sailing");
      const dx = x - s.boat.x,
        dz = z - s.boat.z,
        distance = Math.hypot(dx, dz);
      if (distance < tolerance) return;
      if (
        forward &&
        previous &&
        Math.hypot(s.boat.x - previous.x, s.boat.z - previous.z) < 0.003
      )
        blocked++;
      else blocked = 0;
      if (blocked > 35)
        throw new Error(`Blocked hull to ${x},${z}: ${JSON.stringify(s.boat)}`);
      previous = s.boat;
      const desired = Math.atan2(dx, -dz),
        difference = Math.atan2(
          Math.sin(desired - s.boat.heading),
          Math.cos(desired - s.boat.heading),
        );
      if (Math.abs(difference) > 0.18) {
        if (forward) {
          await page.keyboard.up("w");
          forward = false;
        }
        await page.keyboard.press(difference > 0 ? "d" : "a", { delay: 100 });
      } else {
        if (!forward) {
          await page.keyboard.down("w");
          forward = true;
        }
        await page.waitForTimeout(80);
      }
    }
    throw new Error(
      `Sail timed out to ${x},${z}: ${JSON.stringify((await state(page)).boat)}`,
    );
  } finally {
    if (forward) await page.keyboard.up("w").catch(() => {});
  }
}
export async function brake(page: Page) {
  await page.keyboard.press("s", { delay: 1500 });
}
