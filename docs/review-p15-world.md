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

## B movement five-file independent review

Files: `src/player/locomotion.ts`, its test, `assets/source/sprites.mjs`, `src/world/people.ts`, and scene integration. No GPU/build/source changes. Existing locomotion tests **3/3 passed**. Independent30/60Hz query gave identical0.4s travel2.3041666667 and maxspeed6.6. Acceleration60 reaches6.6 in110ms; deceleration75 stops in88ms, with approximately0.264units residual stopping travel after release under this substep scheme. Reset clears velocity and movement phase, and modal/blur/fishing/boarding/recovery integrations call reset. Distance-driven frames use actual accepted displacement; blocked movement cannot advance the gait through accumulated velocity alone. Exponential camera factor1−exp(−dt/.18) has the intended time-constant form.

CPU raster hashes confirm all12 Rowan walk frames are distinct in **each** authored s/n/e/w direction (48 distinct within the four directional sets). This proves authored frames exist, not subjective fluidity or planted-foot quality; actual30/60Hz browser motion clips remain required. NPC regular walking uses independent traveled distance rather than a shared elapsed-time walk phase.

**P2 — facing flips south→north on full stop.** Independent probe:10updates(h0,v1,dt1/60) yields direction`s`;20zero-inputupdates ends`n`. With no travel or input the projected face vector is(0,0), which is classified as north, then the opposite-direction condition forces a switch from south. Gate facing updates on actual travel or intended nonzero input so a stationary actor retains facing. Add a regression that walks south then fully stops/pauses, including other direction reversals.

**P2 — companion transition freezes walking pose.** People boarding/unboarding interpolation sets walking=true but does not increment Person.distance, while the scene now selects all walking frames from that distance. Mira's frame therefore freezes during a real interpolated pier/seat transition. Increment accepted/interpolated travel for that phase as well, or use an intentional transition pose. Ordinary route steps already update distance correctly.

No P0/P1 found in this batch; close these two P2s before calling B movement review complete. NPC purposeful route expansion and final camera bounds/height composition remain later integration evidence, not implied by these passing controller probes.

```text
d02d61d5394fc03c611d3226198959f0c0cb12c617a738a8cf617e52778893c2  src/player/locomotion.ts
785cf72770ad8b7783c83f6a9d245a434dffbdf8d6d6d5a8fa86242eaf0bec0b  src/player/locomotion.test.ts
446638457f8a1da8161c4d6f0481ef40660d93757b2957e88f408bdc85b259b8  assets/source/sprites.mjs
1e5409fd6288be0cab4fba4efbcd08b3268e4016afcf63d160f9eed4ed06dd12  src/world/people.ts
ceb690f1799c63c3d1786cb82c0687a4d20e6b7e847c3f2e31259b8f9e3f6cdf  src/scenes/VoyageScene.ts
```

## B fixes closed / C expanded-world CPU audit

B facing and companion-transition P2s are **closed** at source level: facing only updates with travel/nonzero input, south-idle regression passes, and boarding interpolation adds actual traveled distance before animation selection. Updated locomotion tests **4/4 passed**. Browser feel remains a separate gate.

C audit covers five cohesive systems: shared geometry/elevation+area; terrain sizing/depth metadata; foot paths/NPC routines; dock/hull sea clearance; migrated coordinate relationships. Current data has only the two authorized islands, Saltglass offset−340, bounds x−165..180/z−500..130. No build, GPU or app edits by reviewer.

| Current authoritative area measurement | Havenport | Saltglass |
| --- | ---: | ---: |
| Sample bounds local x/z | −103..59 / −113..82 | −76..59 / −84..49 |
| Usable area, same0.25-cell-center rule | **20,002.625** | **10,605.375** |
| Ratio to recorded baseline | **2.847247×** | **2.461108×** |
| Reachable half-unit cells via canStep | 79,963 | 42,424 |
| Reachable elevated cells | 14,862 at h24 | 8,249 at h28 |
| Authored path samples≤0.1unit | 6,515 | 3,643 |
| Blocked painted samples | **0** | **0** |

