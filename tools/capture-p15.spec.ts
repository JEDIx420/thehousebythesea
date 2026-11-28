/** Reproducible real native-browser evidence run. No state injection/time warp.
 * npm run build && npm run preview -- --port4190
 * npx playwright test -c tools/capture-p15.config.ts
 */
import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import {
  state,
  ready,
  begin,
  walk,
  sail,
  brake,
  npc,
  choose,
} from "../tests/browser/input";
// @ts-ignore capture-only JS utility
import { installAudioCapture, record } from "./record-browser.mjs";
test("relaxed actual two-island First Voyage, district stills and audible crossing", async ({
  page,
  baseURL,
  browser,
}) => {
  const dir = "docs/evidence/p15/after";
  await fs.mkdir(dir, { recursive: true });
  const started = Date.now(),
    errors: string[] = [],
    checkpoints: Record<string, unknown> = {};
  page.on("pageerror", (e) => errors.push(e.message));
  await installAudioCapture(page);
  await page.goto(baseURL!);
  await ready(page);
  await page
    .getByRole("button", { name: "Begin your voyage", exact: true })
    .click();
  await expect(page.locator("#cover")).toBeHidden({ timeout: 35000 }); // watch all three original memory cards
  async function shot(name: string, settle = 2000) {
    await page.waitForTimeout(settle);
    await page.screenshot({ path: `${dir}/${name}.png` });
    checkpoints[name] = {
      elapsedSeconds: (Date.now() - started) / 1000,
      state: await state(page),
      metrics: await page.evaluate(() => (window as any).voyage.getMetrics()),
    };
    await fs.writeFile(
      `${dir}/native-checkpoints.json`,
      JSON.stringify(
        {
          browser: browser.version(),
          viewport: [1440, 900],
          errors,
          elapsedSeconds: (Date.now() - started) / 1000,
          checkpoints,
        },
        null,
        2,
      ) + "\n",
    );
    console.log("Captured", name);
  }
  async function route(points: number[][]) {
    for (const [x, z] of points) await walk(page, x, z);
  }
  async function readChoice(name: string, shotName?: string) {
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(4200);
      const next = page.getByRole("button", {
        name: "Continue dialogue",
        exact: true,
      });
      if (!(await next.isVisible())) break;
      if (shotName) {
        const label = await page
          .locator("#dialogue .portrait-slot.active .portrait")
          .getAttribute("aria-label");
        if (label)
          await shot(`${shotName}-${label.replaceAll(/[^a-z]+/g, "-")}`, 0);
      }
      await next.click();
    }
    if (shotName) await shot(`${shotName}-choices`, 500);
    await page.getByRole("button", { name, exact: true }).click();
  }
  await shot("01-harbour", 5500);
  const stopWalk = await record(page, `${dir}/movement-after`);
  const samples = [];
  await page.keyboard.down("w");
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(40);
    samples.push({
      at: Date.now() - started,
      player: (await state(page)).player,
      locomotion: await page.evaluate(
        () => (window as any).voyage.getMetrics().locomotion,
      ),
    });
  }
  await page.keyboard.up("w");
  await page.waitForTimeout(200);
  await page.keyboard.press("r");
  await page.keyboard.press("d", { delay: 1800 });
  await page.keyboard.press("a", { delay: 1800 });
  await page.waitForTimeout(1600);
  const movementRecording = await stopWalk();
  await fs.writeFile(
    `${dir}/movement.json`,
    JSON.stringify({ samples, recording: movementRecording }, null, 2),
  );
  await page.keyboard.press("r");
  await npc(page, "ellis");
  await page.keyboard.press("e");
  await readChoice("Take the parcel · 120 coins", "02-ellis");
  await route([
    [40, 0],
    [32, -1],
    [22, -7],
    [26, 4],
    [26, 19],
    [22, 23],
    [3, 23],
  ]);
  await shot("03-cafe-square");
  await route([
    [22, 23],
    [26, 19],
    [25, 18],
  ]);
  await npc(page, "seller");
  await page.keyboard.press("e");
  await readChoice("See you soon", "04-tomas");
  await route([
    [26, 19],
    [22, 23],
    [3, 23],
    [-18, 17],
    [-34, 17],
    [-47, 25],
    [-50, 42],
    [-53, 57],
  ]);
  await shot("05-garden-street");
  await route([
    [-50, 42],
    [-47, 25],
    [-34, 17],
    [-37, 5],
    [-37, -12],
    [-32, -16],
    [-28, -24],
    [-28, -28],
  ]);
  await shot("06-hill-foot");
  await route([
    [-28, -44],
    [-28, -60],
    [-40, -72],
    [-42, -84],
  ]);
  await shot("07-lighthouse-meadow", 5000);
  await route([
    [-40, -72],
    [-28, -60],
    [-28, -44],
    [-28, -28],
    [-28, -24],
    [-14, -16],
    [10, -12],
    [22, -7],
    [32, -1],
    [32, -12],
  ]);
  await npc(page, "mira");
  await page.keyboard.press("e");
  await readChoice("Tell her about the boat", "08-mira-intro");
  await readChoice("Invite Mira to Saltglass", "09-mira-invite");
  await readChoice("Meet you by the boat", "10-mira-ready");
  await route([
    [32, -12],
    [32, -1],
    [40, 0],
    [55, 0],
  ]);
  await page.waitForTimeout(2500);
  const stopCrossing = await record(
    page,
    `${dir}/audible-town-sea-arrival-dialogue`,
  );
  await page.keyboard.press("e");
  await expect
    .poll(
      () =>
        page.evaluate(() => (window as any).voyage.getMetrics().companionReady),
      { timeout: 20000 },
    )
    .toBe(true);
  await sail(page, 63, -115);
  await shot("11-sailing", 1000);
  await sail(page, 66, -345);
  await brake(page);
  await page.keyboard.press("e");
  await shot("12-saltglass-quay", 2500);
  await npc(page, "nessa");
  await page.keyboard.press("e");
  await readChoice("Hand over the parcel", "13-nessa");
  await readChoice("See you soon");
  const crossingRecording = await stopCrossing();
  await fs.writeFile(
    `${dir}/crossing-recording.json`,
    JSON.stringify(crossingRecording, null, 2),
  );
  await walk(page, 54, -340);
  await page.keyboard.press("f");
  await shot("14-fishing", 600);
  await expect(page.locator("#fishing")).toContainText("A bite!", {
    timeout: 10000,
  });
  await page.keyboard.press("Space");
  expect(
    (await state(page)).inventory.bream + (await state(page)).inventory.sardine,
  ).toBe(1);
  await npc(page, "nessa");
  await page.keyboard.press("e");
  await readChoice("Sell my catch");
  await route([
    [42, -340],
    [30, -341],
    [30, -329],
    [25, -316],
    [29, -310],
    [16, -302],
  ]);
  await shot("15-tide-pools", 5000);
  await route([
    [25, -316],
    [3, -308],
    [-21, -315],
    [-34, -324],
    [-58, -324],
    [-61, -338],
  ]);
  await shot("16-sheltered-cove", 5000);
  await route([
    [-58, -324],
    [-34, -324],
    [-34, -340],
    [-24, -349],
    [-12, -350],
    [-12, -371],
    [-12, -385],
    [-5, -385],
    [-2, -393],
  ]);
  await shot("17-shell-cliff", 5000);
  await page.keyboard.press("e");
  await shot("18-arch-memory", 4500);
  await page.keyboard.press("Escape");
  await route([
    [-5, -385],
    [-12, -385],
    [-12, -371],
    [-12, -350],
    [0, -345],
    [16, -342],
    [30, -341],
    [42, -340],
    [55, -340],
  ]);
  await page.keyboard.press("e");
  await page.waitForTimeout(700);
  await sail(page, 63, -368, 4);
  await sail(page, 90, -368, 5);
  await sail(page, 90, -110, 6);
  await sail(page, 66, -3, 7);
  await brake(page);
  await page.keyboard.press("e");
  await page.waitForTimeout(650);
  await route([
    [40, 0],
    [32, -1],
    [32, -12],
  ]);
  await npc(page, "mira");
  await page.keyboard.press("e");
  await readChoice("Share the memory of the crossing", "19-mira-return");
  await readChoice("See you soon, Mira", "20-shared-memory");
  await route([
    [32, -12],
    [24, -24],
    [24, -45],
    [18, -62],
    [20, -74],
  ]);
  await shot("21-quiet-home-shore", 5000);
  await page.keyboard.press("e");
  await shot("22-home-fund", 4000);
  await page.keyboard.press("Escape");
  await page.keyboard.press("m");
  await shot("23-chart", 1500);
  await page.keyboard.press("Escape");
  await page.keyboard.press("j");
  await shot("24-journal", 1500);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Save voyage", exact: true }).click();
  await expect(page.locator("#toast")).toHaveText("Your voyage is saved.");
  const saved = await state(page);
  await page.reload();
  await begin(page);
  expect(await state(page)).toEqual(saved);
  await shot("25-return-saved", 2500);
  expect(errors).toEqual([]);
  expect(saved.delivery).toBe("complete");
  expect(saved.story.outingComplete).toBe(true);
  expect(saved.story.homeSeen).toBe(true);
  console.log(
    JSON.stringify({
      elapsedSeconds: (Date.now() - started) / 1000,
      errors,
      wallet: saved.wallet,
      kind: "agent-driven real-time reading/exploration, not a human duration claim",
    }),
  );
});
