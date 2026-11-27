/** Finite authored coast. Rendering and navigation share these exact triangle vertices. */
export const TERRAIN_SIZE = 120;
export const TERRAIN_SEGMENTS = 120;
export const TERRAIN_STEP = TERRAIN_SIZE / TERRAIN_SEGMENTS;
export const PIER = { minX: 43, maxX: 58, halfWidth: 3.7, top: 1.68 } as const;
export const ISLANDS = [
  { id: "havenport", name: "Havenport", x: 0, z: 0 },
  { id: "saltglass-bay", name: "Saltglass Bay", x: 0, z: -220 },
] as const;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export function authoredHeight(x: number, z: number, island = 0): number {
  const angle = Math.atan2(z, x),
    r = Math.hypot(x, z * (island ? 1.04 : 0.94));
  // Fixed asymmetry: Havenport's rounded harbour and Saltglass's longer green headland.
  const radius =
    49 +
    Math.sin(angle * 3 + island * 0.7) * 3.5 +
    Math.cos(angle * 5 + island) * 1.7;
  const inlet =
    (island ? 5.2 : 6.2) * Math.exp(-((x - 45) ** 2 / 150 + (z * z) / 190));
  const inland = radius - r - inlet;
  let y =
    inland < 0
      ? Math.max(-10, Math.min(-0.01, inland * 0.28))
      : 2.15 * Math.tanh(inland * 0.13);
  const hills =
    Math.exp(-((x + 17) ** 2 / 420 + (z + 8) ** 2 / 520)) *
      (island ? 11.6 : 9.2) +
    Math.exp(-((x + 5) ** 2 / 150 + (z - (island ? -28 : 27)) ** 2 / 180)) *
      (island ? 4.8 : 3.1);
  y += hills * smooth(2, 14, inland);
  // An authored gently sloping settlement apron; avoids the former rectangular sand plateau.
  const apron =
    smooth(15, 28, x) *
    (1 - smooth(28, 39, Math.abs(z))) *
    smooth(4, 14, inland);
  y = y * (1 - apron) + 2.05 * apron;
  // Exact, continuous approach ramp ends beneath the imported boardwalk, not in mid-air.
  const ramp =
    smooth(36, 42, x) *
    (1 - smooth(4, 7, Math.abs(z))) *
    (1 - smooth(43, 46, x));
  y = y * (1 - ramp) + 1.6 * ramp;
  return y;
}
export function createHeightfield(island = 0): Float32Array {
  const n = TERRAIN_SEGMENTS + 1,
    data = new Float32Array(n * n);
  for (let iz = 0; iz < n; iz++)
    for (let ix = 0; ix < n; ix++)
      data[iz * n + ix] = authoredHeight(
        ix * TERRAIN_STEP - 60,
        iz * TERRAIN_STEP - 60,
        island,
      );
  return data;
}
export const heightfields = ISLANDS.map((_, i) => createHeightfield(i));
export function triangleHeight(
  x: number,
  z: number,
  island = 0,
): number | null {
  const gx = (x + 60) / TERRAIN_STEP,
    gz = (z + 60) / TERRAIN_STEP;
  if (gx < 0 || gz < 0 || gx >= TERRAIN_SEGMENTS || gz >= TERRAIN_SEGMENTS)
    return null;
  const ix = Math.floor(gx),
    iz = Math.floor(gz),
    u = gx - ix,
    v = gz - iz,
    n = TERRAIN_SEGMENTS + 1,
    h = heightfields[island]!;
  const a = h[iz * n + ix]!,
    b = h[iz * n + ix + 1]!,
    c = h[(iz + 1) * n + ix]!,
    d = h[(iz + 1) * n + ix + 1]!;
  return u + v <= 1
    ? a + (b - a) * u + (c - a) * v
    : d + (c - d) * (1 - u) + (b - d) * (1 - v);
}
/** Raw visible seabed, including shallows below the walkable threshold. */
export function seaFloorHeight(x: number, z: number): number {
  let result = -12;
  for (let i = 0; i < ISLANDS.length; i++) {
    const p = ISLANDS[i]!;
    result = Math.max(result, triangleHeight(x - p.x, z - p.z, i) ?? -12);
  }
  return result;
}
export function groundHeight(x: number, z: number): number | null {
  for (let i = 0; i < ISLANDS.length; i++) {
    const p = ISLANDS[i]!,
      lx = x - p.x,
      lz = z - p.z;
    if (lx >= PIER.minX && lx <= PIER.maxX && Math.abs(lz) <= PIER.halfWidth)
      return PIER.top;
    const h = triangleHeight(lx, lz, i);
    if (h !== null && h > 0.35) return h;
  }
  return null;
}
