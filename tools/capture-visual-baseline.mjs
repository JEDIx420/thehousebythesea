import { chromium } from "@playwright/test";
import fs from "node:fs";
const label = process.argv[2] ?? "before",
  base = process.argv[3] ?? "http://localhost:4180/thehousebythesea/";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const probe = await browser.newPage();
  await probe.goto(base);
  await probe
    .getByRole("button", { name: "Begin your voyage", exact: true })
    .waitFor();
  const initial = await probe.evaluate(() => window.voyage.getState());
  await probe.close();
  const views = [
    ["harbour", 48, 0, "walk", "havenport"],
    ["characters", 36, -12, "walk", "havenport"],
    ["sailing", 68, -110, "boat", "havenport"],
    ["docking", 55, -220, "walk", "saltglass-bay"],
    ["saltglass", 32, -230, "walk", "saltglass-bay"],
    ["home", 24, -31, "walk", "havenport"],
    ["harbour-boat", 62, 0, "boat", "havenport"],
  ];
  if (label !== "before")
    views.push(
      ["mira-front", 35, -13.3, "walk", "havenport"],
      ["mira-three-quarter", 34, -13.3, "walk", "havenport"],
      ["mira-walking", 35, -9.5, "walk", "havenport"],
    );
  for (const [name, x, z, mode, island] of views.filter(
    ([name]) => !process.argv[4] || name === process.argv[4],
  )) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    const state = structuredClone(initial);
    state.story.prologueSeen = true;
    state.player = { x, z, heading: 0, mode, island };
    state.boat = {
      x: mode === "boat" ? x : 62,
      z: mode === "boat" ? z : island === "havenport" ? 0 : -220,
      heading: 0,
      docked: mode === "boat" ? null : island,
    };
    await page.goto(`${base}assets/CREDITS.txt`);
    await page.evaluate(async (state) => {
      await new Promise((resolve, reject) => {
        const r = indexedDB.open("thehousebythesea", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("snapshots");
        r.onsuccess = () => {
          const db = r.result,
            t = db.transaction("snapshots", "readwrite");
          t.objectStore("snapshots").put(state, "first-voyage");
          t.oncomplete = () => {
            db.close();
            resolve();
          };
        };
        r.onerror = () => reject(r.error);
      });
    }, state);
    await page.goto(
      base + (label === "lighting-reference" ? "?light=reference" : ""),
    );
    await page
      .getByRole("button", { name: "Continue your voyage", exact: true })
      .click();
    if (name === "home") {
      await page.mouse.move(700, 400);
      await page.mouse.down();
      await page.mouse.move(1033, 400, { steps: 20 });
      await page.mouse.up();
    }
    if (name.startsWith("mira-")) {
      await page.mouse.move(700, 400);
      await page.mouse.wheel(0, name === "mira-walking" ? -200 : -800);
      const angle =
        name === "mira-walking" ? Math.PI : name === "mira-front" ? 0 : 0.45;
      await page.mouse.down();
      await page.mouse.move(700 + (0.8 - angle) / 0.006, 366, { steps: 20 });
      await page.mouse.up();
      if (name === "mira-walking") await page.waitForTimeout(7500);
    }
    await page.waitForTimeout(1600);
    fs.mkdirSync("docs/evidence/visual-reset", { recursive: true });
    await page.screenshot({
      path: `docs/evidence/visual-reset/${label}-${name}.png`,
    });
    console.log(
      label,
      name,
      JSON.stringify(await page.evaluate(() => window.voyage.metrics())),
    );
    await ctx.close();
  }
} finally {
  await browser.close();
}
