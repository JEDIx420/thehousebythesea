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
  return (
    (await page.locator("#cover").isVisible()) ||
    (await page.locator("#dialogue").isVisible())
  );
}
export async function walk(page: Page, x: number, z: number, tolerance = 0.75) {
  const origin = (await state(page)).player,
    segment = { x: x - origin.x, z: z - origin.z },
    length = Math.hypot(segment.x, segment.z);
  let held: string[] = [],
    previous: { x: number; z: number } | undefined,
    blocked = 0,
    precision = false;
  try {
    for (let i = 0; i < 400; i++) {
      const s = await state(page);
      expect(s.player.mode).toBe("walk");
      const dx = x - s.player.x,
        dz = z - s.player.z,
        distance = Math.hypot(dx, dz);
      // Near a waypoint, do not hold movement across asynchronous readbacks.
      // Slow traced runners otherwise receive a stale position and orbit the goal.
      if (!precision && distance <= 6) {
        for (const key of held) await page.keyboard.up(key);
        held = [];
        precision = true;
        await page.waitForTimeout(130);
        continue;
      }
      if (await modal(page)) throw new Error("A modal paused walking");
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
      // Follow the actual lane rather than steering at a far goal and cutting
      // across corners: only real key presses are issued.
      const progress = Math.max(
          0,
          Math.min(
            length,
            ((s.player.x - origin.x) * segment.x +
              (s.player.z - origin.z) * segment.z) /
              Math.max(length, 0.001),
          ),
        ),
        ahead = Math.min(length, progress + 2.2),
        steerX =
          origin.x + (segment.x / Math.max(length, 0.001)) * ahead - s.player.x,
        steerZ =
          origin.z + (segment.z / Math.max(length, 0.001)) * ahead - s.player.z;
      const choice = options.reduce((best, o) =>
        o.unit.x * steerX + o.unit.z * steerZ >
        best.unit.x * steerX + best.unit.z * steerZ
          ? o
          : best,
      );
      if (precision) {
        // One trusted chord/pulse is bounded inside the browser input command;
        // all keys are released and the actual controller settles before reading.
        await page.keyboard.press(choice.keys.join("+"), { delay: 100 });
        await page.waitForTimeout(130);
      } else {
        for (const key of held)
          if (!choice.keys.includes(key)) await page.keyboard.up(key);
        for (const key of choice.keys)
          if (!held.includes(key)) await page.keyboard.down(key);
        held = choice.keys;
        await page.waitForTimeout(70);
      }
    }
    throw new Error(
      `Walk timed out to ${x},${z}: ${JSON.stringify((await state(page)).player)}`,
    );
  } finally {
    for (const key of new Set([...held, "w", "a", "s", "d"]))
      await page.keyboard.up(key).catch(() => {});
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

export async function choices(page: Page) {
  for (let i = 0; i < 30; i++) {
    const next = page.getByRole("button", {
      name: "Continue dialogue",
      exact: true,
    });
    if (!(await next.isVisible())) return;
    await next.click();
    await page.waitForTimeout(25);
  }
  throw Error("Dialogue never reached choices");
}
export async function choose(page: Page, name: string) {
  await choices(page);
  await page.getByRole("button", { name, exact: true }).click();
}
export async function npc(page: Page, id: string) {
  for (let i = 0; i < 8; i++) {
    const target = await page.evaluate(
      (id) =>
        (window as any).voyage.getMetrics().npcs.find((p: any) => p.id === id),
      id,
    );
    await walk(page, target.x, target.z, 1.6);
    const p = (await state(page)).player;
    if (Math.hypot(p.x - target.x, p.z - target.z) < 3) return;
  }
  throw Error(`Cannot approach NPC ${id}`);
}
