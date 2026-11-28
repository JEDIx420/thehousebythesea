import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import completeV1 from "../fixtures/pixel-v1-complete.json" with { type: "json" };
import { state, begin, walk, npc } from "./input";
test("returning P1 player keeps real progress while a warm old art cache upgrades coherently", async ({
  page,
}, info) => {
  const dist = path.resolve("dist"),
    html = await fs.readFile(path.join(dist, "index.html"), "utf8"),
    prefix = html.match(/src="([^"]*?)assets\/index[^" ]+\.js/)![1],
    expected = JSON.parse(
      await fs.readFile("public/assets/manifest.json", "utf8"),
    ).frames.length;
  let warming = true;
  const requests: { path: string; version: string | null; warming: boolean }[] =
    [];
  const server = createServer(async (req, res) => {
    const u = new URL(req.url!, "http://127.0.0.1");
    if (u.pathname === "/cache-fixture") {
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "no-store");
      res.end("<!doctype html><title>isolated old browser cache</title>");
      return;
    }
    if (!u.pathname.startsWith(prefix)) {
      res.writeHead(404).end();
      return;
    }
    const relative =
      decodeURIComponent(u.pathname.slice(prefix.length)) || "index.html";
    if (relative.split("/").includes("..")) {
      res.writeHead(400).end();
      return;
    }
    requests.push({
      path: relative,
      version: u.searchParams.get("v"),
      warming,
    });
    const old =
        warming &&
        [
          "assets/atlas.png",
          "assets/atlas.json",
          "assets/manifest.json",
        ].includes(relative),
      file = old
        ? path.resolve("tests/fixtures/pixel-v1-art", path.basename(relative))
        : path.join(dist, relative);
    try {
      const body = await fs.readFile(file);
      res.setHeader(
        "Content-Type",
        (
          {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".mp3": "audio/mpeg",
          } as Record<string, string>
        )[path.extname(relative)] || "text/plain",
      );
      res.setHeader(
        "Cache-Control",
        relative === "index.html" ? "no-store" : "public,max-age=600",
      );
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number },
    origin = `http://127.0.0.1:${address.port}`,
    base = origin + prefix;
  try {
    await page.goto(origin + "/cache-fixture");
    const oldFrames = await page.evaluate(async (base) => {
      for (const file of ["atlas.png", "atlas.json", "manifest.json"])
        await (await fetch(base + "assets/" + file)).arrayBuffer();
      return (await (await fetch(base + "assets/manifest.json")).json()).frames
        .length;
    }, base);
    expect(oldFrames).toBe(280);
    const raw = JSON.stringify(completeV1);
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
          r.onerror = () => reject(r.error);
        }),
      raw,
    );
    warming = false;
    // The old canonical URL really remains cached after the server has upgraded.
    expect(
      await page.evaluate(
        async (base) =>
          (await (await fetch(base + "assets/manifest.json")).json()).frames
            .length,
        base,
      ),
    ).toBe(280);
    expect(
      requests.filter((r) => r.path === "assets/manifest.json").length,
    ).toBe(1);
    await page.goto(base);
    await page.waitForFunction(() => Boolean((window as any).voyage), null, {
      timeout: 8000,
    });
    await begin(page);
    const current = await state(page);
    expect(current.wallet).toBe(completeV1.wallet);
    expect(current.story).toEqual(completeV1.story);
    expect(current.delivery).toBe(completeV1.delivery);
    expect(current.worldVersion).toBe("pixel-first-voyage-v2");
    expect(
      await page.evaluate(() => (window as any).voyage.getMetrics().assets),
    ).toBe(expected);
    const before = { ...current.player };
    await page.keyboard.press("w", { delay: 300 });
    expect(
      Math.hypot(
        (await state(page)).player.x - before.x,
        (await state(page)).player.z - before.z,
      ),
    ).toBeGreaterThan(0.2);
    expect((await state(page)).wallet).toBe(195);
    for (const file of [
      "assets/atlas.png",
      "assets/atlas.json",
      "assets/manifest.json",
    ])
      expect(
        requests.some((r) => r.path === file && !r.warming && r.version),
      ).toBe(true);
    await page.keyboard.press("r");
    await walk(page, 40, 0);
    await walk(page, 32, -1);
    await walk(page, 32, -12);
    await npc(page, "mira");
    await page.keyboard.press("e");
    await expect(page.locator("#dialogue .portrait").first()).toBeVisible();
    expect(
      await page
        .locator("#dialogue .portrait")
        .first()
        .evaluate((e) => getComputedStyle(e).backgroundImage),
    ).toContain("?v=");
    expect((await state(page)).wallet).toBe(195);
    console.info(
      `Warm-cache upgrade retained ${current.wallet} coins and loaded ${expected} coherent frames; canonical cache still280.`,
    );
  } finally {
    await info.attach("warm-cache-http", {
      body: JSON.stringify({ expected, requests }, null, 2),
      contentType: "application/json",
    });
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections();
    });
  }
});
