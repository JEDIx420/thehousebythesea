# Independent visual and functional review — Issue #4

**Final verification:** helper `71902b3`, unchanged original BY application, native **6/6 PASS in2.0 min** and software **6/6 PASS in4.2 min**. No experimental graphics/physics change ships. Hosted CI remains a separate pending outcome.

Reviewed application: `5ecd019efb9a0e32915d71ddfa47918bccc463cd`; final harness correction: `5a55a3ec8a6462f56ab5a0d820823e04540fa805`. Tested bundle `index-BYtek1mE.js`, SHA-256 `27c91750a9e80e55c7e0665a516f544998b2985763463891a387c1a64a464706`. An independent git diff of application/config/assets/tools/test inputs against final HEAD returned exit 0. Reviewer owns movement/test plumbing, **not the replacement models, environment, camera or lighting implementation**. Movement fixes received a separate state-owner review.

## Art review

Inspected actual matched `before-*` / `after-*` controllable-game frames, the three additional Mira views and the lighting A/B. No catalogue thumbnail or generated illustration was used to approve the gameplay look.

| View | Independent observation | Result |
| --- | --- | --- |
| Havenport arrival | Real boardwalk, ropes, bollards, working-harbour props and cream/blue coastal buildings replace the exposed plank/blockout composition and oversized sign. Human scale and closer camera are readable. Café furniture and planting form recognisable activity clusters. | PASS for creator review |
| Near-camera characters | Rowan has articulated human proportions and clothing. Creator-selected Mira Family Traveller has a visible adult face, hair, outfit and sketchbook, rather than an anonymous primitive stand-in. Front and three-quarter captures clearly show her selected appearance. | PASS for creator review |
| Sailing / harbour boat | The detailed caique has a distinct cabin, hull trim, sail, ropes and deck. Its silhouette fits the working coastal setting and reads clearly from the lower follow camera. Old rectangular wake cards are gone. | PASS for creator review |
| Docking | Imported deck and shoreline composition agree visually with the landing route. Boat/land transition remains in the same playable world. The added mandatory-boardwalk guard prevents a differently sized fallback mesh from masquerading as the same collision surface. | PASS, also exercised by functional tests |
| Saltglass | Smaller fishing settlement, green headland and stone arch distinguish it from Havenport's café/harbour frontage. Paths lead toward an identifiable landmark rather than an empty second island. | PASS for creator review |
| Scenic future home | Initial review found an obstructing cypress and empty foreground (P2). The corrective frame has an open horizon, readable plot notice and appropriately placed seating/planting, without adding house construction. | P2 CLOSED after recapture |
| Mira walking | Initial close framing cropped the feet. Recaptured `after-mira-walking.png` shows her full body in a stepping pose. Independent binary inspection of the actual 892,448-byte GLB found eight skins, 31 joints per skin and Idle/Walk/Run clips, including named Head/RightArm/RightForeArm bones used by runtime animation. | Evidence gap CLOSED |
| Light / readability | Chosen lighting retains stronger shadow and midtone separation than the pale reference lighting. The cream UI remains legible against both land and dark water. Mood is a calm stylised late afternoon, not a photoreal sunset. | PASS for creator review |

**Remaining P3:** shoreline foam forms conspicuously regular parallel bands in some views. The new sea-depth colour and softer wake improve the old result, but less regular shoreline foam would be a reasonable creator-requested polish follow-up within Stage 1. Asset choice, outfit attractiveness and the overall art style remain the creator's judgement.

## Actual play clip

Independently probed `sail-dock-walk-interact.webm`: **31.920 seconds, 1280 × 720, 25 FPS**. Inspected decoded actual frames at 2, 8, 20 and 30 seconds: approach aboard the caique; tied-up player on the pier; walking NPC/player and delivery payout changing the wallet from 25 to 145; boat still present at the dock. The clip begins from an isolated mid-voyage save fixture, as documented by its owner; it is not claimed as a complete fresh-start campaign recording. The full start-to-return route is tested separately below.

## Functional regression

Command: `npm run test:e2e -- --output=test-results/visual-hardware-corrected`.

**PASS: 6 tests, 2.1 minutes, exit 0.** Native headless Chrome 158 on Apple M4 / Mac16,12 arm64, CSS viewport 1440 × 900, render scale 1.

