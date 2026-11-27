import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
function summarize(raw) {
  const intervals = raw.frames,
    sorted = [...intervals].sort((a, b) => a - b),
    quantile = (q) =>
      sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] ?? 0;
  return {
    ...raw,
    frames: intervals.length,
    intervals,
    meanMs:
      intervals.reduce((a, b) => a + b, 0) / Math.max(1, intervals.length),
    medianMs: quantile(0.5),
    p95Ms: quantile(0.95),
    p99Ms: quantile(0.99),
  };
}
const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
  args: ["--enable-webgl", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({ viewport: { width: 512, height: 384 } });
  page.on("console", (message) => console.log(message.type(), message.text()));
  page.on("pageerror", (error) => console.error("PAGE ERROR", error.message));
  await page.goto(
    "http://localhost:5173/thehousebythesea/tools/terrain-spike.html",
  );
  await page.waitForFunction(
    () => window.spike || window.spikeError,
    undefined,
    { timeout: 120000 },
  );
  const failure = await page.evaluate(() => window.spikeError);
  if (failure) throw new Error(`Live terrain proof failed: ${failure}`);
  fs.mkdirSync("docs/evidence", { recursive: true });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: "docs/evidence/terrain-live.png" });
  const live = await page.evaluate(() => window.spike.diagnostics());
  console.log("LIVE", JSON.stringify(live));
  const exports = await page.evaluate(() => window.spike.export());
  for (const [name, bytes] of Object.entries(exports)) {
    const target = path.join("public/assets", name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(bytes));
    console.log("EXPORT", name, bytes.length);
  }
  if (!exports["terrain.glb"])
    throw new Error("Terrain export did not produce terrain.glb");
  console.log(
    await page.evaluate(
      (bytes) => window.spike.baked(bytes),
      exports["terrain.glb"],
    ),
  );
  await page.waitForTimeout(3500);
  await page.screenshot({ path: "docs/evidence/terrain-baked.png" });
  const baked = await page.evaluate(() => window.spike.diagnostics());
  console.log("BAKED", JSON.stringify(baked));
  fs.writeFileSync(
    "docs/evidence/terrain-metrics.json",
    JSON.stringify(
      {
        LIVE: summarize(live),
        BAKED: summarize(baked),
        host: `${os.platform()} ${os.release()} ${os.arch()}`,
        viewport: "512x384 page;320x240 canvas",
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
