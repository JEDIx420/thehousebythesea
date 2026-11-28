// CPU-only reproducible reviewer evidence. Does not build assets or launch a browser.
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "vite";
import { inside } from "../assets/source/surface.mjs";
const baselineRef = "90693e37ce009c5f44b19ac683c0c017aef0843c";
const baseline = JSON.parse(
  execFileSync("git", ["show", `${baselineRef}:assets/source/world.json`], {
    encoding: "utf8",
  }),
);
const current = JSON.parse(
  await fs.readFile("assets/source/world.json", "utf8"),
);
const output = "docs/evidence/p15";
await fs.mkdir(output, { recursive: true });
function bounds(m) {
  const p = [
    ...m.shore,
    [m.dock.minX, m.dock.minZ],
    [m.dock.maxX, m.dock.maxZ],
  ];
  return [
    Math.floor(Math.min(...p.map((p) => p[0]))),
    Math.ceil(Math.max(...p.map((p) => p[0]))),
    Math.floor(Math.min(...p.map((p) => p[1]))),
    Math.ceil(Math.max(...p.map((p) => p[1]))),
  ];
}
// Reconstruct the old flat predicate against immutable baseline data, including radius.
function baselineWalk(m, x, z) {
  const ground = (x, z) =>
    inside(x, z, m.shore) ||
    (x >= m.dock.minX &&
      x <= m.dock.maxX &&
      z >= m.dock.minZ &&
      z <= m.dock.maxZ);
  if (!ground(x, z)) return false;
  for (const p of m.landmarks) {
    const box = baseline.buildings[p.kind];
    if (
      box &&
      x > p.x - box.width - 0.7 &&
      x < p.x + 0.7 &&
      z > p.z - box.depth - 0.7 &&
      z < p.z + 0.7
    )
      return false;
    if (p.solid && Math.hypot(x - p.x, z - p.z) < p.solid + 0.7) return false;
    if (p.kind === "arch")
      for (const a of baseline.archPillars)
        if (Math.hypot(x - p.x - a.x, z - p.z - a.z) < a.radius + 0.7)
          return false;
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    if (!ground(x + Math.cos(a) * 0.7, z + Math.sin(a) * 0.7)) return false;
  }
  return true;
}
function area(m, predicate) {
  const b = bounds(m);
  let count = 0;
  for (let x = b[0] + 0.125; x < b[1]; x += 0.25)
    for (let z = b[2] + 0.125; z < b[3]; z += 0.25)
      if (predicate(x, z)) count++;
  return {
    bounds: b,
    firstCenter: [b[0] + 0.125, b[2] + 0.125],
    cells: count,
    area: count / 16,
  };
}
const server = await createServer({
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
  appType: "custom",
});
const report = {
  baselineRef,
  worldJsonSha256: createHash("sha256")
    .update(await fs.readFile("assets/source/world.json"))
    .digest("hex"),
  currentHead: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  note: "Working-tree world data; baseline immutable. No random seed. Logical square units; radius0.7; cell0.25; BFS0.5.",
  islands: [],
};
try {
  const w = await server.ssrLoadModule("/src/world/world.ts");
  for (const m of w.MAPS) {
    const old = [baseline.havenport, baseline.saltglass].find(
        (n) => n.id === m.id,
      ),
      before = area(old, (x, z) => baselineWalk(old, x, z)),
      after = area(m, (x, z) => w.walkable(x, z + m.offsetZ)),
      d = w.dockFor(m.id),
      q = [[d.landingX, d.landingZ]],
      seen = new Set([q[0].join(",")]);
    for (let i = 0; i < q.length; i++) {
      const [x, z] = q[i];
      for (const [dx, dz] of [
        [0.5, 0],
        [-0.5, 0],
        [0, 0.5],
        [0, -0.5],
      ]) {
        const a = x + dx,
          b = z + dz,
          k = `${a},${b}`;
        if (!seen.has(k) && w.canStep(x, z, a, b)) {
          seen.add(k);
          q.push([a, b]);
        }
      }
    }
    let samples = 0,
      blocked = [];
    for (let path = 0; path < m.paths.length; path++)
      for (let i = 1; i < m.paths[path].length; i++) {
        const a = m.paths[path][i - 1],
          b = m.paths[path][i],
          n = Math.max(
            1,
            Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.1),
          );
        let prev = a;
        for (let j = 0; j <= n; j++) {
          const p = [
            a[0] + ((b[0] - a[0]) * j) / n,
            a[1] + ((b[1] - a[1]) * j) / n,
          ];
          if (!w.canStep(prev[0], prev[1] + m.offsetZ, p[0], p[1] + m.offsetZ))
            blocked.push({ path, point: p });
          prev = p;
          samples++;
        }
      }
    report.islands.push({
      id: m.id,
      before,
      after,
      ratio: after.area / before.area,
      reachableHalfUnitCells: q.length,
      targets: [...w.NPCS, ...w.PLACES]
        .filter((n) => n.island === m.id)
        .map((n) => ({
          id: n.id,
          height: w.elevationAt(n.x, n.z),
          distance: Math.min(
            ...q.map(([x, z]) => Math.hypot(x - n.x, z - n.z)),
          ),
        })),
      levels: m.levels.map((l) => ({
        id: l.id,
        height: l.height,
        reachableCells: q.filter(([x, z]) => w.elevationAt(x, z) === l.height)
          .length,
      })),
      paths: { samples, blocked },
      berthClear: w.boatClear({ ...d, heading: 0 }),
    });
  }
} finally {
  await server.close();
}
await fs.writeFile(
  `${output}/world-audit.json`,
  JSON.stringify(report, null, 2) + "\n",
);
const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const maps = [current.havenport, current.saltglass]
  .map((m, index) => {
    let b = bounds(m),
      view = [b[0] - 10, b[2] - 16, b[1] - b[0] + 20, b[3] - b[2] + 28];
    return `<svg x="${index * 600}" y="40" width="600" height="700" viewBox="${view.join(" ")}"><polygon points="${m.shore.map((p) => p.join(",")).join(" ")}" fill="#d1c08a" stroke="#f1e1b4" stroke-width=".7"/>${m.levels.map((l) => `<polygon points="${l.polygon.map((p) => p.join(",")).join(" ")}" fill="#7d9867" stroke="#294b43" stroke-width=".6"/>`).join("")}${m.paths.map((p) => `<polyline points="${p.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#fff4cb" stroke-width="1.4"/>`).join("")}${m.ramps.map((r) => `<rect x="${r.rect[0]}" y="${r.rect[1]}" width="${r.rect[2] - r.rect[0]}" height="${r.rect[3] - r.rect[1]}" fill="#d79565" opacity=".85"/>`).join("")}${m.districts.map((d) => `<text x="${(d.rect[0] + d.rect[2]) / 2}" y="${(d.rect[1] + d.rect[3]) / 2}" text-anchor="middle" font-size="3.3" fill="#163b4a">${esc(d.name.split(" · ")[1])}</text>`).join("")}${[
      ...current.npcs,
      ...current.interactions,
    ]
      .filter((n) => n.island === m.id)
      .map(
        (n) =>
          `<circle cx="${n.x}" cy="${n.z}" r="1.3" fill="#992f42"/><text x="${n.x + 2}" y="${n.z - 1}" font-size="3.2" fill="#163b4a">${esc(n.id)}</text>`,
      )
      .join(
        "",
      )}<circle cx="${m.dock.landingX}" cy="${m.dock.landingZ}" r="1.5" fill="#1e5268"/><text x="${view[0] + 2}" y="${view[1] + 7}" font-size="5" fill="#f1e1b4">${esc(m.name)} · offset z ${m.offsetZ}</text></svg>`;
  })
  .join("");
await fs.writeFile(
  `${output}/district-map.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760"><rect width="1200" height="760" fill="#20596b"/><text x="20" y="26" font-family="sans-serif" font-size="16" fill="#f1e1b4">P1.5 logical route audit · cream routes · green raised land · orange ramps · red interactions · blue landings</text>${maps}</svg>`,
);
console.log(
  JSON.stringify(
    report.islands.map((m) => ({
      id: m.id,
      area: m.after.area,
      ratio: m.ratio,
      blocked: m.paths.blocked.length,
    })),
    null,
    2,
  ),
);
