import WORLD from "../../assets/source/world.json" with { type: "json" };
import { navigation } from "../data/navigation";
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
  distance: number;
  wait: number;
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
    distance: 0,
    wait: 3,
  }));
  private time = 0;
  private mode:
    "home" | "to-boat" | "boarding" | "aboard" | "unboarding" | "returning" =
    "home";
  private route: Point[] = [];
  private progress = 0;
  private from: Point = { ...navigation("havenport").landing };
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
    this.route = navigation("havenport").companionRoute;
  }
  prepareBoarding() {
    if (this.mode === "returning" || this.mode === "home") {
      const path = navigation("havenport").companionRoute;
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
      if (s.settings.reducedMotion) continue;
      this.routine(p, dt);
    }
  }
  private routine(p: Person, dt: number) {
    if (p.wait > 0) {
      p.wait = Math.max(0, p.wait - dt);
      return;
    }
    const route = WORLD.routines[p.id as keyof typeof WORLD.routines],
      node = route[p.target % route.length],
      offset = navigation(p.point.island).offsetZ;
    if (this.step(p, { x: node[0], z: node[1] + offset }, dt, 1.35)) {
      p.wait = node[2];
      p.target++;
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
    const moved = Math.hypot(next.x - p.point.x, next.z - p.point.z);
    p.distance += moved;
    p.walking = moved > 0.001;
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
    if (this.mode === "home") {
      if (!s.settings.reducedMotion) this.routine(p, dt);
      return;
    }
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
          : navigation("havenport").landing;
      this.progress = Math.min(1, this.progress + dt / 0.75);
      p.direction = facing(target.x - this.from.x, target.z - this.from.z);
      const before = { x: p.point.x, z: p.point.z };
      p.point = {
        ...p.point,
        x: this.from.x + (target.x - this.from.x) * this.progress,
        z: this.from.z + (target.z - this.from.z) * this.progress,
      };
      p.distance += Math.hypot(p.point.x - before.x, p.point.z - before.z);
      p.walking = true;
      if (this.progress === 1) {
        if (this.mode === "boarding") {
          this.mode = "aboard";
          p.visible = false;
        } else {
          this.mode = "returning";
          p.point.island = "havenport";
          this.route = [...navigation("havenport").companionRoute]
            .reverse()
            .slice(1);
          if (s.player.mode === "boat" && s.story.outingInvited)
            this.prepareBoarding();
        }
      }
    }
  }
}
