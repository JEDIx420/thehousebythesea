import { test, expect, type Page } from "@playwright/test";
import { begin, state, ready, walk, choose, npc, choices } from "./input";
import walkV1 from "../fixtures/pixel-v1-walk.json" with { type: "json" };
import seaV1 from "../fixtures/pixel-v1-midsea.json" with { type: "json" };
import saltV1 from "../fixtures/pixel-v1-saltglass.json" with { type: "json" };
import completeV1 from "../fixtures/pixel-v1-complete.json" with { type: "json" };
const metrics = (p: Page) =>
  p.evaluate(() => (window as any).voyage.getMetrics());
async function seed(p: Page, value: unknown) {
  await p.evaluate(
    (value) =>
      new Promise<void>((resolve, reject) => {
        const r = indexedDB.open("thehousebythesea-pixel");
        r.onsuccess = () => {
          const db = r.result,
            t = db.transaction("snapshots", "readwrite");
          t.objectStore("snapshots").put(value, "first-voyage");
          t.oncomplete = () => {
            db.close();
            resolve();
          };
          t.onabort = () => reject(t.error);
        };
        r.onerror = () => reject(r.error);
      }),
    value,
  );
}
async function read(p: Page, key: string) {
  return p.evaluate(
    (key) =>
      new Promise((resolve) => {
        const r = indexedDB.open("thehousebythesea-pixel");
        r.onsuccess = () => {
          const db = r.result,
            t = db.transaction("snapshots"),
            q = t.objectStore("snapshots").get(key);
          q.onsuccess = () => resolve(q.result);
          t.oncomplete = () => db.close();
        };
      }),
    key,
  );
}
for (const [name, fixture] of Object.entries({
  walk: walkV1,
  midsea: seaV1,
  saltglass: saltV1,
  complete: completeV1,
}))
  test(`historical world-v1 ${name} migration preserves progress and first-only backup`, async ({
    page,
  }) => {
    await page.goto("./");
    await ready(page);
    const raw = JSON.stringify(fixture);
    await seed(page, raw);
    await page.reload();
    await begin(page);
    const migrated = await state(page);
    expect(migrated.worldVersion).toBe("pixel-first-voyage-v2");
    for (const key of [
      "wallet",
      "inventory",
      "delivery",
      "discoveries",
      "story",
    ] as const)
      expect(migrated[key]).toEqual(fixture[key]);
    expect(migrated.settings.volume).toBe(fixture.settings.volume);
    expect(migrated.settings.music).toBe(0.7);
    await page
      .getByRole("button", { name: "Esc · Pause", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save voyage", exact: true })
      .click();
    await expect(page.locator("#toast")).toHaveText("Your voyage is saved.");
    expect(await read(page, "before-world-v2")).toBe(raw);
    const saved = await state(page);
    await page.reload();
    await begin(page);
    expect(await state(page)).toEqual(saved);
    await seed(
      page,
      JSON.stringify({ ...fixture, wallet: fixture.wallet + 1 }),
    );
    await page.reload();
    await begin(page);
    await page
      .getByRole("button", { name: "Esc · Pause", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save voyage", exact: true })
      .click();
    await expect(page.locator("#toast")).toHaveText("Your voyage is saved.");
    expect(await read(page, "before-world-v2")).toBe(raw);
    const oldWriter = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const r = indexedDB.open("thehousebythesea-pixel", 1);
          r.onerror = () => resolve(r.error?.name);
          r.onsuccess = () => {
            r.result.close();
            resolve("unexpected success");
          };
        }),
    );
    expect(oldWriter).toBe("VersionError");
  });
test("missing music retries are bounded and surfaced while gameplay and ambience survive", async ({
  page,
}) => {
  let requests = 0;
  await page.route("**/audio/*.mp3*", (route) => {
    requests++;
    return route.fulfill({ status: 404, body: "" });
  });
  await page.goto("./");
  await begin(page);
  await expect(page.locator("#toast")).toContainText(
    "Music is temporarily unavailable",
  );
  const before = (await state(page)).player;
  await page.keyboard.press("d", { delay: 350 });
  expect((await state(page)).player.x).not.toBe(before.x);
  await page.waitForTimeout(2500);
  expect(requests).toBe(1);
  expect((await metrics(page)).audio.state).toBe("running");
});
test("mixer, continuous96s loop, ducking and two-state crossfade are real browser audio", async ({
  page,
}) => {
  test.setTimeout(160000);
  await page.goto("./");
  await begin(page);
  await expect
    .poll(async () => (await metrics(page)).audio.track)
    .toBe("havenport");
  await expect
    .poll(async () => (await metrics(page)).audio.musicRms)
    .toBeGreaterThan(0.00005);
  await walk(page, 55, 0);
  await page.keyboard.press("e");
  await expect
    .poll(async () => (await metrics(page)).audio.track)
    .toBe("sailing");
  await page.waitForTimeout(2300);
  expect((await metrics(page)).audio.voices).toBe(1);
  await page.keyboard.press("e");
  await expect
    .poll(async () => (await metrics(page)).audio.track)
    .toBe("havenport");
  await page.getByRole("button", { name: "Esc · Pause", exact: true }).click();
  await page
    .getByRole("button", { name: "Settings & controls", exact: true })
    .click();
  for (const [label, value] of [
    ["Music volume", "0.25"],
    ["Ambience volume", "0.15"],
    ["Sound effects volume", "0.45"],
  ] as const) {
    const slider = page.getByRole("slider", { name: label, exact: true });
    await slider.focus();
    await page.keyboard.press("Home");
    for (let n = 0; n < Math.round(Number(value) / 0.05); n++)
      await page.keyboard.press("ArrowRight");
  }
  expect((await state(page)).settings).toMatchObject({
    music: 0.25,
    ambience: 0.15,
    sfx: 0.45,
  });
  await page.getByRole("checkbox", { name: "Sound off", exact: true }).check();
  await page.waitForTimeout(700);
  expect((await metrics(page)).audio.rms).toBeLessThan(0.00001);
  await page
    .getByRole("checkbox", { name: "Sound off", exact: true })
    .uncheck();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const fullGain = (await metrics(page)).audio.gains.music;
  await npc(page, "ellis");
  await page.keyboard.press("e");
  await page.waitForTimeout(600);
  expect((await metrics(page)).audio.gains.music).toBeLessThan(fullGain * 0.85);
  expect((await metrics(page)).audio.musicRms).toBeGreaterThan(0.00005);
  await page.keyboard.press("Escape");
  // Actual context runs past a full musical loop; do not time-warp the audio clock.
  for (let i = 0; i < 3; i++) await page.waitForTimeout(33000);
  const a = (await metrics(page)).audio;
  expect(a.musicTime).toBeGreaterThan(96);
  expect(a.loopSeconds).toBeCloseTo(96, 1);
  expect(a.musicRms).toBeGreaterThan(0.00005);
  expect(a.voices).toBe(1);
});
test("portraits, release-debounced dialogue, raised walking and compact responsive HUD", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("./");
  await begin(page);
  await page.waitForTimeout(5000);
  const coverage = await page.evaluate(() => {
    const root = document.querySelector("#app")!.getBoundingClientRect();
    const nodes = [".fund", ".objective", "footer"];
    return (
      nodes.reduce((sum, q) => {
        const b = document.querySelector(q)!.getBoundingClientRect();
        return sum + b.width * b.height;
      }, 0) /
      (root.width * root.height)
    );
  });
  expect(coverage).toBeLessThan(0.1);
  const prompt = await page.locator("#context").boundingBox(),
    app = await page.locator("#app").boundingBox(),
    m = await metrics(page),
    scale = app!.width / m.viewport[0];
  if (prompt)
    for (const b of m.screenActors) {
      const p = {
        x: (prompt.x - app!.x) / scale,
        y: (prompt.y - app!.y) / scale,
        w: prompt.width / scale,
        h: prompt.height / scale,
      };
      expect(
        Math.max(0, Math.min(p.x + p.w, b.x + b.width) - Math.max(p.x, b.x)) *
          Math.max(0, Math.min(p.y + p.h, b.y + b.height) - Math.max(p.y, b.y)),
      ).toBe(0);
    }

  await npc(page, "ellis");
  await page.keyboard.press("e");
  await page.keyboard.down("Enter");
  for (let n = 0; n < 8; n++) {
    await page.waitForTimeout(20);
    await page.keyboard.down("Enter");
  } // actual repeated keydowns while held
  await page.waitForTimeout(190);
  await page.keyboard.up("Enter");
  expect((await state(page)).delivery).toBe("available");
  await choose(page, "Take the parcel · 120 coins");
  expect((await state(page)).delivery).toBe("active");
  for (const [x, z] of [
    [40, 0],
    [32, -1],
    [32, -12],
  ])
    await walk(page, x, z);
  await npc(page, "mira");
  await page.keyboard.press("e");
  await expect(page.locator("#dialogue")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "mira · neutral", exact: true }),
  ).toBeVisible();
  const expressions = new Set<string>();
  for (let i = 0; i < 12; i++) {
    const label = await page
      .locator("#dialogue .portrait-slot.active .portrait")
      .getAttribute("aria-label");
    if (label) expressions.add(label);
    const next = page.getByRole("button", {
      name: "Continue dialogue",
      exact: true,
    });
    if (!(await next.isVisible())) break;
    await next.click();
    await page.waitForTimeout(50);
  }
  expect([...expressions].some((x) => x.includes("happy"))).toBe(true);
  expect([...expressions].some((x) => x.includes("rowan"))).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });
  const b = await page.locator("#dialogue").boundingBox();
  expect(b!.x).toBeGreaterThanOrEqual(0);
  expect(b!.x + b!.width).toBeLessThanOrEqual(1280);
  await page.setViewportSize({ width: 840, height: 640 });
  await expect(page.locator("#app")).toHaveAttribute("data-narrow", "true");
  const nameBounds = await page.evaluate(() => ({
    name: document.querySelector("#dialogue-name")!.getBoundingClientRect().y,
    strip: document.querySelector(".dialogue-strip")!.getBoundingClientRect().y,
  }));
  expect(nameBounds.name).toBeGreaterThanOrEqual(nameBounds.strip);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.keyboard.press("Escape");
  for (const [x, z] of [
    [32, -12],
    [32, -1],
    [22, -7],
    [10, -12],
    [-14, -16],
    [-28, -24],
    [-28, -28],
    [-28, -44],
    [-28, -60],
    [-40, -72],
    [-42, -84],
  ])
    await test.step(`Walk the lighthouse route to ${x},${z}`, () =>
      walk(page, x, z));
  expect((await metrics(page)).elevation).toBe(24);
  await page.keyboard.press("r");
  expect((await state(page)).wallet).toBe(25);
  expect((await metrics(page)).elevation).toBe(0);
});

