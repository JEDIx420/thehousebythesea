import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import environmentAssets from "./environment-assets.json" with { type: "json" };
import { addTerrain } from "./terrain";
import { addWater } from "./water";
import { groundHeight, seaFloorHeight, ISLANDS, PIER } from "./surface";
export { groundHeight, seaFloorHeight, ISLANDS } from "./surface";
export interface World {
  groundHeight(x: number, z: number): number | null;
  seaFloorHeight(x: number, z: number): number;
  blocked(x: number, z: number): boolean;
  update(dt: number, time: number): void;
  dispose(): void;
  warnings: string[];
}
export async function createWorld(scene: THREE.Scene): Promise<World> {
  const root = new THREE.Group();
  root.name = "first-voyage-mediterranean";
  scene.add(root);
  addTerrain(root);
  const water = addWater(root);
  const loader = new GLTFLoader(),
    base = (import.meta as ImportMeta & { env: { BASE_URL: string } }).env
      .BASE_URL;
  const warnings: string[] = [];
  function releaseLateModel(scene: THREE.Object3D) {
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>(),
      textures = new Set<THREE.Texture>();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          materials.add(material);
          for (const value of Object.values(material))
            if (value instanceof THREE.Texture) textures.add(value);
        }
      }
    });
    textures.forEach((texture) => texture.dispose());
    materials.forEach((material) => material.dispose());
    geometries.forEach((geometry) => geometry.dispose());
  }
  async function load(record: (typeof environmentAssets)[number]) {
    const controller = new AbortController();
    let expired = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const gltf = await Promise.race([
        (async () => {
          const response = await fetch(`${base}${record.file}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const bytes = await response.arrayBuffer();
          const parsed = await loader.parseAsync(
            bytes,
            `${base}assets/models/`,
          );
          if (expired) {
            releaseLateModel(parsed.scene);
            throw new Error("Coastal parse completed after its deadline.");
          }
          return parsed;
        })(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            expired = true;
            controller.abort();
            reject(new Error("10 second asset deadline"));
          }, 10_000);
        }),
      ]);
      return { id: record.id, gltf };
    } catch {
      warnings.push(`${record.credit} could not load; reload to retry.`);
      throw new Error(`Optional coastal model ${record.id} was unavailable.`);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  const entries = await Promise.allSettled(environmentAssets.map(load));
  const models = new Map<string, THREE.Group>();
  for (const entry of entries)
    if (entry.status === "fulfilled")
      models.set(entry.value.id, entry.value.gltf.scene);
  if (!models.has("boardwalk-deck"))
    throw new Error(
      "The harbour models could not load. Please reload to retry; your save is safe.",
    );
  const staticMeshes: THREE.Mesh[] = [];
  const deckMeshes: THREE.Mesh[] = [];
  const deckRay = new THREE.Raycaster();
  const colliders: THREE.Box3[] = [];
  const fallback: Record<string, string> = {
    boathouse: "boat-shed",
    "boat-shed": "boathouse",
    "village-shopfront": "harbourmaster-hut",
    kafeneio: "village-shopfront",
  };
  function prop(
    id: string,
    x: number,
    z: number,
    options: {
      scale?: number | THREE.Vector3;
      rotation?: number;
      y?: number;
      solid?: boolean;
      batch?: boolean;
      followTerrain?: boolean;
    } = {},
  ) {
    const model = models.get(id) ?? models.get(fallback[id] ?? "");
    if (!model) return null;
    const object = model.clone(true);
    object.name = `prop-${id}`;
    object.position.set(x, options.y ?? groundHeight(x, z) ?? 0, z);
    object.rotation.y = options.rotation ?? 0;
    if (typeof options.scale === "number")
      object.scale.setScalar(options.scale);
    else if (options.scale) object.scale.copy(options.scale);
    root.add(object);
    object.updateWorldMatrix(true, true);
    if (options.followTerrain) {
      const bounds = new THREE.Box3().setFromObject(object),
        floor = bounds.min.y;
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const geometry = child.geometry.clone(),
            position = geometry.getAttribute("position"),
            point = new THREE.Vector3(),
            inverse = child.matrixWorld.clone().invert();
          for (let v = 0; v < position.count; v++) {
            point
              .fromBufferAttribute(position, v)
              .applyMatrix4(child.matrixWorld);
            const relief = point.y - floor;
            point.y =
              (groundHeight(point.x, point.z) ?? point.y) + relief - 0.035;
            point.applyMatrix4(inverse);
            position.setXYZ(v, point.x, point.y, point.z);
          }
          geometry.computeVertexNormals();
          child.geometry = geometry;
        }
      });
    }
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (options.batch !== false) staticMeshes.push(child);
        if (id === "boardwalk-deck" || id === "pier-head")
          deckMeshes.push(child);
      }
    });
    if (options.solid) {
      const bounds = new THREE.Box3().setFromObject(object);
      bounds.expandByScalar(0.38);
      colliders.push(bounds);
    }
    return object;
  }
  // V0 harbour composition: three useful buildings frame an open path, rather than filling it.
  for (const [i, island] of ISLANDS.entries()) {
    const z = island.z;
    // Four real boardwalk modules, stretched in XZ only; audited deck plane is localY1.2.
    // Their union is exactly x43..58,z±3.7; 1.2+.48 gives the shared1.68m walk surface.
    for (let k = 0; k < 4; k++)
      prop("boardwalk-deck", PIER.minX + 1.875 + k * 3.75, z, {
        scale: new THREE.Vector3(0.9375, 1, 1.85),
        y: PIER.top - 1.2,
      });
    for (const side of [-1, 1]) {
      for (const x of [45, 50, 55])
        prop("mooring-bollard", x, z + side * 3.1, { scale: 0.8, y: PIER.top });
      prop("lifebuoy-post", 46, z + side * 3, {
        scale: 0.8,
        y: PIER.top,
        rotation: (side * Math.PI) / 2,
      });
    }
    // A short stone quay makes the beach-to-wood junction legible without enclosing the bay.
    for (const dz of [-7, -3, 3, 7])
      prop("harbour-quay", 41.1, z + dz, {
        rotation: Math.PI / 2,
        y: 0.42,
        scale: new THREE.Vector3(1, 0.95, 0.7),
      });
    prop("wayfinding-post", 43.3, z - 5.4, {
      rotation: Math.PI / 2,
      scale: 0.8,
    });
    if (i === 0) {
      prop("boathouse", 21, z - 12, {
        rotation: Math.PI / 2,
        scale: 1.2,
        solid: true,
      });
      prop("village-shopfront", 24, z + 12, {
        rotation: Math.PI / 2,
        scale: 1.2,
        solid: true,
      });
      prop("kafeneio", 11, z - 26, {
        rotation: Math.PI / 2,
        scale: 1.15,
        solid: true,
      });
      prop("harbourmaster-hut", 35, z + 7, {
        rotation: Math.PI / 2,
        scale: 1,
        solid: true,
      });
      prop("bougainvillea", 27, z + 12, { rotation: Math.PI / 2, scale: 1.2 });
      for (const [x, dz, r] of [
        [17, -21, 0.4],
        [21, -18, -0.4],
        [25, -21, 0.2],
      ])
        prop("taverna-table-set", x, z + dz, { rotation: r, scale: 1.3 });
      prop("boat-shed", 6, z + 18, {
        rotation: Math.PI / 2,
        scale: 1.15,
        solid: true,
      });
    } else {
      prop("harbourmaster-hut", 28, z + 14, {
        rotation: Math.PI / 2,
        scale: 1.1,
        solid: true,
      });
      prop("boat-shed", 15, z - 8, {
        rotation: Math.PI / 2,
        scale: 1.05,
        solid: true,
      });
      prop("boathouse", 8, z + 19, { rotation: 0.8, scale: 1.1, solid: true });
      prop("fishing-net", 37, z + 11, { rotation: 0.6, scale: 1.5 });
      prop("rock-armour", -28, z - 30, { scale: 2.3, rotation: 0.8 });
      prop("rock-armour", -34, z - 25, { scale: 2, rotation: 1.2 });
    }
    // Real paving stones are inset so their top, not their origin, meets ground.
    for (let dz = -26; dz <= 22; dz += 4)
      prop("lane-paving", 32, z + dz, {
        y: (groundHeight(32, z + dz) ?? 2) - 0.05,
        scale: new THREE.Vector3(1, 0.8, 0.98),
        followTerrain: true,
      });
    for (let x = 36; x <= 40; x += 4)
      prop("lane-paving", x, z, {
        y: (groundHeight(x, z) ?? 1.6) - 0.05,
        followTerrain: true,
      });
    for (const dz of [-19, 3, 22])
      prop("harbour-lamp", 38, z + dz, { scale: 1 });
    for (const [x, dz, r] of [
      [41, 10, 0.8],
      [39, 11, -0.3],
      [39, -7, 0.2],
    ]) {
      prop("fish-crate", x, z + dz, { scale: 2.2, rotation: r });
      prop("fishing-net", x - 1.5, z + dz + 1.1, { rotation: r });
    }
    prop("painted-rowboat", 49, z + 13, {
      y: -0.08,
      rotation: -0.25,
      batch: false,
    });
    prop("rowing-dinghy", 52, z - 15, { y: -0.2, rotation: 0.2, batch: false });
    // Authored groves keep paths open and frame, rather than cover, harbour silhouettes.
    for (let t = 0; t < 28; t++) {
      const a = t * 2.399963 + i * 0.4,
        r = 13 + (t % 5) * 6.5,
        x = Math.cos(a) * r - 10,
        dz = Math.sin(a) * r;
      if (x > 12 && Math.abs(dz) < 35) continue;
      if (Math.hypot(x + 0, z + dz - (i ? -243 : -31)) < 10) continue;
      const h = groundHeight(x, z + dz);
      if (h === null || h < 1.5) continue;
      prop(t % 5 === 0 ? "pencil-cypress" : "olive-tree", x, z + dz, {
        scale: 0.9 + (t % 4) * 0.13,
        rotation: a,
      });
    }
    for (const [x, dz] of [
      [24, 24],
      [28, -17],
      [8, -38],
      [20, 31],
      [-21, -23],
      [-30, 13],
    ])
      prop("pencil-cypress", x, z + dz, { scale: 0.85 });
    for (let t = 0; t < 35; t++) {
      const a = t * 0.71,
        r = 44 + (t % 3) * 1.5,
        x = Math.cos(a) * r,
        dz = Math.sin(a) * r;
      if (x > 31 && Math.abs(dz) < 13) continue;
      const h = groundHeight(x, z + dz);
      if (h === null || (h > 0.9 && h > 2.7)) continue;
      prop(t % 4 === 0 ? "tamarisk-bush" : "dune-grass", x, z + dz, {
        scale: 0.65 + (t % 3) * 0.2,
        rotation: a,
      });
    }
    prop("flowering-agave", 22, z + 31, { scale: 1.1 });
  }
  // A natural stone arch remains the second island's unique walkable destination.
  const archY = groundHeight(23, -243) ?? 2;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.2, 0, 0),
    new THREE.Vector3(-3.1, 3.7, 0.2),
    new THREE.Vector3(-1.5, 5.4, 0),
    new THREE.Vector3(1.5, 5.3, -0.3),
    new THREE.Vector3(3.1, 3.7, -0.1),
    new THREE.Vector3(3.2, 0, 0),
  ]);
  const arch = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 25, 0.95, 7, false),
    new THREE.MeshStandardMaterial({
      color: "#919486",
      roughness: 1,
      flatShading: true,
    }),
  );
  arch.position.set(23, archY, -243);
  arch.castShadow = true;
  arch.receiveShadow = true;
  root.add(arch);
  prop("rock-pool", 21, -246, { scale: 2 });
  prop("rock-pool", 27, -245, { scale: 1.7 });
  prop("shaded-bench", 27, -27, { rotation: Math.PI / 2, scale: 1 });
  prop("wayfinding-post", 25, -31, { rotation: Math.PI / 2, scale: 0.7 });
  prop("dune-grass", 25, -25, { scale: 0.65 });
  prop("flowering-agave", 29, -28, { scale: 0.5 });
  addPlotNotice();
  function addPlotNotice() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#ead9b1";
    context.fillRect(0, 0, 512, 320);
    context.strokeStyle = "#8c784f";
    context.lineWidth = 10;
    context.strokeRect(10, 10, 492, 300);
    context.fillStyle = "#35574c";
    context.textAlign = "center";
    context.font = "bold 44px Georgia";
    context.fillText("A little place", 256, 73);
    context.fillText("by the sea", 256, 128);
    context.font = "30px Georgia";
    context.fillText("Beach plot", 256, 208);
    context.font = "26px Georgia";
    context.fillText("Enquiries at harbour", 256, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const notice = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.8),
      new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
    );
    notice.name = "home-plot-notice";
    notice.position.set(24.6, (groundHeight(25, -31) ?? 2) + 1.5, -31);
    notice.rotation.y = -Math.PI / 2;
    root.add(notice);
  }
  // Merge only static imported meshes sharing the same authored material and island.
  root.updateWorldMatrix(true, true);
  const batches = new Map<
    THREE.Material,
    Map<number, THREE.BufferGeometry[]>
  >();
  for (const mesh of staticMeshes) {
    if (Array.isArray(mesh.material)) continue;
    const island = mesh.matrixWorld.elements[14]! < -110 ? 1 : 0;
    let entries = batches.get(mesh.material);
    if (!entries) {
      entries = new Map();
      batches.set(mesh.material, entries);
    }
    let geometries = entries.get(island);
    if (!geometries) {
      geometries = [];
      entries.set(island, geometries);
    }
    const geometry = mesh.geometry.index
      ? mesh.geometry.toNonIndexed()
      : mesh.geometry.clone();
    for (const attribute of Object.keys(geometry.attributes))
      if (!["position", "normal", "color"].includes(attribute))
        geometry.deleteAttribute(attribute);
    const originalColor = geometry.getAttribute("color");
    const rgb = new Float32Array(geometry.getAttribute("position").count * 3);
    for (let v = 0; v < rgb.length / 3; v++) {
      rgb[v * 3] = originalColor?.getX(v) ?? 1;
      rgb[v * 3 + 1] = originalColor?.getY(v) ?? 1;
      rgb[v * 3 + 2] = originalColor?.getZ(v) ?? 1;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(rgb, 3));
    geometry.applyMatrix4(mesh.matrixWorld);
    geometries.push(geometry);
  }
  for (const [material, islands] of batches)
    for (const geometries of islands.values()) {
      const geometry = mergeGeometries(geometries, false);
      if (!geometry)
        throw new Error("A coastal prop batch could not be prepared.");
      geometry.computeBoundingSphere();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = "merged-coastal-models";
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);
      geometries.forEach((g) => g.dispose());
    }
  for (const mesh of staticMeshes)
    if (!Array.isArray(mesh.material)) mesh.removeFromParent();
  let disposed = false;
  function actualGroundHeight(x: number, z: number): number | null {
    for (const island of ISLANDS)
      if (
        x >= PIER.minX &&
        x <= PIER.maxX &&
        Math.abs(z - island.z) <= PIER.halfWidth
      ) {
        // Imported planks have centimetric bevels. Query their exact rendered triangles,
        // not a second idealised plane. Retained mesh matrices are the pre-batch world transforms.
        deckRay.set(
          new THREE.Vector3(x, PIER.top + 0.16, z),
          new THREE.Vector3(0, -1, 0),
        );
        const hit = deckRay.intersectObjects(deckMeshes, false)[0];
        if (hit && hit.point.y > 1.4) return hit.point.y;
      }
    return groundHeight(x, z);
  }
  return {
    groundHeight: actualGroundHeight,
    seaFloorHeight,
    warnings,
    blocked(x, z) {
      return colliders.some(
        (box) =>
          x > box.min.x && x < box.max.x && z > box.min.z && z < box.max.z,
      );
    },
    update(_dt, time) {
      water.update(time);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.removeFromParent();
      water.dispose();
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      root.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          geometries.add(o.geometry);
          for (const material of Array.isArray(o.material)
            ? o.material
            : [o.material])
            materials.add(material);
        }
      });
      for (const mesh of staticMeshes) geometries.add(mesh.geometry);
      for (const template of models.values())
        template.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            geometries.add(o.geometry);
            for (const m of Array.isArray(o.material)
              ? o.material
              : [o.material])
              materials.add(m);
          }
        });
      for (const g of geometries) g.dispose();
      for (const m of materials) {
        const map = (m as THREE.MeshStandardMaterial).map;
        map?.dispose();
        m.dispose();
      }
    },
  };
}
