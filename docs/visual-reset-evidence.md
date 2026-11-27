# Stage 1B — visual and gameplay review build

Issue #4 corrective scope only. **WAITING FOR CREATOR VISUAL AND GAMEPLAY APPROVAL. No Stage 2.**

[Corrective PR #5](https://github.com/JEDIx420/thehousebythesea/pull/5) targets `feat/first-voyage`, preserving #3 unmerged. Implementation `5ecd019efb9a0e32915d71ddfa47918bccc463cd`; follow-up `5a55a3e` changes only fishing-test readiness checks. Frozen production bundle `index-BYtek1mE.js`, SHA256 `27c91750a9e80e55c7e0665a516f544998b2985763463891a387c1a64a464706`.

## Actual game comparisons

These are real controllable-game frames using isolated versioned save checkpoints, not model-catalogue images or mockups. Each pair uses the same world position and orientation; follow-camera distance/pitch and environment are deliberately improved. [Reproduction tool](../tools/capture-visual-baseline.mjs) documents all coordinates. User saves were not touched.

| View | Before | After |
| --- | --- | --- |
| Harbour arrival | [before](evidence/visual-reset/before-harbour.png) | [after](evidence/visual-reset/after-harbour.png) |
| Near-camera people | [before](evidence/visual-reset/before-characters.png) | [after](evidence/visual-reset/after-characters.png) |
| Sailing | [before](evidence/visual-reset/before-sailing.png) | [after](evidence/visual-reset/after-sailing.png) |
| Docking / landing | [before](evidence/visual-reset/before-docking.png) | [after](evidence/visual-reset/after-docking.png) |
| Saltglass village | [before](evidence/visual-reset/before-saltglass.png) | [after](evidence/visual-reset/after-saltglass.png) |
| Scenic future-home site | [before](evidence/visual-reset/before-home.png) | [after](evidence/visual-reset/after-home.png) |

[Integrated harbour and caique checkpoint](evidence/visual-reset/checkpoint-harbour-boat.png) was the V0 checkpoint before final shoreline/placement cleanup. [Final harbour and vessel](evidence/visual-reset/after-harbour-boat.png) supersedes it. Failed early frames remain as history and are not labelled final acceptance proof.

## Creator-selected Mira

Uses actual Polyfork **Family Traveller (`9af47e`)**, preserving original face, hair, outfit palette and adult scale. The earlier Quaternius heroine audition is superseded; that CC0 woman is now Nessa only. Mira has real Idle/Walk/Run clips and a small disclosed authored greeting over existing bones; no embedded interaction clip is falsely claimed.

- [Front close-up](evidence/visual-reset/after-mira-front.png)
- [Three-quarter close-up](evidence/visual-reset/after-mira-three-quarter.png)
- [Walking / full body](evidence/visual-reset/after-mira-walking.png)

[Asset audition](asset-audition.md) and [independent rig/model review](review-visual-models.md) record dimensions, skins, bones, exact sources and licences.

## Light, terrain and actual play

[Reference intensities/fog](evidence/visual-reset/lighting-reference-harbour.png) versus [selected moderated lighting](evidence/visual-reset/after-harbour.png), using the same assets/view. Selected exposure0.95, hemisphere1.35, directional2.1; reference1.15/2.7/3.4. Selected fog180–520m versus reference130–490m. The moving shadow target now covers both islands.

[Terrain revisit and environment report](environment-reset.md) includes actual ProceduralTerrains live/export/authored comparison, measured CPU-sample differences and the retained export silhouette failure. Production uses exact authored triangles and actual GLB deck queries, not the failed export or approximate GPU sampler.

[31.92-second actual gameplay recording](evidence/visual-reset/sail-dock-walk-interact.webm): sail → dock → walk → interact → deliver. Started from an explicitly isolated mid-voyage save fixture, then used ordinary keyboard/menu input; no scripted scene animation, teleport or direct reward action during the recording. Wallet145 and completed parcel asserted. [Verification log](evidence/visual-reset/clip-verification.log). `ffprobe` measured31.92s. The full start-to-resume route is separately tested below.

## Verification and independent review

- `npm run typecheck`: PASS.
- `npm test`: PASS,33 tests (22 domain/save,8 movement,3 exact terrain).
- `npm run build`: PASS. JavaScript702.02KB/185.90KB gzip; standard Three.js >500KB chunk warning disclosed.
- `node tools/environment-pier-audit.mjs`: PASS,18 rays and exact imported-deck footprint.
- `node tools/inspect-assets.mjs`: PASS;35 locally bundled GLBs match35 credited manifest records. Rejected/reference auditions are authoring-only and separately attributed.
- Full hardware-browser regression: **6/6 PASS,2.1 minutes**, real-input two-island route, delivery once, both fish, cancellation/sale195coins, Mira/home flags, save/reload/checkpoints and credits. Additional cases cover title/settings/native keyboard, future-save protection, optional decoration fallback, critical-model errors, loading lock and mandatory audited deck. [Exact log](evidence/visual-reset/full-regression.log), [scene/load/heap measurements](evidence/visual-reset/regression-metrics.json), and `regression-*.png`.
- **Software Chromium full regression: 6/6 PASS, exit 0, 7.2 minutes** (full route 6.8 minutes), using actual SwiftShader Chromium 159 at half render scale, unchanged CSS viewport and the same gameplay assertions. See [software log](evidence/visual-reset/software-regression.log) and [software measurements](evidence/visual-reset/software-metrics.json). CI capture profile retains actions/sources and failure/checkpoint images without per-action canvas snapshots or video encoding; hardware videos and final visual evidence remain full resolution. Hosted Actions is tracked independently in [PR #5 checks](https://github.com/JEDIx420/thehousebythesea/pull/5/checks); local passes do not imply a hosted pass. On Apple M4 / Chrome158 at1440×900 and full render scale, nine route snapshots measured median16.7ms and p9516.7–16.8ms,76–155draw calls, JS heap62.1–89.1MB and initial resource transfer9,030,571bytes. These are this hardware’s observations, not guarantees for all laptops. A focused traced SwiftShader approach already passed; see [CI investigation](review-ci.md).

Final test-input follow-up `71902b3`: **hardware 6/6 PASS in2.0 minutes (1.8-minute complete route)** and **software 6/6 PASS in4.2 minutes (3.8-minute complete route)**, using continuous real W input and the same frozen game/graphics/assertions. [Final hardware log](evidence/visual-reset/hardware-continuous-regression.log), [hardware measurements](evidence/visual-reset/hardware-continuous-metrics.json), [final software log](evidence/visual-reset/software-continuous-regression.log), [measurements](evidence/visual-reset/software-continuous-metrics.json), and `software-continuous-*.png` distinguish this run from the earlier pulsed-input7.2-minute pass. The graphics experiments were rejected; no reduced graphics profile ships.

Hosted run [46019041111](https://github.com/JEDIx420/thehousebythesea/actions/runs/46019041111) with the final real-input helper still **failed its600-second route budget**, after Saltglass delivery/fishing/sale/landmark, while sailing back at(76.43,−131.62). Its [raw failure log](evidence/visual-reset/linux-continuous-600s-failure.log) is retained. Independent timing review found a monotonic stationary return turn took110.386 seconds under the hosted renderer. CI now has a measured, finite900-second route budget; local240-second timeout, navigation limits and all assertions remain. The twenty-minute job accommodates that budget. See current [PR checks](https://github.com/JEDIx420/thehousebythesea/pull/5/checks) for the actual hosted result; this budget adjustment alone is not a passing result.

Independent batches (five files or coherent systems): [environment](review-visual-world.md), [models/rigs](review-visual-models.md), [app/state/UI](review-stage1b-app.md), [test harness](review-visual-ci.md), [visual evidence](review-stage1b-art.md). Reviewers distinguish their own implementation from independent checks. No passing tests are treated as creator art approval.

## Failures repaired and remaining limits

Actions investigation (historical failures): trace snapshots executed while separate keyboard down/timer/up calls held input, causing repeated heading overshoot. Atomic real key presses fix the observed issue. New cove required following authored inland paths instead of stale water-edge waypoints. Fishing test now requires fresh waiting feedback before its own bite, avoiding the previous cast's one-frame stale hint. The final helper commit `71902b3` also keeps real W held through forward feedback, releasing it before turns and on every exit. This avoids spending slow protocol calls stationary or repeatedly decelerating the boat. Independent source review and the focused software sea route pass; full-run evidence is recorded separately in [CI review](review-ci.md). No graphics or game-clock change ships. All route/assertion checks remain; no gameplay bypass. Failed logs/traces are retained and not called passing.

Main structures/ground/shore collide; decorative furniture/foliage remain non-colliding. Software rasterisation is functional proof, not a 30 FPS claim: measured sea/landing median about 83.3 ms and p95 about 116.7 ms. Native hardware observations above are separate. Minor repeated paving/shore-foam patterns and composition are creator taste feedback points. Firefox/Safari and subjective audio listening remain untested; human10–15minute leisurely pacing is not established by the faster automated route. No whole-world expansion, new currencies or house construction.

The Polyfork key was used only by local tooling against official endpoints via an authorization header. It is outside the repository, absent from runtime/browser code, and a byte scan of source/assets/evidence/build passed without exposing its value. No account details, signed tokens or key values are published.

## Play and approval

Local built preview: http://localhost:4181/thehousebythesea/ . README describes reproducible startup. GitHub Pages remains static and main-only; neither PR has been merged and no public deployed game is claimed. Please play and approve this visual/gameplay baseline or request Stage 1 corrections. **No Stage 2 until explicit approval.**
