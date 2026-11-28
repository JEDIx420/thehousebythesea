import { describe, it, expect } from "vitest";
import {
  project,
  unproject,
  walkDirection,
  depth,
  contains,
} from "./projection";
import WORLD from "../../assets/source/world.json";
describe("fixed isometric world coordinates", () => {
  it("round trips negative/positive world coordinates without camera dependence", () => {
    for (let x = -300; x <= 300; x += 13)
      for (let z = -350; z <= 100; z += 17) {
        const p = project(x, z),
          q = unproject(p.x, p.y);
        expect(q.x).toBeCloseTo(x, 10);
        expect(q.z).toBeCloseTo(z, 10);
      }
  });
  it("sorts by projected feet, not sprite top or raw x alone", () => {
    expect(depth(20, 0)).toBe(depth(0, 20));
    expect(depth(1, 20)).toBeGreaterThan(depth(20, 0));
  });
  it("normalizes diagonal walking and maps screen-relative keys consistently", () => {
    for (const [h, v] of [
      [1, 0],
      [0, -1],
      [1, 1],
      [-1, -1],
    ]) {
      const d = walkDirection(h, v);
      expect(Math.hypot(d.x, d.z)).toBeCloseTo(1);
      const p = project(d.x, d.z);
      expect(Math.sign(p.x)).toBe(h ? Math.sign(h) : 0);
      expect(Math.sign(p.y)).toBe(v ? Math.sign(v) : 0);
    }
    expect(walkDirection(0, 0)).toEqual({ x: 0, z: 0 });
  });
  it("uses the exact authored cove contour rather than its bounding rectangle", () => {
    expect(contains(0, 0, WORLD.havenport.shore)).toBe(true);
    expect(contains(45, 0, WORLD.havenport.shore)).toBe(false);
    expect(contains(100, 0, WORLD.havenport.shore)).toBe(false);
  });
});
