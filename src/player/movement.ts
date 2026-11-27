import type { GameState } from "../state/game";

export interface MovementSurface {
  groundHeight(x: number, z: number): number | null;
  blocked(x: number, z: number): boolean;
}
export interface MovementInput {
  forward: number;
  turn: number;
}
const velocities = new WeakMap<object, number>();
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Collision queries use the same baked triangle surface as rendering. No scene graph state is authoritative. */
export function updateMovement(
  state: GameState,
  input: MovementInput,
  dt: number,
  world: MovementSurface,
) {
  dt = clamp(dt, 0, 0.05);
  const forward = clamp(input.forward, -1, 1),
    turn = clamp(input.turn, -1, 1);
  let boundary = false;
  if (state.player.mode === "walk") {
    state.player.heading += turn * 2.7 * dt;
    const distance = forward * 5.8 * dt;
    const dx = Math.sin(state.player.heading) * distance,
      dz = -Math.cos(state.player.heading) * distance;
    const canWalk = (x: number, z: number) => {
      const h = world.groundHeight(x, z),
        old = world.groundHeight(state.player.x, state.player.z);
      return (
        h !== null &&
        h > 0.1 &&
        !world.blocked(x, z) &&
        (old === null || Math.abs(h - old) < 0.75)
      );
    };
    let moving = false;
    if (canWalk(state.player.x + dx, state.player.z + dz)) {
      state.player.x += dx;
      state.player.z += dz;
      moving = Math.abs(distance) > 0.001;
    } else if (canWalk(state.player.x + dx, state.player.z)) {
      state.player.x += dx;
      moving = Math.abs(dx) > 0.001;
    } else if (canWalk(state.player.x, state.player.z + dz)) {
      state.player.z += dz;
      moving = Math.abs(dz) > 0.001;
    }
    return { moving, speed: moving ? forward * 5.8 : 0, boundary };
  }
  let speed = velocities.get(state.boat) ?? 0;
  const target = forward * (forward < 0 ? 4 : 13);
  speed += (target - speed) * (1 - Math.exp(-dt * (forward === 0 ? 2.4 : 1.6)));
  if (Math.abs(speed) < 0.025) speed = 0;
  const candidateHeading =
    state.boat.heading +
    turn * dt * 1.0 * (0.4 + Math.min(1, Math.abs(speed) / 6));

  // Boat clearance samples a short bow/stern footprint and hull sides. Docks are
  // deliberately approached from their seaward side; landing itself is explicit.
  const clear = (cx: number, cz: number, heading = state.boat.heading) => {
    for (const [ox, oz] of [
      [0, 0],
      [0, -4],
      [0.8, -2.9],
      [-0.8, -2.9],
      [1.5, -1.7],
      [-1.5, -1.7],
      [1.6, 0],
      [-1.6, 0],
      [1.6, 1.6],
      [-1.6, 1.6],
      [1.2, 3.1],
      [-1.2, 3.1],
      [0, 3.1],
    ]) {
      // Model rotates by -heading about Y: local -Z bow turns toward +X.
      const sx = cx + ox * Math.cos(heading) - oz * Math.sin(heading);
      const sz = cz + oz * Math.cos(heading) + ox * Math.sin(heading);
      const h = world.groundHeight(sx, sz);
      // A dock surface may be over water. Keep its margin clear to avoid hull clipping.
      if (h !== null && h > -0.15) return false;
    }
    return true;
  };
  if (clear(state.boat.x, state.boat.z, candidateHeading))
    state.boat.heading = candidateHeading;
  const dx = Math.sin(state.boat.heading) * speed * dt,
    dz = -Math.cos(state.boat.heading) * speed * dt;
  const x = state.boat.x + dx,
    z = state.boat.z + dz;
  if (x < -140 || x > 180 || z < -340 || z > 120) {
    boundary = true;
    speed = 0;
  } else if (clear(x, z)) {
    state.boat.x = x;
    state.boat.z = z;
    if (Math.abs(speed) > 0.15) state.boat.docked = null;
  } else speed = 0;
  velocities.set(state.boat, speed);
  state.player.x = state.boat.x;
  state.player.z = state.boat.z;
  state.player.heading = state.boat.heading;
  return { moving: Math.abs(speed) > 0.1, speed, boundary };
}

/** Call after recovery or a manual docking transition to eliminate stale momentum. */
export function stopBoat(state: GameState) {
  velocities.set(state.boat, 0);
}
