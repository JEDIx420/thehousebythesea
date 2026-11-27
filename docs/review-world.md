# Independent review — finite world and asset batch

Reviewer: state-system agent; no ownership of these five implementation files. Date: 2026-11-27. Batch: `src/world/surface.ts`, `src/world/surface.test.ts`, `src/world/world.ts`, `src/data/assets.ts`, `docs/terrain-spike.md`. Baseline HEAD `fa4a43b427a6cb8fdc9ba29bc0782fd7e16b2dc3`; additions were reviewed in the shared working tree. This does not review state/persistence authored by this reviewer.

## Verification performed

- PASS: `npx vitest run src/world/surface.test.ts src/player/movement.test.ts`, exit 0, eight tests (two terrain, six movement). Triangle barycentric interpolation matches independently constructed raycast geometry at five sample points; production source uses the same vertex/index ordering. Pier query gives 1.68 m, berth gives null on both islands.
- PASS: `node tools/inspect-assets.mjs`, exit 0. All five actual model byte lengths, triangle counts, clip counts and skin counts match the manifest. Mesh-local bounds are explicitly described as such, not a promise about rigged dimensions.
- PASS: independently opened [Polyfork licensing](https://polyfork.dev/licensing) and the manifest's five canonical model pages. Free mesh licensing permits self-hosting with attribution/change notices; public CREDITS and manifest preserve individual source links. Downloaded files are GLB, not licensed source modules or HD assets. Installed `procedural-terrains/package.json` reports 2.1.0, MIT and Three.js peer ~0.185.1, matching the spike documentation.
- PASS: isolated proof code imports actual `createTerrain` and `exportTerrain`, creates finite heightmap terrain, exports GLB/collision data, parses the export with GLTFLoader, and captures both paths. Export file byte sizes match committed artifacts. This reviewer inspected the code, screenshots and JSON metrics; did not independently rerun the entire terrain benchmark and does not claim the reported performance as an independently measured result.
- PASS: actual world instantiation in installed headless Chrome through dev server `/thehousebythesea/`: groundHeight(57,0)=1.68, groundHeight(62,0)=null, original house blocked(21,-12)=true. A second isolated world instance was disposed after querying it. This browser probe does not constitute walking or full gameplay proof.
- ISSUE W-01: Polyfork huts have no collision, reproduced below.
- ISSUE W-02: exported-GLB screenshot's square cream sheet differs visibly from live bounded island; spike text should explain observed visual failure and avoid implying shoreline parity. Direct authored production terrain is clearly disclosed, and is a reasonable chosen fallback, but the export is not production-quality equivalence.
- NOT TESTED: full path, live Pages deployment, production viewport performance, Safari/Firefox, CPU sampler error against rendered runtime GPU vertices. Three CPU samples only prove quantisation at those points, not general GPU-collider parity.

## W-01 — P1: beach huts are traversable main structures

`world.ts` prop() adds no collider. Actual createWorld browser calls returned `blocked(23,27)=false` for Havenport's hut and `blocked(27,-203)=false` for Saltglass's hut, while `blocked(21,-12)=true` for a procedural house. These are buildings, with the GLB about 4 m wide by 4.9 m deep before instance scaling (1.2/1.4). Expected: walking cannot cross their walls. Required fix: add transformed footprint colliders for hut instances, independent of whether the decorative mesh load succeeds. Sent to terrain implementer and coordinator.

## Reviewed fingerprints

```text
fb8014456c8a0664391fa0572052c1ee8f098654a40d2b14597a0c208cae77ea  src/world/surface.ts
25a28c3b05a16ceb0b4f5ea42a84f1c2a02cbb7107c1e3b175d99a6b3784325c  src/world/surface.test.ts
b10797f053fbff80d3788fad8a09ac2689a3463e03fc657bdde65f606daf3216  src/world/world.ts
329daec2f19fc6722d67ce1f6807152d188e9711fee4fde6c7aa3c59bd8ef9c6  src/data/assets.ts
0b2e59eddcf96704832da29bb11a2d4d5380be2f6127d05903cc8b4247b90ba9  docs/terrain-spike.md
```

Conclusion: **NOT READY** pending W-01 closure and honest W-02 documentation. This conclusion concerns this batch; complete browser gameplay and creator approval remain separate gates. Stage 2 remains unauthorised.

## Corrective round — independently verified

**W-01 CLOSED:** implementer added hut colliders from actual scaled/rotated `Box3` world bounds, with an avatar clearance margin. Repeated installed-Chrome world instantiation independently returns `blocked(23,27)=true`, `blocked(27,-203)=true`, `blocked(21,-12)=true`, and village walking path `blocked(32,0)=false`; pier remains 1.68 m and berth remains null. The collider exists for each successfully loaded hut; when a GLB is absent there is no invisible model wall. `npx vitest run src/world/surface.test.ts src/player/movement.test.ts` again exits 0, eight tests passed.

**W-02 CLOSED:** spike documentation now explicitly describes failed export visual parity, the square sheet artifact, direct production heightfield choice, and unmeasured live GPU-versus-CPU collision error. No unsupported runtime collision parity is claimed.

Latest corrected SHA-256: world.ts `0f486e574782c749f5b2ff68952102278ca0bc09cf901d098d1d743917c11289`; terrain-spike.md `3be23675e4b3d81b4dd46a5d57b8eb4548d04c7099835771420a76881ef5430f`. Other three reviewed files are unchanged from fingerprints above.

**Batch conclusion: PASS, ready for integration review.** No open P0/P1 defects in these five files. Full Stage 1 readiness still requires independent complete browser gameplay evidence and final commit attachment. This is not creator approval and cannot authorise Stage 2.

## Static-prop batching targeted follow-up

Reviewed world.ts performance follow-up SHA-256 `279eed9e2491b1119a06ee0042626e2516b9d983a5577640ce044bb8c528f350`. Original static prop transforms are baked into cloned/non-indexed geometry, grouped by material and island, merged and originals disposed. Terrain, GLTF props, animated water/foam and birds are outside these batches. Collider data is unchanged. Group has identity transform; baking world matrices then adding merged objects under that group preserves placement.

Independent installed-Chrome render at 960×640 through dev server succeeded: 44 merged batches, zero nonfinite position values, 109 draw calls and 60,280 triangles in the isolated waterfront view. This is one-frame world-only rendering, not full-game FPS or whole-game draw count. [Actual isolated rendered screenshot](evidence/independent-world-batched.png) inspected: pier, terrain, houses, trees, path and water remain coherent. Actual world methods still return hut collisions true/true, original house true, village path false, pier 1.68 m and berth null. **Targeted review PASS.** No build was run during the coordinator's browser verification.

## Immutable implementation sign-off

**Reviewed implementation commit: `f788256bebd0d958b96c5397fbe4922746855d31`. World batch PASS.** Verified scoped surface.ts, surface.test.ts, world.ts and assets.ts are present in that commit and working-tree diff against it is empty. Their hashes match the most recent verified review above, including merged world hash `279eed9e2491b1119a06ee0042626e2516b9d983a5577640ce044bb8c528f350`. The fifth scoped file, docs/terrain-spike.md, is a report queued for the next evidence commit, not part of this implementation SHA; its reviewed hash remains `3be23675e4b3d81b4dd46a5d57b8eb4548d04c7099835771420a76881ef5430f`. W-01/W-02 remain closed. No source changed or extra benchmark was run during sign-off. Creator approval and Stage 2 authorisation remain separate.
