import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  ISLANDS,
  heightfields,
  groundHeight,
  TERRAIN_SEGMENTS,
  TERRAIN_STEP,
} from "./surface";
export { groundHeight, ISLANDS } from "./surface";
export interface World {
  groundHeight(x: number, z: number): number | null;
  blocked(x: number, z: number): boolean;
  update(dt: number, time: number): void;
  dispose(): void;
}
const COLORS = {
  sand: 0xe4c99a,
  grass: 0x79945d,
  wood: 0x96674c,
  trunk: 0x71543e,
  leaf: 0x3e6d4c,
  roof: 0xb7654f,
};
export async function createWorld(scene: THREE.Scene): Promise<World> {
  const group = new THREE.Group();
  group.name = "authored-first-voyage";
  scene.add(group);
  const colliders: { x: number; z: number; w: number; d: number }[] = [];
  const materialCache = new Map<number, THREE.MeshStandardMaterial>();
  const originalStaticMeshes: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] = [];
  function material(color: number) {
    let m = materialCache.get(color);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.94,
        flatShading: true,
      });
      materialCache.set(color, m);
    }
    return m;
  }
  function mesh(
    g: THREE.BufferGeometry,
    color: number,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = group,
  ) {
    const m = new THREE.Mesh(g, material(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    originalStaticMeshes.push(m);
    return m;
  }
  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: number,
    parent: THREE.Object3D = group,
  ) {
    return mesh(new THREE.BoxGeometry(w, h, d), color, x, y, z, parent);
  }
  function tree(x: number, z: number, scale: number, palm = false) {
    const y = groundHeight(x, z);
    if (y === null) return;
    const t = new THREE.Group();
    t.position.set(x, y, z);
    t.scale.setScalar(scale);
    group.add(t);
    mesh(
      new THREE.CylinderGeometry(0.22, 0.4, 4.8, 6),
      COLORS.trunk,
      0,
      2.4,
      0,
      t,
    );
    if (palm) {
      for (let j = 0; j < 7; j++) {
        const a = (j * Math.PI * 2) / 7;
        const f = mesh(
          new THREE.ConeGeometry(1, 5.8, 4),
          0x477e56,
          Math.cos(a) * 1.7,
          5,
          Math.sin(a) * 1.7,
          t,
        );
        f.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1);
      }
    } else {
      mesh(new THREE.IcosahedronGeometry(2.2, 1), COLORS.leaf, 0, 5, 0, t);
      mesh(new THREE.IcosahedronGeometry(1.7, 0), 0x64834e, 1, 6.1, 0, t);
    }
  }
  const loader = new GLTFLoader();
  const base = (import.meta as ImportMeta & { env: { BASE_URL: string } }).env
    .BASE_URL;
  const loaded = await Promise.allSettled(
    ["beach-hut", "seafront-lamp", "promenade-bench"].map((id) =>
      loader.loadAsync(`${base}assets/models/${id}.glb`),
    ),
  );
  function prop(index: number, x: number, z: number, scale = 1, rot = 0) {
    const item = loaded[index];
    if (item?.status !== "fulfilled") return;
    const object = item.value.scene.clone(true);
    object.position.set(x, groundHeight(x, z) ?? 1.6, z);
    object.scale.setScalar(scale);
    object.rotation.y = rot;
    object.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    group.add(object);
    if (index === 0) {
      // Use the actual transformed GLB envelope, including instance scale and rotation.
      object.updateWorldMatrix(true, true);
      const bounds = new THREE.Box3().setFromObject(object);
      colliders.push({
        x: (bounds.min.x + bounds.max.x) / 2,
        z: (bounds.min.z + bounds.max.z) / 2,
        w: bounds.max.x - bounds.min.x + 0.8,
        d: bounds.max.z - bounds.min.z + 0.8,
      });
    }
  }
  function house(x: number, z: number, color: number, rotation = 0) {
    const y = groundHeight(x, z) ?? 1.6;
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotation;
    group.add(g);
    box(0, 2.1, 0, 8, 4.2, 6, color, g);
    const roof = mesh(
      new THREE.CylinderGeometry(0, 6.1, 3.1, 4),
      COLORS.roof,
      0,
      5.4,
      0,
      g,
    );
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = 0.8;
    for (const dx of [-2.3, 2.3]) {
      box(dx, 2.5, 3.02, 1.35, 1.5, 0.12, 0x374f57, g);
      box(dx, 2.5, 3.1, 0.1, 1.5, 0.15, 0xf1dbb4, g);
    }
    box(0, 1.3, 3.05, 1.4, 2.6, 0.18, 0x6a7a70, g);
    box(3, 5.8, -1.4, 1, 3, 1, 0xd7b3a0, g);
    colliders.push({ x, z, w: 8.8, d: 6.8 });
  }
  function label(text: string, x: number, z: number) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#f4e7c9";
    c.fillRect(0, 0, 512, 128);
    c.fillStyle = "#3d594d";
    c.font = "bold 38px Georgia";
    c.textAlign = "center";
    c.fillText(text, 256, 78);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.4), mat);
    sign.position.set(x, (groundHeight(x, z) ?? 1.6) + 2.8, z);
    sign.rotation.y = Math.PI / 2;
    group.add(sign);
    box(x, 1.7, z, 0.15, 3.4, 0.15, COLORS.wood);
  }
  ISLANDS.forEach((island, i) => {
    const geometry = new THREE.BufferGeometry(),
      positions: number[] = [],
      colors: number[] = [],
      indices: number[] = [];
    const n = TERRAIN_SEGMENTS + 1;
    for (let iz = 0; iz < n; iz++)
      for (let ix = 0; ix < n; ix++) {
        const x = ix * TERRAIN_STEP - 60,
          z = iz * TERRAIN_STEP - 60,
          y = heightfields[i]![iz * n + ix]!;
        positions.push(x, y, z);
        const c = new THREE.Color(
          y < 1.8 ? COLORS.sand : y > 6 ? 0x6b8151 : COLORS.grass,
        );
        c.multiplyScalar(0.96 + Math.sin(ix * 17 + iz * 31) * 0.035);
        colors.push(c.r, c.g, c.b);
      }
    for (let iz = 0; iz < TERRAIN_SEGMENTS; iz++)
      for (let ix = 0; ix < TERRAIN_SEGMENTS; ix++) {
        const a = iz * n + ix,
          b = a + 1,
          c = a + n,
          d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
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
        flatShading: true,
      }),
    );
    land.position.set(island.x, 0, island.z);
    land.receiveShadow = true;
    group.add(land);
    // Pier planks run continuously over the sculpted terrain ramp, exact 1.68m walk surface.
    for (let k = 0; k < 24; k++)
      box(
        43 + k * 0.63,
        1.46,
        island.z,
        0.59,
        0.44,
        7.4,
        k % 3 ? 0xa47c58 : 0xb79168,
      );
    for (const x of [45, 52, 57])
      for (const dz of [-3.3, 3.3]) {
        mesh(
          new THREE.CylinderGeometry(0.2, 0.25, 4.1, 7),
          COLORS.wood,
          x,
          0.2,
          island.z + dz,
        );
        box(x, 2, island.z + dz, 0.55, 0.2, 0.55, 0xd1b593);
      }
    // Paved village path, follows the same heightfield at each stone.
    for (let k = -24; k <= 24; k += 2)
      for (let j = 0; j < 2; j++) {
        const x = 31 + j * 1.8,
          z = island.z + k;
        const y = groundHeight(x, z);
        if (y !== null) {
          const p = mesh(
            new THREE.CylinderGeometry(1, 1, 0.08, 6),
            k % 4 ? 0xc9bba0 : 0xb8b69c,
            x,
            y + 0.025,
            z,
          );
          p.rotation.y = k;
        }
      }
    for (let k = 35; k < 45; k += 2)
      box(k, 1.62, island.z, 1.7, 0.05, 3.5, 0xcdbb98);
    if (i === 0) {
      house(21, -12, 0xe3bf92);
      house(18, 13, 0xe3cfad);
      house(5, 25, 0xcb9b7e);
      house(-7, 3, 0xe6d4b6);
      prop(0, 23, 27, 1.2, Math.PI / 2);
      prop(2, 37, -16, 1, Math.PI / 2);
      prop(2, 31, 19, 1, Math.PI / 2);
      label("HAVENPORT", 45, -5);
    } else {
      house(19, island.z - 14, 0xadc5bb);
      prop(0, 27, island.z + 17, 1.4, Math.PI / 2);
      house(-6, island.z + 7, 0xddd1ac);
      label("SALTGLASS BAY", 45, island.z - 5);
      for (let j = 0; j < 6; j++) {
        const a = (j * Math.PI) / 3;
        mesh(
          new THREE.IcosahedronGeometry(2.5, 0),
          0x858e86,
          -17 + Math.cos(a) * 4,
          groundHeight(
            -17 + Math.cos(a) * 4,
            island.z - 24 + Math.sin(a) * 4,
          ) ?? 2,
          island.z - 24 + Math.sin(a) * 4,
        );
      }
    }
    for (const dz of [-21, 11, 25]) prop(1, 39, island.z + dz, 0.85);
    for (let t = 0; t < 45; t++) {
      const a = t * 2.399963 + 0.3 * i,
        r = 12 + (t % 7) * 5.5,
        x = Math.cos(a) * r - 6,
        z = island.z + Math.sin(a) * r;
      if (x > 15 && Math.abs(z - island.z) < 32) continue;
      if (Math.hypot(x + 18, z - island.z - 29) < 10) continue;
      tree(x, z, 0.7 + (t % 4) * 0.18, t % 5 === 0);
    }
    for (let r = 0; r < 24; r++) {
      const a = r * 2.39996,
        x = Math.cos(a) * 46,
        z = island.z + Math.sin(a) * 43;
      if (x > 35 && Math.abs(z - island.z) < 9) continue;
      const y = groundHeight(x, z);
      if (y !== null)
        mesh(
          new THREE.IcosahedronGeometry(0.8 + (r % 3) * 0.4, 0),
          0x8c9584,
          x,
          y,
          z,
        );
    }
  });
  // Future plot: an open coastal clearing with a bench, not construction mechanics.
  prop(2, 22, -31, 1, Math.PI / 2);
  label("A little room for tomorrow", 22, -31);
  // Saltglass shell arch: a walkable landmark framing the open sea.
  const archX = 23,
    archZ = -243,
    archY = groundHeight(archX, archZ) ?? 1.6;
  for (const dx of [-3.2, 3.2]) {
    mesh(
      new THREE.DodecahedronGeometry(1.65, 0),
      0xbdbca5,
      archX + dx,
      archY + 1.4,
      archZ,
    );
    mesh(
      new THREE.DodecahedronGeometry(1.45, 0),
      0xcac6ae,
      archX + dx,
      archY + 3.6,
      archZ,
    );
  }
  const archTop = mesh(
    new THREE.TorusGeometry(3.2, 1.2, 5, 9, Math.PI),
    0xd3c9ad,
    archX,
    archY + 3.5,
    archZ,
  );
  archTop.rotation.y = 0;
  label("The shell arch", 27, -242);
  const waterGeometry = new THREE.PlaneGeometry(1200, 1200, 120, 120);
  waterGeometry.rotateX(-Math.PI / 2);
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color("#276e80") },
      uShallow: { value: new THREE.Color("#66b8b3") },
    },
    vertexShader: `uniform float uTime; varying vec3 vWorld; void main(){vec3 p=position;p.y=sin(p.x*.07+uTime*.6)*.12+sin(p.z*.11+uTime*.8)*.09;vWorld=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `uniform float uTime; uniform vec3 uDeep;uniform vec3 uShallow;varying vec3 vWorld;void main(){float ripple=sin(vWorld.x*.43+vWorld.z*.71+uTime)*sin(vWorld.z*.37-uTime*.7);float light=pow(max(0.,ripple),14.);float band=.5+.5*sin(vWorld.z*.017+vWorld.x*.012);vec3 color=mix(uDeep,uShallow,band*.38)+light*.12;gl_FragColor=vec4(color,1.);}`,
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.z = -100;
  water.receiveShadow = true;
  group.add(water);
  // Broken foam rings make shoreline motion readable without covering land with a flat disk.
  const foam: THREE.Mesh[] = [];
  for (const island of ISLANDS)
    for (let j = 0; j < 54; j++) {
      const a = (j * Math.PI * 2) / 54;
      const x = Math.cos(a) * 52,
        z = island.z + Math.sin(a) * 51;
      if (x > 43 && Math.abs(z - island.z) < 8) continue;
      const f = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 0.25),
        new THREE.MeshBasicMaterial({
          color: 0xc8e7d5,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
        }),
      );
      f.rotation.x = -Math.PI / 2;
      f.rotation.z = -a;
      f.position.set(x, 0.25, z);
      group.add(f);
      foam.push(f);
    }
  const birds = new THREE.Group();
  group.add(birds);
  for (let i = 0; i < 8; i++) {
    const b = new THREE.Group();
    const wing = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.8, 0.1, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.8, 0.1, 0),
    ]);
    b.add(
      new THREE.Line(wing, new THREE.LineBasicMaterial({ color: 0xf8edda })),
    );
    birds.add(b);
  }
  // Bake only our original static props; GLTFs, terrain and animated objects stay separate.
  // Partition by island as well as material so distant islands retain useful frustum culling.
  group.updateWorldMatrix(true, true);
  const batches = new Map<THREE.MeshStandardMaterial, Map<number, THREE.BufferGeometry[]>>();
  for (const object of originalStaticMeshes) {
    const island = object.matrixWorld.elements[14]! < -110 ? 1 : 0;
    let islands = batches.get(object.material);
    if (!islands) { islands = new Map(); batches.set(object.material, islands); }
    let geometries = islands.get(island);
    if (!geometries) { geometries = []; islands.set(island, geometries); }
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    geometries.push(geometry);
  }
  for (const [material, islands] of batches) for (const geometries of islands.values()) {
    const merged = mergeGeometries(geometries, false);
    if (!merged) throw new Error("Static world geometry could not be merged.");
    merged.computeBoundingSphere();
    const object = new THREE.Mesh(merged, material);
    object.name = "merged-authored-static-props";
    object.castShadow = true;
    object.receiveShadow = true;
    group.add(object);
    for (const geometry of geometries) geometry.dispose();
  }
  for (const object of originalStaticMeshes) {
    object.removeFromParent();
    object.geometry.dispose();
  }
  originalStaticMeshes.length = 0;
  return {
    groundHeight,
    blocked(x, z) {
      return colliders.some(
        (b) => Math.abs(x - b.x) < b.w / 2 && Math.abs(z - b.z) < b.d / 2,
      );
    },
    update(_dt, time) {
      waterMaterial.uniforms.uTime!.value = time;
      foam.forEach((f, i) => {
        f.position.y = 0.22 + Math.sin(time + i) * 0.04;
        (f.material as THREE.MeshBasicMaterial).opacity =
          0.23 + Math.sin(time * 0.8 + i) * 0.15;
      });
      birds.children.forEach((b, i) => {
        b.position.set(
          Math.sin(time * 0.07 + i) * 65,
          22 + Math.sin(time * 0.5 + i) * 2,
          -70 + Math.cos(time * 0.07 + i) * 100,
        );
        b.rotation.y = -time * 0.07 - i;
      });
    },
    dispose() {
      scene.remove(group);
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      group.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
          geometries.add(o.geometry);
          for (const m of Array.isArray(o.material) ? o.material : [o.material])
            materials.add(m);
        }
      });
      for (const g of geometries) g.dispose();
      for (const m of materials) {
        const mapped = m as THREE.MeshStandardMaterial;
        if (mapped.map) mapped.map.dispose();
        m.dispose();
      }
    },
  };
}
