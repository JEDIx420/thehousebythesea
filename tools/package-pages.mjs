import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
// This is a complete site artifact: an explicit review landing page + nested game.
// Only this project's ignored build directory is replaced. Never touch source or main.
const index = await readFile(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
if (!index.includes("/thehousebythesea/preview/pixel/assets/"))
  throw new Error("Build with PIXEL_PAGES_PREVIEW=1 before packaging Pages.");
const output = new URL("../dist-pages/", import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(new URL("preview/", output), { recursive: true });
await cp(
  new URL("../dist/", import.meta.url),
  new URL("preview/pixel/", output),
  { recursive: true },
);
await writeFile(new URL(".nojekyll", output), "");
await writeFile(
  new URL("index.html", output),
  `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The House by the Sea · First Voyage review</title><link rel="icon" href="data:,">
<style>body{margin:0;background:#edf2df;color:#25394d;font:18px/1.65 system-ui}main{max-width:680px;margin:12vh auto;padding:32px}h1{line-height:1.15}a{color:#205a6e}a.play{display:inline-block;background:#25394d;color:#fff;padding:12px 22px;border-radius:4px;font-weight:700}small{display:block;margin-top:32px}</style>
<main><p>THE HOUSE BY THE SEA</p><h1>A first boat. A shared horizon.</h1>
<p>Play the pixel-isometric First Voyage: Havenport, Saltglass Bay, fishing, deliveries and a crossing with Mira.</p>
<p><a class="play" href="./preview/pixel/">Play the First Voyage</a></p>
<p>Desktop keyboard · WASD/arrows, E interact, F fish, M chart, J journal, Esc pause. Progress stays in your browser. Free, with no account or external services.</p>
<small>Creator review build · Stage 1 only · <a href="https://github.com/JEDIx420/thehousebythesea/pull/7">Source, tests and review evidence</a>. Awaiting visual and gameplay approval before further islands.</small></main></html>\n`,
);
console.log(
  "Packaged dist-pages: landing + preview/pixel (complete GitHub Pages artifact)",
);
