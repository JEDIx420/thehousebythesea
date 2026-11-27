import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  heightfields,
  TERRAIN_SEGMENTS,
  TERRAIN_STEP,
  triangleHeight,
  groundHeight,
  seaFloorHeight,
} from "./surface";
describe("authored terrain collision", () => {
  it("matches the rendered triangle planes, including diagonal seams", () => {
    const n = TERRAIN_SEGMENTS + 1,
      positions: number[] = [],
      indices: number[] = [];
    for (let iz = 0; iz < n; iz++)
      for (let ix = 0; ix < n; ix++)
        positions.push(
          ix * TERRAIN_STEP - 60,
          heightfields[0]![iz * n + ix]!,
          iz * TERRAIN_STEP - 60,
        );
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
    geometry.setIndex(indices);
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
    );
    mesh.updateMatrixWorld();
    for (const [x, z] of [
      [0.3, 0.9],
      [0.5, 0.5], // exact u+v=1 triangle diagonal at the new1m grid
      [-14.3, -11.8],
      [38.3, 12.6],
      [48.1, 5.8],
      [-43.2, 6.8],
    ]) {
      const ray = new THREE.Raycaster(
        new THREE.Vector3(x, 100, z),
        new THREE.Vector3(0, -1, 0),
      );
      const hit = ray.intersectObject(mesh)[0];
      expect(hit).toBeDefined();
      expect(triangleHeight(x, z)).toBeCloseTo(hit!.point.y, 5);
    }
    geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  });
  it("provides a continuous safe pier and a clear water berth", () => {
    expect(groundHeight(48, 0)).toBe(1.68);
    expect(groundHeight(55, 0)).toBe(1.68);
    expect(groundHeight(62, 0)).toBeNull();
    expect(groundHeight(55, -220)).toBe(1.68);
    expect(groundHeight(62, -220)).toBeNull();
  });
  it("keeps raw shallows available for boat collision instead of filtering them as walking water", () => {
    let shallow: [number, number] | undefined;
    for (let x = -54; x < 54 && !shallow; x += 0.25) {
      const h = seaFloorHeight(x, 18);
      if (h > 0.02 && h < 0.3) shallow = [x, 18];
    }
    expect(shallow).toBeDefined();
    expect(groundHeight(...shallow!)).toBeNull();
    expect(seaFloorHeight(...shallow!)).toBeGreaterThan(0);
    expect(seaFloorHeight(62, 0)).toBeLessThan(-0.15);
    expect(seaFloorHeight(62, -220)).toBeLessThan(-0.15);
  });
});