Both areas meet requested numeric ranges without camera/texture scaling. Every NPC/place is exactly reachable by elevation-aware0.5-grid BFS from its landing; Nessa/Ellis/Mira/Tomas/home remain h0, arch is actually h28. Each island's raised interior is connected through its authored ramp. Both safe checkpoints and canonical full-hull berths pass. Hull clears the straight30-unit north departure on both islands and a complete heading sweep at x85,z=dockz−28. Actual whole crossing/return still requires the browser route.

Dynamic landSpec computes projected shore+dock bounds with40px padding and32px sizing. Current grounds are Havenport1088×576/anchor584,376 and Saltglass768×448/anchor368,276, avoiding the obsolete fixed1024×512 anchor assumption. Structural overlays count27/23 including tops. Atlas/device/memory metrics need actual build evidence, not inferred from these dimensions.

**P2 — two authored NPC routines stall at invalid waypoints.** Independent0.1-unit route sampling found94 blocked samples across Ellis and Nessa loops. Ellis target(41,4) is beyond0.7-radius clearance of the narrow pier; Nessa target(42,6) also leaves valid ground/clearance. A120-second production People simulation leaves Ellis at target2 after6.921units travel and Nessa at target1 after2.160units; Mira and Tomas continue cycling (target9/14). Keep all routine segments, including last→first, walkable and accessible; reroute nodes rather than reducing foot collision. This does not block current story interactions because NPCs remain in reachable nearby positions, but does defeat the promised purposeful routines.

Migration coordinate inspection: valid v1 snapshots dispatch explicit migration; docked boats remap using stable island dock identity (important after Saltglass moves−220→−340), aboard player synchronizes to full-hull-validated boat, walking coordinates must be elevation-standable and belong to saved island, and invalid partner boat is repaired to the same island berth. This maintains the coordinate contract without issuing reward actions. Full state/settings/corrupt/future/browser preservation remains the separate state-review/test responsibility; no blanket save-pass claim from this geometry audit.

## C routine correction closure and D source integration pass

NPC P2 **closed**. Corrected Ellis/Nessa nodes independently resampled over every nonzero loop segment at≤0.1unit with radius-aware canStep: zero invalid geometry samples. The duplicate Mira last→first node has zero length and was excluded from interpolation division, not bypassed in gameplay.120-second production People simulation now advances Ellis target14/distance38.4975 and Nessa target13/distance22.4325; Mira target9 and Tomas target14 also cycle. Every final actor is walkable. No GPU/source edits.

D source review covers five cohesive systems: dedicated dialogue/confirmation handling; modal focus/accessibility; scene input freeze/reset and quest actions; world-space contextual prompt; camera follow/height integration. **No additional concrete actionable issue found in this source pass.** Dialogue has its own bottom-strip view and portrait/blink/typewriter state rather than generic menu-card reuse. Confirm-key handlers prevent native default and propagation, ignore repeats, and route focused action versus reveal/advance; keyup is stopped before world forwarding. Scene has a modal guard, so confirmations do not also cast, board or move. Choices are displayed only on final fully revealed beat. Repeated quest actions remain reducer-gated rather than relying only on button timing.

Focus wraps through dialogue choices using Tab/arrows; generic menus retain their separate focus trap. Opening either view clears movement/velocity, hides or inerts underlying HUD controls, and close restores prior connected focus or canvas fallback. Full beat text is announced once in a live region while typewriter text is aria-hidden, avoiding per-character speech churn. Blink/typewriter intervals clear on hide/re-render, reduced motion/instant text select immediate reveal, and disabled background control semantics are retained. Actual keyboard/resize/screen-reader behavior is not claimed from source alone.

