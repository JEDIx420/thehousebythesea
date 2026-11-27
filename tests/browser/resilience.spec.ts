import { test, expect } from "@playwright/test";

test("title credits can close, memory can skip, pause and settings remain usable", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: "Credits & provenance", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Begin your voyage", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Begin your voyage", exact: true })
    .click();
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(
      () => (window as any).voyage.getState().story.prologueSeen,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await page.getByLabel("Mute sea ambience").check();
  expect(
    await page.evaluate(() => (window as any).voyage.getState().settings.muted),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Return to safe island dock", exact: true })
    .click();
  expect(
    await page.evaluate(() => (window as any).voyage.getState().player.mode),
  ).toBe("walk");
});
test("a future save survives fallback play and autosave", async ({ page }) => {
  // Seed from a plain same-origin resource: an old game's pagehide autosave
  // must not race with installing the unsupported-save fixture.
  await page.goto("assets/CREDITS.txt");
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("thehousebythesea", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("snapshots");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result,
          tx = db.transaction("snapshots", "readwrite");
        tx.objectStore("snapshots").put(
          { schemaVersion: 99, wallet: 999, marker: "preserve-me" },
          "first-voyage",
        );
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
      };
    });
  });
  await page.goto("./");
  await expect(page.getByText(/save version is unsupported/)).toBeVisible();
  await page
    .getByRole("button", { name: "Begin your voyage", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip memory", exact: true }).click();
  await page.waitForTimeout(5500);
  const raw = await page.evaluate(
    async () =>
      await new Promise<any>((resolve) => {
        const req = indexedDB.open("thehousebythesea", 1);
        req.onsuccess = () => {
          const db = req.result;
          const get = db
            .transaction("snapshots", "readonly")
            .objectStore("snapshots")
            .get("first-voyage");
          get.onsuccess = () => {
            db.close();
            resolve(get.result);
          };
        };
      }),
  );
  expect(raw).toEqual({
    schemaVersion: 99,
    wallet: 999,
    marker: "preserve-me",
  });
});
test("missing optional props fall back to a playable original environment", async ({
  page,
}) => {
  await page.route("**/assets/models/*.glb", (route) => route.abort());
  await page.goto("./");
  await page
    .getByRole("button", { name: "Begin your voyage", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip memory", exact: true }).click();
  const before = await page.evaluate(
    () => (window as any).voyage.getState().player.z,
  );
  await page.keyboard.down("w");
  await page.waitForTimeout(700);
  await page.keyboard.up("w");
  expect(
    await page.evaluate(() => (window as any).voyage.getState().player.z),
  ).toBeLessThan(before);
});
