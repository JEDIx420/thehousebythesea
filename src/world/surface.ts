/** Authored finite heightfield: renderer and walker share the exact triangle data. */
export const TERRAIN_SIZE = 120;
export const TERRAIN_SEGMENTS = 60;
export const TERRAIN_STEP = TERRAIN_SIZE / TERRAIN_SEGMENTS;
export const ISLANDS = [
  { id: "havenport", name: "Havenport", x: 0, z: 0 },
  { id: "saltglass-bay", name: "Saltglass Bay", x: 0, z: -220 },
] as const;
export function authoredHeight(x: number, z: number, island = 0): number {
  const angle = Math.atan2(z, x);
  const radius =
    51 + Math.sin(angle * 3 + island) * 3 + Math.cos(angle * 5) * 2;
  const r = Math.hypot(x, z * (island ? 1.1 : 0.94));
  const beach = Math.max(-3, Math.min(2.2, (radius - r) * 0.28));
  const hill =
    Math.exp(-((x + 15) ** 2 + (z + 10) ** 2) / 450) * (island ? 13 : 9);
  let y = beach + hill * Math.max(0, Math.min(1, (radius - r) / 12));
  // Harbour walk / access ramp: level enough to be inviting; still part of same mesh.
  if (x > 23 && Math.abs(z) < 27)
    y = Math.min(y, 1.6 + Math.max(0, 23 - x) * 0.02);
  if (x > 45 && x < 58 && Math.abs(z) < 7) y = Math.max(y, 1.6);
  return y;
}
export function createHeightfield(island = 0): Float32Array {
  const count = TERRAIN_SEGMENTS + 1;
  const data = new Float32Array(count * count);
  for (let iz = 0; iz < count; iz++)
    for (let ix = 0; ix < count; ix++)
      data[iz * count + ix] = authoredHeight(
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
export function groundHeight(x: number, z: number): number | null {
  for (let i = 0; i < ISLANDS.length; i++) {
    const p = ISLANDS[i]!,
      lx = x - p.x,
      lz = z - p.z;
    if (lx >= 43 && lx <= 58 && Math.abs(lz) <= 3.7) return 1.68;
    const h = triangleHeight(lx, lz, i);
    if (h !== null && h > 0.35) return h;
  }
  return null;
}
