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
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "on",
    launchOptions: { args: ["--enable-webgl", "--ignore-gpu-blocklist"] },
  },
  webServer: {
    command: "npm run preview -- --port 4173",
    url: "http://localhost:4173/thehousebythesea/",
    reuseExistingServer: !process.env.CI,
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
