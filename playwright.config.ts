import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  timeout: 180000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://localhost:4173/thehousebythesea/",
    viewport: { width: 1440, height: 900 },
    // CI uses software rasterisation; CSS/input coverage stays full size.
    deviceScaleFactor: process.env.CI ? 0.5 : 1,
    channel: process.env.CI ? undefined : "chrome",
    // Hosted CI has no hardware GPU. Per-action DOM/canvas snapshots and video
    // readbacks can freeze a software WebGL frame; retain actions/sources plus
    // the explicit gameplay checkpoint and failure screenshots instead.
    trace: process.env.CI
      ? { mode: "retain-on-failure", screenshots: false, snapshots: false, sources: true }
      : "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CI ? "off" : "on",
    launchOptions: { args: ["--enable-webgl", "--ignore-gpu-blocklist"] },
  },
  webServer: {
    command: "npm run preview -- --port 4173",
    url: "http://localhost:4173/thehousebythesea/",
    reuseExistingServer: !process.env.CI,
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
