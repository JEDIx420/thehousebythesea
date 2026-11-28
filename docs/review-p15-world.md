# P1.5 independent world baseline and migration audit

Baseline commit `90693e37ce009c5f44b19ac683c0c017aef0843c`, clean before this report. Read active AGENTS, first-voyage-polish and kickoff. Read-only audit of five cohesive systems: authored land geometry, collision/navigation, projection/elevation model, checkpoint/companion coordinate consumers, save compatibility. No implementation edit, build, GPU or browser run. Stage 2 remains locked.

## Reproducible measured baseline

CPU probe loaded actual `world.ts` through Vite SSR and counted `walkable(x,z,0.7)`, including obstacle clearance and shoreline radius. Deterministic square grid of **0.25 logical units**, cell centers; no random seed (none used). Local bounding rectangle is the integer-rounded union of shore vertices and dock rectangle. Multiply valid cell count by 0.0625. Ground sample uses `groundAt===island`, so includes dock ground; walkable area is already reduced for buildings, rocks, trees, arch pillars and player radius. This is a reproducible estimate, not exact polygon integration.

| Measurement | Havenport | Saltglass Bay |
| --- | ---: | ---: |
| Grid bounds local x | −57..59 | −43..59 |
| Grid bounds local z | −66..49 | −49..30 |
| First cell center local x/z | −56.875, −65.875 | −42.875, −48.875 |
| Analytic shore polygon area | 8,923 | 5,072 |
| Sampled ground incl dock | 9,115.25 | 5,207.875 |
| **Sampled usable walkable area** | **7,025.25** | **4,309.1875** |
| Plan target multiplier | 2–3× | 1.8–2.5× |
| Corresponding usable target | 14,050.5–21,075.75 | 7,756.5375–10,772.96875 |
| Reachable one-unit BFS cells | 7,167 | 4,379 |

Four-neighbor BFS starts at each landing on the one-unit integer grid. Every baseline NPC and place is exactly reachable: Ellis/Mira/Tomas/home and Nessa/arch. All painted centerlines were previously corrected and passed 0.1-unit sampling with 0.7-radius clearance. Repeat both area measurement and **elevation-aware** connectivity after redesign; a large disconnected plateau must not count as usable expansion. Report reachable usable area separately if any valid but isolated cells exist. Retain the same sample spacing/origin rule for before/after comparisons; do not infer increase from camera zoom or texture dimensions.

Baseline world bounds x(−150,165), z(−360,130). Island offsets 0 and −220. Both berths x63, localz0; landings x55, localz0. Player recovery x48. Hull fore extent +7.875/−8.925 and half width up to3.675. Boat max7.6 units/s, acceleration1.4, passive deceleration1.15, brake6; turning0.7+0.07×speed radians/s, 25ms substeps. Walking5.2 units/s, 0.7radius, max0.25-unit collision substeps. Dock acquisition radius13 and speed≤1.6; boarding landing radius7 plus canonical boat radius1. Expansion must leave clearance for full rotated hull and north/open-water departure before reversal, not only centerline sea connectivity.

## Coordinate hardcodes to remove together

- `assets/source/world.json`: island offsets, all shore/grass/path/landmark/NPC/interaction positions, dock extents, hull and bounds. Author stable district/height/connector/route IDs here.
- `src/world/world.ts`: NPC/place z uses literal −220 instead of owning island offset. `dockFor` already composes authored offset; make all consumers use the same map transformation.
- `src/state/game.ts`: initial x48/x63; RECOVER hardcodes −220 and x48/x63. Delegate to pure authored safe-checkpoint data without making state depend on Phaser.
- `src/world/people.ts`: Mira home/pier path and boarding-return waypoints, initial interpolation origin55. Move these to shared named companion routes and dock definitions; preserve real approach/boarding/reboard behavior.
- `src/scenes/VoyageScene.ts`: decorative boats, ripples/birds, initial camera point and prologue composition, actor projection/depth, fishing water probe, boarded seats and tooltip placement. Numeric world locations need review even if unrelated numbers happen to equal old dock coordinates.
- `src/world/projection.ts`: fixed 4/2 projection and zero height. Keep input-vector unprojection independent of elevation; elevated pointer picking needs actual surface resolution rather than naive flat inverse.
- `assets/source/land.mjs`: fixed1024×512 canvas and anchor512,256. Expansion/elevation can crop shore or cliff faces; compute projected bounds with padding or layered chunks and emit exact anchors. Avoid blindly growing atlas past device limits.
- `src/ui/view.ts`: chart composes map offsets but fixed drawing fit/labels need rescaling. `tests/browser/voyage.spec.ts` contains old x55/x63/−220 and authored foot/sea waypoints; update fixtures to the actual new map while retaining every interaction assertion. Tests must not share a broken route generation algorithm that makes controller errors invisible.

