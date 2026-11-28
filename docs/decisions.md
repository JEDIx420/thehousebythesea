# Decision record and risk register

Decisions here state choices that are *actually made*, and identify hypotheses that remain to be proved. New architectural decisions append dated entries, rationale, alternatives, impact and reversal path.

## Confirmed product decisions (27 Nov 2026)
- **D-001:** Browser-only first release; GitHub Pages, no Cloudflare/backend/multiplayer. Reason: keep cost and implementation simple.
- **D-002:** Persistent 12-island bounded archipelago, rather than an endless random ocean. Reason: quality, liveliness and authored story.
- **D-003:** Core story is boy grows up dreaming of the sea, buys a boat, works, woos a woman, and saves for a shared beachfront home. No fog conspiracy as main plot.
- **D-004:** Single personal cottage build, not village construction. Fishing/deliveries/exploration/relationship are primary loops.
- **D-005:** Only Stage 0 + Stage 1 authorised. First experience must be played and explicitly approved before expanding.
- **D-006:** Three.js + Vite + TypeScript are the proposed core; selected free Polyfork GLBs preferred for assets, respecting their actual licences.
- **D-007 (candidate, not confirmed integration):** ProceduralTerrains for island authoring; live runtime versus authored/exported terrain is **OPEN** pending Stage 0 measurement.

## Technical risks

| Risk | Why it matters | Mitigation / owner | Status |
| --- | --- | --- | --- |
| Terrain GPU/CPU collision mismatch | Player falls through ground / wrong slope height | Stage 0 owner tests/export collider alignment and disembark | OPEN |
| Rendering incompatibility / GPU cost | Water, clouds and game scene may not blend or perform | Compare runtime versus baked mesh; use simpler water as fallback | OPEN |
| Polyfork animation uncertainty | Characters look inert in a lively harbour | Audit rigs/clips per model; use valid free animations/procedural fallback | OPEN |
| GitHub Pages path/size or settings | Blank screen, 404 assets, no demo | Vite /thehousebythesea/ base + built preview; owner enables Pages Actions | OPEN |
| Softlocks at dock / out of bounds | Player stranded without reload | Validated boarding points, safe checkpoint / recover option | OPEN |
| Save schema and repeatable payment | Lost money / duplicate economy rewards | Versioned save data, atomic/idempotent job completion, unit/browser tests | OPEN |
| Visual scope creep | Twelve empty islands or generic cubes | Two-island playable quality gate, authored environment checklist | OPEN |
| Licence attribution omissions | Unacceptable release liability | Verify source+license for each shipped asset; credits in game | OPEN |

## Open design decisions for creator review
- Protagonist and woman's final names and visual appearances (Rowan and Mira are placeholders).
- Art style target as tested in the browser (stylised/cozy, not fixed to any particular reference).
- Exact home plot locations and money balance after real playtesting.
- Mobile controls and accessibility extensions after the first desktop milestone.

## Change procedure
Write: ID/date/status; motivation; observed evidence; decision; rejected alternatives; consequence; how to reverse. For Stage 0 terrain choice include screenshots/metrics and the version tested. No tech decision is "done" merely because a library appeared in an earlier conversation.

## D-008 — 2026-11-28 — tested pixel renderer / foundation

PR #6 supersedes D-006/D-007's rendering proposal. Use pinned **Phaser3.90.0 (MIT), TypeScript5.9.3 and Vite7.3.8**, Node22, for this separate implementation branch. A real production build loaded a199-frame atlas in Chrome158/WebGL at640×360 logical /1440×900 browser viewport, integer2× pixels. Golden-v3's short107-frame raw render-callback sample measured p50≈16.70ms, p95≈16.80ms, zero>50ms stalls and zero page errors. Earlier v1/v2 JSONs record Phaser-smoothed update deltas and are not raw frame-time evidence. This establishes renderer feasibility, not sustained performance or complete gameplay. Four projection/depth/input/contour unit tests pass; asset checks prove byte reproducibility. Screenshots/JSON live in docs/evidence/pixel/.

