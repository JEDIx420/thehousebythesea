import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { defineConfig } from "vite";
const revision = createHash("sha256")
  .update(
    readFileSync(new URL("./public/assets/manifest.json", import.meta.url)),
  )
  .update(
    readFileSync(new URL("./public/audio/manifest.json", import.meta.url)),
  )
  .digest("hex")
  .slice(0, 16);
export default defineConfig({
  define: { __COAST_ASSET_REVISION__: JSON.stringify(revision) },
  base:
    process.env.PIXEL_PAGES_PREVIEW === "1"
      ? "/thehousebythesea/preview/pixel/"
      : "/thehousebythesea/",
  build: { target: "es2022" },
});
