import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { PixelCanvas } from "./pixel-canvas.mjs";
import * as art from "../assets/source/sprites.mjs";
import P from "../assets/source/palette.json" with { type: "json" };
import WORLD from "../assets/source/world.json" with { type: "json" };
import { Painter } from "./vendor/pixelfx/src/core/painter.js";
import { hex } from "./vendor/pixelfx/src/core/color.js";
import { ring } from "./vendor/pixelfx/src/fx/water/_lib.js";
import { rasterText, textWidth } from "./vendor/pixelfx/src/core/font.js";
import { land, water } from "../assets/source/land.mjs";
export const ROOT = fileURLToPath(new URL("../", import.meta.url));
const PAD = 2,
  WIDTH = 2048;
export function makeFrames() {
  const frames = [];
  const add = (id, image, anchor, extra = {}) =>
    frames.push({
      id,
      image,
      anchor,
      license: "MIT",
      source: "assets/source/sprites.mjs",
      ...extra,
    });
  add("havenport-ground", land(WORLD.havenport), [512, 256], {
    category: "ground",
    source: "assets/source/land.mjs + world.json",
  });
  add("saltglass-ground", land(WORLD.saltglass), [512, 256], {
    category: "ground",
    source: "assets/source/land.mjs + world.json",
  });
  add("water", water(), [0, 0], {
    category: "sea",
    source: "assets/source/land.mjs",
  });
  add("young-rowan", art.youngRowan(), [16, 43], { category: "memory" });
  for (const kind of ["grass", "sand", "path", "deck"])
    for (let i = 0; i < 4; i++)
      add(`${kind}-${i}`, art.tile(kind, i), [32, 17], {
        category: "ground",
        collision: kind === "deck" ? "dock" : "land",
      });
  for (const name of ["rowan", "mira", "ellis", "nessa", "tomas"])
    for (const direction of ["s", "w", "n", "e"]) {
      for (let i = 0; i < 2; i++)
        add(
          `${name}-${direction}-idle-${i}`,
          art.character(name, direction, i, false),
          [24, 64],
          {
            category: "character",
            actor: name,
            direction,
            animation: "idle",
            index: i,
            fps: 2,
          },
        );
      for (let i = 0; i < 6; i++)
        add(
          `${name}-${direction}-walk-${i}`,
          art.character(name, direction, i, true),
          [24, 64],
          {
            category: "character",
            actor: name,
            direction,
            animation: "walk",
            index: i,
            fps: 8,
          },
        );
      for (let i = 0; i < 2; i++)
        add(
          `${name}-${direction}-sit-${i}`,
          art.seated(name, direction, i),
          [24, 64],
          {
            category: "character",
            actor: name,
            direction,
            animation: "sit",
            index: i,
            fps: 2,
          },
        );
    }
  for (const kind of ["shop", "cafe", "hut", "cottage"])
    add(kind, art.house(kind), [80, 171], {
      category: "building",
      footprint: {
        units: "world",
        origin: WORLD.buildingOrigin,
        ...WORLD.buildings[kind],
      },
    });
  add("fishing-hut", art.fishingHut(), [64, 152], {
    category: "building",
    footprint: {
      units: "world",
      origin: WORLD.buildingOrigin,
      ...WORLD.buildings["fishing-hut"],
    },
  });
  add("arch", art.arch(), [96, 139], { category: "landmark" });
  for (let i = 0; i < 2; i++)
    add(`tree-${i}`, art.tree(i), [48, 114], { category: "foliage", fps: 1 });
  for (const kind of [
    "rock",
    "pot",
    "crate",
    "lamp",
    "bollard",
    "bench",
    "sign",
    "net",
  ])
    add(kind, art.prop(kind), [32, 68], { category: "prop" });
  for (let d = 0; d < 8; d++)
    for (let i = 0; i < 2; i++)
      add(`boat-${d}-${i}`, art.boat(d, i), [64, 106], {
        category: "boat",
        direction: d,
        fps: 2,
        footprint: { units: "world", ...WORLD.boatHull },
      });
  for (const species of ["sardine", "bream"])
    for (let i = 0; i < 2; i++)
      add(`fish-${species}-${i}`, art.fish(species, i), [20, 17], {
        category: "effect",
        fps: 2,
      });
  for (let i = 0; i < 4; i++) {
    add(`gull-${i}`, art.gull(i), [16, 16], { category: "effect", fps: 5 });
    add(`glint-${i}`, art.glint(i), [12, 8], { category: "effect", fps: 4 });
  }
  const C = [
    P.deep,
    P.sea,
    P.seaLight,
    P.teal,
    P.teal,
    P.foam,
    P.glint,
    P.cream,
  ].map(hex);
  for (let i = 0; i < 16; i++) {
    const f = {
      w: 64,
      h: 32,
      ox: 0,
      oy: 0,
      color: new Uint32Array(64 * 32),
      light: new Uint32Array(64 * 32),
    };
    const p = new Painter(f).place(32, 16);
    p.lightK = 0;
    for (let q = 0; q < 2; q++) {
      const age = (i / 16 + q * 0.5) % 1;
      ring(p, 0, 0, 2 + age * 27, 0.45, Math.sin(Math.PI * age), C, {
        n: 2,
        gap: 3,
        seed: art.SEED + q,
        wob: 0.7,
      });
    }
    const image = new PixelCanvas(64, 32);
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 64; x++) {
        const c = f.color[y * 64 + x];
        if (c)
          image.pixel(x, y, [c & 255, (c >>> 8) & 255, (c >>> 16) & 255, 255]);
      }
    // Phase zero contains the second, half-life ring; every exported frame has visible ink.
    add(`ripple-${i}`, image, [32, 16], {
      category: "effect",
      fps: 8,
      license: "MIT",
      source:
        "PixelFX water/ring @5294518ce7c72e48b6100a744596e0acf57f2826; original palette/seed/adaptation",
    });
  }
  return frames;
}
export function compile() {
  const frames = makeFrames();
  let x = PAD,
    y = PAD,
    row = 0;
  const placed = [];
  for (const f of frames) {
    if (x + f.image.width + PAD > WIDTH) {
      x = PAD;
      y += row + PAD * 2;
      row = 0;
    }
    placed.push({ ...f, x, y });
    x += f.image.width + PAD * 2;
    row = Math.max(row, f.image.height);
  }
  const height = 2 ** Math.ceil(Math.log2(y + row + PAD)),
    atlas = new PixelCanvas(WIDTH, height),
    json = {
      frames: {},
      meta: {
        app: "First Voyage offline asset factory",
        version: "1",
        image: "atlas.png",
        format: "RGBA8888",
        size: { w: WIDTH, h: height },
        scale: "1",
      },
    },
    manifest = {
      version: 1,
      seed: art.SEED,
      padding: PAD,
      palette: P,
      source: "assets/source/sprites.mjs",
      frames: [],
      attributions: [
        {
          id: "original-art",
          author: "The House by the Sea contributors",
          source: "assets/source/sprites.mjs",
          license: "MIT",
          notice: "LICENSE",
        },
        {
          id: "pixelfx-water",
          author: "Patch contributors; upstream notice credits preserved",
          source:
            "https://github.com/patch-gg/pixelfx/tree/5294518ce7c72e48b6100a744596e0acf57f2826",
          license: "MIT",
          notice: "tools/vendor/pixelfx/LICENSE and NOTICE.md",
          modifications:
            "Offline core export adapter; project palette, seed and frame encoder. No remote/API runtime.",
        },
      ],
    };
  for (const f of placed) {
    atlas.blit(f.image, f.x, f.y);
    json.frames[f.id] = {
      frame: { x: f.x, y: f.y, w: f.image.width, h: f.image.height },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: f.image.width, h: f.image.height },
      sourceSize: { w: f.image.width, h: f.image.height },
    };
    const { image, ...entry } = f;
    manifest.frames.push({
      ...entry,
      width: image.width,
      height: image.height,
    });
  }
  const png = atlas.png();
  manifest.atlasSha256 = crypto.createHash("sha256").update(png).digest("hex");
  return { png, json, manifest, frames };
}
export function contacts(frames) {
  const chosen = frames.filter((f) =>
    f.category === "character"
      ? (f.animation === "idle" && f.index === 0) ||
        (f.direction === "s" && f.animation === "walk") ||
        (f.direction === "e" && f.animation === "sit" && f.index === 0)
      : f.category === "boat"
        ? f.id.endsWith("-0")
        : [
            "shop",
            "cafe",
            "hut",
            "cottage",
            "fishing-hut",
            "arch",
            "young-rowan",
            "fish-sardine-0",
            "fish-bream-0",
            "tree-0",
            "grass-0",
            "deck-0",
            "rock",
            "pot",
            "crate",
            "lamp",
            "bollard",
            "bench",
            "sign",
            "net",
            "ripple-0",
            "ripple-4",
            "ripple-8",
            "ripple-12",
            "gull-0",
            "glint-2",
          ].includes(f.id),
  );
  const pages = [],
    layout = [];
  let page, x, y, h;
  const next = () => {
    page = new PixelCanvas(800, 600);
    page.rect(0, 0, 800, 600, P.deep);
    pages.push(page);
    x = 12;
    y = 12;
    h = 0;
  };
  next();
  for (const f of chosen) {
    const w = Math.max(f.image.width, textWidth(f.id, "mini")),
      height = f.image.height + 13;
    if (x + w > 788) {
      x = 12;
      y += h + 12;
      h = 0;
    }
    if (y + height > 588) next();
    page.blit(f.image, x, y);
    rasterText(f.id, "mini", (xx, yy) =>
      page.pixel(x + xx, y + f.image.height + 4 + yy, P.cream),
    );
    layout.push({
      id: f.id,
      page: pages.length,
      width: f.image.width,
      height: f.image.height,
      x,
      y,
    });
    x += w + 12;
    h = Math.max(h, height);
  }
  return { pages, layout };
}
export function write() {
  const { png, json, manifest, frames } = compile();
  const out = path.join(ROOT, "public/assets");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "atlas.png"), png);
  fs.writeFileSync(path.join(out, "atlas.json"), JSON.stringify(json));
  fs.writeFileSync(
    path.join(out, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  // Editable source sheets contain exactly the same logical pixels as the runtime frames.
  for (const name of ["rowan", "mira", "ellis", "nessa", "tomas"]) {
    const sheet = new PixelCanvas(48 * 10, 72 * 4);
    for (let d = 0; d < 4; d++)
      for (let i = 0; i < 10; i++) {
        const dir = ["s", "w", "n", "e"][d],
          id = `${name}-${dir}-${i < 2 ? "idle" : i < 8 ? "walk" : "sit"}-${i < 2 ? i : i < 8 ? i - 2 : i - 8}`;
        sheet.blit(frames.find((f) => f.id === id).image, i * 48, d * 72);
      }
    fs.writeFileSync(path.join(ROOT, `assets/source/${name}.png`), sheet.png());
  }
  const { pages, layout } = contacts(frames);
  for (let i = 0; i < pages.length; i++)
    fs.writeFileSync(
      path.join(
        ROOT,
        `assets/source/contact-sheet${i ? "-" + (i + 1) : ""}.png`,
      ),
      pages[i].png(),
    );
  fs.writeFileSync(
    path.join(ROOT, "assets/source/contact-layout.json"),
    JSON.stringify(layout, null, 2) + "\n",
  );
  console.log(
    `Generated ${frames.length} frames, ${manifest.atlasSha256}, ${png.length} atlas bytes; offline/no credentials.`,
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  write();