test("actual IndexedDBv1 upgrade retains snapshots and failed migration write rolls back backup too", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/p15-storage-fixture", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>isolated historical storage fixture</title>",
    }),
  );
  await page.goto(new URL("p15-storage-fixture", baseURL).toString());
  const raw = JSON.stringify(saltV1);
  await page.evaluate(
    (raw) =>
      new Promise<void>((resolve, reject) => {
        const r = indexedDB.open("thehousebythesea-pixel", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("snapshots");
        r.onsuccess = () => {
          const db = r.result,
            t = db.transaction("snapshots", "readwrite");
          t.objectStore("snapshots").put(raw, "first-voyage");
          t.oncomplete = () => {
            db.close();
            resolve();
          };
          t.onabort = () => reject(t.error);
        };
      }),
    raw,
  );
  await page.goto(baseURL!);
  await begin(page);
  expect((await state(page)).player).toMatchObject({
    x: saltV1.player.x,
    z: saltV1.player.z - 120,
  });
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (
        key === "first-voyage" &&
        value?.worldVersion === "pixel-first-voyage-v2"
      )
        throw new DOMException(
          "Injected migration commit denial",
          "QuotaExceededError",
        );
      return put.call(this, value, key);
    };
  });
  await page.getByRole("button", { name: "Esc · Pause", exact: true }).click();
  await page.getByRole("button", { name: "Save voyage", exact: true }).click();
  await expect(page.locator("#save-status")).toContainText("Not saved");
  expect(await read(page, "first-voyage")).toBe(raw);
  expect(await read(page, "before-world-v2")).toBeUndefined();
  expect(errors).toEqual([]);
});
test("safe pier step cannot replay E or fishing and recovery clears transient motion", async ({
  page,
}) => {
  await page.goto("./");
  await begin(page);
  await walk(page, 55, 0);
  await page.keyboard.press("e");
  await expect
    .poll(async () => (await metrics(page)).gangway !== null)
    .toBe(true);
  await page.keyboard.press("e");
  await page.keyboard.press("f");
  expect((await state(page)).player.mode).toBe("boat");
  await expect(page.locator("#fishing")).toBeHidden();
  await page.keyboard.press("r");
  await expect.poll(async () => (await metrics(page)).gangway).toBeNull();
  const recovered = await state(page);
  expect(recovered.player.mode).toBe("walk");
  await page.waitForTimeout(650);
  expect((await state(page)).player).toEqual(recovered.player);
  await walk(page, 55, 0);
  await page.keyboard.press("e");
  // A fresh held throttle during the step takes effect after it finishes.
  await page.keyboard.down("w");
  await page.waitForTimeout(850);
  await page.keyboard.up("w");
  expect((await state(page)).boat.z).toBeLessThan(-0.01);
  await page.keyboard.press("s", { delay: 700 });
  await expect.poll(async () => (await metrics(page)).gangway).toBeNull();
  await page.keyboard.press("e");
  await expect
    .poll(async () => (await metrics(page)).gangway !== null)
    .toBe(true);
  await page.waitForTimeout(600);
  expect((await state(page)).player.mode).toBe("walk");
  expect((await metrics(page)).gangway).toBeNull();
});