Choose stable Phaser3's tested sprite/atlas/camera API instead of an unmeasured engine rewrite. Small tested world projection uses source-world JSON factors4/2 and logical x/z; no 3D physics or free orbit is claimed. Vite7.2.2 was rejected during initial dependency audit;7.3.8 resolves the reported development-server advisories. Final install audit reported zero vulnerabilities. Phaser's1.22MB JavaScript /≈336KB gzip produces the standard >500KB chunk warning, retained honestly.

The original recipes and palette are versioned; a small pinned MIT PixelFX Painter/ring subset generates transparent ripple frames offline. No runtime asset generation, model/API calls, gallery fonts, installer scripts or credentials. Original source/art is MIT; third-party notices remain separate. PixelFX is credited for its effect utility and contact-sheet labelling, not for original characters/buildings. See pixel-tool-audit.md for the exact pin, bounded adapter and rejected model-routing workflows.

First art sample v1 was **NO-GO**: water repetition, noisy ground, small hull and character proportions. V2 fixes those; independent native browser review passed walking/boarding/steering/stopping/disembarking and accepted the art direction. V3 corrects the final lamp placement and raw timing; final image placement is independently verified and the golden sample is GO for First Voyage production. No visual approval is implied by this decision. The prior Three.js implementations remain intact on their separate branches/PRs; nothing is deleted or merged. Reversal is a separate reviewed renderer decision, keeping state/story/assets intact.


## D-009 — 2026-11-28 — First Voyage world, preservation and review deployment

Implement only the two authored islands as a continuous projected world, preserving stable story/economy IDs,25 starting coins,120 once-only parcel payment,18/32 fish values and500 home target/150 first milestone. Original schema0/1 saves remain untouched; a separate schema2 database and explicit COPY import prevent old3D coordinates becoming new pixel positions. Migration resets positions to safe docks and retains progress. Storage deadlines and protected temporary play are required, rather than silently replacing unknown/corrupt saves.

Golden-v3 precedes town production. Extend the same source art to280 frames and named Havenport/Saltglass landmarks; use original authored sprite loops and a bounded offline MIT PixelFX helper, not remote image models. Mira's paid illustration work is her own ambition; the optional crossing follows a physical walk/board/unboard route, without affection purchases.

Use an exact-branch GitHub Pages review deployment with root landing and `/preview/pixel/` game. GitHub Pages publishes a whole site artifact, so the preview package deliberately includes both, rather than assuming a partial path upload preserves the root. The root was independently checked404 before publishing; main remains unchanged. Environment branch policy adds only the implementation branch alongside main. GitHub Actions must pass real browser checks before deploying, and a live browser must verify the public URL before it is advertised. No native Pages alpha preview feature or alternate provider.

Browser integration exposed queued key replays that could board and immediately disembark or replay stale direction keys. Use named native window keyboard listeners (removed on disposal), preserving modal locks, native menus, blur clear and repeat guards. This practical input fix is verified through the normal keyboard voyage, not console state changes. Also isolate Vitest discovery to pure source tests so Playwright specs cannot be collected by the wrong runner. Evidence retains the failed setup/route attempts rather than describing them as passes.

The remaining ten islands, construction and later romance campaign stay locked. Independent technical review authorizes presenting this checkpoint only; it is not creator visual/gameplay approval.


## D-010 — 2026-11-28 — measured CI and live checkpoint exit

The default hosted runner advanced to unsupported Ubuntu26.04, so pin Ubuntu24.04 for Playwright1.56.1. Do not remove real WebGL/gameplay checks. A fishing integration test then exposed an evidence-capture race: after detecting a real bite it awaited a screenshot plus readbacks before pressing Space. Move the screenshot to the waiting phase and issue Space immediately after observed bite, retaining the2.1s game window and both-species reward assertions. CI continuous video capture is unnecessary software-renderer overhead: preserve the actual native40s recording, all checkpoint PNGs/metrics, HTML report and failure traces. Avoid duplicate raw/report video uploads. Independent source review accepts both corrections; hosted run46119325130 passes41 units/8 browser cases and deploys the complete site. Public8-case suite also passes. No game/economy/story rule changed to make a test pass.

