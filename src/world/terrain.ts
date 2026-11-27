import * as THREE from "three";
import {
  heightfields,
  ISLANDS,
  TERRAIN_SEGMENTS,
  TERRAIN_STEP,
} from "./surface";
const mix = (a: number, b: number, x: number) => a + (b - a) * x;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** One mesh definition is also the authoritative collider data. */
export function addTerrain(group: THREE.Group) {
  const n = TERRAIN_SEGMENTS + 1;
  for (let island = 0; island < ISLANDS.length; island++) {
    const positions: number[] = [],
      colors: number[] = [],
      indices: number[] = [],
      h = heightfields[island]!;
    for (let iz = 0; iz < n; iz++)
      for (let ix = 0; ix < n; ix++) {
        const x = ix * TERRAIN_STEP - 60,
          z = iz * TERRAIN_STEP - 60,
          y = h[iz * n + ix]!;
        positions.push(x, y, z);
        const slope = Math.hypot(
          (h[iz * n + Math.min(n - 1, ix + 1)]! -
            h[iz * n + Math.max(0, ix - 1)]!) /
            2,
          (h[Math.min(n - 1, iz + 1) * n + ix]! -
            h[Math.max(0, iz - 1) * n + ix]!) /
            2,
        );
        const sand = new THREE.Color("#d0b787"),
          grass = new THREE.Color(island ? "#607654" : "#78875d"),
          rock = new THREE.Color("#777d70");
        const patch =
          Math.sin(x * 0.15 + z * 0.08) * 0.18 + Math.sin(z * 0.21) * 0.1;
        const inland = smooth(0.8, 2.2, y + patch);
        sand.lerp(grass, inland).lerp(rock, smooth(0.55, 1.4, slope) * 0.7);
        // A continuous sandy lane joins the individual stone models into one readable route.
        const lane = Math.abs(x - 32),
          branch = Math.abs(z);
        const laneMask =
          (1 - smooth(1.8, 2.8, lane)) * (1 - smooth(27, 31, Math.abs(z)));
        const branchMask =
          (1 - smooth(1.7, 2.7, branch)) *
          smooth(30, 33, x) *
          (1 - smooth(41, 44, x));
        sand.lerp(
          new THREE.Color("#c6b187"),
          Math.max(laneMask, branchMask) * 0.8,
        );
        if (island === 0)
          sand.lerp(
            new THREE.Color("#d4bc8d"),
            (1 - smooth(3.5, 7, Math.hypot(x - 22, z + 31))) * 0.75,
          );
        const variation = mix(
          0.94,
          1.03,
          0.5 + 0.5 * Math.sin(x * 0.23 + Math.cos(z * 0.31)),
        );
        sand.multiplyScalar(variation);
        colors.push(sand.r, sand.g, sand.b);
      }
    for (let iz = 0; iz < TERRAIN_SEGMENTS; iz++)
      for (let ix = 0; ix < TERRAIN_SEGMENTS; ix++) {
        const a = iz * n + ix,
          b = a + 1,
          c = a + n,
          d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const land = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 1,
        flatShading: false,
      }),
    );
    land.name = `terrain-${ISLANDS[island]!.id}`;
    land.position.set(ISLANDS[island]!.x, 0, ISLANDS[island]!.z);
    land.receiveShadow = true;
    group.add(land);
  }
}