- Title/credits Escape, skippable memory, modal keyboard range input, pause/settings and safe recovery.
- Unsupported-save preservation through actual fallback play/autosave.
- Optional-decoration failures permit real walking; all-critical-model failure shows an honest retry error; failure of only the mandatory boardwalk also errors while other models remain healthy.
- Full real-input First Voyage: parcel accepted; selected Mira invited; boat boarded, steered and docked; Saltglass walked; delivery paid exactly once; both fish caught, cancellation retried, sale brings wallet to 195; landmark visited; boat reboarded and return sailed; shared Mira memory completed; home plot, fund and journal opened; save/reload restores wallet/job/outing/home/checkpoint; credits count matches the verified manifest and licences; zero page errors.

The corrected route uses the visible inland junctions instead of attempting the new cove's water edge. Fresh fishing casts explicitly show Watching the float before their own bite, preventing the previous cast's one-frame-old hint from being mistaken for a new bite. These are test synchronisation/path corrections, not game-state manipulation, relaxed payouts or skipped assertions. Failed attempts and their causes remain in `failed-cove-edge-regression.log` and `failed-fishing-stale-hint.log`.

Evidence: `full-regression.log`, nine `regression-*.png` files and `regression-metrics.json` under `docs/evidence/visual-reset/`. Full test video/trace artifacts remain local under ignored `test-results/visual-hardware-corrected/`. The original nine pre-reset evidence images and metrics were restored after copying the new results.

## Desktop measurements

Resource Timing at the first harbour snapshot reported **9,030,571 transferred resource bytes**, excluding the navigation document itself. This includes the selected detailed models; the old sub-megabyte budget is not represented as met. Sampled JavaScript heap peaked at **84.9 MiB** across these snapshots, not including GPU/process memory.

| Scene | Frame p50 / p95 | Draw calls | Triangles |
| --- | --- | --- | --- |
| Havenport | 16.7 / 16.8 ms | 124 | 360,222 |
| Sailing | 16.7 / 16.7 ms | 155 | 385,700 |
| Landing | 16.7 / 16.7 ms | 95 | 280,595 |

These are measured samples on the M4 browser, not a promise for all devices. Firefox/Safari were not independently exercised. The automatic direct route takes around two minutes; human leisurely 10–15-minute pacing still needs the creator's playtest.

## Gate

**READY FOR CREATOR VISUAL AND GAMEPLAY REVIEW**, with no remaining demonstrated P0/P1 from this reviewed local build. This is an independent technical/art assessment, **not the creator's creative approval**. The P3 foam note is disclosed for feedback. Remote CI status must be read separately from the actual current Actions run; the old Linux failures are not relabelled as passes. The additional full software-renderer suite passed **6/6 in 7.2 minutes**, with all assertions retained; see `docs/review-ci.md` for honest lower-resolution/software performance and the separate remote-CI gate.

**No Stage 2. Stop for the creator's explicit approval.**

Final frozen chain: app `5ecd019efb9a0e32915d71ddfa47918bccc463cd` → fresh-cast harness `5a55a3ec8a6462f56ab5a0d820823e04540fa805` → CI capture configuration `20e6c416ed8905843f2f9faaae287f37255e54fd` → CI artifact destination `0a9519881de2b1a7a2d358c15d4a5fc95e9759d2`. No later gameplay/visual code change is included in this review. Hosted run `46014107025` for `0a95198` was still pending/in progress when the reviewer finished; it is **not claimed passing** here.


Final helper verification: `71902b31a084708ba416bd380c5c6f79a5a1b8c9` preserves the original BY app/visuals and passes all six cases in2.0 min native /4.2 min software. The final helper keeps real W held through forward feedback, releases it before turning/arrival/failure, and retains all existing assertions. Native screenshots/metrics are in `hardware-continuous-*`; software screenshots/metrics are in `software-continuous-*` under the visual-reset evidence directory. All experimental graphics and input-timeline application changes were rejected and are not shipped. See the final section of `docs/review-ci.md` for precise commands and the independently pending hosted-CI gate. Art judgement and the disclosed P3 foam note are unchanged.
