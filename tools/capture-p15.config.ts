import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  outputDir: "../test-results/p15-native-evidence",
  testMatch: ["capture-p15.spec.ts", "capture-p15-final.spec.ts"],
  workers: 1,
  timeout: 1_200_000,
  use: {
    baseURL:
      process.env.PIXEL_TEST_BASE_URL ||
      "http://localhost:4190/thehousebythesea/",
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
    launchOptions: { args: ["--enable-webgl", "--ignore-gpu-blocklist"] },
  },
  reporter: [["list"]],
});
