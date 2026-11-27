import * as THREE from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { loadedModel, preloadModels } from "../assets/models";
export type CharacterRole = "rowan" | "mira" | "ellis" | "seller" | "nessa";
export function preloadCharacters(): Promise<void> {
  return preloadModels(["male", "female", "mira"]);
}

/** Licensed Polyfork heroine and CC0 Quaternius neighbours, with independent real skeletons. */
export function createAvatar(
  scene: THREE.Scene,
  palette: {
    shirt?: number;
    trousers?: number;
    skin?: number;
    hair?: number;
  } = {},
  role: CharacterRole = "rowan",
) {
  const female = role === "mira" || role === "nessa";
  const source = loadedModel(
    role === "mira" ? "mira" : female ? "female" : "male",
  );
  const root = new THREE.Group();
  root.name = `character-${role}`;
  const visual = clone(source.scene);
  visual.name = `licensed-${role === "mira" ? "mira-family-traveller" : female ? "mira-casual" : "rowan-casual"}`;
  const materials = new Set<THREE.Material>();
  const outfits = {
    rowan: {
      shirt: 0x668588,
      trousers: 0x354c59,
      hair: 0x4d3326,
      shoes: 0x5b493a,
    },
    mira: {
      shirt: 0xc88055,
      trousers: 0x655b48,
      hair: 0x633b2e,
      shoes: 0x674733,
    },
    ellis: {
      shirt: 0x3d596c,
      trousers: 0x2f424d,
      hair: 0x8f8a7b,
      shoes: 0x3f3c35,
    },
    seller: {
      shirt: 0xe2ceac,
      trousers: 0x55624b,
      hair: 0x33271f,
      shoes: 0x5c4938,
    },
    nessa: {
      shirt: 0x62877d,
      trousers: 0x4c5f66,
      hair: 0x463326,
      shoes: 0x504336,
    },
  }[role];
  visual.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const repaint = (original: THREE.Material) => {
      const m = original.clone() as THREE.MeshStandardMaterial;
      const n = original.name.toLowerCase();
      if (role === "mira") {
        // Creator-selected heroine: preserve authored face, hair and outfit palette unchanged.
      } else if (n.includes("hair") || n === "eyebrows")
        m.color.setHex(palette.hair ?? outfits.hair);
      else if (n === "white" || (!female && n === "lightbrown"))
        m.color.setHex(palette.shirt ?? outfits.shirt);
      else if ((!female && n === "lightblue") || (female && n === "orange"))
        m.color.setHex(palette.trousers ?? outfits.trousers);
      else if (
        (!female && n === "red_dark") ||
        (female && (n === "grey" || n === "brown"))
      )
        m.color.setHex(outfits.shoes);
      else if (n === "skin" && palette.skin) m.color.setHex(palette.skin);
      m.roughness = 0.92;
      materials.add(m);
      return m;
    };
    object.material = Array.isArray(object.material)
      ? object.material.map(repaint)
      : repaint(object.material);
  });
  root.add(visual);
  // Sources are +Z-forward, feet at y≈0. Use a child turn so the controller remains -Z-forward.
  const bounds = new THREE.Box3().setFromObject(visual);
  const targetHeight =
    role === "mira" ? bounds.max.y - bounds.min.y : female ? 1.72 : 1.79;
  const scale = targetHeight / (bounds.max.y - bounds.min.y);
  visual.scale.setScalar(scale);
  visual.position.y = -bounds.min.y * scale;
  visual.rotation.y = Math.PI;
  scene.add(root);
  const mixer = new THREE.AnimationMixer(visual);
  const greetingName = source.animations.some((clip) => clip.name === "Wave")
    ? "Wave"
    : "Idle";
  const required = [
    "Idle",
    "Walk",
    ...(greetingName === "Wave" ? ["Wave"] : []),
  ];
  const actions = new Map<string, THREE.AnimationAction>();
  for (const name of required) {
    const original = source.animations.find((clip) => clip.name === name);
    if (!original)
      throw new Error(`The ${role} model is missing its ${name} animation.`);
    const clip = original.clone();
    // Locomotion stays in the controller. Remove horizontal root motion from animation tracks.
    for (const track of clip.tracks)
      if (
        track.name.endsWith(".position") &&
        /(?:Root|Hips|Armature)/i.test(track.name)
      ) {
        for (let i = 0; i < track.values.length; i += 3) {
          track.values[i] = track.values[0];
          track.values[i + 2] = track.values[2];
        }
      }
    actions.set(name, mixer.clipAction(clip));
  }
  let current = "Idle";
  let gestureBlend = 0;
  const greetingArm =
    role === "mira" ? visual.getObjectByName("RightArm") : undefined;
  const greetingForearm =
    role === "mira" ? visual.getObjectByName("RightForeArm") : undefined;
  const greetingHead =
    role === "mira" ? visual.getObjectByName("Head") : undefined;
  actions.get(current)!.play();
  mixer.update(0);
  return {
    root,
    update(dt: number, _time: number, moving: boolean, interacting = false) {
      const next = interacting ? greetingName : moving ? "Walk" : "Idle";
      if (next !== current) {
        actions.get(current)!.fadeOut(0.2);
        actions.get(next)!.reset().fadeIn(0.2).play();
        current = next;
      }
      mixer.update(Math.min(Math.max(dt, 0), 0.1));
      // Family Traveller ships Idle/Walk/Run, not an interaction clip. This small authored
      // greeting operates its real named bones after the mixer; no fake clip is claimed.
      gestureBlend +=
        ((interacting ? 1 : 0) - gestureBlend) *
        (1 - Math.exp(-Math.max(dt, 0) * 7));
      if (greetingArm) greetingArm.rotateZ(-0.16 * gestureBlend);
      if (greetingForearm) greetingForearm.rotateZ(-0.4 * gestureBlend);
      if (greetingHead)
        greetingHead.rotateX(Math.sin(_time * 1.4) * 0.035 * gestureBlend);
    },
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(visual);
      root.removeFromParent();
      // Geometry belongs to the shared asset cache; each avatar owns only cloned materials.
      for (const material of materials) material.dispose();
    },
  };
}
