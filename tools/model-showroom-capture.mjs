import { chromium } from "@playwright/test";
import fs from "node:fs";
const origin = process.env.MODEL_PREVIEW_URL ?? "http://localhost:5173";
const b = await chromium.launch({ channel: "chrome", headless: true });
try {
  const p = await b.newPage({
    viewport: { width: 1440, height: 1080 },
    deviceScaleFactor: 1,
  });
  p.on("pageerror", (e) => console.log("ERROR", e.message));
  await p.goto(`${origin}/thehousebythesea/tools/model-showroom.html`);
  await p.waitForFunction(() => window.showroom?.ready);
  await p.waitForTimeout(1200);
  fs.mkdirSync("docs/evidence/visual-reset", { recursive: true });
  await p.screenshot({
    path: "docs/evidence/visual-reset/asset-audition-idle.png",
    fullPage: true,
  });
  const reports = await p.evaluate(() => window.showroom.reports);
  fs.writeFileSync(
    "docs/evidence/visual-reset/asset-audition-metrics.json",
    JSON.stringify(reports, null, 2) + "\n",
  );
  console.log("Captured " + reports.length + " actual local GLB candidates.");
  await p.getByRole("button", { name: "Walk clips" }).click();
  await p.waitForTimeout(600);
  await p.screenshot({
    path: "docs/evidence/visual-reset/asset-audition-walk.png",
    fullPage: true,
  });
} finally {
  await b.close();
}
