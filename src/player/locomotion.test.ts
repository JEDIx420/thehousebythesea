import { test, expect } from "vitest";
import { Locomotion } from "./locomotion";
import { initialState } from "../state/game";
function run(hz: number, h: number, v: number, seconds: number) {
  const c = new Locomotion();
  let p = { ...initialState().player, x: 40, z: 0 };
  for (let i = 0; i < hz * seconds; i++) p = c.update(p, h, v, 1 / hz).player;
  return { c, p };
}
test("brisk normalized motion agrees at30/60Hz without diagonal bonus", () => {
  for (const input of [
    [1, 0],
    [0, -1],
    [1, -1],
  ]) {
    const a = run(60, ...(input as [number, number]), 0.4),
      b = run(30, ...(input as [number, number]), 0.4);
    expect(Math.hypot(a.p.x - b.p.x, a.p.z - b.p.z)).toBeLessThan(0.025);
    expect(a.c.metrics().speed).toBeCloseTo(6.6, 2);
  }
});
test("responds within120ms and stops within100ms; reset eliminates drift", () => {
  const c = new Locomotion();
  let p = initialState().player;
  for (let i = 0; i < 7; i++) p = c.update(p, 1, 0, 1 / 60).player;
  expect(c.metrics().speed).toBeCloseTo(6.6, 1);
  for (let i = 0; i < 6; i++) p = c.update(p, 0, 0, 1 / 60).player;
  expect(c.metrics().speed).toBe(0);
  c.reset();
  const at = { ...p };
  for (let i = 0; i < 60; i++) p = c.update(p, 0, 0, 1 / 60).player;
  expect(p).toEqual(at);
});
test("blocked actor does not advance phase-distance or moonwalk and diagonal facing is stable", () => {
  const c = new Locomotion();
  let p = { ...initialState().player, x: 58, z: 0 };
  for (let i = 0; i < 600; i++) p = c.update(p, 1, 1, 0.016).player;
  const d = c.distance;
  for (let i = 0; i < 10; i++) p = c.update(p, 1, 1, 0.016).player;
  expect(c.distance - d).toBeLessThan(0.02);
  const a = run(60, 1, -1, 0.3);
  const direction = a.c.direction;
  for (let i = 0; i < 30; i++) a.c.update(a.p, 1, -1, 1 / 60);
  expect(a.c.direction).toBe(direction);
});

test("stopping preserves south facing and does not turn on zero input", () => {
  const c = new Locomotion();
  let p = initialState().player;
  for (let i = 0; i < 10; i++) p = c.update(p, 0, 1, 1 / 60).player;
  expect(c.direction).toBe("s");
  for (let i = 0; i < 20; i++) p = c.update(p, 0, 0, 1 / 60).player;
  expect(c.direction).toBe("s");
});
