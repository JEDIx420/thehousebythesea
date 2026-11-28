import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  use: {
    baseURL:
      process.env.PIXEL_TEST_BASE_URL ||
      "http://localhost:4191/thehousebythesea/",
    viewport: { width: 1440, height: 900 },
    channel: process.env.CI ? undefined : "chrome",
    trace: {
      mode: "retain-on-failure",
      // Avoid continuous canvas screencast readbacks on software CI renderers.
      // DOM snapshots, actions, sources, network and failure/checkpoint PNGs remain.
      screenshots: !process.env.CI,
      snapshots: true,
      sources: true,
    },
    screenshot: "only-on-failure",
    // The committed native gameplay excerpt supplies motion evidence. CI keeps
    // screenshots + failure traces without continuous software-GPU readbacks.
    video: process.env.CI
      ? "off"
      : { mode: "on", size: { width: 1280, height: 800 } },
    launchOptions: { args: ["--enable-webgl", "--ignore-gpu-blocklist"] },
  },
  webServer: process.env.PIXEL_TEST_BASE_URL
    ? undefined
    : {
        command: "npm run preview -- --port 4191",
        url: "http://localhost:4191/thehousebythesea/",
        reuseExistingServer: !process.env.CI,
      },
  reporter: [["list"], ["html", { open: "never" }]],
});
