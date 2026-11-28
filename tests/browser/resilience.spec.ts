import { test, expect, type Page } from "@playwright/test";
import { begin, ready, state, walk } from "./input";
import { initialState } from "../../src/state/game";
async function put(page: Page, database: string, value: unknown) {
  await page.evaluate(
    ({ database, value }) =>
      new Promise<void>((resolve, reject) => {
        const r = indexedDB.open(database, 1);
        r.onupgradeneeded = () => r.result.createObjectStore("snapshots");
        r.onerror = () => reject(r.error);
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
      }),
    { database, value },
  );
}
async function read(page: Page, database: string) {
  return page.evaluate(
    (database) =>
      new Promise<unknown>((resolve, reject) => {
        const r = indexedDB.open(database, 1);
        r.onerror = () => reject(r.error);
        r.onsuccess = () => {
          const db = r.result,
            t = db.transaction("snapshots", "readonly"),
            q = t.objectStore("snapshots").get("first-voyage");
          let value: unknown;
          q.onsuccess = () => {
            value = q.result;
          };
          t.oncomplete = () => {
            db.close();
            resolve(value);
          };
          t.onabort = () => reject(t.error);
        };
      }),
    database,
  );
}
test("title credits return, native keyboard menus, settings, picking and laptop layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await ready(page);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("button", { name: "Begin your voyage", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Credits & provenance", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Begin your voyage", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Begin your voyage", exact: true })
    .focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Skip memory", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip memory", exact: true }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Esc · Pause", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("heading", { name: "A moment on the shore", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Settings & controls", exact: true })
    .click();
  await page.getByRole("checkbox", { name: "Sound off", exact: true }).check();
  await page
    .getByRole("checkbox", { name: "Reduced decorative motion", exact: true })
    .check();
  await page
    .getByRole("slider", { name: "Sea and harbour volume", exact: true })
    .focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  expect((await state(page)).settings).toEqual({
    muted: true,
    volume: 0.05,
    reducedMotion: true,
  });
  await page.setViewportSize({ width: 1024, height: 720 });
  const bounds = await page.locator("#panel").boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1024);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(720);
  await page.keyboard.press("Escape");
  await page.keyboard.press("m");
  await expect(
    page.getByRole("heading", { name: "The Saltglass channel", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("j");
  await expect(
    page.getByRole("heading", { name: "Notes from the sea", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator("canvas").click({ position: { x: 350, y: 350 } });
  const pick = await page.evaluate(
    () => (window as any).voyage.getMetrics().lastPick,
  );
  expect(Number.isFinite(pick.x) && Number.isFinite(pick.z)).toBe(true);
  // One physical E must board once, rather than replaying into a dock action.
  await walk(page, 55, 0);
  await page.keyboard.press("e");
  expect((await state(page)).player.mode).toBe("boat");
  await page.waitForTimeout(150);
  expect((await state(page)).player.mode).toBe("boat");
  await page.keyboard.press("e");
  expect((await state(page)).player.mode).toBe("walk");
  await page.keyboard.press("e");
  expect((await state(page)).player.mode).toBe("boat");
  await page.keyboard.press("r");
  expect((await state(page)).player.mode).toBe("walk");
  expect((await state(page)).boat.docked).toBe("havenport");
  await page.keyboard.down("d");
  await page.keyboard.press("Escape");
  await page.keyboard.up("d");
  await page.keyboard.press("Escape");
  const stopped = (await state(page)).player;
  await page.waitForTimeout(250);
  expect((await state(page)).player).toEqual(stopped);
  expect(errors).toEqual([]);
});
for (const [name, raw] of [
  ["future", '{"schemaVersion":99,"note":"preserve exact original bytes"}'],
  ["corrupt", "{broken-snapshot"],
] as const)
  test(`${name} snapshot survives temporary play, recovery and autosave`, async ({
    page,
  }) => {
    await page.goto("./");
    await ready(page);
    await put(page, "thehousebythesea-pixel", raw);
    await page.reload();
    await begin(page);
    await page.keyboard.press("r");
    await page.waitForTimeout(11000);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Save voyage", exact: true }),
    ).toBeDisabled();
    expect(await read(page, "thehousebythesea-pixel")).toBe(raw);
  });
test("missing and stalled art are bounded, input-locked and recover through retry", async ({
  page,
}) => {
  await page.route("**/assets/atlas.png", (r) => r.abort());
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", {
      name: "The coast could not load",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Begin your voyage", exact: true }),
  ).toHaveCount(0);
  await page.unroute("**/assets/atlas.png");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await ready(page);
  await expect(
    page.getByRole("button", { name: "Begin your voyage", exact: true }),
  ).toBeVisible();
  await page.route("**/assets/atlas.png", () => {});
  const start = Date.now();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", {
      name: "The coast could not load",
      exact: true,
    }),
  ).toBeVisible({ timeout: 15000 });
  expect(Date.now() - start).toBeLessThan(16000);
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
});
test("malformed metadata and a missing required animated frame show an honest retry state", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/assets/manifest.json", (r) =>
    r.fulfill({ contentType: "application/json", body: '{"frames":[]}' }),
  );
  await page.goto("./");
  await expect(
    page.getByRole("heading", {
      name: "The coast could not load",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
  await page.unroute("**/assets/manifest.json");
  await page.route("**/assets/manifest.json", async (r) => {
    const response = await r.fetch(),
      json = await response.json();
    json.frames = json.frames.filter((f: { id: string }) => f.id !== "tree-1");
    await r.fulfill({ response, body: JSON.stringify(json) });
  });
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "The coast could not load",
      exact: true,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
function legacy() {
  const { worldVersion: _world, ...s } = initialState();
  return {
    ...s,
    schemaVersion: 1,
    wallet: 195,
    delivery: "complete",
    inventory: { sardine: 2, bream: 1 },
    discoveries: ["havenport", "saltglass-bay"],
    story: {
      ...s.story,
      metMira: true,
      outingComplete: true,
      homeSeen: true,
      prologueSeen: true,
    },
    player: {
      ...s.player,
      x: 999,
      z: 999,
      mode: "boat",
      island: "saltglass-bay",
    },
    boat: { ...s.boat, x: 888, z: 888, docked: null },
    settings: { muted: true, volume: 0.4 },
  };
}
test("explicit legacy import copies progress to a safe pixel dock and preserves its source", async ({
  page,
}) => {
  await page.goto("./");
  await ready(page);
  const raw = JSON.stringify(legacy());
  await put(page, "thehousebythesea", raw);
  await page
    .getByRole("button", { name: "Import original voyage", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Continue voyage", exact: true }),
  ).toBeVisible();
  await begin(page);
  const s = await state(page);
  expect(s.wallet).toBe(195);
  expect(s.delivery).toBe("complete");
  expect(s.inventory).toEqual({ sardine: 2, bream: 1 });
  expect(s.player).toEqual({
    x: 48,
    z: -220,
    heading: 0,
    mode: "walk",
    island: "saltglass-bay",
  });
  expect(s.boat).toEqual({
    x: 63,
    z: -220,
    heading: 0,
    docked: "saltglass-bay",
  });
  expect(await read(page, "thehousebythesea")).toBe(raw);
  expect(
    ((await read(page, "thehousebythesea-pixel")) as { schemaVersion: number })
      .schemaVersion,
  ).toBe(2);
});
test("a failed import write says temporary and never reports durable success", async ({
  page,
}) => {
  await page.goto("./");
  await ready(page);
  const raw = JSON.stringify(legacy());
  await put(page, "thehousebythesea", raw);
  await page.evaluate(() => {
    const transaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (
      ...args: Parameters<IDBDatabase["transaction"]>
    ) {
      if (this.name === "thehousebythesea-pixel" && args[1] === "readwrite")
        throw new DOMException("Simulated quota denial", "QuotaExceededError");
      return transaction.apply(this, args);
    };
  });
  await page
    .getByRole("button", { name: "Import original voyage", exact: true })
    .click();
  await expect(page.locator("#toast")).toContainText(
    "loaded for this tab only",
  );
  expect((await state(page)).wallet).toBe(195);
  expect(await read(page, "thehousebythesea")).toBe(raw);
  expect(await read(page, "thehousebythesea-pixel")).toBeUndefined();
  await expect(page.locator("#save-status")).toContainText("Not saved");
});
