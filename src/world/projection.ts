import WORLD from "../../assets/source/world.json" with { type: "json" };
export interface Point {
  x: number;
  z: number;
}
export function project(x: number, z: number) {
  return { x: (x - z) * WORLD.projection.x, y: (x + z) * WORLD.projection.y };
}
export function unproject(x: number, y: number): Point {
  return {
    x: (x / WORLD.projection.x + y / WORLD.projection.y) / 2,
    z: (y / WORLD.projection.y - x / WORLD.projection.x) / 2,
  };
}
export function contains(
  x: number,
  z: number,
  polygon: readonly (readonly number[])[],
) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [a, b] = polygon[i],
      [c, d] = polygon[j];
    if (b > z !== d > z && x < ((c - a) * (z - b)) / (d - b) + a) hit = !hit;
  }
  return hit;
}
export function depth(x: number, z: number) {
  return project(x, z).y;
}
export function walkDirection(horizontal: number, vertical: number) {
  const v = unproject(horizontal, vertical),
    n = Math.hypot(v.x, v.z);
  return n ? { x: v.x / n, z: v.z / n } : { x: 0, z: 0 };
}
