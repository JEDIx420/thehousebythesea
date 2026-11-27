/** Delays one real parsed optional GLB to reproduce the post-deadline cleanup path. */
import { chromium } from "@playwright/test";
import fs from "node:fs";
const origin = process.env.ENVIRONMENT_PREVIEW_URL ?? "http://localhost:5173";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  const page = await browser.newPage();
  await page.route("**/__lateworld.html", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<!doctype html><body></body>",
    }),
  );
  await page.route("**/src/world/world.ts*", async (route) => {
    const response = await route.fetch();
    let body = await response.text();
    const target =
      "const parsed = await loader.parseAsync(bytes, `${base}assets/models/`);";
    if (!body.includes(target))
      throw new Error("World parse instrumentation target changed.");
    body = body.replace(
      target,
      target +
        `if(record.id==='fish-crate'){parsed.scene.traverse(o=>{if(o.geometry)o.geometry.addEventListener('dispose',()=>{window.__lateDisposals=(window.__lateDisposals??0)+1;});});await new Promise(resolve=>setTimeout(resolve,11000));}`,
    );
    await route.fulfill({ response, body });
  });
  await page.goto(`${origin}/__lateworld.html`);
  const report = await page.evaluate(async () => {
    window.__lateDisposals = 0;
    let root;
    const started = performance.now();
    const { createWorld } =
      await import("/thehousebythesea/src/world/world.ts");
    const world = await createWorld({
      add(o) {
        root = o;
      },
      remove() {},
    });
    const elapsed = performance.now() - started;
    const before = {
      children: root.children.length,
      blocked: world.blocked(35, 7),
      disposals: window.__lateDisposals,
    };
    await new Promise((resolve) => setTimeout(resolve, 1600));
    const after = {
      children: root.children.length,
      blocked: world.blocked(35, 7),
      disposals: window.__lateDisposals,
    };
    const result = {
      elapsedMs: elapsed,
      warnings: world.warnings,
      deadlineReturned: elapsed < 11000,
      lateGeometryDisposed: after.disposals > 0,
      noLateSceneAdditions: before.children === after.children,
      noLateColliderChanges: before.blocked === after.blocked,
      before,
      after,
    };
    world.dispose();
    return result;
  });
  fs.writeFileSync(
    "docs/evidence/visual-reset/environment-late-load-audit.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
  if (
    !report.deadlineReturned ||
    !report.lateGeometryDisposed ||
    !report.noLateSceneAdditions ||
    !report.noLateColliderChanges
  )
    throw new Error("Late GLB lifecycle failed");
} finally {
  await browser.close();
}
