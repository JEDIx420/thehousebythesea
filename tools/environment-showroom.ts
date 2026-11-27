import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import records from "../src/world/environment-assets.json";
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1600, 1200);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
document.body.append(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#354d4b");
scene.add(new THREE.HemisphereLight("#dbe4e2", "#444b35", 1.8));
const sun = new THREE.DirectionalLight("#ffe4bd", 2.2);
sun.position.set(30, 50, 25);
scene.add(sun);
const camera = new THREE.OrthographicCamera(-46, 46, 35, -35, 0.1, 300);
camera.position.set(25, 70, 65);
camera.lookAt(0, 0, 0);
const loader = new GLTFLoader();
const audits = [];
for (const [index, record] of records.entries()) {
  const gltf = await loader.loadAsync(`/thehousebythesea/${record.file}`);
  const model = gltf.scene;
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model),
    size = bounds.getSize(new THREE.Vector3()),
    center = bounds.getCenter(new THREE.Vector3());
  const scale = Math.min(1.2, 6 / Math.max(size.x, size.y, size.z));
  model.scale.setScalar(scale);
  const x = ((index % 7) - 3) * 12,
    z = (Math.floor(index / 7) - 1.5) * 14;
  model.position.set(
    x - center.x * scale,
    -bounds.min.y * scale,
    z - center.z * scale,
  );
  scene.add(model);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 80;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f2dfbc";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(record.id, 256, 32);
  ctx.font = "18px sans-serif";
  ctx.fillText(
    `${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)}m · ${record.triangles} triangles`,
    256,
    62,
  );
  const texture = new THREE.CanvasTexture(canvas);
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthTest: false }),
  );
  label.position.set(x, -0.1, z + 4);
  label.scale.set(10, 1.6, 1);
  scene.add(label);
  audits.push({
    ...record,
    worldBounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
    materials: new Set(gltf.scene.children.map((o) => o.name)).size,
  });
}
renderer.render(scene, camera);
Object.assign(window, { environmentAudit: audits, environmentReady: true });
