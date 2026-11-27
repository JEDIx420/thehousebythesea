import * as THREE from "three";
import { createTerrain } from "procedural-terrains";
import { exportTerrain } from "procedural-terrains/export";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createHeightfield, TERRAIN_SEGMENTS } from "../src/world/surface";
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(320, 240);
document.body.append(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#d4dfdc");
scene.add(new THREE.HemisphereLight("#fff4da", "#497758", 3));
const camera = new THREE.PerspectiveCamera(45, 320 / 240, 0.1, 1000);
camera.position.set(95, 80, 110);
camera.lookAt(0, 0, 0);
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(800, 800, 20, 20),
  new THREE.MeshStandardMaterial({
    color: "#398e9a",
    roughness: 0.28,
    metalness: 0.15,
  }),
);
water.rotation.x = -Math.PI / 2;
scene.add(water);
const start = performance.now();
try {
  const terrain = await createTerrain({
    renderer,
    configuration: {
      layout: { chunkCount: 1, chunkSize: 120 },
      source: {
        kind: "heightmap",
        width: TERRAIN_SEGMENTS + 1,
        height: TERRAIN_SEGMENTS + 1,
        data: Array.from(createHeightfield()),
      },
      quality: { lodSegments: [16, 8, 4, 2] },
      material: {
        terrainDetailQuality: 0,
        terrainMicroDetail: 0,
        terrainMacroVariation: 0,
        terrainTriplanar: false,
        visualsTerrainHeightDetail: 0,
      },
      seaLevel: 0,
      heightScale: 1,
    },
  });
  scene.add(terrain.object);
  await terrain.prepare(camera);
  const ready = performance.now();
  const frames: number[] = [];
  let last = performance.now(),
    time = 0;
  let mode = "live";
  function frame() {
    const now = performance.now(),
      dt = (now - last) / 1000;
    last = now;
    time += dt;
    frames.push(dt * 1000);
    if (mode === "live") terrain.update(dt, { camera });
    const pos = water.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++)
      pos.setZ(i, Math.sin(pos.getX(i) * 0.1 + time) * 0.12);
    pos.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();
  Object.assign(window, {
    spike: {
      terrain,
      renderer,
      scene,
      frames,
      readyMs: ready - start,
      mode,
      async export() {
        const result = await exportTerrain(terrain, {
          format: "glb",
          meshRes: 60,
          texRes: 64,
          bakeColor: false,
          exportHeightmap: true,
          exportCollision: true,
          collisionRes: 60,
        });
        return Object.fromEntries(
          Object.entries(result.files).map(([k, v]) => [k, Array.from(v)]),
        );
      },
      async baked(bytes: number[]) {
        scene.remove(terrain.object);
        const gltf = await new GLTFLoader().parseAsync(
          new Uint8Array(bytes).buffer,
          "",
        );
        scene.add(gltf.scene);
        mode = "baked";
        frames.length = 0;
        return { triangles: renderer.info.render.triangles };
      },
      diagnostics() {
        return {
          readyMs: ready - start,
          frames: frames.slice(-180),
          draw: renderer.info.render,
          terrain: terrain.getDiagnostics(),
          samples: [
            terrain.sampleHeight(40, 0),
            terrain.sampleHeight(0, 0),
            terrain.sampleHeight(49, 0),
          ],
        };
      },
    },
  });
} catch (e) {
  document.body.append(String(e));
  console.error(e);
  Object.assign(window, { spikeError: String(e) });
}
