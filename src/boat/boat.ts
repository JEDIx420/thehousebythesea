import * as THREE from "three";

/** Original small wooden sailboat, bow towards -Z. Root Y is the water line. */
export function createBoat(scene: THREE.Scene) {
  const root = new THREE.Group(),
    body = new THREE.Group();
  root.add(body);
  const geos: THREE.BufferGeometry[] = [],
    mats: THREE.Material[] = [];
  const material = (color: number) => {
    const m = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    mats.push(m);
    return m;
  };
  const timber = material(0x805439),
    deck = material(0xc49a62),
    teal = material(0x235b61),
    cream = material(0xf8ebc8),
    rope = material(0x5d5142);
  const mesh = (
    g: THREE.BufferGeometry,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = body,
  ) => {
    geos.push(g);
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  const shape = new THREE.Shape();
  shape.moveTo(0, -3.7);
  shape.lineTo(1.25, -1.7);
  shape.lineTo(1.35, 1.6);
  shape.lineTo(0.95, 2.8);
  shape.lineTo(-0.95, 2.8);
  shape.lineTo(-1.35, 1.6);
  shape.lineTo(-1.25, -1.7);
  shape.closePath();
  const hullGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.7,
    bevelEnabled: true,
    bevelThickness: 0.28,
    bevelSize: 0.23,
    bevelSegments: 1,
  });
  hullGeo.rotateX(Math.PI / 2);
  mesh(hullGeo, teal, 0, 0.68, 0);
  const deckGeo = new THREE.ShapeGeometry(shape);
  deckGeo.rotateX(Math.PI / 2);
  mesh(deckGeo, deck, 0, 0.72, 0);
  for (const z of [-1.5, 0.4, 1.9])
    mesh(new THREE.BoxGeometry(2.1, 0.18, 0.38), timber, 0, 0.98, z);
  mesh(new THREE.CylinderGeometry(0.075, 0.11, 6.8, 8), timber, 0, 3.85, -0.8);
  const boom = mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 3.25, 7),
    timber,
    0,
    1.65,
    0.65,
  );
  boom.rotation.x = Math.PI / 2;
  const sailGeo = new THREE.BufferGeometry();
  sailGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        0.09, 6.9, -0.8, 0.1, 1.8, -0.8, 0.27, 1.8, 2.35, 0.09, 6.9, -0.8, 0.27,
        1.8, 2.35, 0.43, 3.5, 0.95,
      ],
      3,
    ),
  );
  sailGeo.computeVertexNormals();
  const sail = mesh(sailGeo, cream, 0, 0, 0);
  const line = mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 7.1, 5),
    rope,
    0,
    3.9,
    0.55,
  );
  line.rotation.x = -0.4;
  mesh(new THREE.BoxGeometry(0.68, 0.62, 0.75), timber, 0.55, 1.1, 1.6);
  mesh(
    new THREE.TorusGeometry(0.48, 0.12, 6, 12),
    cream,
    -1.3,
    0.85,
    0.8,
  ).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.65, 7), teal, -0.65, 1.25, 1.7);
  const wakeMat = new THREE.MeshBasicMaterial({
    color: 0xe1fbef,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  mats.push(wakeMat);
  const wakes: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const o = mesh(
      new THREE.PlaneGeometry(0.18 + i * 0.16, 1.2),
      wakeMat,
      (i % 2 === 0 ? -1 : 1) * (1 + i * 0.21),
      0.04,
      3 + i * 0.7,
      root,
    );
    o.rotation.x = -Math.PI / 2;
    o.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.35;
    wakes.push(o);
  }
  scene.add(root);
  return {
    root,
    update(dt: number, time: number, speed: number) {
      void dt;
      body.rotation.z = Math.sin(time * 1.5) * 0.025;
      body.rotation.x = Math.sin(time * 1.1) * 0.018;
      body.position.y = Math.sin(time * 1.8) * 0.045;
      sail.rotation.z = Math.sin(time * 1.6) * 0.014;
      wakeMat.opacity = Math.min(0.65, Math.abs(speed) / 12);
      wakes.forEach((w, i) => {
        w.scale.y = 0.85 + Math.sin(time * 5 + i) * 0.15;
      });
    },
    dispose() {
      root.removeFromParent();
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}
