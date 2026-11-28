import type { PlayerCheckpoint } from "../state/game";
import { walkDirection, project } from "../world/projection";
import { canStep } from "../world/world";
export type GaitPhase = "idle" | "start" | "walk" | "stop";
export class Locomotion {
  vx = 0;
  vz = 0;
  distance = 0;
  phase: GaitPhase = "idle";
  direction: "n" | "s" | "e" | "w" = "s";
  private age = 0;
  private stepIndex = 0;
  readonly maxSpeed = 6.6;
  reset() {
    this.vx = 0;
    this.vz = 0;
    this.phase = "idle";
    this.age = 0;
  }
  update(player: PlayerCheckpoint, h: number, v: number, dt: number) {
    const time = Math.max(0, Math.min(0.1, Number.isFinite(dt) ? dt : 0)),
      wanted = walkDirection(h, v),
      input = !!(h || v),
      startX = player.x,
      startZ = player.z;
    let x = startX,
      z = startZ;
    const steps = Math.max(1, Math.ceil(time / (1 / 120))),
      slice = time / steps;
    if (input && this.phase === "idle") {
      this.phase = "start";
      this.age = 0;
    }
    if (!input && (this.phase === "walk" || this.phase === "start")) {
      this.phase = "stop";
      this.age = 0;
    }
    for (let i = 0; i < steps; i++) {
      const dx = wanted.x * this.maxSpeed - this.vx,
        dz = wanted.z * this.maxSpeed - this.vz,
        n = Math.hypot(dx, dz),
        change = Math.min(n, (input ? 60 : 75) * slice);
      if (n) {
        this.vx += (dx / n) * change;
        this.vz += (dz / n) * change;
      }
      const nx = x + this.vx * slice,
        nz = z + this.vz * slice;
      if (canStep(x, z, nx, z)) x = nx;
      else this.vx = 0;
      if (canStep(x, z, x, nz)) z = nz;
      else this.vz = 0;
    }
    const dx = x - startX,
      dz = z - startZ,
      travel = Math.hypot(dx, dz),
      speed = Math.hypot(this.vx, this.vz);
    this.distance += travel;
    this.age += time;
    if (travel < 0.00001 && speed < 0.05) {
      this.phase = "idle";
      this.age = 0;
    } else if (input && this.age > 0.14) this.phase = "walk";
    const face = project(
        travel > 0.00001 ? dx : wanted.x,
        travel > 0.00001 ? dz : wanted.z,
      ),
      ax = Math.abs(face.x),
      ay = Math.abs(face.y),
      candidate = ax > ay ? (face.x > 0 ? "e" : "w") : face.y > 0 ? "s" : "n";
    // A 20% axis hysteresis keeps four authored facings stable on diagonals.
    const currentAxis =
      this.direction === "e" || this.direction === "w" ? "x" : "y";
    if (
      (travel > 0.00001 || input) &&
      ((candidate === "e" || candidate === "w" ? ax : ay) >
        (currentAxis === "x" ? ax : ay) * 1.2 ||
        (candidate === "e" && this.direction === "w") ||
        (candidate === "w" && this.direction === "e") ||
        (candidate === "n" && this.direction === "s") ||
        (candidate === "s" && this.direction === "n"))
    )
      this.direction = candidate;
    const index = Math.floor(this.distance / 1.65),
      footstep = index !== this.stepIndex;
    this.stepIndex = index;
    return {
      player: {
        ...player,
        x,
        z,
        heading: travel > 0.00001 ? Math.atan2(dx, -dz) : player.heading,
      },
      travel,
      speed,
      footstep,
    };
  }
  frame() {
    return Math.floor((this.distance / 3.3) * 12) % 12;
  }
  metrics() {
    return {
      phase: this.phase,
      speed: Math.hypot(this.vx, this.vz),
      distance: this.distance,
      direction: this.direction,
      velocity: [this.vx, this.vz],
    };
  }
}
