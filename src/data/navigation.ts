import WORLD from "../../assets/source/world.json" with { type: "json" };
export const WORLD_VERSION = "pixel-first-voyage-v2" as const;
export const islands = [WORLD.havenport, WORLD.saltglass];
export function navigation(id: "havenport" | "saltglass-bay") {
  const m = islands.find((m) => m.id === id)!;
  return {
    dock: { x: m.dock.x, z: m.dock.z + m.offsetZ, heading: 0, docked: id },
    landing: { x: m.dock.landingX, z: m.dock.landingZ + m.offsetZ },
    safe: { x: m.safe.x, z: m.safe.z + m.offsetZ },
    companionRoute: m.companionRoute.map(([x, z]) => ({ x, z: z + m.offsetZ })),
    offsetZ: m.offsetZ,
  };
}
export const DEFAULT_SETTINGS = {
  muted: false,
  volume: 0.35,
  music: 0.7,
  ambience: 0.35,
  sfx: 0.55,
  reducedMotion: false,
  instantText: false,
};
