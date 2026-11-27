import * as THREE from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { loadedModel, preloadModels } from "../assets/models";
export function preloadBoat(): Promise<void> {
  return preloadModels(["vessel"]);
}
/** Local deck positions measured by downward rays on the actual caique GLB. */
export const BOAT_SEATS = {
  rowan: { x: -0.376, y: 0.762, z: 2.272 },
  mira: { x: 0.376, y: 0.762, z: 2.272 },
} as const;

/** Licensed Polyfork caique; the existing independent controller hull stays unchanged. */
export function createBoat(scene: THREE.Scene) {
  const root = new THREE.Group();
  root.name = "rowan-caique";
  const body = new THREE.Group();
  root.add(body);
  const source = loadedModel("vessel");
  const model = clone(source.scene);
  model.name = "licensed-caique-fishing-boat";
  // Source bow is +Z. 0.94 scale and -0.36 Z offset fit the existing [-4,+3.1]m hull.
  model.scale.setScalar(0.94);
  model.rotation.y = Math.PI;
  model.position.z = -0.36;
  model.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  body.add(model);
  const mixer = new THREE.AnimationMixer(model);
  const tick = source.animations.find((c) => c.name === "tick");
  if (tick) mixer.clipAction(tick).play();
  const wakeGeometry = new THREE.CircleGeometry(1, 16);
  const wakeMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uStrength: { value: 0 } },
    transparent: true,
    depthWrite: false,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uTime;uniform float uStrength;varying vec2 vUv;void main(){vec2 p=vUv*2.-1.;float r=length(p);float irregular=.78+.22*sin(p.x*17.+p.y*13.+uTime*2.);float alpha=(1.-smoothstep(.2,.95,r))*uStrength*irregular;gl_FragColor=vec4(.79,.93,.88,alpha);}`,
  });
  const wake = new THREE.InstancedMesh(wakeGeometry, wakeMaterial, 24);
  wake.name = "soft-circular-foam-wake";
  wake.frustumCulled = false;
  root.add(wake);
  const matrix = new THREE.Matrix4(),
    position = new THREE.Vector3(),
    scale = new THREE.Vector3();
  const rotation = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(-Math.PI / 2, 0, 0),
  );
  scene.add(root);
  return {
    root,
    seats: BOAT_SEATS,
    update(dt: number, time: number, speed: number) {
      mixer.update(Math.min(Math.max(dt, 0), 0.1));
      body.rotation.z = Math.sin(time * 1.5) * 0.012;
      body.rotation.x = Math.sin(time * 1.1) * 0.009;
      body.position.y = Math.sin(time * 1.8) * 0.018;
      wakeMaterial.uniforms.uTime.value = time;
      wakeMaterial.uniforms.uStrength.value = Math.min(
        0.55,
        Math.abs(speed) / 16,
      );
      for (let i = 0; i < 24; i++) {
        const row = Math.floor(i / 2),
          side = i % 2 === 0 ? -1 : 1;
        position.set(
          side * (0.7 + row * 0.1) + Math.sin(time * 1.5 + i) * 0.04,
          0.035 + Math.sin(time + i) * 0.012,
          2.7 + row * 0.38,
        );
        scale.set(0.28 + row * 0.045, 0.45 + row * 0.025, 1);
        matrix.compose(position, rotation, scale);
        wake.setMatrixAt(i, matrix);
      }
      wake.instanceMatrix.needsUpdate = true;
    },
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      root.removeFromParent();
      wakeGeometry.dispose();
      wakeMaterial.dispose();
    },
  };
}
