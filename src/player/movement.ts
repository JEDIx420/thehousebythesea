import type { PlayerCheckpoint, BoatCheckpoint } from "../state/game";
import { walkDirection, project } from "../world/projection";
import {
  walkable,
  boatClear,
  dockFor,
  reachableDock,
  groundAt,
} from "../world/world";
export function facing(x: number, z: number): "n" | "s" | "e" | "w" {
  const p = project(x, z);
  return Math.abs(p.x) > Math.abs(p.y)
    ? p.x > 0
      ? "e"
      : "w"
    : p.y > 0
      ? "s"
      : "n";
}
export function moveFoot(
  player: PlayerCheckpoint,
  h: number,
  v: number,
  dt: number,
): PlayerCheckpoint {
  const d = walkDirection(h, v),
    total = Math.max(0, Math.min(dt, 0.15)) * 5.2,
    steps = Math.max(1, Math.ceil(total / 0.25));
  let { x, z } = player;
  for (let i = 0; i < steps; i++) {
    const nextX = x + (d.x * total) / steps,
      nextZ = z + (d.z * total) / steps;
    if (walkable(nextX, z)) x = nextX;
    if (walkable(x, nextZ)) z = nextZ;
  }
  return {
    ...player,
    x,
    z,
    heading: h || v ? Math.atan2(d.x, -d.z) : player.heading,
    island: groundAt(x, z) ?? player.island,
  };
}
export function moveVessel(
  boat: BoatCheckpoint,
  speed: number,
  forward: number,
  turn: number,
  dt: number,
): { boat: BoatCheckpoint; speed: number; blocked: boolean } {
  const time = Math.max(0, Math.min(dt, 0.15)),
    steps = Math.max(1, Math.ceil(time / 0.025)),
    slice = time / steps;
  let next = { ...boat },
    velocity = speed,
    blocked = false;
  for (let i = 0; i < steps; i++) {
    const target = forward > 0 ? 7.6 : 0,
      accel = forward < 0 ? 6 : forward > 0 ? 1.4 : 1.15;
    velocity += Math.max(
      -accel * slice,
      Math.min(accel * slice, target - velocity),
    );
    const heading = Math.atan2(
      Math.sin(next.heading + turn * slice * (0.7 + 0.07 * velocity)),
      Math.cos(next.heading + turn * slice * (0.7 + 0.07 * velocity)),
    );
    if (boatClear({ ...next, heading })) next.heading = heading;
    else blocked = true;
    const x = next.x + Math.sin(next.heading) * velocity * slice,
      z = next.z - Math.cos(next.heading) * velocity * slice;
    if (boatClear({ ...next, x, z })) {
      next = { ...next, x, z, docked: velocity > 0.05 ? null : next.docked };
    } else {
      velocity = 0;
      blocked = true;
    }
  }
  return { boat: next, speed: velocity, blocked };
}
export function board(player: PlayerCheckpoint, boat: BoatCheckpoint) {
  if (player.mode !== "walk" || boat.docked !== player.island) return null;
  const d = dockFor(player.island);
  if (
    Math.hypot(player.x - d.landingX, player.z - d.landingZ) > 7 ||
    Math.hypot(boat.x - d.x, boat.z - d.z) > 1
  )
    return null;
  return {
    ...player,
    x: boat.x,
    z: boat.z,
    heading: boat.heading,
    mode: "boat" as const,
  };
}
export function disembark(
  player: PlayerCheckpoint,
  boat: BoatCheckpoint,
  speed: number,
) {
  const island = reachableDock(boat, speed);
  if (player.mode !== "boat" || !island) return null;
  const d = dockFor(island);
  return {
    player: {
      x: d.landingX,
      z: d.landingZ,
      heading: 0,
      mode: "walk" as const,
      island,
    },
    boat: { x: d.x, z: d.z, heading: 0, docked: island },
  };
}
