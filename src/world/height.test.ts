import { test, expect } from "vitest";
import {
  elevationAt,
  canStep,
  walkable,
  pickSurface,
  surfaceDepth,
  MAPS,
  boatClear,
  dockFor,
} from "./world";
import { project } from "./projection";
test("both raised areas are physical and ramps change height continuously", () => {
  for (const [id, x, z, h] of [
    ["havenport", -28, -60, 24],
    ["saltglass-bay", -12, -385, 28],
  ] as const) {
    expect(elevationAt(x, z)).toBe(h);
    expect(walkable(x, z)).toBe(true);
    const m = MAPS.find((m) => m.id === id)!,
      r = m.ramps[0],
      cx = (r.rect[0] + r.rect[2]) / 2;
    for (let z = r.rect[1] + 1; z < r.rect[3] - 1; z += 0.25)
      expect(canStep(cx, z + m.offsetZ, cx, z + 0.25 + m.offsetZ)).toBe(true);
  }
});
test("cliff faces cannot be stepped through and standing clearance respects height edges", () => {
  expect(canStep(-40, -43.75, -40, -44)).toBe(false);
  expect(walkable(-40, -43.9)).toBe(false);
  expect(elevationAt(-40, -43)).toBe(0);
  expect(elevationAt(-40, -45)).toBe(24);
});
test("projection picking and depth agree with actual raised floor/feet", () => {
  for (const [x, z] of [
    [-40, -72],
    [-12, -385],
  ]) {
    const h = elevationAt(x, z),
      p = project(x, z),
      q = pickSurface(p.x, p.y - h);
    expect(q.x).toBeCloseTo(x, 1);
    expect(q.z).toBeCloseTo(z, 1);
    expect(q.height).toBe(h);
  }
  expect(surfaceDepth(-28, -60)).toBeGreaterThan(surfaceDepth(-40, -72));
});
test("current safe berths and both departure corridors remain hull-clear", () => {
  for (const m of MAPS) {
    const d = dockFor(m.id);
    expect(boatClear({ ...d, heading: 0 })).toBe(true);
    for (let i = 0; i < 30; i++)
      expect(boatClear({ ...d, z: d.z - i, heading: 0 })).toBe(true);
  }
});