## Recommended authoritative two/three-level model

Use base coastal surface h0 plus one h1 terrace per island; optional h2 only where the same model and connected routes are proven. Author level polygons, height values and connector corridors in the shared world source. Give connectors stable IDs, endpoints/levels, width and a longitudinal height interpolation. Suggested height steps around8–12 logical elevation units, adjusted to artwork; choose one explicit pixels-per-elevation convention. Do not mix logical elevation with world z or screen y.

Expose one pure surface query returning island, surface/zone ID, elevation and walkability. A pure transition predicate accepts from/to samples plus player radius and allows same-level motion or passage through an authored connector. Every movement substep must enforce transitions, including x/z sliding and diagonal corner attempts: checking only final height permits cliff teleport at polygon seams. Connector corridors should provide at least three player diameters of usable width (~4.2units with baseline radius), preferably ~6 for comfortable stair approach. Verify clearance at their endpoints with the radius, not only center.

The same geometry drives terrain top/cliff rendering, stairs/ramp rendering, feet/shadows/props/interaction positions and collision. Ground projection gains elevation subtraction; camera follows elevated feet consistently. Structural depth uses consistent layer/foot ordering and cliff masks/chunks so an upper actor is not drawn behind its own retaining face. Do not add height to input-vector unprojection; click picking must resolve candidate elevated surfaces. No overhangs/stacked walkable surfaces are required in this slice, simplifying unique surface lookup.

Boat shoreline blocking uses the full land footprint regardless of plateau height; stairs do not create navigable water. Dock/shore is h0 and connected to the starter district. Place at least one meaningful destination on h1 on each island (home viewpoint and shell arch fit existing story); retain easy pier quest/fishing access at h0. Test both directions across each connector, outside-corridor edge rejection, diagonal corner rejection, end clearance, NPC route reachability and save reload on connector/mid-terrace. Decorative inaccessible cliffs must be marked nonwalkable rather than painted as a path.

## Schema2/world-v1 migration hazards and required proof

Current `parseSave` accepts only schema2 plus `pixel-first-voyage-v1`; `validate` then stamps that world version. Simply changing the constant will reject every installed pixel save. Keep explicit validated v1 dispatch before transforming to a new world version. Do not weaken future/corrupt protection. Database remains `thehousebythesea-pixel`, snapshots/first-voyage; 3D copy import remains separate from `thehousebythesea` schema0/1.

Preserve wallet, both inventories, delivery enum, discoveries, every story flag and settings byte-for-byte except deliberate new setting defaults. v1 `volume` becomes master; missing new channels receive defaults, while malformed explicitly present fields must not silently become defaults. No migration action may grant a delivery, sale, invitation or discovery reward. Complete delivery remains complete; invitation/visitedSaltglass state must restore Mira coherently.

Preserve old checkpoints if they remain valid **and** island/mode/boat relationships are coherent in the new map. A walking point must belong to its saved island and have radius clearance on a reachable surface, not merely return some ground. A boat point must pass the full hull query; synchronize aboard player coordinates/heading to it and clear inconsistent docked metadata. If an invalid walking actor must relocate, use that story island's documented safe landing; repair its boat to the corresponding valid berth. If the walking actor remains valid but its old boat is invalid, repair the boat without gratuitously resetting otherwise valid player position. For valid midsea boats preserve positions; if expanded land swallows one, relocate both together to the saved safe island/boat relationship. Do not choose narrative island by nearest pixel. Explain relocation once; never silently reset progress.

