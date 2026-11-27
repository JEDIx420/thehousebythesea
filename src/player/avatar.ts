import * as THREE from "three";

/** Original articulated low-poly character. Facing north (-Z), feet at root Y. */
export function createAvatar(
  scene: THREE.Scene,
  palette: {
    shirt?: number;
    trousers?: number;
    skin?: number;
    hair?: number;
  } = {},
) {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const mat = (color: number) => {
    const m = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.88,
      flatShading: true,
    });
    materials.push(m);
    return m;
  };
  const skin = mat(palette.skin ?? 0xd69a71),
    shirt = mat(palette.shirt ?? 0xf2e4c6),
    pants = mat(palette.trousers ?? 0x294c5b),
    hair = mat(palette.hair ?? 0x433124),
    boots = mat(0x544235);
  function box(
    w: number,
    h: number,
    d: number,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = root,
  ) {
    const g = new THREE.BoxGeometry(w, h, d);
    geometries.push(g);
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    parent.add(o);
    return o;
  }
  box(0.63, 0.68, 0.36, shirt, 0, 1.12, 0);
  box(0.54, 0.16, 0.34, pants, 0, 0.77, 0);
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.7;
  root.add(headGroup);
  const headGeo = new THREE.IcosahedronGeometry(0.245, 1);
  geometries.push(headGeo);
  const head = new THREE.Mesh(headGeo, skin);
  head.scale.set(1, 1.17, 0.93);
  head.castShadow = true;
  headGroup.add(head);
  box(0.42, 0.16, 0.38, hair, 0, 0.18, 0.025, headGroup);
  box(0.12, 0.2, 0.34, hair, -0.18, 0.07, 0.04, headGroup);
  box(0.065, 0.045, 0.035, hair, -0.08, 0.015, -0.22, headGroup);
  box(0.065, 0.045, 0.035, hair, 0.08, 0.015, -0.22, headGroup);
  const limbs: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.4, 1.37, 0);
    root.add(arm);
    limbs.push(arm);
    box(0.2, 0.35, 0.26, shirt, 0, -0.14, 0, arm);
    box(0.15, 0.32, 0.18, skin, 0, -0.46, 0, arm);
    const leg = new THREE.Group();
    leg.position.set(side * 0.16, 0.75, 0);
    root.add(leg);
    limbs.push(leg);
    box(0.23, 0.59, 0.26, pants, 0, -0.27, 0, leg);
    box(0.25, 0.17, 0.4, boots, 0, -0.67, -0.065, leg);
  }
  // Shoulder bag and strap make the silhouette readable at the follow-camera scale.
  box(0.18, 0.78, 0.05, mat(0x92714b), -0.15, 1.12, -0.2);
  box(0.25, 0.34, 0.38, mat(0x987347), 0.39, 0.77, 0.06);
  scene.add(root);
  return {
    root,
    update(dt: number, time: number, moving: boolean) {
      void dt;
      const stride = moving
        ? Math.sin(time * 9) * 0.55
        : Math.sin(time * 1.8) * 0.035;
      limbs[0].rotation.x = stride;
      limbs[1].rotation.x = -stride;
      limbs[2].rotation.x = -stride;
      limbs[3].rotation.x = stride;
      headGroup.rotation.y = Math.sin(time * 0.7) * 0.055;
    },
    dispose() {
      root.removeFromParent();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
