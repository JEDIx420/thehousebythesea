import type {
  GameState,
  PlayerCheckpoint,
  BoatCheckpoint,
  IslandId,
} from "../state/game";
import { NPCS, dockFor } from "./world";
import { moveFoot, facing } from "../player/movement";
import { project, type Point } from "./projection";
export interface Person {
  id: string;
  actor: string;
  name: string;
  point: PlayerCheckpoint;
  home: Point;
  direction: "s" | "n" | "e" | "w";
  walking: boolean;
  visible: boolean;
  target: number;
}
export function deckSeat(
  boat: BoatCheckpoint,
  fore: number,
  right: number,
): Point {
  const s = Math.sin(boat.heading),
    c = Math.cos(boat.heading);
  return { x: boat.x + s * fore + c * right, z: boat.z - c * fore + s * right };
}
export class People {
  readonly persons: Person[] = NPCS.map((n) => ({
    id: n.id,
    actor: n.actor,
    name: n.name,
    point: { x: n.x, z: n.z, heading: 0, mode: "walk", island: n.island },
    home: { x: n.x, z: n.z },
    direction: "s",
    walking: false,
    visible: true,
    target: 0,
  }));
  private time = 0;
  private mode:
    "home" | "to-boat" | "boarding" | "aboard" | "unboarding" | "returning" =
    "home";
  private route: Point[] = [];
  private progress = 0;
  private from: Point = { x: 55, z: 0 };
  constructor(s: GameState) {
    if (
      s.story.outingInvited &&
      (s.player.mode === "boat" || s.player.island === "saltglass-bay")
    ) {
      this.mode = "aboard";
      this.mira.visible = false;
    } else if (s.story.outingInvited && !s.story.outingVisitedSaltglass)
      this.invite();
  }
  get mira() {
    return this.persons.find((p) => p.id === "mira")!;
  }
  get aboard() {
    return this.mode === "aboard";
  }
  invite() {
    if (this.mode !== "home") return;
    this.mode = "to-boat";
    this.route = [
      { x: 35, z: -12 },
      { x: 32, z: -12 },
      { x: 32, z: -1 },
      { x: 40, z: 0 },
      { x: 55, z: 0 },
    ];
  }
  prepareBoarding() {
    if (this.mode === "returning" || this.mode === "home") {
      const path = [
        { x: 35, z: -12 },
        { x: 32, z: -12 },
        { x: 32, z: -1 },
        { x: 40, z: 0 },
        { x: 55, z: 0 },
      ];
      let closest = 0;
      for (let i = 1; i < path.length; i++)
        if (
          Math.hypot(
            path[i].x - this.mira.point.x,
            path[i].z - this.mira.point.z,
          ) <
          Math.hypot(
            path[closest].x - this.mira.point.x,
            path[closest].z - this.mira.point.z,
          )
        )
          closest = i;
      this.route = path.slice(closest);
      this.mode = "to-boat";
    }
  }
  disembarked(island: IslandId, s: GameState) {
    if (
      this.mode === "aboard" &&
      island === "havenport" &&
      s.story.outingVisitedSaltglass
    ) {
      this.mode = "unboarding";
      this.from = deckSeat(s.boat, 5, 1.6);
      this.progress = 0;
      this.mira.visible = true;
    }
  }
  update(dt: number, paused: boolean, s: GameState) {
    for (const p of this.persons) p.walking = false;
    if (paused) return;
    this.time += dt;
    for (const [index, p] of this.persons.entries()) {
      if (p.id === "mira") {
        this.updateMira(dt, s);
        continue;
      }
      if (s.settings.reducedMotion || this.time % 18 > 7) continue;
      const offsets =
        p.id === "seller"
          ? [
              [0, 0],
              [1, 2],
              [-1, 1],
            ]
          : [
              [0, 0],
              [-3, -1],
              [1, -1],
            ];
      const [dx, dz] = offsets[p.target % offsets.length],
        target = { x: p.home.x + dx, z: p.home.z + dz };
      if (this.step(p, target, dt, 0.8 + index * 0.08)) p.target++;
    }
  }
  private step(p: Person, target: Point, dt: number, speed: number) {
    const dx = target.x - p.point.x,
      dz = target.z - p.point.z;
    if (Math.hypot(dx, dz) < Math.max(0.2, dt * speed)) {
      p.point = { ...p.point, ...target };
      return true;
    }
    const screen = project(dx, dz),
      next = moveFoot(p.point, screen.x, screen.y, (dt * speed) / 5.2);
    p.walking = Math.hypot(next.x - p.point.x, next.z - p.point.z) > 0.001;
    if (p.walking) p.direction = facing(dx, dz);
    p.point = next;
    return false;
  }
  private updateMira(dt: number, s: GameState) {
    const p = this.mira;
    if (this.mode === "aboard") {
      p.visible = false;
      return;
    }
    p.visible = true;
    if (this.mode === "home") return;
    if (this.mode === "to-boat" || this.mode === "returning") {
      if (this.route.length) {
        if (this.step(p, this.route[0], dt, 4.2)) this.route.shift();
        return;
      }
      if (this.mode === "returning") {
        this.mode = "home";
        p.direction = "s";
        return;
      }
      this.mode = "boarding";
      this.from = { x: p.point.x, z: p.point.z };
      this.progress = 0;
    }
    if (this.mode === "boarding" || this.mode === "unboarding") {
      const target =
        this.mode === "boarding"
          ? deckSeat(s.boat, 5, 1.6)
          : { x: dockFor("havenport").landingX, z: 0 };
      this.progress = Math.min(1, this.progress + dt / 0.75);
      p.direction = facing(target.x - this.from.x, target.z - this.from.z);
      p.point = {
        ...p.point,
        x: this.from.x + (target.x - this.from.x) * this.progress,
        z: this.from.z + (target.z - this.from.z) * this.progress,
      };
      p.walking = true;
      if (this.progress === 1) {
        if (this.mode === "boarding") {
          this.mode = "aboard";
          p.visible = false;
        } else {
          this.mode = "returning";
          p.point.island = "havenport";
          this.route = [
            { x: 40, z: 0 },
            { x: 32, z: -1 },
            { x: 32, z: -12 },
            { x: 35, z: -12 },
          ];
          if (s.player.mode === "boat" && s.story.outingInvited)
            this.prepareBoarding();
        }
      }
    }
  }
}
