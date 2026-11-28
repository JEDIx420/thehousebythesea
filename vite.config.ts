import { defineConfig } from "vite";
export default defineConfig({
  base:
    process.env.PIXEL_PAGES_PREVIEW === "1"
      ? "/thehousebythesea/preview/pixel/"
      : "/thehousebythesea/",
  build: { target: "es2022" },
});
