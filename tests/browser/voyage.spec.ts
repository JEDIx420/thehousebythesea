import { navigation } from "../../src/data/navigation";
import WORLD from "../../assets/source/world.json" with { type: "json" };
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import { begin, state, walk, sail, brake, choose, choices, npc } from "./input";
test("First Voyage: real walking, continuous sailing, work, fishing, Mira and saved return", async ({
  page,
}) => {
  test.setTimeout(480000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const output =
      process.env.PIXEL_EVIDENCE_DIR ||
      (process.env.CI ? "test-results/checkpoints" : "docs/evidence/p15/after"),
    metrics: Record<string, unknown> = {};
  await fs.mkdir(output, { recursive: true });
  async function shot(name: string) {
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${output}/${name}.png` });
    console.info(`Checkpoint ${name}`);
    metrics[name] = {
      capturedAt: new Date().toISOString(),
      metrics: await page.evaluate(() => (window as any).voyage.getMetrics()),
      state: await state(page),
      bundle: await page.locator('script[type="module"]').getAttribute("src"),
    };
    await fs.writeFile(
      `${output}/gameplay-metrics.json`,
      JSON.stringify(metrics, null, 2) + "\n",
    );
  }
  const salt = navigation("saltglass-bay"),
    haven = navigation("havenport"),
    offset = salt.offsetZ;
  await page.goto("./");
  await begin(page);
  await shot("01-havenport");
  await npc(page, "ellis");
  await page.keyboard.press("e");
  await choose(page, "Take the parcel · 120 coins");
  expect((await state(page)).delivery).toBe("active");
  await walk(page, 40, 0);
  await walk(page, 32, -1);
  await walk(page, 32, -12);
  await npc(page, "mira");
  await page.keyboard.press("e");
  await shot("02-mira-dialogue");
  await choose(page, "Tell her about the boat");
  await choose(page, "Invite Mira to Saltglass");
  await choose(page, "Meet you by the boat");
  expect((await state(page)).story.outingInvited).toBe(true);
  await walk(page, 32, -12);
  await walk(page, 32, -1);
  await walk(page, 40, 0);
  await walk(page, 55, 0);
  await page.keyboard.press("e");
  await expect.poll(async () => (await state(page)).player.mode).toBe("boat");
  await expect
    .poll(
      () =>
        page.evaluate(() => (window as any).voyage.getMetrics().companionReady),
      { timeout: 20000 },
    )
    .toBe(true);
  await sail(page, 63, -100);
  await shot("03-sailing");
  await sail(page, salt.dock.x + 3, salt.dock.z - 5);
  await brake(page);
  await expect(page.locator("#context")).toContainText("Tie up");
  await page.keyboard.press("e");
  expect((await state(page)).player.island).toBe("saltglass-bay");
  expect((await state(page)).player.mode).toBe("walk");
  await shot("04-docking");
  await npc(page, "nessa");
  await page.keyboard.press("e");
  await choose(page, "Hand over the parcel");
  expect((await state(page)).wallet).toBe(145);
  await choose(page, "See you soon");
  await page.keyboard.press("e");
  await choices(page);
  await expect(
    page.getByRole("button", { name: "Hand over the parcel", exact: true }),
  ).toHaveCount(0);
  expect((await state(page)).wallet).toBe(145);
  await page.keyboard.press("Escape");
  await walk(page, salt.landing.x - 1, salt.landing.z);
  await page.keyboard.press("f");
  await expect(page.locator("#fishing")).toContainText("Watching the float");
  await page.keyboard.press("f");
  expect((await state(page)).inventory).toEqual({ sardine: 0, bream: 0 });
  for (const fish of ["bream", "sardine"] as const) {
    await page.keyboard.press("f");
    await expect(page.locator("#fishing")).toContainText("Watching the float");
    await expect(page.locator("#toast")).toBeHidden();
    // Capture while waiting. A GPU readback during the 2.1s bite window can
    // consume the real player's response interval on software CI renderers.
    if (fish === "bream") await shot("05-fishing");
    await expect(page.locator("#fishing")).toContainText("A bite!", {
      timeout: 10000,
    });
    await page.keyboard.press("Space");
    await expect.poll(async () => (await state(page)).inventory[fish]).toBe(1);
  }
  await npc(page, "nessa");
  await page.keyboard.press("e");
  await choose(page, "Sell my catch");
  expect((await state(page)).wallet).toBe(195);
  expect((await state(page)).inventory).toEqual({ sardine: 0, bream: 0 });
  for (const [x, z] of [
    [42, 0],
    [30, -1],
    [16, -2],
    [0, -5],
    [-12, -10],
    [-12, -31],
    [-12, -45],
    [-5, -45],
    [-2, -53],
  ])
    await walk(page, x, z + offset);
  expect(
    await page.evaluate(() => (window as any).voyage.getMetrics().elevation),
  ).toBe(28);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Where the sea draws", exact: true }),
  ).toBeVisible();
  await shot("06-saltglass");
  await page.keyboard.press("Escape");
  await shot("06b-saltglass-vista");
  for (const [x, z] of [
    [-5, -45],
    [-12, -45],
    [-12, -31],
    [-12, -10],
    [0, -5],
    [16, -2],
    [30, -1],
    [42, 0],
    [55, 0],
  ])
    await walk(page, x, z + offset);
  await page.keyboard.press("e");
  expect((await state(page)).player.mode).toBe("boat");
  await sail(page, salt.dock.x, salt.dock.z - 28, 4);
  await sail(page, 90, salt.dock.z - 28, 5);
  await sail(page, 90, -110, 6);
  await sail(page, 66, -3, 7);
  await brake(page);
  await expect(page.locator("#context")).toContainText("Tie up");
  await page.keyboard.press("e");
  expect((await state(page)).player.island).toBe("havenport");
  // Mira walks off and follows the same pier lane. Meet her along that route.
  await walk(page, 40, 0);
  await walk(page, 32, -1);
  await walk(page, 32, -12);
  await walk(page, 35, -12);
  await expect
    .poll(() => page.locator("#context").textContent(), { timeout: 20000 })
    .toContain("Mira");
  await page.keyboard.press("e");
  await choose(page, "Share the memory of the crossing");
  expect((await state(page)).story.outingComplete).toBe(true);
  await choose(page, "See you soon, Mira");
  await walk(page, 32, -12);
  await walk(page, 24, -24);
  await walk(page, 24, -45);
  await walk(page, 18, -62);
  await walk(page, 20, -74);
  await page.keyboard.press("e");
  expect((await state(page)).story.homeSeen).toBe(true);
  await shot("07-home-fund");
  await page.keyboard.press("Escape");
  await page.keyboard.press("j");
  await shot("08-journal");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Save voyage", exact: true }).click();
  await expect(page.locator("#toast")).toHaveText("Your voyage is saved.");
  const saved = await state(page);
  await page.reload();
  await begin(page);
  expect(await state(page)).toEqual(saved);
  await page.keyboard.press("m");
  await expect(
    page.getByRole("heading", { name: "The Saltglass channel", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Credits & provenance", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Full licences & notices", exact: true }),
  ).toBeVisible();
  await shot("09-credits");
  expect(errors).toEqual([]);
});
