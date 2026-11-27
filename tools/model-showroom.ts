import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const candidates = [
  {
    file: "rowan-casual",
    title: "Rowan · Quaternius casual",
    status: "SELECT · CC0 human rig · matching family",
  },
  {
    file: "mira-family-traveller",
    title: "Mira · creator-selected Family Traveller",
    status: "CREATOR CHOICE · CC BY4.0 · authored face/hair retained",
  },
  {
    file: "mira-casual",
    title: "Nessa · Quaternius coastal casual",
    status: "SELECT for Nessa · CC0 · distinct supporting character",
  },
  {
    file: "older-woman-basket",
    title: "Polyfork · grandmother",
    status: "REJECT for Mira · explicit elderly styling",
  },
  {
    file: "rowan-flannel",
    title: "Polyfork · flannel",
    status: "REJECT · blocky human silhouette",
  },
  {
    file: "mira-cardigan",
    title: "Polyfork · cardigan",
    status: "REJECT · blocky human silhouette",
  },
  {
    file: "caique-fishing-boat",
    title: "Mediterranean caique",
    status: "SELECT vessel · 2,636 triangles · mast and jib",
  },
  {
    file: "small-fishing-boat",
    title: "Small Fishing Boat",
    status: "REJECT playable vessel · trestle and dangling anchor",
  },
];
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas")!,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setSize(1440, 920);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.setScissorTest(true);
const loader = new GLTFLoader();
let animation = "Idle";
const tiles: {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mixer: THREE.AnimationMixer;
  clips: THREE.AnimationClip[];
  actions: THREE.AnimationAction[];
}[] = [];
const reports: unknown[] = [];
for (const [i, item] of candidates.entries()) {
  const gltf = await loader.loadAsync(
    `/thehousebythesea/${["rowan-casual", "mira-casual", "mira-family-traveller", "caique-fishing-boat"].includes(item.file) ? "assets/models" : "tools/model-showroom-assets"}/${item.file}.glb`,
  );
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(i === 4 ? "#d2cdc3" : "#e8dfcf");
  scene.add(new THREE.HemisphereLight("#e5f1ee", "#7c765f", 1.6));
  const sun = new THREE.DirectionalLight("#ffe4b4", 2.4);
  sun.position.set(-3, 7, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(512, 512);
  scene.add(sun);
  const bounds = new THREE.Box3().setFromObject(gltf.scene);
  const size = bounds.getSize(new THREE.Vector3());
  gltf.scene.position.y = -bounds.min.y;
  gltf.scene.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  scene.add(gltf.scene);
  const isBoat = i >= 6;
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(isBoat ? 5 : 1.6, isBoat ? 5 : 1.6, 0.06, 64),
    new THREE.MeshStandardMaterial({
      color: isBoat ? "#7faba4" : "#d4c6ad",
      roughness: 0.88,
    }),
  );
  floor.position.y = -0.06;
  floor.receiveShadow = true;
  scene.add(floor);
  const camera = new THREE.PerspectiveCamera(34, 360 / 460, 0.1, 100);
  camera.position.set(isBoat ? 8 : 2.8, isBoat ? 6 : 1.8, isBoat ? 10 : 4);
  camera.lookAt(0, isBoat ? 1.25 : 0.9, 0);
  const mixer = new THREE.AnimationMixer(gltf.scene);
  const actions = gltf.animations.map((c) => mixer.clipAction(c));
  (
    actions[gltf.animations.findIndex((c) => c.name === "Idle")] ?? actions[0]
  )?.play();
  tiles.push({ scene, camera, mixer, clips: gltf.animations, actions });
  const report = {
    file: item.file,
    size: size.toArray(),
    clips: gltf.animations.map((a) => ({
      name: a.name,
      seconds: a.duration,
      tracks: a.tracks.length,
    })),
    materials: new Set(
      (() => {
        const ms: unknown[] = [];
        gltf.scene.traverse((o) => {
          if (o instanceof THREE.Mesh) ms.push(o.material);
        });
        return ms;
      })(),
    ).size,
    skins: (() => {
      let n = 0;
      gltf.scene.traverse((o) => {
        if (o instanceof THREE.SkinnedMesh) n++;
      });
      return n;
    })(),
  };
  reports.push(report);
  document.querySelector("#labels")!.insertAdjacentHTML(
    "beforeend",
    `<article><h2>${item.title}</h2><p>${item.status}</p><small>${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)} m · ${gltf.animations
      .filter((c) => ["Idle", "Walk", "Interact", "tick"].includes(c.name))
      .map((c) => c.name)
      .join(" / ")}</small></article>`,
  );
}
function select(name: string) {
  animation = name;
  tiles.forEach((t) => {
    t.actions.forEach((a) => a.stop());
    const index = t.clips.findIndex((c) => c.name === name);
    (t.actions[index] ?? t.actions[0])?.reset().play();
  });
}
document
  .querySelector("#idle")!
  .addEventListener("click", () => select("Idle"));
document
  .querySelector("#walk")!
  .addEventListener("click", () => select("Walk"));
let last = performance.now();
function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  for (const [i, t] of tiles.entries()) {
    t.mixer.update(dt);
    const x = (i % 4) * 360,
      y = 460 - Math.floor(i / 4) * 460;
    renderer.setViewport(x, y, 360, 460);
    renderer.setScissor(x, y, 360, 460);
    renderer.render(t.scene, t.camera);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
Object.assign(window, {
  showroom: {
    reports,
    get animation() {
      return animation;
    },
    ready: true,
  },
});
