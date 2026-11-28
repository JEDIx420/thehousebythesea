import type { GameState } from "./game";
import {
  navigation,
  WORLD_VERSION,
  DEFAULT_SETTINGS,
} from "../data/navigation";
import { walkable, groundAt, boatClear } from "../world/world";
/** Migration is a coordinate repair, never a gameplay event or reward. */
export function migrateWorld(source: GameState): GameState {
  const state = structuredClone(source),
    p = state.player,
    b = state.boat;
  state.worldVersion = WORLD_VERSION;
  state.settings = { ...DEFAULT_SETTINGS, ...state.settings };
  if (b.docked) {
    const canonical = navigation(b.docked).dock;
    // A docked tag is a berth promise: remap its coordinates together.
    Object.assign(b, canonical);
  }
  if (p.mode === "boat") {
    if (!boatClear(b)) Object.assign(b, navigation(p.island).dock);
    Object.assign(p, { x: b.x, z: b.z, heading: b.heading });
  } else {
    if (!walkable(p.x, p.z) || groundAt(p.x, p.z) !== p.island)
      Object.assign(p, navigation(p.island).safe, { heading: 0 });
    if (!boatClear(b) || b.docked !== p.island)
      Object.assign(b, navigation(p.island).dock);
  }
  return state;
}
