import { heightAtLocal } from "./surface.mjs";
import { PixelCanvas, noise } from "../../tools/pixel-canvas.mjs";
import P from "./palette.json" with { type: "json" };
import WORLD from "./world.json" with { type: "json" };
export function inside(x, z, polygon) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [a, b] = polygon[i],
      [c, d] = polygon[j];
    if (b > z !== d > z && x < ((c - a) * (z - b)) / (d - b) + a) hit = !hit;
  }
  return hit;
}
function segment(x, z, a, b) {
  const dx = b[0] - a[0],
    dz = b[1] - a[1],
    t = Math.max(
      0,
      Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz)),
    );
  return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz);
}
function edge(x, z, points, closed = true) {
  let d = 1e4;
  for (let i = 0; i < points.length - (closed ? 0 : 1); i++)
    d = Math.min(d, segment(x, z, points[i], points[(i + 1) % points.length]));
  return d;
}
export function land(map = WORLD.havenport) {
  const c = new PixelCanvas(1024, 512),
    anchor = [512, 256],
    sx = WORLD.projection.x,
    sy = WORLD.projection.y;
  for (let py = 0; py < c.height; py++)
    for (let px = 0; px < c.width; px++) {
      const u = (px - anchor[0]) / sx,
        v = (py - anchor[1]) / sy,
        x = (u + v) / 2,
        z = (v - u) / 2,
        d = edge(x, z, map.shore),
        ground = inside(x, z, map.shore),
        n = noise(px, py, 11282026);
      let color;
      const dock = map.dock;
      if (
        x >= dock.minX &&
        x <= dock.maxX &&
        z >= dock.minZ &&
        z <= dock.maxZ
      ) {
        color =
          Math.floor((x - dock.minX) * 2.5) % 5 === 0
            ? P.woodDark
            : n < 0.035
              ? P.woodLight
              : P.wood;
        c.pixel(px, py, color);
        continue;
      }
      if (!ground) {
        if (d > 6 || n < d - 5) continue;
        color = d < 2 ? P.teal : P.seaLight;
        if (n < 0.006) color = P.foam;
      } else {
        const grassy = inside(x, z, map.grass),
          path = map.paths.some((points) => edge(x, z, points, false) < 2.6);
        color = grassy
          ? map.tone === "cool"
            ? P.grassShade
            : P.grass
          : map.tone === "cool"
            ? P.plaster
            : P.sand;
        if (grassy && n < 0.024)
          color = n < 0.012 ? P.grassLight : P.grassShade;
        if (!grassy && n < 0.009) color = P.sandLight;
        if (path) {
          color = P.sandLight;
          const a = Math.floor((x + z) * 1.2),
            b = Math.floor((x - z) * 0.8);
          if ((a % 6 === 0 || b % 8 === 0) && n < 0.5) color = P.sandShade;
          else if (n < 0.008) color = P.cream;
        }
        if (d < 0.45 && noise(px >> 2, py >> 1, 77) > 0.25) color = P.foam;
        // Broken sandy edge and grass tufts prevent a perfect geometric cutout.
        if (grassy && !path && n < 0.004) {
          c.line(px, py, px + 1, py - 2, P.grassLight);
        }
      }
      c.pixel(px, py, color);
    }
  // Raised surfaces and visible shaded retaining-wall faces share the exact zone data.
  for (const level of map.levels ?? []) {
    const project = (p, h = 0) => [
      anchor[0] + (p[0] - p[1]) * sx,
      anchor[1] + (p[0] + p[1]) * sy - h,
    ];
    const points = level.polygon;
    // Vertical faces are separate foot-depth overlays, never flattened into ground.
    // Raised top is a separate occluding depth layer too.
  }
  for (const r of map.ramps ?? []) {
    const [a, b, d, e] = r.rect;
    for (let x = a; x <= d; x += 0.2)
      for (let z = b; z <= e; z += 0.2) {
        const h = heightAtLocal(map, x, z),
          px = anchor[0] + (x - z) * sx,
          py = anchor[1] + (x + z) * sy - h;
        c.rect(
          px,
          py,
          2,
          2,
          Math.floor((r.axis === "x" ? x : z) * 2) % 5 === 0
            ? P.sandShade
            : P.sandLight,
        );
      }
  }
  const d = map.dock,
    screen = (x, z) => [anchor[0] + (x - z) * sx, anchor[1] + (x + z) * sy];
  for (const x of [d.minX + 3, d.maxX - 2])
    for (const z of [d.minZ, d.maxZ]) {
      const [px, py] = screen(x, z);
      c.rect(px - 1, py + 1, 3, 6, P.woodDark);
    }
  const a = screen(d.minX, d.maxZ),
    b = screen(d.maxX, d.maxZ),
    e = screen(d.maxX, d.minZ);
  c.line(...a, ...b, P.woodDark);
  c.line(...b, ...e, P.woodDark);
  return c;
}
export function water() {
  const c = new PixelCanvas(512, 256);
  c.rect(0, 0, 512, 256, P.sea);
  for (let i = 0; i < 100; i++) {
    const x = Math.floor(noise(i, 4, 39) * 512),
      y = Math.floor(noise(i, 9, 17) * 256),
      length = 3 + Math.floor(noise(i, 1, 88) * 15);
    for (let k = 0; k < length; k++) {
      const xx = (x + k) % 512,
        yy = (y + Math.round(Math.sin((k / length) * Math.PI) * 1.5)) % 256;
      c.pixel(xx, yy, i % 7 === 0 ? P.teal : P.seaLight);
    }
  }
  return c;
}

