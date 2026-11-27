import { chromium } from "@playwright/test";
const origin = process.env.MODEL_PREVIEW_URL ?? "http://localhost:5173";
const b = await chromium.launch({ channel: "chrome", headless: true });
try {
  const p = await b.newPage();
  p.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  await p.route("**/__probe.html", (r) =>
    r.fulfill({ contentType: "text/html", body: "<html></html>" }),
  );
  await p.goto(`${origin}/__probe.html`);
  const result = await p.evaluate(async () => {
    const THREE =
      await import("/thehousebythesea/node_modules/.vite/deps/three.js");
    const { preloadCharacters, createAvatar } =
      await import("/thehousebythesea/src/player/avatar.ts");
    const { preloadBoat, createBoat } =
      await import("/thehousebythesea/src/boat/boat.ts");
    await Promise.all([preloadCharacters(), preloadBoat()]);
    const scene = new THREE.Scene();
    const a = createAvatar(scene, {}, "rowan"),
      b = createAvatar(scene, {}, "rowan"),
      m = createAvatar(scene, {}, "mira");
    let ab, bb;
    a.root.traverse((o) => {
      if (o.isSkinnedMesh && !ab) ab = o.skeleton;
    });
    b.root.traverse((o) => {
      if (o.isSkinnedMesh && !bb) bb = o.skeleton;
    });
    const boneA = ab.bones.find((x) => /leg/i.test(x.name)) ?? ab.bones[5],
      boneB = bb.bones.find((x) => x.name === boneA.name);
    const beforeB = boneB.quaternion.toArray();
    a.update(0.1, 1, true);
    a.update(0.1, 1.1, true);
    const independentPose =
      JSON.stringify(beforeB) === JSON.stringify(boneB.quaternion.toArray());
    const poseWalk = boneA.quaternion.toArray();
    a.update(0.1, 1.2, false, true);
    a.update(0.1, 1.3, false, true);
    const interactDiff =
      JSON.stringify(poseWalk) !== JSON.stringify(boneA.quaternion.toArray());
    let miraArm;
    m.root.traverse((o) => {
      if (o.name === "RightForeArm") miraArm = o;
    });
    m.update(0.1, 1, false, false);
    const miraBefore = miraArm?.quaternion.toArray();
    m.update(0.1, 1.2, false, true);
    const miraGreeting =
      miraArm &&
      JSON.stringify(miraBefore) !==
        JSON.stringify(miraArm.quaternion.toArray());
    const preferredMira = !!m.root.getObjectByName(
      "licensed-mira-family-traveller",
    );
    const boat = createBoat(scene);
    boat.update(0.016, 2, 9);
    scene.updateMatrixWorld(true);
    const model = boat.root.getObjectByName("licensed-caique-fishing-boat");
    const bounds = new THREE.Box3().setFromObject(model);
    const seats = Object.entries(boat.seats).map(([name, s]) => {
      const hit = new THREE.Raycaster(
        new THREE.Vector3(s.x, 5, s.z),
        new THREE.Vector3(0, -1, 0),
      ).intersectObject(model, true)[0];
      return {
        name,
        feetY: s.y,
        deckY: hit?.point.y,
        gap: hit ? s.y - hit.point.y : null,
      };
    });
    const output = {
      preferredMira,
      miraGreeting,
      bonesIndependent: ab.bones[0] !== bb.bones[0],
      independentPose,
      interactDiff,
      rootPosition: a.root.position.toArray(),
      boatBounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
      seats,
      foamGeometry: boat.root.getObjectByName("soft-circular-foam-wake")
        .geometry.type,
    };
    a.dispose();
    b.dispose();
    m.dispose();
    boat.dispose();
    output.childrenAfterDispose = scene.children.length;
    return output;
  });
  console.log(JSON.stringify(result));
  if (
    !result.preferredMira ||
    !result.miraGreeting ||
    !result.bonesIndependent ||
    !result.independentPose ||
    !result.interactDiff ||
    result.childrenAfterDispose !== 0 ||
    result.foamGeometry !== "CircleGeometry"
  )
    throw new Error("Character/vessel asset integration invariant failed");
} finally {
  await b.close();
}
