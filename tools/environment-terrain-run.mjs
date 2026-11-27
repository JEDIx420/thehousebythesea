import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
const origin = process.env.ENVIRONMENT_PREVIEW_URL ?? "http://localhost:5173",
  out = "docs/evidence/visual-reset";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 640, height: 470 } });
  await page.goto(
    `${origin}/thehousebythesea/tools/environment-terrain-proof.html`,
  );
  await page.waitForFunction(
    () => window.v2proof || window.v2proofError,
    undefined,
    { timeout: 60000 },
  );
  const failure = await page.evaluate(() => window.v2proofError);
  if (failure) throw new Error(failure);
  const results = {
    host: `${os.platform()} ${os.arch()}`,
    browser: await browser.version(),
    viewport: [640, 470],
    canvas: [640, 420],
  };
  async function sample(name) {
    await page.waitForTimeout(2500);
    const raw = await page.evaluate(() => window.v2proof.diagnostics());
    const f = raw.frames.sort((a, b) => a - b);
    results[name] = {
      ...raw,
      frames: raw.frames.length,
      p50: f[Math.floor(f.length * 0.5)],
      p95: f[Math.floor(f.length * 0.95)],
      p99: f[Math.floor(f.length * 0.99)],
    };
    await page.screenshot({ path: `${out}/v2-terrain-${name}.png` });
  }
  await sample("live");
  const files = await page.evaluate(() => window.v2proof.export());
  for (const [name, bytes] of Object.entries(files)) {
    const target = path.join(out, "v2-export", name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(bytes));
  }
  if (!files["terrain.glb"])
    throw new Error("No terrain.glb from real exporter");
  await page.evaluate(
    (bytes) => window.v2proof.showExport(bytes),
    files["terrain.glb"],
  );
  await sample("exported");
  await page.evaluate(() => window.v2proof.showAuthored());
  await sample("authored");
  fs.writeFileSync(
    `${out}/v2-terrain-metrics.json`,
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
