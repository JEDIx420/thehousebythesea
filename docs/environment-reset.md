# Stage1B — environment and finite coast reset

Issue#4 remediation, not Stage2. This is the environment implementer's evidence and handoff; independent review and creator visual approval remain separate gates. Only Havenport and Saltglass Bay exist as playable islands. The First Voyage state, NPC interaction markers, harbour landingX55 and berthX62 contracts are preserved.

## Actual assets and composition

The environment now loads selected actual Polyfork free CC BY4.0 GLBs from the Mediterranean Island Village and Coast&Boardwalk families: boathouse, shopfront, café, harbourmaster hut, boat shed, tables, flowering planters, olive/cypress trees, imported boardwalk with rope posts, bollards, lifebuoys, nets, fish crates, local rowboats, dune grass and rock details. Primitive box-house generators, oversized canvas harbour billboards, repeated hand-built planks and cone-leaf trees were removed. Havenport's café/shopfront and busier quay contrast with Saltglass's smaller fishing hamlet, muted green vegetation and natural stone arch.

`tools/environment-assets.mjs` reproduces the28 curated environment GLB downloads and audits actual bytes, triangle counts, skins and animation counts. It uses public GLB URLs with a project User-Agent; no API credential, source module or HD asset was needed. Individual canonical URLs, licences, authors and modifications are in `src/world/environment-assets.json` and the combined runtime `src/data/assets.ts` manifest.28 environment model files total4,349,488bytes before transfer compression. This replaces the former arbitrary500KB model budget; final full-game transfer/performance measurements belong to V4.

Actual GLB audition, not catalogue renders: [environment contact sheet](evidence/visual-reset/environment-contact-sheet.png) and [mesh bounds/audit](evidence/visual-reset/environment-audition.json). The first contact sheet contained27 models; the shaded bench was subsequently added to the scenic plot clearing. The interactive reproducible showroom is `/thehousebythesea/tools/environment-showroom.html` during development. It is not a production entry point.

Full selected people/vessel provenance is documented separately in [model audition](asset-audition.md). Unused old character/boat references moved outside public release assets; original hut/lamp/bench files remain clearly labelled legacy references in the runtime manifest, not claimed as active Stage1B scene models. Credits text and in-game manifest agree about source authorship and runtime edits. No scene model is hotlinked.

## Coast, paths and water

Both authored heightfields now have121×121 vertices over120m (1m grid), with different fixed coast asymmetry, rounded hills, a sheltered harbour inlet, a gentler3–8m beach transition and softly blended settlement apron. Smooth sand/grass/rock colour interpolation replaces abrupt vertex-colour bands. A continuous sandy lane beneath the real stone models joins the village route. Café placement moved inland toX11/Z−26 so the plot notice atX22/Z−31 and sea view stay open.

Paving initially floated at slope edges because rigid models were placed by centre height. The cleanup conforms cloned paving vertices to the exact terrain triangles, preserving original stone relief with a3.5cm inset; terrain and state are not altered by those visuals. This runtime geometry modification is disclosed in the manifest. Decorative vegetation and small furnishings remain nonblocking; main buildings have transformed GLB bounds plus avatar clearance as colliders.

Water uses the same authored heightfields in a small depth atlas for shallow/deep colour and shoreline foam; foam is not circular ring meshes. Two-dimensional phase-varying wave highlights replace rigid parallel bands. A first depth-atlas version exposed a hard square edge. The corrected shader smoothly blends submerged field margins to deep sea over a noisy radial48–59m envelope, while preserving shallow coastal samples. Final cleanup screenshots and independent art review must confirm the visible border is gone; a code change alone does not approve water appearance.

The environment implementer inspected actual controllable-game cleanup views: [harbour and real boat](evidence/visual-reset/environment-cleanup-harbour-boat.png), [pier and conformed path](evidence/visual-reset/environment-cleanup-harbour.png). The previous hard diagonal/square sea-colour boundary is absent in these views; paving follows the ground and forms a continuous route. These are reproducible fixed-checkpoint compositions captured using the coordinator's shared script, not claimed as a real-input full-route test. At1440×900 these two dev views sampled108/110frames with p50=16.7ms,p95=16.8/16.7ms and140/124draw calls. Independent art approval and final built performance remain V4 checks.

## Pier ground truth and raw shore collision

Four actual Boardwalk Deck Run GLBs form exactlyX43..58/Z±3.7 on each island, with scale(.9375,1,1.85). Local deck height is nominal1.2m and instanceY0.48 gives nominal1.68m. `node tools/environment-pier-audit.mjs` independently raycasts the actual GLB: exact outerXZbounds pass,18 floor samples pass, actual bevelled plank heights1.6675513..1.68000005m. The source contains centimetric plank bevels; it would be false to call every visible point an ideal1.68m plane.

Runtime `World.groundHeight` therefore queries retained exact imported deck triangles, using the same pre-batch world transforms as rendering, then the authored terrain. The pure surface helper retains the nominal pier contract for fixtures. The rendering/collision source arrays and triangle diagonal are identical for land. `seaFloorHeight` separately exposes raw submerged triangles: the walking filter must not hide visible0.02–0.3m shallows from the boat hull. Controls ownership handles that separate movement query correction.

`npx vitest run src/world/surface.test.ts`:3 tests passed, including ray/triangle parity at exact(.5,.5) diagonal, safe nominal pier/berths, and raw-shallows availability. `npm run typecheck`:passed after integration. Runtime pier/controller/browser regressions remain required in the complete built-game route.

## V2 actual terrain technology revisit

