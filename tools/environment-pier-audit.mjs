import fs from "node:fs";
import assert from "node:assert/strict";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const bytes = fs.readFileSync(
  new URL("../public/assets/models/boardwalk-deck.glb", import.meta.url),
);
const gltf = await new GLTFLoader().parseAsync(
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  "",
);
const pier = new THREE.Group();
for (let k = 0; k < 4; k++) {
  const module = gltf.scene.clone(true);
  module.position.set(44.875 + k * 3.75, 0.48, 0);
  module.scale.set(0.9375, 1, 1.85);
  pier.add(module);
}
pier.updateMatrixWorld(true);
const bounds = new THREE.Box3().setFromObject(pier);
for (const [actual, expected] of [
  [bounds.min.x, 43],
  [bounds.max.x, 58],
  [bounds.min.z, -3.7],
  [bounds.max.z, 3.7],
])
  assert.ok(Math.abs(actual - expected) < 1e-5);
const samples = [];
for (const x of [43.1, 45, 48, 51, 55, 57.9])
  for (const z of [-2.5, 0, 2.5]) {
    const hits = new THREE.Raycaster(
      new THREE.Vector3(x, 1.9, z),
      new THREE.Vector3(0, -1, 0),
    ).intersectObject(pier, true);
    assert.ok(hits.length, `No imported deck below ${x},${z}`);
    assert.ok(
      hits[0].point.y >= 1.64 && hits[0].point.y <= 1.681,
      `Deck height ${hits[0].point.y}`,
    );
    samples.push([x, z, hits[0].point.y]);
  }
console.log(
  JSON.stringify(
    {
      bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
      walkTop: 1.68,
      samples: samples.length,
      actualDeckRange: [
        Math.min(...samples.map((p) => p[2])),
        Math.max(...samples.map((p) => p[2])),
      ],
      result: "PASS",
    },
    null,
    2,
  ),
);
