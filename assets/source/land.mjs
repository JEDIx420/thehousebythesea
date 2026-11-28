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