Context position follows Rowan's actual elevated screen position through camera world-view and zoom, clamps to logical canvas margins, and renders above the actor rather than as the previous bottom banner. Follow uses an exponential time constant and pixel rounding, with reduced-motion immediate follow. Camera subjective comfort, absence of jitter/cropping, opaque HUD coverage and clear uphill/boat composition need the actual recorded browser route; this source pass is not a creative sign-off. Coordinator currently owns the15-case GPU suite, so the reviewer deliberately did not launch browser duplicates.

## Final polish source review — five cohesive systems

Reviewed authored idle/fishing frames and required asset wiring; independent NPC phase; transient gangway transition; camera look-ahead/dead-zone/integer zoom; stable dialogue portrait sides/blink/narrow layout. CPU only; coordinator owns full browser tests.

Passing source/CPU evidence: all four Rowan idle frames and both fishing frames are raster-distinct in each s/n/e/w direction. Generator emits those families and scene checks them before gameplay. Regular NPC walk frames remain actual-distance based; idle rhythm uses per-person offsets rather than identical global frame selection. Dialogue keeps NPC left/Rowan right during actual exchanges, active/inactive classes follow the speaking identity, blink updates only the active slot, and narrow mode hides inactive while moving active to the left slot. Existing confirm propagation/repeat and focus behavior remain intact. Camera follow uses actual transient velocity for foot look-ahead, elevation-adjusted target, small dead-zone and exponential smoothing; integer zoom algebra preserves current avatar screen position when computed from the current camera view. Actual repeated-wheel behavior/comfort and sprite motion still need browser evidence.

**P2 — gangway animation currently never starts on either authored pier.** Both caller endpoints use berthx−3=60, while pier maxX is59 and radius-aware standing only reaches58.3. Independent runtime queries confirm boarding endpoint(60,dockz) false and the first disembark sample(59.875,dockz) false on both islands; `stepGangway` therefore returns without creating the transient. Use an authored safe pier-edge point (e.g.x58, verified true), not an offset from the water berth. Persistent boarding remains functional; this finding concerns the promised safe transition animation.

**P2 — transient interaction/reset integration needs guard.** Once the animation can run, E/F/R action routes currently remain enabled during the0.48s transient. E can flip the persistent mode again before the first visual transition finishes; fishing can begin while the gangway still overrides Rowan's rod pose; recovery does not clear the old gangway path. Ignore new interact/fish initiation during a gangway and cancel it explicitly on recovery (without blocking legitimate menus/recovery). This is an actual activity-state boundary, not an arbitrary key delay.

No new P0/P1 found in this batch. Correct and independently recheck these two P2s before claiming the transition completed.

## Gangway closure and committed measurement reproducibility

Both gangway P2s **closed** in source/CPU review. Endpoints derive from each authored pier's maxX−1 (currently58), and all40validation samples pass in both55→58 and58→55 directions on both islands. During an active transient the action dispatcher ignores interact/fish/reel, while recovery explicitly clears gangway before repairing actors. Menus/recovery remain available; no arbitrary key delay was introduced. Actual transition display remains covered by the coordinator browser run.

Reproducible CPU audit script: `node tools/audit-p15-world.mjs`. It reads immutable baseline90693e3 world JSON through git, reconstructs its original flat radius predicate, and measures current production world functions through Vite SSR without building assets or using GPU. Outputs [world-audit.json](evidence/p15/world-audit.json) and [annotated two-island district/route map](evidence/p15/district-map.svg). JSON records baseline ref, current head/world hash, grid bounds/origin, areas/ratios, elevation-aware BFS, destination distances, level reachability, every blocked path sample and berth clearance. SVG is a logical top-down audit illustration, not in-engine art or a sea-distance map.

Latest repeat reproduces Havenport20,002.625 (2.847247×), Saltglass10,605.375 (2.461108×) and zero blocked painted route samples. No source-game changes/build/GPU by reviewer; the new tool and evidence are review artifacts requested by coordinator.

## Gangway fresh-held-input follow-up — source PASS

