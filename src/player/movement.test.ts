import { it, expect } from "vitest";
import { initialState, reduce } from "../state/game";
import { board, disembark, moveFoot, moveVessel } from "./movement";
import {
  MAPS,
  dockFor,
  boatClear,
  walkable,
  groundAt,
  hullPoints,
  buildingFootprint,
} from "../world/world";
it("keeps both docks, canonical hull and recovery checkpoints valid", () => {
  for (const m of MAPS) {
    const d = dockFor(m.id);
    expect(walkable(d.landingX, d.landingZ), m.id).toBe(true);
    expect(walkable(48, m.offsetZ), m.id).toBe(true);
    expect(boatClear({ ...d, heading: 0 }), m.id).toBe(true);
    expect(groundAt(d.x, d.z)).toBe(null);
  }
  const s = initialState();
  expect(board(s.player, s.boat)?.mode).toBe("boat");
  expect(disembark({ ...s.player, mode: "boat" }, s.boat, 0)?.player.x).toBe(
    55,
  );
  expect(disembark({ ...s.player, mode: "boat" }, s.boat, 4)).toBe(null);
});
it("cannot walk into the cove or through the shared building footprint", () => {
  expect(walkable(44, 10)).toBe(false);
  expect(walkable(-5, -25)).toBe(false);
  let p = { ...initialState().player, x: 58, z: 0 };
  for (let i = 0; i < 200; i++) p = moveFoot(p, 1, 0, 0.016);
  expect(walkable(p.x, p.z)).toBe(true);
  expect(p.x).toBeLessThan(60);
  const shape = buildingFootprint("shop", 1, -18);
  expect(shape).toHaveLength(4);
  expect(shape[2]).toEqual({ x: -14, z: -33 });
});
it("normalizes foot travel and keeps stable headings over extended turns", () => {
  const p = { ...initialState().player, x: 24, z: -15 };
  const a = moveFoot(p, 1, 0, 0.05),
    b = moveFoot(p, 1, 1, 0.05);
  expect(Math.hypot(a.x - p.x, a.z - p.z)).toBeCloseTo(
    Math.hypot(b.x - p.x, b.z - p.z),
  );
  let boat = { ...initialState().boat, x: 85, z: -100 },
    speed = 0;
  for (let i = 0; i < 10000; i++) {
    const r = moveVessel(boat, speed, 0, 1, 0.016);
    boat = r.boat;
    speed = r.speed;
  }
  expect(Math.abs(boat.heading)).toBeLessThanOrEqual(Math.PI);
});
it("stops the entire hull at shore and never rotates a stern through the pier", () => {
  let boat = { ...initialState().boat, x: 80, z: 0, heading: -Math.PI / 2 },
    speed = 7;
  for (let i = 0; i < 200; i++) {
    const r = moveVessel(boat, speed, 1, 0, 0.05);
    boat = r.boat;
    speed = r.speed;
  }
  expect(boatClear(boat)).toBe(true);
  expect(boat.x).toBeGreaterThan(60);
  const points = hullPoints(initialState().boat);
  expect(
    Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x)),
  ).toBeCloseTo(7.35);
});
it("preserves money and story while recovering an invalid pixel location", () => {
  const s = initialState();
  s.wallet = 195;
  s.delivery = "complete";
  s.story.metMira = true;
  s.player.x = 999;
  const safe = reduce(s, { type: "RECOVER" });
  expect(boatClear(safe.boat)).toBe(true);
  expect(walkable(safe.player.x, safe.player.z)).toBe(true);
  expect(safe.wallet).toBe(195);
  expect(safe.delivery).toBe("complete");
  expect(safe.story.metMira).toBe(true);
});
it("keeps every painted lane centre clear without weakening building collision", () => {
  for (const m of MAPS)
    for (const [pathIndex, path] of m.paths.entries())
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i],
          b = path[i + 1],
          steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 5);
        for (let j = 0; j <= steps; j++) {
          const x = a[0] + ((b[0] - a[0]) * j) / steps,
            z = a[1] + ((b[1] - a[1]) * j) / steps + m.offsetZ;
          expect(walkable(x, z), `${m.id} path${pathIndex}: ${x},${z}`).toBe(
            true,
          );
        }
      }
  expect(walkable(18, -239)).toBe(false);
});
