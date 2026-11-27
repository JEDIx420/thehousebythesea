# Independent five-file review — Stage 1B app integration

Reviewer is the character/vessel implementer, independent of the five files under review: `src/main.ts`, `src/audio/ambience.ts`, `src/activities/fishing-view.ts`, `src/state/persistence.ts`, `src/state/game.test.ts`. This does **not** independently approve the reviewer's model implementation or world code. Scope includes the PR #3 correctness fixes and visual-reset integration on `fix/stage1-visual-baseline`; immutable final-SHA verification remains a release handoff step.

## Findings and corrections

- **P2 / fixed:** NPC conversation yaw was reversed after adopting -Z-forward human visuals: `atan2(player−NPC)` made the imported actor face away. Root changed it to `atan2(current NPC position−player)`. Actual keyboard walking west along the dock and north to Mira, then E, opened the real dialogue; rendered frame inspected shows her looking toward Rowan. No state teleport or private debug mutation was used for that test.
- **P2 / fixed:** Escape could replace the loading modal with title/Begin before required character/vessel assets finished loading. Keyboard and HUD shortcuts now guard loading/error state. Actual delayed required-GLB test pressed Escape while Opening the harbour was visible: the loading heading remained, with zero Begin buttons. Missing required GLB displays the explicit retry screen; no primitive substitution.
- **P2 / fixed and image rechecked:** Fixed ±100m directional-shadow frustum at Havenport excluded distant Saltglass. Root now adds the light target to the scene and translates target plus sun by the same player-following snapped-8m offset, retaining `(-70,65,45)` light direction. Source verified; actual frozen `after-saltglass.png` inspected with clear building/tree shadows on the ground, closing this finding.

## Actual checks

Chrome 158.0.8127.37, Apple M4/macOS, 1365×900 and 1280×800. Local dev prefix `/thehousebythesea/`; mocked Vite websocket only prevents HMR during test, with normal modules, CSS, WebGL2 and actual keyboard/button actions intact.

| Check | Result / evidence |
| --- | --- |
| Audio construction failure | PASS: injected unavailable AudioContext, Begin still opens the memory; honest “continue in silence” toast |
| Memory Escape | PASS: closes memory and persisted logical `prologueSeen=true` |
| Native modal controls | PASS: focused mute checkbox toggled with Space; focused volume slider changed via ArrowLeft to0.30; no global-game-key cancellation |
| Walking after menu close | PASS: real W input moved z0→−2.90; input state clears across modal transitions |
| Storage unavailable | PASS: disabled IndexedDB produces visible warning at title, no false saved-success claim |
| Required model missing | PASS: actual404 response for Rowan's GLB leads to We couldn't open the harbour + Try again |
| Browser Back | PASS: navigation away and back restored a rendering game; frame counter increased afterwards |
| Real BFCache cache hit | NOT EXERCISED: Chrome reported `pageshow.persisted=false` in this harness; do not claim a real cache restoration |
| BFCache lifecycle branch | PASS separately: synthetic `pagehide` with `persisted:true` leaves resources live and frame counter increasing; explicitly a branch test, not an actual cache hit |
| Save parser strict delivery flag | PASS: rejects array `['active']`; valid scalar remains accepted; parser detaches snapshots and migrations remain explicit |
| Save accounting / domain unit suite | PASS: `npx vitest run src/state/game.test.ts` →22 passed, exit0 |
| Fishing display culling | PASS static: geometry bounding sphere is recomputed after changing world-space line vertices, including a new island cast |
| Fishing display resource ownership | PASS: still owns/disposes its line/bobber geometry and materials; inventory remains in domain |
| Avatar roles, preloads and seats wiring | PASS static plus real rendered frame: mandatory preloads before create, explicit roles, read-only seat transforms, conversation boolean passed to corresponding NPC |
| NPC movement / conversation | PASS: bounded1.25m walk/idle phases query blocked/ground surface; active interaction stops locomotion and passes the conversation flag; model-specific greeting playback is reviewed in the separate V1 batch |
| Closer camera and lighting A/B switch | PASS static and checkpoint inspection:8.5m foot/14m boat radius, collision shortening and ground clearance; `?light=reference` changes only exposure and light intensities, no save/state or network changes |
| Subjective audio listening | NOT TESTED |
| Non-Chrome compatibility / full story voyage | NOT TESTED in this batch; separate integration/browser matrix required |

Browser runner commands actually executed: `node /tmp/review-stage1b-main.mjs` (targeted resilience/menu checks), `node /tmp/recheck-stage1b.mjs` (delayed-loading guard, lifecycle branch, actual Mira approach/dialogue). Temporary reproduction scripts are local reviewer artifacts; the exact manual actions and outcomes are recorded above. Initial direct-line walking attempts hit authored harbour obstacles/shore and were rerouted along the actual dock/path; this was not treated as a successful route. Final west-then-north physical approach succeeded.

No new P0/P1 findings in this batch. **READY FOR CREATOR REVIEW subject to final frozen-build visual evidence, the complete First Voyage regression, other independent subsystem reviews and final SHA verification.** The corrected Saltglass shadow frame has now been inspected; later source changes still require the final SHA check. No Stage2 authority.


## Additional camera/lighting check

The diagnostic `?light=reference` branch changes only the three intensities/exposure values; it does not change save data, game rules or runtime services. The matched `lighting-reference-harbour.png` and `after-harbour.png` frames were inspected: the moderated pass retains deeper blue doors, foliage and cast shadows, while the reference pass is visibly paler. This is a visual comparison, not a claim of creator approval. Scroll zoom uses a bounded0.55–1.5 multiplier on the same camera radius, ignores active panels, and keeps the existing occlusion/ground safeguards. Actual Mira close-up captures using the wheel are part of the final evidence pipeline, with their visual recheck still pending at this note.

## Immutable final source sign-off — 5ecd019

Reviewed implementation commit **`5ecd019efb9a0e32915d71ddfa47918bccc463cd`**. `git diff 5ecd019 -- src/main.ts src/audio/ambience.ts src/activities/fishing-view.ts src/state/persistence.ts src/state/game.test.ts` is empty. The committed five-file batch matches the corrected source reviewed above. Final formatting and the following small integration additions were inspected directly at this commit:

- Selected fog is now `#adc9cf`,180–520m; `?light=reference` uses `#aecfcd`,130–490m. These remain rendering-only A/B choices, alongside the already-reviewed exposure/light intensities. They do not mutate saves, roles or story.
- Scroll zoom remains bounded0.55–1.5, ignores panels and retains camera clearance checks.
- On loading an old **walking** checkpoint that no longer has ground or lies inside a new main-structure collider, boot uses the existing `RECOVER` action and an honest dock-relocation toast. The reducer preserves wallet, inventory, delivery, discoveries, story and settings by spreading the existing state and replacing only player/boat checkpoints. Boat-mode saves are not silently reset. Required asset loading still resolves before gameplay creation; corrupt/unsupported saves remain protected from overwriting.

`npx vitest run src/state/game.test.ts` at this commit: **22 passed, exit0**. No new blocking source findings. Final batch conclusion: **READY FOR CREATOR REVIEW**, subject to the complete final-build integration results and the creator's visual/gameplay approval. This source sign-off does not independently approve the reviewer's own models, approve Stage2, imply subjective audio listening, or claim a real BFCache cache hit. Final current-world/Mira screenshots and gameplay recording are separate evidence, regenerated by the coordinator from the frozen production bundle.