Completion now clears only the transient and resets velocity; it no longer clears keys newly pressed during the step. Start still clears pre-transition input, and modal/blur/recovery retain their explicit clearing rules. This preserves a fresh held W after boarding while preventing pre-board velocity carry. The same frame may integrate new held input once the transition finishes, which matches responsive expected behavior. No new actionable issue in this narrow delta.

Reviewed regression additions: the step activity test presses fresh W during boarding and checks actual negative boat-z movement after completion, then brakes and docks; existing input/menu test still asserts one E remains aboard after150ms and waits for the legitimate transient to finish before sending the next physical E. These are real input/state observations, not synthetic state writes or removed interaction checks. Browser execution is owned by coordinator; reviewer did not launch GPU or claim the changed cases ran here.

## Final idle-phase and actor-avoiding prompt source check

Verified new independent idle phase coefficients from the production scene. Modulo9-second cycle offsets are Ellis0.960s, Mira5.370s, Tomas/seller1.580s and Nessa6.450s: four distinct phases, removing the prior near-identical Ellis/Mira offset. No physics/pose geometry changed by this adjustment.

Actor-avoiding prompt design source review **PASS**: visible Rowan/passenger/NPC bounds are transformed through camera view and zoom into logical overlay coordinates; the same read-only rectangles are exposed in metrics. DOM placement evaluates nearby clamped slots using measured prompt dimensions and rectangle overlap, selecting the least overlapping candidate. The browser assertion independently reads the actual DOM bounding box, removes CSS app scale, and compares geometric overlap against read-only actor rectangles; it does not inspect or trust the placement solver's chosen score. It therefore tests actual overlay placement at that checkpoint. No state-writing API or gameplay bypass was added.

No new concrete actionable finding in this narrow source delta. Candidate selection is a local minimizer, not an exhaustive proof for every possible crowd/viewport; the assertion proves the exercised scene only. Final17-case browser and native route results remain coordinator-owned and are not reported as run by this reviewer. No GPU/source implementation edits.

## Chart focus/layout and credits narrow source re-review

Reviewed only `src/ui/view.ts` and `src/style.css` for the final chart correction. **Source PASS, no new concrete actionable finding.** Chart-only initial focus now targets the dialog panel with preventScroll and resets scrollTop after focus, removing the previous first-button autofocus scroll-to-bottom trigger. Shift-Tab from that initial panel focus wraps to the final control; normal Tab can enter the chart's button. Existing close/focus restoration, modal input lock and generic menu behavior remain.

Chart-only styling uses the wider nautical spread, two-column body, minmax columns, responsive height clamp, and scrollable bounded panel rather than changing every menu. A warm focus ring identifies panel focus. Credits now explicitly include original coastal music and seeded sea ambience with contributor/license provenance. Actual small-laptop visual clipping and keyboard focus positions remain browser verification, not inferred from CSS. Interrupted historical suites must remain labeled interrupted; coordinator owns the fresh final17-case/native queue. No reviewer GPU or implementation changes.

```text
5f509c25e103db6df4063b764b41528c83839696beaf2509fb9f94f32c71eccc  src/ui/view.ts
0a0dd1bf14224b339ca1b418a7bd2b9cf234a6434c479ffcc96d70b0bdfc3b9c  src/style.css
```

## Narrow dialogue heading and held-confirm regression review

Source/test delta **PASS, no assertion weakening found**. Narrow dialogue h1 now participates in normal layout inside the scrollable strip instead of sitting above its clipping boundary. Resize regression waits for the actual app narrow-layout attribute, then reads heading and strip rectangles in one DOM evaluation before enforcing the same strict top-boundary condition; this removes mixed pre/post-resize observations rather than adding tolerance or accepting clipping.

Held Enter regression now sends eight repeated keydowns while Enter remains held, then keyup; delivery must still be available before a deliberate choice. It exercises repeat suppression directly rather than merely sleeping after one keydown, and keeps the subsequent real acceptance assertion. Coordinator owns targeted/full browser execution; no GPU used here.
