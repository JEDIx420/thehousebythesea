import { chromium } from "@playwright/test";
import fs from "node:fs";
const base = process.argv[2] ?? "http://localhost:4181/thehousebythesea/";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const seed = await browser.newContext();
  const prep = await seed.newPage();
  await prep.goto(base);
  await prep
    .getByRole("button", { name: "Begin your voyage", exact: true })
    .waitFor();
  const state = await prep.evaluate(() => window.voyage.getState());
  await prep.goto(`${base}assets/CREDITS.txt`);
  await prep.waitForTimeout(200);
  state.story.prologueSeen = true;
  state.delivery = "active";
  state.player = {
    x: 68,
    z: -190,
    heading: 0,
    mode: "boat",
    island: "havenport",
  };
  state.boat = { x: 68, z: -190, heading: 0, docked: null };
  await prep.evaluate(
    async (state) =>
      await new Promise((resolve, reject) => {
        const r = indexedDB.open("thehousebythesea", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("snapshots");
        r.onerror = () => reject(r.error);
        r.onsuccess = () => {
          const db = r.result,
            t = db.transaction("snapshots", "readwrite");
          t.objectStore("snapshots").put(state, "first-voyage");
          t.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
    state,
  );
  const storage = await seed.storageState({ indexedDB: true });
  await seed.close();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    storageState: storage,
    recordVideo: {
      dir: "test-results/visual-clip",
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();
  await page.goto(base);
  await page
    .getByRole("button", { name: "Continue your voyage", exact: true })
    .click();
  await page.waitForTimeout(2000);
  await page.keyboard.press("w", { delay: 2800 });
  await page.keyboard.press("s", { delay: 1000 });
  await page.waitForTimeout(1000);
  await page.keyboard.press("e");
  if (
    (await page.evaluate(() => window.voyage.getState().player)).mode !== "walk"
  )
    throw new Error("Actual docking failed");
  await page.waitForTimeout(3500);
  for (let i = 0; i < 70; i++) {
    const p = await page.evaluate(() => window.voyage.getState().player),
      dx = 46 - p.x,
      dz = -217 - p.z;
    if (Math.hypot(dx, dz) < 2) break;
    const desired = Math.atan2(dx, -dz),
      difference = Math.atan2(
        Math.sin(desired - p.heading),
        Math.cos(desired - p.heading),
      );
    await page.keyboard.press(
      Math.abs(difference) > 0.22 ? (difference > 0 ? "d" : "a") : "w",
      { delay: 100 },
    );
  }
  await page.keyboard.press("e");
  await page.waitForTimeout(5500);
  await page.getByRole("button", { name: /Hand over the parcel/ }).click();
  await page.waitForTimeout(3500);
  await page.mouse.move(600, 350);
  await page.mouse.down();
  await page.mouse.move(880, 350, { steps: 35 });
  await page.mouse.up();
  await page.waitForTimeout(8000);
  const final = await page.evaluate(() => window.voyage.getState());
  if (final.wallet !== 145 || final.delivery !== "complete")
    throw new Error("Parcel regression during recorded gameplay");
  const video = page.video();
  await context.close();
  fs.mkdirSync("docs/evidence/visual-reset", { recursive: true });
  await video.saveAs("docs/evidence/visual-reset/sail-dock-walk-interact.webm");
  console.log(
    "PASS actual sail/dock/walk/interact; wallet145, parcel complete. Isolated mid-voyage save fixture; no debug movement/actions.",
  );
} finally {
  await browser.close();
}