Height can be derived from uniquely authored x/z surface, so persistent elevation is optional. If height/zone is stored, include it in validation and migration; never trust stale v1 height. Reset transient velocity/phase on load, independent of saved progress. Migration should be idempotent and exact round-trip after first write. Failure leaves the raw snapshot protected; autosave may not replace it with a fallback new game.

Required fixtures: v1 walking on still-valid ground; old house/shore now invalid; boat docked each island; valid midsea; midsea now land; active/complete delivery; one/both fish; Mira invited before departure, aboard, Saltglass visited and returned; old reducedMotion/master settings; current-world raised landing/connector save; malformed/future values. Browser seed fixtures on a static origin page before starting the game to avoid prior-page pagehide autosave overwriting the fixture. Confirm original copy-source unchanged and no duplicate payout after import/migration/reload.

Awaiting root redesign for independent implementation review. This report supplies baseline numbers and design risks, not a claim that P1.5 elevation/migration is implemented or verified.

## A prototype — shared height independent five-file review

Reviewed `assets/source/surface.mjs`, `assets/source/land.mjs`, `src/world/world.ts`, `src/player/movement.ts`, supported by `assets/source/world.json`. CPU-only, no implementation edits/build/GPU. Prototype contains Havenport garden h18 pixels, rectangle x−28..−8/z−52..−30, with x-axis ramp x−8..4/z−39..−31 descending18→0. Main geography expansion and Saltglass elevation are not claimed complete.

**Collision/connectivity proof passes.** Independent 0.5-unit four-neighbor BFS using production `canStep` from landing55,0 reached28,815cells, including1,341h18cells and garden interior−18,−40. Ramp center z−35 yields expected heights: x−9/−8=18, x−7=16.5, x0=6, x3=1.5, x4/5=0, with valid small steps through both joins. Direct terrace boundary attempts and lateral ramp approaches reject. Grid sweep of0.17-unit diagonal attempts around the zone produced0accepted jumps above1.8px. Runtime applies transition clearance on each axis of each ≤0.25unit substep, rather than only the final target. Baked ramp and runtime consume the same `heightAtLocal` source: this is actual height data, not only a raised texture.

**P2 — old painted lane now ends against cliff.** Havenport path3 still ends at(−8,−40), outside the ramp's z range. `canStep(−7.75,−40,−8,−40)` rejects. Reroute the lane through the ramp center near z−35 before golden capture so the rendered approach teaches the valid way uphill. This is an optional route mismatch, not disconnected garden geometry.

**P2 / migration integration gate — standability is not identical to current walkable.** `walkable(−8.1,−42)`, `walkable(−18,−30.1)` and `walkable(0,−38.9)` return true but `canStep(p,p)` returns false due height clearance at terrace/ramp edges. Geometry-only migration or scene recovery using walkable can preserve a radius-invalid elevated position from v1. Add/reuse an elevation-aware canStand predicate in checkpoint validation/recovery; preserve genuinely valid points but relocate boundary points. Sampled area/connectivity after expansion should likewise use the final elevation-aware predicate. This does not imply the separately reviewed state migration implementation has been re-reviewed in this five-file batch.

**Depth/occlusion evidence gate.** `land.mjs` currently bakes all plateau tops and retaining faces into one land image. If the runtime retains one constant background depth for this entire image, base-level actors will draw over raised faces/tops in screen overlap; sharing height values does not itself solve occlusion. Verify the actual new renderer during golden capture or split structural overlays/chunks into appropriate depth/masks. Runtime scene layering lies outside this batch, so this is a concrete integration risk, not a browser-reproduced rendering finding. Props, feet, shadows and picking must consume the same elevation.

