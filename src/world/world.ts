import { heightAtLocal, traversable } from "../../assets/source/surface.mjs";
import { navigation } from "../data/navigation";
import WORLD from "../../assets/source/world.json" with { type: "json" };
import type { IslandId, BoatCheckpoint } from "../state/game";
import { contains, type Point } from "./projection";
export interface Prop extends Point {
  kind: string;
  solid?: number;
}
export interface Island {
  id: IslandId;
  name: string;
  offsetZ: number;
  shore: number[][];
  grass: number[][];
  paths: number[][][];
  landmarks: Prop[];
  levels: { id: string; height: number; polygon: number[][] }[];
  ramps: {
    id: string;
    rect: number[];
    axis: string;
    from: number;
    to: number;
  }[];
  dock: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    x: number;
    z: number;
    landingX: number;
    landingZ: number;
  };
}
export const MAPS: readonly Island[] = [
  WORLD.havenport as Island,
  WORLD.saltglass as Island,
];
export const NPCS = WORLD.npcs.map((n) => ({
  ...n,
  island: n.island as IslandId,
  z: n.z + navigation(n.island as IslandId).offsetZ,
}));
export const PLACES = WORLD.interactions.map((n) => ({
  ...n,
  island: n.island as IslandId,
  z: n.z + navigation(n.island as IslandId).offsetZ,
}));
const buildings: Record<string, { width: number; depth: number }> =
  WORLD.buildings;
export function mapFor(id: IslandId) {
  return MAPS.find((m) => m.id === id)!;
}
export function dockFor(id: IslandId) {
  const n = navigation(id);
  return { ...n.dock, landingX: n.landing.x, landingZ: n.landing.z };
}
export function groundAt(x: number, z: number): IslandId | null {
  for (const m of MAPS) {
    const zz = z - m.offsetZ,
      d = m.dock;
    if (
      contains(x, zz, m.shore) ||
      (x >= d.minX && x <= d.maxX && zz >= d.minZ && zz <= d.maxZ)
    )
      return m.id;
  }
  return null;
}
export function obstacleAt(x: number, z: number, radius = 0) {
  for (const m of MAPS) {
    const zz = z - m.offsetZ;
    for (const p of m.landmarks) {
      const box = buildings[p.kind];
      if (
        box &&
        x > p.x - box.width - radius &&
        x < p.x + radius &&
        zz > p.z - box.depth - radius &&
        zz < p.z + radius
      )
        return true;
      if (p.solid && Math.hypot(x - p.x, zz - p.z) < p.solid + radius)
        return true;
      if (p.kind === "arch")
        for (const a of WORLD.archPillars)
          if (Math.hypot(x - p.x - a.x, zz - p.z - a.z) < a.radius + radius)
            return true;
    }
  }
  return false;
}
export function walkable(x: number, z: number, radius = 0.7) {
  if (!groundAt(x, z) || obstacleAt(x, z, radius)) return false;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    if (!groundAt(x + Math.cos(a) * radius, z + Math.sin(a) * radius))
      return false;
  }
  const map = mapFor(groundAt(x, z)!);
  return traversable(
    map,
    { x, z: z - map.offsetZ },
    { x, z: z - map.offsetZ },
    radius,
  );
}
export function inBounds(x: number, z: number) {
  const b = WORLD.bounds;
  return x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ;
}
export function hullPoints(
  boat: Pick<BoatCheckpoint, "x" | "z" | "heading">,
): Point[] {
  const s = Math.sin(boat.heading),
    c = Math.cos(boat.heading);
  return WORLD.boatHull.points.map(([fore, right]) => ({
    x: boat.x + s * fore + c * right,
    z: boat.z - c * fore + s * right,
  }));
}
export function boatClear(boat: Pick<BoatCheckpoint, "x" | "z" | "heading">) {
  const points = hullPoints(boat);
  for (let i = 0; i < points.length; i++) {
    const p = points[i],
      q = points[(i + 1) % points.length],
      steps = Math.ceil(Math.hypot(q.x - p.x, q.z - p.z));
    for (let k = 0; k <= steps; k++) {
      const x = p.x + ((q.x - p.x) * k) / steps,
        z = p.z + ((q.z - p.z) * k) / steps;
      if (!inBounds(x, z) || groundAt(x, z)) return false;
    }
  }
  return !groundAt(boat.x, boat.z) && inBounds(boat.x, boat.z);
}
export function reachableDock(boat: BoatCheckpoint, speed: number) {
  if (Math.abs(speed) > 1.6) return null;
  for (const m of MAPS) {
    const d = dockFor(m.id);
    if (
      Math.hypot(boat.x - d.x, boat.z - d.z) < 13 &&
      walkable(d.landingX, d.landingZ) &&
      boatClear({ ...d, heading: 0 })
    )
      return m.id;
  }
  return null;
}
export function buildingFootprint(kind: string, x: number, z: number) {
  const b = buildings[kind];
  return b
    ? [
        { x, z },
        { x: x - b.width, z },
        { x: x - b.width, z: z - b.depth },
        { x, z: z - b.depth },
      ]
    : [];
}

export function elevationAt(x: number, z: number) {
  const map = MAPS.find((m) => groundAt(x, z) === m.id);
  return map ? heightAtLocal(map, x, z - map.offsetZ) : 0;
}
export function canStep(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  radius = 0.7,
) {
  const id = groundAt(bx, bz);
  if (!id || !walkable(bx, bz, radius)) return false;
  const map = mapFor(id);
  return traversable(
    map,
    { x: ax, z: az - map.offsetZ },
    { x: bx, z: bz - map.offsetZ },
    radius,
  );
}

/** A raised top sorts at its front rim; occupants share that plane, then foot-sort. */
export function surfaceDepth(x: number, z: number) {
  const flat = (x + z) * WORLD.projection.y,
    id = groundAt(x, z);
  if (!id) return flat;
  const map = mapFor(id),
    h = elevationAt(x, z);
  let result = flat;
  for (const level of map.levels ?? [])
    if (
      h >= level.height - 0.01 &&
      (contains(x, z - map.offsetZ, level.polygon) ||
        contains(x - 0.01, z - map.offsetZ - 0.01, level.polygon))
    )
      result = Math.max(
        result,
        ...level.polygon.map(
          ([a, b]) => (a + b + map.offsetZ) * WORLD.projection.y + 0.5 + (flat-(a+b+map.offsetZ)*WORLD.projection.y)*0.001,
        ),
      );
  return result;
}
