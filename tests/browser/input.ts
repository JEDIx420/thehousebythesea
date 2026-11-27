import type { Page } from "@playwright/test";

export const state = (page: Page) =>
  page.evaluate(() => (window as any).voyage.getState());

export async function installInputProbe(page: Page) {
  await page.addInitScript(() => {
    const pressed = new Set<string>();
    (window as any).__voyageTestKeys = pressed;
    addEventListener("keydown", (e) => pressed.add(e.key.toLowerCase()));
    addEventListener("keyup", (e) => pressed.delete(e.key.toLowerCase()));
    addEventListener("blur", () => pressed.clear());
  });
}

export async function hold(page: Page, key: string, milliseconds: number) {
  // One protocol action owns real keydown, timer and keyup. Separate traced
  // calls take frame snapshots while the key remains held and overshoot turns.
  await page.keyboard.press(key, { delay: milliseconds });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );
}

export async function navigate(
  page: Page,
  x: number,
  z: number,
  tolerance = 2,
) {
  let previousPosition: { x: number; z: number } | null = null;
  let previousWasForward = false,
    blockedFrames = 0;
  for (let i = 0; i < 350; i++) {
    const sample = await page.evaluate(() => ({
      state: (window as any).voyage.getState(),
      keys: [...((window as any).__voyageTestKeys ?? [])],
      panel:
        document
          .querySelector("#overlay.open")
          ?.textContent?.trim()
          .slice(0, 100) ?? null,
    }));
    const p = sample.state.player,
      distance = Math.hypot(x - p.x, z - p.z);
    const desired = Math.atan2(x - p.x, -(z - p.z));
    const difference = Math.atan2(
      Math.sin(desired - p.heading),
      Math.cos(desired - p.heading),
    );
    if (process.env.CI || i % 50 === 0)
      console.log(
        "NAV",
        JSON.stringify({
          target: [x, z],
          iteration: i,
          distance: Number(distance.toFixed(3)),
          position: [p.x, p.z],
          heading: p.heading,
          difference,
          mode: p.mode,
          keys: sample.keys,
          panel: sample.panel,
        }),
      );
    if (sample.panel)
      throw new Error(`Navigation unexpectedly paused: ${sample.panel}`);
    if (distance < tolerance) return;
    if (
      previousWasForward &&
      previousPosition &&
      Math.hypot(p.x - previousPosition.x, p.z - previousPosition.z) < 0.01
    )
      blockedFrames++;
    else blockedFrames = 0;
    if (blockedFrames >= 10)
      throw new Error(
        `Waypoint crosses a blocked surface: target ${x},${z}; actual ${JSON.stringify(p)}`,
      );
    previousPosition = { x: p.x, z: p.z };
    previousWasForward = Math.abs(difference) <= 0.22;
    if (Math.abs(difference) > 0.22)
      await hold(page, difference > 0 ? "d" : "a", 100);
    else await hold(page, "w", p.mode === "boat" ? 250 : 200);
  }
  throw new Error(
    `Could not reach ${x},${z}; ${JSON.stringify((await state(page)).player)}`,
  );
}