The public project root and nested game are200 and independently browser-verified. An explicit inline empty favicon suppresses Chrome's default site-root `/favicon.ico`404 in both landing and game HTML, without adding a runtime service/art asset or changing the game bundle. Final source/check status and public verification are attached to PR #7. The checkpoint is GO for creator review only; record WAITING FOR CREATOR APPROVAL, stop after the First Voyage, and leave main/earlier work unmerged. Relaxed human10–15-minute pacing, animation/audio feel and the art direction remain creator judgements rather than inferred automated approvals.


## D-011 — P1.5 prototype, preserve before re-authoring geography

Creator authorised polish on existingPR7 via90693e3. Fresh same-resolution screenshots and actual CDP DOM+WebAudio before recording captured first. Usable baseline area H7025.25/S4309.1875. Adopt worldVersionpixel-first-voyage-v2 while keeping schema2: validate exact historical scalar version, migrate real saved fixture progress, preserve valid coordinates, canonicalize tagged berths and repair invalid components, retain originalworldv1 snapshot once atomically on first commit, protect future/corrupt competing writes. Existingvolume remains master; new mixer/text defaults added without resetting progress. Independent findings on version coercion, backup overwriting and berth coherence were fixed;51 units pass.

A golden sample preceded mass production: originalMira expression busts, compact HUD, asymmetric cafe, genuinely walkable18px garden and an original96sAABA acoustic-style score. Independent art/height/source gates GO after fixing path/standing clearance and splitting raised tops/front walls into actual depth overlays. Source low-actor occlusion and raised-foot ordering reproduced then closed. Actual browser sample has no page errors, decoded music96s and composited audiovisual evidence. Human subjective music listening remains unverified, explicitly reserved for creator review. Original fixtures/prototype/raw results are retained. NoStage2.


## D-012 — P1.5 complete-world tuning and preservation

Re-author the two existing islands around working harbour/market/garden/meadow/quietshore and weathered cove/tidepool/shellcliff districts. Shared0/24/28px surfaces and ramps drive collision, standing, render heights, picking and top/wall occlusion. Dynamic bake extents replace the old fixedground image. Sample radius0.7 at0.25unit centers: Havenport20002.625 vs7025.25 (2.847×), Saltglass10605.375 vs4309.1875 (2.461×). Painted center routes and interaction targets remain connected; the continuous channel moves Saltglass to−340. Original IDs and25/120/18/32/500 economy do not change.

Migration precedes geography: preserve valid old walking/midsea points, translate Saltglass local points, canonicalize tagged berths and repair incoherent components. Upgrade only the separate pixel IndexedDB to2 so old code cannot write v1 world coordinates back. First-only `before-world-v2` backup and new snapshot commit atomically. Exact real historical fixtures, a true pre-app DB1 upgrade and injected commit failure cover preservation/rollback, alongside unchanged legacy COPY/future/corrupt tests.

Movement stays transient:6.6units/s,110ms acceleration/88ms stopping,12 distance-linked walk poses, four independently phased idle poses, seated/fishing poses. Safe pier animation only follows40 validated ground samples. A reviewer found its first endpoint was beyond the pier; use the shared pier maxX margin, guard repeated interaction/fishing and clear it on recovery. Camera and audio tuning are separate from the economy/save reducer.

Original96s/32bar AABA music is synthesized offline from a committed score/seed, compressed to three lazy MP3 files totaling2.306MB. Director ownership/cooldowns/decode deadlines prevent duplicated/fading orphan sources and retry storms; settings preserve old master volume and add independent music/ambience/SFX. A real music-bus meter and unwarped96s browser loop test supplement audible gameplay capture. Audio-node tests are not a claim of human listening or creator aesthetic approval.

Stable two-sided portraits and a dedicated dialogue strip preserve interaction semantics while native key release/repeat guards prevent accidental boarding/casting/reward replay. All34 required portrait frames must be distinct; a genuine happy-blink duplicate was found and fixed without weakening validation. Independent batches have at most five coherent systems; unresolved findings block the relevant gate. Stop at WAITING FOR CREATOR PLAYTEST after verified P1.5 deployment; no Stage2.
