# P1.5 — actual First Voyage polish evidence

The creator's P1.5 plan remains the acceptance contract. Only Havenport and Saltglass Bay are playable. The previous P1, rejected samples and failed/interrupted runs are retained as history. Source preparation, automated checks and independent review never constitute creator approval.

## Actual comparisons

All main native stills are1440×900 CSS,640×360 logical at2×, Chrome158.0.8127.37 on Apple M4/macOS26.5.2. These are the actual Phaser/DOM game, not mockups.

| Before P1 | P1.5 after |
| --- | --- |
| [Starting harbour](before/harbour.png) | [Final harbour / actor-safe prompt](after/26-final-harbour-prompt.png) |
| [Generic central dialogue](before/ellis-dialogue.png) | [Mira's expressive exchange](after/27-final-mira-choices.png), [Ellis/Rowan](after/02-ellis-rowan-happy.png), [Nessa](after/13-nessa-choices.png) |
| [Original movement + surf recording](before/movement-surf.webm) | [Same-control movement + actual music](after/movement-after.webm) |

Districts: [cafe/market](after/03-cafe-square.png), [garden street](after/05-garden-street.png), [hill foot](after/06-hill-foot.png), [walkable24px meadow/beacon](after/07-lighthouse-meadow.png), [Saltglass quay](after/12-saltglass-quay.png), [tide pools](after/15-tide-pools.png), [sheltered cove](after/16-sheltered-cove.png), [walkable28px shell cliffs](after/17-shell-cliff.png), [quiet home shore](after/21-quiet-home-shore.png). The scenic home notice remains a First Voyage teaser, not construction or Stage2.

HUD/menus: [fishing pose and meter](after/14-fishing.png), [Mira return choices](after/19-mira-return-choices.png), [final nautical chart](after/30-final-chart.png), [journal](after/24-journal.png), [independent audio settings](after/29-audio-settings.png), [1280×720](after/28-dialogue-1280x720.png), [1024×720](after/28-dialogue-1024x720.png), [840×640](after/28-dialogue-840x640.png). Main route's old chart23 and harbour01 remain evidence of the review findings; final26/30 supersede their prompt/focus layout. The initially reported cove objective clipping was withdrawn after reopening the exact intact image.

## Real sound and motion

- [88.2s continuous town → sea → Saltglass arrival → Nessa dialogue](after/audible-town-sea-arrival-dialogue.webm): actual CDP-composited browser20fps plus live WebAudio, VP9+Opus. Includes real track transitions, surf and interaction sound; no audio laid over a silent capture.
- [Mira expressions with actual game music](after/mira-expressions-audible.webm): final speaker sides, typewriter, emotions and native choices.
- [Movement comparison samples](after/movement.json), [baseline samples](before/baseline.json), [native checkpoints](after/native-checkpoints.json), [final viewport/audio/network smoke](after/final-smoke.json).
- Original score **The Afternoon We Kept**, authored for this project/MIT: [source score](../../../assets/source/music-score.json), [synthesizer](../../../tools/generate-music.mjs), [track hashes/provenance](../../../public/audio/manifest.json). Three96s/32bar AABA arrangements,64kbps MP3,2,306,010bytes total. All three rebuilt locally without file changes; [rebuild log](music-rebuild.log). Compressed bytes can vary across FFmpeg builds; the fixed score/seed/PCM source is retained.

Recordings are made by `tools/record-browser.mjs`; its init hook exists only in evidence tooling. Raw separate audio/video streams are ignored; final muxed files are committed. Initial master0.35 preserves prior settings; independent music/ambience/SFX are available in-game. Actual crossing levels mean−35.6dBFS/peak−17.7dBFS show a quiet non-silent mix with headroom. These measurements and source/decoded-loop reviews are **not human listening approval**. Creator listening must judge melody, timbre, balance, loop seam and comfort; tools available here do not provide perceptual hearing.

## Geography and preserved progress

[Annotated district/route map](district-map.svg) · [CPU area/connectivity/height audit](world-audit.json). Reproduce with `node tools/audit-p15-world.mjs`, using immutable90693e3 baseline and the recorded world JSON hash.0.25unit center samples, radius0.7, obstacle and ledge/standing clearance included:

| Island | Old usable area | P1.5 usable area | Ratio |
| --- | ---: | ---: | ---: |
| Havenport |7025.25|20002.625|2.847×|
| Saltglass |4309.1875|10605.375|2.461×|

Both plateaus and all interaction targets are connected from the pier; all painted center routes have zero blocked samples. Ramp-only cliff transitions and upper/lower occlusion/picking have regression tests. Saltglass moves from−220 to−340; central navigation supplies all berths/safe/companion points.

[Real historical fixtures](../../../tests/fixtures/README.md) include walking, midsea, Saltglass dock and completed delivery/outing. Schema2/world-v1→v2 migration preserves money/fish/story/jobs/discoveries/settings; valid old Saltglass55,−220 becomes55,−340, valid midsea remains, tagged berths canonicalize and invalid checkpoints repair coherently. Originalv1 raw snapshot is backed up once atomically with the new save. A real pre-app IndexedDB1→2 upgrade and injected write failure assert old bytes remain and backup rolls back too. Existing corruption/future protection, original3D explicit COPY and failed-import durability tests are retained.

## Executed checks and review

- [Prior integrated16-case PASS](local-16-browser-pass.log) retains every original8 scenario and adds music/migration/portrait/height checks. [First expanded route failure](failed-first-expanded-route.log) led to a real road/tree correction. [Interrupted superseded run](interrupted-for-chart-review.log) was intentionally stopped for the review's chart correction, not counted as a pass.
- [9½-minute relaxed agent playthrough](native-relaxed-play-pass.log):569.001s real time, watched30s memory, read dialogue, explored both towns/cliffs, worked/fished, returned with Mira, inspected the home notice, journal/chart and exact saved reload. Final wallet163 reflects one18-coin fish plus the120 parcel from25; the separate full regression catches/sells both species and asserts195. This is agent-driven reading/exploration, **not measured human playtime**.
- Clean `npm ci --ignore-scripts`:45 packages audited, zero reported vulnerabilities. Exact art rebuild/check:541 frames, all12walk/4idle/2sit/2fish poses distinct as applicable,34 distinct portrait frames, anchors/padding/alpha/4096limit. Typecheck, production build,60 unit cases pass. Standard Phaser chunk-size warning retained.
- [Full17-case local regression PASS](local-17-browser-pass.log),6.8min, including all original8 scenarios. The final narrow-name CSS correction was then checked with [strengthened repeated-key/narrow/title tests](narrow-final-pass.log),2/2PASS, and [three-viewport native evidence](final-native-pass.log),PASS/zero page errors. The earlier false resize assertion mixed two frames; synchronized strict bounds retain the actual clipping check. A local blob origin classification was corrected to compare canonical origins; both diagnostic failures are retained.
- Real nested static Pages package: [four browser cases PASS](nested-browser-pass.log), [native layout/music-bus/recording smoke PASS](nested-native-pass.log), [nested evidence](nested/final-smoke.json). All three MP3 assets returned200/audio-mpeg and match source-manifestSHA256. This verifies the nested build, not a public deployment claim.

Independent batches≤5 files/coherent systems: [world/controller/UI](../../review-p15-world.md), [state/audio/tests](../../review-p15-state.md), [art/actual screenshots](../../review-p15-art.md). Fixed findings include version coercion, atomic first-only backup, preserve valid Saltglass position, true DB1 upgrade coverage, audio timeout/retry/source ownership, happy/blink duplicates, idle facing, Mira boarding distance, valid pier endpoint/replay/recovery/fresh throttle, NPC-overlapping prompt and chart autofocus clipping. Subjective art/music/game feel stays the creator's gate.

## Final release regression and hosted diagnosis

[All18 local cases PASS](local-18-browser-pass.log),7.0min, include the new real warm-cache/save upgrade plus every original scenario. [Final195-wallet raw checkpoint states](release-local/gameplay-metrics.json) and [home-fund screenshot](release-local/07-home-fund195.png) retain the full two-fish/job/outing result.

Hosted303 baseline: [PR success proof](hosted/303e1d8-pr-proof.json),60units/17cases9.8min; the separate push runner timed out the portrait/hill test at120s while its other16 cases/fullvoyage passed. It did not deploy. The old failing artifact491MB and Playwright's pinned source exposed continuous trace JPEG capture despite video being off. CI tracing now retains DOM/action/network/source diagnostics with explicit failure/checkpoint PNGs, while disabling continuous screencast screenshots; assertions and budgets are unchanged. [Actual retained diagnostic trace summary](trace-without-screencast.json), [selected regression PASS](trace-profile-pass.log):1.52MB,0JPEG,3510 DOM snapshots and3910 actions. This is a diagnostic policy change, not a claim of local speedup. The later18-case hosted push passed; remaining duplicate-runner driver failures are analyzed below.

## Returning-player cache regression

Actual Pages art/metadata headers have600s freshness. [Before-fix failure](cache-before-failure.log) and [actual error screenshot](cache-before-failure.png) reproduce a warm cached P1 atlas/metadata breaking the new loader. [Four targeted cache/fault cases PASS](cache-upgrade-pass.log) after a shared content-derived resource revision. The real HTTP fixture keeps old canonical metadata280 while loading coherent current541 frames; completed v1 save195 coins/story, walking, recovery and Mira portrait survive. No Playwright routing disables this cache. The18th case passes in the final [full local18 run](local-18-browser-pass.log); the hosted18-case push also passed (including the actual warm-cache case). [Latest versioned nested4 cases](release-nested-browser-pass.log) and [native layout/audio/network smoke](release-nested-native-pass.log) also PASS; [current nested proof](release-nested/final-smoke.json). Vite's normal JS/CSS fingerprinting and Pages architecture remain intact.

## Independent actual browser play

[Independent native browser results](independent-p15-browser.json), [first bounded driver record](independent-p15-first-driver.json), [dialogue](independent-p15-dialogue.png), [real raised meadow](independent-p15-terrace.png), [rejected cliff edge](independent-p15-edge.png), [actual fish](independent-p15-fishing.png). The reviewer used real input and read-only observations on the fingerprinted nested release. Corrected checks cover stop/modal/blur/diagonal movement, H24 up/edge/down0, expressive/narrow dialogue and chart focus, parcel/fish/cancel/catch, recovery and exact reload, with zero page errors. The first driver's boundary expectation was corrected to walk fully beyond the ramp; its failure is retained and is not counted as a product defect. Its immediate post-reload audio sample was unsettled, so no music-quality/output approval is inferred from that record.

## Verified public release and final harness checks

[Hosted push60 units/18 cases + deploy SUCCESS](hosted/7b42b7d-push-proof.json) · [actual public voyage PASS3.5min](live-voyage-pass.log) · [public headers and9 exact resource hashes](live/http-proof.json) · [ten actual public checkpoints/state/audio samples](live/gameplay-metrics.json). Public root/nested200, bundleCEY2Ra4G, resource revision00d3130eaac76f05, final195coins/outingComplete/homeSeen and exact reload. Havenport, sailing and Saltglass music buses are nonzero with no audio error. [Play P1.5](https://jedix420.github.io/thehousebythesea/preview/pixel/?p15=7b42b7d).

The duplicate7b42 PR runner still had four feedback-driver failures; [compact actual trace analysis](hosted/7b42b7d-pr-failure-analysis.json) separates them from the successful push/public game. Continuous screenshots were removed, but held input across slow readbacks could still orbit a waypoint. The corrected walker stops before near-goal observations and uses bounded trusted key chords, retaining the0.75goal/collision/budgets. [Focused cache/delayed-readback/portrait cases PASS3/3](precision-regression-pass.log), including250ms stale observations, strict arrivals, no drift and unchanged wallet. The19-case suite's latest result/artifacts are on [PR #7 checks](https://github.com/JEDIx420/thehousebythesea/pull/7/checks). Final production game bytes remain the publicly verified release; this refinement changes test infrastructure only. A local wrong-build-base diagnostic was stopped/rebuilt and retained as a setup failure, not a game defect.

## Reproduce

```sh
npm ci --ignore-scripts
npm run assets:build
npm run assets:check
npm run music:build  # optional regeneration, local FFmpeg/libmp3lame required
npm run music:check
npm run typecheck
npm test
npm run build
CI=1 npm run test:e2e
npm run preview -- --port 4190
# Native Chrome + local FFmpeg; real-time route ~9.5min:
npx playwright test -c tools/capture-p15.config.ts
node tools/analyse-p15-evidence.mjs
PIXEL_PAGES_PREVIEW=1 npm run build
node tools/package-pages.mjs
```

`PIXEL_TEST_BASE_URL` selects a real nested static/public base. No teleport/reward/time-warp hooks are used. Fault/migration fixtures seed only isolated disposable storage. [Measurements](measurements.json) keep before/after metrics, encoded payload/atlas size, clip codec/levels and limitations. Render intervals are overlapping rolling1200-sample windows;20fps capture cadence is not game FPS. Local transfer counters depend on cache/compression/server headers. Chrome/Chromium tested; Firefox/Safari/touch-only play are unclaimed.

Ordinary native render callbacks: p50 16.6–16.7ms, p95 16.9–18.5ms across42 overlapping checkpoints; heap15.6–28.9MB. Initial local transfer2,017,576bytes versus baseline799,003 (includes new music/art; cache/compression caveats apply). Atlas866,951bytes,2048×4096,32MiB decodedRGBA;541 frames. Measured conservative HUD coverage4.852%, including location/context bounds. See raw [measurements](measurements.json).

**WAITING FOR CREATOR PLAYTEST. Public runtime and independent reviews verified; latest19-case confirmation is linked through PR checks. Creator approval remains withheld; Stage2 locked.**