export function cliffFrames(map) {
  const frames = [];
  for (const level of map.levels ?? []) {
    const poly = level.polygon,
      mid = [
        poly.reduce((n, p) => n + p[0], 0) / poly.length,
        poly.reduce((n, p) => n + p[1], 0) / poly.length,
      ],
      project = ([x, z]) => [
        (x - mid[0] - z + mid[1]) * WORLD.projection.x,
        (x - mid[0] + z - mid[1]) * WORLD.projection.y - level.height,
      ],
      points = poly.map(project),
      minX = Math.floor(Math.min(...points.map((p) => p[0]))) - 2,
      minY = Math.floor(Math.min(...points.map((p) => p[1]))) - 2,
      maxX = Math.ceil(Math.max(...points.map((p) => p[0]))) + 2,
      maxY = Math.ceil(Math.max(...points.map((p) => p[1]))) + 2,
      c = new PixelCanvas(maxX - minX + 1, maxY - minY + 1),
      anchor = [-minX, Math.max(0, -minY)];
    // Anchor must stay within the raster; a front-rim world position keeps it inside.
    const rim = Math.max(...poly.map(([x, z]) => (x + z) * WORLD.projection.y));
    c.poly(
      points.map(([x, y]) => [x - minX, y - minY]),
      P.grassShade,
      P.sandLight,
    );
    for (let i = 0; i < points.length; i++)
      c.line(
        points[i][0] - minX,
        points[i][1] - minY,
        points[(i + 1) % points.length][0] - minX,
        points[(i + 1) % points.length][1] - minY,
        P.grassLight,
      );
    // Use image centre as placement anchor and store explicit projected offset for this top.
    frames.push({
      id: `top-${map.id}-${level.id}`,
      image: c,
      anchor: [Math.floor(c.width / 2), Math.floor(c.height / 2)],
      world: mid,
      pixelOffset: [
        minX + Math.floor(c.width / 2),
        minY + Math.floor(c.height / 2),
      ],
      depthY: rim - 0.1,
    });
  }
  for (const level of map.levels ?? [])
    for (let edge = 0; edge < level.polygon.length; edge++) {
      const a = level.polygon[edge],
        b = level.polygon[(edge + 1) % level.polygon.length],
        dx = b[0] - a[0],
        dz = b[1] - a[1];
      if (dz - dx <= 0) continue; // only the two camera-facing walls of clockwise plateaus
      const count = Math.ceil(Math.hypot(dx, dz) / 4);
      for (let i = 0; i < count; i++) {
        const p = [a[0] + (dx * i) / count, a[1] + (dz * i) / count],
          q = [a[0] + (dx * (i + 1)) / count, a[1] + (dz * (i + 1)) / count],
          mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        if (
          (map.ramps ?? []).some(
            (r) =>
              mid[0] >= r.rect[0] - 0.1 &&
              mid[0] <= r.rect[2] + 0.1 &&
              mid[1] >= r.rect[1] - 0.1 &&
              mid[1] <= r.rect[3] + 0.1,
          )
        )
          continue;
        const project = (v, h) => [
            (v[0] - mid[0] - v[1] + mid[1]) * WORLD.projection.x,
            (v[0] - mid[0] + v[1] - mid[1]) * WORLD.projection.y - h,
          ],
          points = [
            project(p, 0),
            project(q, 0),
            project(q, level.height),
            project(p, level.height),
          ];
        const minX = Math.floor(Math.min(...points.map((p) => p[0]))) - 2,
          minY = Math.floor(Math.min(...points.map((p) => p[1]))) - 2,
          maxX = Math.ceil(Math.max(...points.map((p) => p[0]))) + 2,
          maxY = Math.ceil(Math.max(...points.map((p) => p[1]))) + 2,
          c = new PixelCanvas(maxX - minX + 1, maxY - minY + 1),
          anchor = [-minX, -minY];
        c.poly(
          points.map(([x, y]) => [x - minX, y - minY]),
          dx === 0 ? P.wallShade : P.sandShade,
          P.woodDark,
        );
        for (let h = 4; h < level.height; h += 5)
          c.line(
            ...project(p, h).map((v, j) => v + anchor[j]),
            ...project(q, h).map((v, j) => v + anchor[j]),
            P.plaster,
          );
        c.line(
          ...project(p, level.height).map((v, j) => v + anchor[j]),
          ...project(q, level.height).map((v, j) => v + anchor[j]),
          P.sandLight,
        );
        frames.push({
          id: `cliff-${map.id}-${level.id}-${edge}-${i}`,
          image: c,
          anchor,
          world: mid,
        });
      }
    }
  return frames;
}