```text
3dff1302540e36f53a95bf5251832930667bdaeb0be833da1affc3dcd0615968  assets/source/surface.mjs
c227085811f776d41138ab19d7ae295bc9a901d252e872a14e494b9cf1c62dab  assets/source/land.mjs
c04448d6e865bdb999d8b238206490da0076b20b8fcc7418727ff946ca4d39c3  src/world/world.ts
de4b03d9b8b0f7929f039638f697cf0061efd5f381280263ceb92169f46fa557  src/player/movement.ts
a795718d99a08658355bea6c561012631f1b206f211dff868dd276940de26f06  assets/source/world.json
```

## A prototype correction re-review

Both prior P2s are **closed**: `walkable` now includes elevation-aware radius clearance using traversable(point,point), and all three previously accepted invalid edge/ramp points reject. All authored centerlines independently passed transition-aware sampling at intervals≤0.1unit: Havenport2,748 and Saltglass1,945 samples, zero blocked, including the new approach via4,−35 → −8,−35 → −18,−35.

Generator now removes vertical retaining faces from the background bake, produces small camera-facing cliff chunks with finite anchors/world midpoints, and Scene places these at flat logical foot depth+0.1. Independent frame-generation probe produced9chunks and no chunk whose midpoint crosses the ramp opening. This resolves the specific always-background **front-wall** risk at source level; visible seams and depth parity still need golden capture.

**Remaining P2 — raised top cannot occlude a low actor behind the plateau.** The raised grass top remains baked in the constant-background ground image. A valid low point near the west/back edge, e.g.(−29,−40), projects to(44,−138). That screen pixel also falls inside the elevated top: reverse the height shift18 and obtain logical(−24.5,−35.5), inside the garden polygon. Thus the lower actor's feet can render over the raised top despite being behind it; no camera-facing front-wall chunk reaches this upper/back overlap to hide them. A depth-aware top overlay/mask is needed as well as front-wall chunks, or another explicit shared-geometry occlusion solution. This is a source/geometry repro, not a browser screenshot claim. Do not close the complete terrain occlusion gate solely because front walls now sort correctly.

Narrow re-review includes land generator, atlas metadata emission, world standability, authored approach and Scene terrain placement. No build, implementation edit or GPU activity by reviewer.

## Raised-top occlusion correction re-review

Original raised-top P2 **closed** at source and CPU ordering level. Raised tops are now separate required frames with explicit finite pixel offsets and depth, not part of the constant-background terrain. Generated garden top has midpoint−18,−41, pixel offset0,−18, anchor86,44 and depth−76.1. Production `surfaceDepth` sorts lower-behind Rowan at−29,−40 to−137, correctly behind the top, and upper Rowan at−18,−40 to−74.5, correctly in front. The explicit offset uses the same projection and height data; runtime adds island offset consistently. Golden browser verification still belongs to the coordinator.

**Remaining P2 — upper occupants lose foot ordering.** `surfaceDepth` raises every terrace occupant to the same maximum front-rim+0.5 value and returns it without the advertised foot tie. Independent query returns identical−75.5 for(−18,−40) and(−18,−35), despite different logical feet depth. NPCs and props on the terrace can therefore sort by insertion order, while Rowan's constant+1 wins over any foreground person/prop. Preserve a bounded logical-foot tie within the raised layer (or explicit sortable layer/feet tuple) while keeping every occupant above its top image. This is a small depth-ordering correctness issue, not failed ramp traversal.

## A height source gate — GO

Final upper-occupant foot-order P2 **closed**. Independent CPU query now gives upper depths−75.540 at(−18,−40) and−75.530 at(−18,−35); front feet sort later while both remain above top−76.1. Near opposite terrace corners samples−75.580 and−75.504 likewise remain above the top. Lower-behind point keeps flat−138, below the top. Rowan's extra occupant offset is reduced to0.001, avoiding the previous full-depth-unit override.

**GO for this small A height prototype's shared geometry, transition clearance, reachable ramp and source ordering.** No remaining actionable defect found in these reviewed corrections. This does not replace coordinator golden-image/browser evidence, approve other A art/audio/UI systems, or claim C geography complete. The epsilon is proportional to logical foot span; if C introduces very large plateaus, clamp its range or preserve enough guaranteed margin over each top frame. Recheck multiple-height overlaps and all new connector routes on the expanded map. No GPU/build/source edits by reviewer.
