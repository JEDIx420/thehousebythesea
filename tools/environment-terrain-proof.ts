import * as THREE from "three";
import { createTerrain } from "procedural-terrains";
import { exportTerrain } from "procedural-terrains/export";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  createHeightfield,
  TERRAIN_SEGMENTS,
  triangleHeight,
} from "../src/world/surface";
import { addTerrain } from "../src/world/terrain";
import { addWater } from "../src/world/water";
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(640, 420);
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
document.body.append(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#bfd4d3");
scene.add(new THREE.HemisphereLight("#dbe6e0", "#4b573d", 1.65));
const sun = new THREE.DirectionalLight("#ffe2b4", 2.1);
sun.position.set(-60, 90, 20);
scene.add(sun);
const camera = new THREE.PerspectiveCamera(43, 640 / 420, 0.1, 800);
camera.position.set(87, 57, 76);
camera.lookAt(0, 1, 0);
const waterRoot = new THREE.Group();
scene.add(waterRoot);
const water = addWater(waterRoot);
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
      quality: { lodSegments: [32, 16, 8, 4] },
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
  const readyMs = performance.now() - start;
  const frames: number[] = [];
  let last = performance.now(),
    elapsed = 0,
    mode = "live",
    other: THREE.Object3D | null = null;
  function frame(now: number) {
    const dt = (now - last) / 1000;
    last = now;
    elapsed += Math.min(0.05, dt);
    frames.push(dt * 1000);
    if (frames.length > 240) frames.shift();
    if (mode === "live") terrain.update(dt, { camera });
    water.update(elapsed);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  Object.assign(window, {
    v2proof: {
      diagnostics() {
        const points = [
          [40, 0],
          [0, 0],
          [49, 0],
          [48, 5],
        ];
        return {
          mode,
          readyMs,
          frames: frames.slice(-120),
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          webgl: renderer
            .getContext()
            .getParameter(renderer.getContext().VERSION),
          cpuSamples: points.map(([x, z]) => ({
            x,
            z,
            live: terrain.sampleHeight(x, z),
            authoredTriangle: triangleHeight(x, z),
          })),
        };
      },
      async export() {
        const result = await exportTerrain(terrain, {
          format: "glb",
          meshRes: 120,
          texRes: 64,
          bakeColor: false,
          exportHeightmap: true,
          exportCollision: true,
          collisionRes: 120,
        });
        return Object.fromEntries(
          Object.entries(result.files).map(([name, data]) => [
            name,
            Array.from(data),
          ]),
        );
      },
      async showExport(bytes: number[]) {
        scene.remove(terrain.object);
        const gltf = await new GLTFLoader().parseAsync(
          new Uint8Array(bytes).buffer,
          "",
        );
        other = gltf.scene;
        scene.add(other);
        mode = "exported";
        frames.length = 0;
        document.querySelector("#mode")!.textContent =
          "V2 · actual exported GLB · export appearance is not presumed equivalent";
      },
      showAuthored() {
        if (other) scene.remove(other);
        scene.remove(terrain.object);
        const group = new THREE.Group();
        addTerrain(group);
        const distant = group.getObjectByName("terrain-saltglass-bay");
        if (distant) distant.visible = false;
        scene.add(group);
        mode = "authored";
        frames.length = 0;
        document.querySelector("#mode")!.textContent =
          "V2 · production authored1m triangle mesh · exact collision vertices";
      },
    },
  });
} catch (error) {
  Object.assign(window, { v2proofError: String(error) });
  document.body.append(String(error));
}
