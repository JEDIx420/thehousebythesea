import * as THREE from "three";
/** A local, original rod/line/float display; catch state remains in the domain. */
export function createFishingView(scene: THREE.Scene) {
  const root = new THREE.Group();
  scene.add(root);
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xfff5cc });
  const line = new THREE.Line(geometry, lineMaterial);
  root.add(line);
  const floatGeometry = new THREE.SphereGeometry(0.2, 8, 6);
  const floatMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8794b,
    emissive: 0x6e2511,
    roughness: 0.5,
  });
  const bobber = new THREE.Mesh(floatGeometry, floatMaterial);
  root.add(bobber);
  root.visible = false;
  return {
    update(
      active: boolean,
      x: number,
      y: number,
      z: number,
      time: number,
      bite: boolean,
    ) {
      root.visible = active;
      if (!active) return;
      const fx = x + 6,
        fz = z - 6,
        fy = 0.35 + Math.sin(time * (bite ? 17 : 2)) * (bite ? 0.23 : 0.07);
      bobber.position.set(fx, fy, fz);
      geometry.setFromPoints([
        new THREE.Vector3(x, y + 1.2, z),
        new THREE.Vector3(x + 2, y + 2, z - 2),
        new THREE.Vector3(fx, fy, fz),
      ]);
      geometry.computeBoundingSphere();
    },
    dispose() {
      root.removeFromParent();
      geometry.dispose();
      lineMaterial.dispose();
      floatGeometry.dispose();
      floatMaterial.dispose();
    },
  };
}
