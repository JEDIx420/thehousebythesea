import { defineConfig } from "vitest/config";
export default defineConfig({
  base: "/thehousebythesea/",
  build: { target: "es2022" },
  test: { include: ["src/**/*.test.ts", "tests/**/*.test.ts"] },
});