Reproduce with dev server5173, then `node tools/environment-terrain-run.mjs`. It creates actual ProceduralTerrains2.1.0 finite terrain from the current121×121 sculpted heightfield, renders it in WebGL2, calls the real GLB/collider exporter, parses the real export, and compares the chosen production authored triangle mesh. It writes separate Stage1B artifacts under `docs/evidence/visual-reset/v2-*`; original Stage0 proof evidence is preserved.

Installed Chrome158.0.8127.37, AppleM4/macOS,640×470 page with640×420 canvas, last120 frames after warmup:

| Mode | p50 | p95 | Draw calls | Triangles including shared water |
| --- | ---: | ---: | ---: | ---: |
| Live runtime, reduced detail |16.7ms|16.7ms|2|47,304|
| Actual exported GLB |16.7ms|16.8ms|2|73,800|
| Production authored triangle mesh |16.7ms|16.8ms|2|73,800|

Live create/prepare45.7ms. These small, vsync-limited technical observations are not complete gameplay FPS or a low-power hardware guarantee. [Full metrics](evidence/visual-reset/v2-terrain-metrics.json), [live](evidence/visual-reset/v2-terrain-live.png), [exported](evidence/visual-reset/v2-terrain-exported.png), [authored](evidence/visual-reset/v2-terrain-authored.png).

The same export visual failure reproduced: the exported mesh becomes a pale angular/square sheet around the island rather than matching the runtime shoreline. This is explicitly failed visual parity, not a production GLB integration claim. Live CPU sampler differs from the authored exact triangle surface by up to0.0832m at the measured shoreline sample; live GPU-vs-CPU error was not measured. Production retains the visually coloured authored1m triangle mesh and exact collider, with sculpted coves/paths, rather than shipping either uncertain collider sampling or the broken export silhouette. Export/collision artifacts are preserved under the proof directory for inspection/reversal.

## Loading and lifecycle

Each environment fetch/body/GLTF parse has a10second deadline and AbortController; all tasks settle before props/colliders enter the scene. There are no late invisible collider additions. The audited boardwalk-deck GLB is mandatory; if it fails, boot raises an honest reload/retry error rather than substituting a differently shaped pier-head asset; optional missing assets use a coherent preloaded family alternative or emit `World.warnings` and skip. Main surfaces warnings. Static GLB mesh geometry is transformed and merged per material/island, normalising irrelevant static skin/UV attributes; characters are not in this batching path. World disposal deduplicates instance/template geometries/materials and releases depth texture resources.

No further settlement scatter is planned before V4 evidence. Remaining gate: final built six matching views, actual30–60second sail/dock/walk/interact clip, independent art/code review, full First Voyage regression and remote CI. **WAITING FOR CREATOR VISUAL AND GAMEPLAY APPROVAL** remains the release boundary; no Stage2.


## Final V4 corrective pass — plot clearing and late asset disposal

The V4 home frame exposed a real furniture overlap at the notice: the oldtable at(24,−32) intersected the player checkpoint(24,−31). This was corrected rather than labelled a visual limitation. Tables moved to(17,−21),(21,−18),(25,−21), shaded bench to(13,−36), and café one metre farther inland to(11,−26). The [actual transformed-GLB clearance audit](evidence/visual-reset/plot-clearing-audit.json) measures every furniture/building envelope above8m from the notice(22,−31), with the closest café8.709m and closest table9.065m. The [actual corrected home frame](evidence/visual-reset/environment-clearing-fixed-home.png) visibly shows a clear player/notice approach and open sea view. This is an implementer correction check; independent art review remains separate.

Reviewer reported that a GLTF parse resolving after its asset deadline would previously retain unowned resources. The load path now sets an expired flag before aborting; a late parser result explicitly disposes its unique geometries, materials and textures, then rejects before any scene/collider acceptance. `node tools/environment-late-load-audit.mjs` delayed one real optional FishCrate parse beyond the deadline in an isolated browser with no WebGL renderer. Observed:world returned at10.153s with an honest warning; two late geometry-dispose events occurred; root child count stayed241 and collider query stayed unchanged. [Machine-readable result](evidence/visual-reset/environment-late-load-audit.json). This deterministic delayed-parser verification does not claim a natural production network timeout or full gameplay pass. Typecheck passed after the narrow corrective change.


## Final art-review vista correction and mandatory deck guard

Independent art review found the first cleared plot frame still too blank/dark, with a cypress obscuring the water. The visible front cypress was moved out of the sightline, while the other near-path cypress shifted off the approach. The bench now sits at(27,−27), facing the sea and visibly framing the right side of the actual home view. This intentionally supersedes the earlier overly broad8m bench exclusion: actual transformed bench geometry stays3.696m from the player checkpoint(24,−31), so it is nearby but cannot intersect the actor. Tables/café remain farther away. A warm sandy clearing blends around(22,−31), with sparse grass/agave beside the bench.

The existing GLB post carries a small original1.2×0.8m notice: “A little place by the sea / Beach plot / Enquiries at harbour”. It faces the approach, at human scale, rather than reintroducing the old oversized harbour billboard. No purchase/construction feature was added. [Actual corrected vista](evidence/visual-reset/plot-vista-final-home.png), [actual GLB bench clearance](evidence/visual-reset/plot-vista-clearance-audit.json). The implementer inspected the frame: open water, readable notice, grounded actor and a visible nearby bench; final independent art approval remains separate.

Root code review caught a critical fallback contract risk: unnormalised pier-head geometry could not safely replace the audited deck if only boardwalk-deck failed. The deck is now explicitly mandatory, and the deck→pier-head fallback was removed. Optional building/decoration fallbacks remain. This preserves the exact measured deck bounds/ground query rather than pretending unlike GLBs are interchangeable. Typecheck passed after these narrow corrections; final functional test ownership covers the mandatory-deck failure case.
