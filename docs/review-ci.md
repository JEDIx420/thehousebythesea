# Stage 1B — functional / CI review

**Latest local result:** final helper `71902b3` passes all six cases on native Chrome (**2.0 min**) and software Chromium (**4.2 min**) against the unchanged original BY game. Hosted run status is separate and was still pending when this report was completed. No experimental graphics or physics change ships.

Scope: movement and test automation only. The visual reset is creator feedback in Issue #4; the earlier First Voyage's visual baseline was **not approved**. Stage 2 remains locked.

## Remote failure evidence

- Run `46002980135`: three resilience checks passed; full route spent roughly nine minutes on the first six-metre approach and timed out at 600 seconds before parcel acceptance. `docs/evidence/initial-linux-ci-failure.log` retains the original log.
- Run `46005086201` at `32e1e1e`: **FAILED**, three resilience checks passed; first approach remained at distance 3 at iterations 50, 100, 150, 200, 250 and 300. Navigation eventually progressed to the next waypoint just before the 600-second route timeout. Raw log: `docs/evidence/ci-32e-failure.log`.
- Local old helper attempts are not counted as passes. One was manually interrupted (exit 130); another stopped during the visual-reset handoff and has incomplete output. Their separate logs are retained. Their mixed-source or incomplete artifacts do not validate the new game.

## Actual cause, demonstrated from recorded state

The local traced `.22` helper trace contains 148 initial approach reads, with player position unchanged at `(48,0)`. Desired heading was `-2.356` radians. Actual headings repeatedly jumped `-1.889 → -2.834 → -1.889 → -2.865`, leaving alternating errors of roughly ±0.5 radians. Keys were held across separate protocol operations (`keyboard.down`, timed wait, frame evaluation, `keyboard.up`). Playwright trace frame snapshots and protocol latency occurred **while the key remained down**: an intended ~120 ms turn caused about 0.95 radians of rotation, rather than the ~0.32 expected. Merely increasing the heading tolerance from .1 to .22 did not fix this limit cycle.

Correction: `tests/browser/input.ts` uses one real `keyboard.press(key, {delay:100})` action for a steering pulse. Its keydown/timer/keyup execute within the one protocol operation; frame acknowledgement occurs **after release**. Heading feedback remains read-only and destination tolerances are unchanged. Walking forward pulses are 200 ms and boat pulses 250 ms to avoid excessive protocol overhead; these are still real keyboard inputs. No teleportation, state writes, collision bypass or omitted economy/story assertions are used. Diagnostic output includes actual position, heading, angular error, captured pressed keys and open modal per iteration.

### Focused traced-software proof

Command: `CI=1 node docs/evidence/navigation-diagnostic.mjs` against the coordinator's existing V0 preview on port 4181; **PASS**, exit 0. Chromium 159.0.8154.6, CSS 1440 × 900, render scale .5, renderer explicitly `ANGLE … SwiftShader Device …`. First target reached within the unchanged two-metre tolerance in 18 iterations / 15.968 seconds with the initial 100 ms walking pulses. Headings progressed monotonically by approximately .243 radians, then real forward input moved to `(45.188, 2.684)`. Captured keys were empty and modal was null after each released action. This is focused helper proof, **not** a full new-visual voyage pass.

Evidence: `docs/evidence/navigation-diagnostic.log`, `.json`, reproducible `.mjs`; detailed trace is local ignored `test-results/navigation-diagnostic/trace.zip`.

## Movement corrections

- Boat collision now takes the maximum of the **unfiltered rendered sea-floor triangles** and elevated walk/pier surface. This prevents the walking filter from hiding shallow coast triangles from the hull. Walking still uses its original navigable-surface filter.
- Walking and sailing headings wrap through atan2(sin,cos), preserving orientation and remaining inside the save validator's finite range during long sessions (PR #3 `discussion_r4719837048`).
- `npx vitest run src/player/movement.test.ts`: **PASS, 8 tests**, including hidden positive shallows and 80,000 walking plus 80,000 boat turning updates followed by save validation.
- `npm run typecheck`: **PASS** after these changes.

## Browser contract updates for mandatory assets

The new pier, boat and character meshes are mandatory. The old “abort every GLB and expect play” test would conceal a broken critical environment. The updated optional-decor case aborts only lamps, dune grass and fish crates and still requires real walking. A separate test aborts all models and requires an honest loading error and visible Try again control, with no Begin control. Credits assertions derive the expected source-link count from the verified manifest and require nonempty source/licence records, rather than hardcoding the obsolete count of five.

## Intermediate conclusion (before final runs)

**NOT YET READY** for whole-stage or remote-CI sign-off. Focused navigation and movement regressions pass; the full five-case browser suite must run on the coordinator's frozen new visual build, and the resulting remote Actions run must be observed. Original full-resolution evidence has been restored; no software or V0 screenshot is substituted for the creator's requested final visual comparison.

### Loading lifecycle cross-review

The environment owner corrected the late-parse disposal edge in `src/world/world.ts`: deadline sets a persistent expired flag; a GLTF that resolves afterwards releases its unique geometry/material/texture resources and rejects before it can enter the accepted model map. Independent code inspection confirms no late prop/collider insertion path. The owner's controlled real-GLB audit returned at 10.153 seconds, observed two late geometry-dispose events and unchanged 241 scene children / collider result (`visual-reset/environment-late-load-audit.json`). This closes the reported P2 lifecycle edge on independent code plus owner-executed reproduction evidence; no separate independent execution is claimed here.

## New-coast route correction discovered in the first hardware suite

On frozen bundle `index-Bpgzxrwg.js` (SHA-256 `60b5c25cfcbbf4eff2033db0c80d4388fa2d1eb32d6ff306c582583a40fc9b90`), all four resilience cases passed. The full route **FAILED** because the obsolete shoreline waypoint `(43,-11)` crossed the new sculpted cove: player stopped safely at `(43.218,-6.178)` with heading nearly zero, no held keys and no modal. This is distinct from the traced-heading limit cycle; collision correctly rejected water. The failed run/trace is retained (`failed-cove-edge-regression.log`, local `test-results/visual-hardware/`).

The browser route now follows the visible inland junction at `(37,0)` before Mira, returns to the boat via the same junction and pier centre, and uses the equivalent inland junction / stone path at Saltglass. Every job, fish, inventory, romance, reload and credits assertion remains. The helper now fails descriptively after ten forward pulses with no position change instead of burning hundreds of iterations against a blocked shore. Static sampling of all five updated walking chains at 0.15 m intervals reported zero missing walk-surface samples and zero height discontinuities greater than the controller's 0.75 m limit. This sampling is a preliminary ground check, not a substitute for the pending real browser route through model colliders.

## Frozen visual-reset hardware result

Application commit `5ecd019efb9a0e32915d71ddfa47918bccc463cd`, final harness commit `5a55a3ec8a6462f56ab5a0d820823e04540fa805`; bundle `index-BYtek1mE.js` SHA-256 `27c91750a9e80e55c7e0665a516f544998b2985763463891a387c1a64a464706`.

A subsequent native hardware attempt passed all five resilience cases and the route through delivery/first fish, then **FAILED** the second fish: the DOM still showed the prior cast's bite for one frame, so checking only that text immediately after F could reel the new cast prematurely. The page snapshot explicitly read “A little too soon”. The harness now requires the fresh cast's **Watching the float → A bite!** sequence before Space; it does not bypass timing or grant a catch. Failure evidence remains in `visual-reset/failed-fishing-stale-hint.log` and the local trace.

Final command `npm run test:e2e -- --output=test-results/visual-hardware-corrected`: **PASS, six tests, 2.1 minutes, exit 0**. The extra sixth case aborts only boardwalk-deck while all other models remain healthy, requiring an honest loading error rather than a geometry/collision mismatch. Every story/economy/fishing/reload assertion passed on the real full-resolution game. Source/config/assets/tools/harness inputs match final HEAD; app source did not change during this passing run.

Results: `visual-reset/full-regression.log`, nine `visual-reset/regression-*.png` files and `visual-reset/regression-metrics.json`. Original pre-reset numbered images/metrics were restored after copying. Full art/function assessment is in `docs/review-visual-reset.md`.

The same six cases are now running independently with `CI=1` (Chromium software renderer, CSS 1440×900, device scale .5). Remote CI status and this software result remain separate outcomes until completion; neither old timeout run is relabelled a pass.


## CI capture correction and completed software proof

The initial PR #5 Linux run `46011486077` advanced monotonically after the input fix, but still exhausted 600 seconds before finishing its route. Its action logs show a 200 ms forward pulse moving only one clamped 0.261 m simulation frame while each traced action cost roughly 2.5 seconds. This was a second, distinct bottleneck: per-action DOM/canvas snapshots plus video forced expensive software WebGL readbacks and CPU encoding. Raw failure output is retained in `visual-reset/linux-visual-capture-failure.log`.

Capture-only configuration commit **`20e6c416ed8905843f2f9faaae287f37255e54fd`** disables per-action raster snapshots/screenshots and video **only in CI**. Action/network/source traces, failure screenshots and nine explicit gameplay checkpoint images remain; native local tracing/video is unchanged. The same six cases, controls, collision queries, CSS viewport and every functional assertion still run against actual WebGL2. Commit **`0a9519881de2b1a7a2d358c15d4a5fc95e9759d2`** places CI-generated checkpoints/metrics under `test-results/checkpoints`, where the existing artifact uploader retains them without mixing in checked-in old screenshots. This last adjustment changes output destinations only. Typecheck and `playwright test --list` passed after both changes.

The old local heavy-capture run was deliberately interrupted (exit 130) after 6.9 minutes, having passed five resilience cases and progressed through Saltglass delivery, both fish, sale and landmark. It is not counted as a pass. Its separate log/partial metrics are retained.

**Final independent software command:** `CI=1 npm run test:e2e -- --output=test-results/visual-software-corrected`.

**PASS: six tests, 7.2 minutes total / 6.8 minutes for the full route, exit 0.** All gameplay assertions, repeat-payment checks, selected Mira outing, 195-coin wallet, home/journal, persistence and verified-manifest credits passed with zero page errors. This run loaded the corrected capture configuration before the output-destination-only commit; its generated shots were copied separately before restoring the original pre-reset numbered evidence.

Environment: Playwright Chromium 159.0.8154.6 / SwiftShader on the Apple M4, CSS viewport 1440×900, device scale .5; WebGL2 true. Software p50/p95 at sea and landing were approximately **83.3 / 116.7 ms**, with first-load p95 up to 250 ms. This is honest functional CI-like evidence, **not a claim that a CPU software renderer meets the desktop 30 FPS goal**. The separately measured native M4 browser remains approximately 16.7 ms/frame.

Final artifacts: `visual-reset/software-regression.log`, `software-metrics.json`, nine distinctly named `software-*.png` files; full-scale art proof remains the `after-*` and `regression-*` images. The original nine pre-reset images/metrics have again been restored. The playable application bundle remains unchanged at SHA-256 `27c91750a9e80e55c7e0665a516f544998b2985763463891a387c1a64a464706`.

**Local technical conclusion: READY FOR CREATOR REVIEW.** Native hardware and software browser suites both pass. The actual current remote GitHub Actions conclusion must still be checked separately before claiming remote CI green; historical failed runs remain failed. Creator visual/gameplay approval and Stage 2 authorisation are still absent.

## Further hosted bottleneck and rejected graphics experiments

Hosted low-capture run `46013674327` still reached its 600-second limit while progressing monotonically through the first sea crossing. The capture fix removed one bottleneck but was not by itself enough on the hosted software renderer; this failure is not relabelled a pass.

Controlled five-second local SwiftShader measurements at CSS1440×900 showed DPR.5 mean71.45 ms versus DPR.25 mean59.92 ms: cutting 75% of canvas pixels improved mean time only about16%. Software-only BasicShadowMap512 measured62.50 ms; turning real-time shadows off measured55.34 ms. These conditional low-quality prototypes were measured, but the gain was insufficient to justify changing the game's appearance for CI. **Both graphics experiments were reverted. The original `index-BYtek1mE.js` bundle, native look and software look are preserved.** Historical benchmark JSONs retain their experimental bundle identifiers. The generic benchmark script can measure the shipping app without expecting prototype-only metadata.

A bounded input-timeline prototype was also considered and tested outside the shipping tree, then set aside in favour of a narrower driver correction; no unused timeline module or altered game clock is shipped.

## Continuous real-forward input correction

The remaining harness was releasing W after every200/250 ms pulse, then spending protocol/feedback time stationary (or letting the boat decelerate). Slow hosted rendering made that forward duty cycle very low even though the actual controller worked. The corrected helper holds **real W** while polling position/heading at80 ms plus one real animation frame, releases it before every atomic100 ms steering pulse, and guarantees release on arrival/error in finally. It does not write positions, synthesize rewards, replace the renderer, alter physics time, loosen destination tolerances or remove any assertion.

Focused command: `CI=1 node docs/evidence/visual-reset/continuous-input-diagnostic.mjs` on the original frozen BY application. **PASS**: first approach5.173 seconds; actual Ellis/Mira conversations, boarding and110 m sea route completed, open-sea portion20.066 seconds; full focused path49.613 seconds. Recorded key feedback shows `["w"]` throughout forward polls and `[]` after arrival. This is not a claim that the earlier historic approach sample was a strictly controlled A/B; the upcoming complete same-bundle suite is the relevant paired comparison with the7.2-minute pulsed-input run.

Evidence: `continuous-input-diagnostic.json` / `.log`; local source/action trace under ignored `test-results/continuous-input-diagnostic/`. Full six-case software verification with this final helper is running; its result will be appended rather than assumed.


## Final verification — continuous real input, original application

Final reviewed helper commit: **`71902b31a084708ba416bd380c5c6f79a5a1b8c9`**. Application source remains the original approved-for-review code at `5ecd019`; bundle remains **`index-BYtek1mE.js` SHA-256 `27c91750a9e80e55c7e0665a516f544998b2985763463891a387c1a64a464706`**. Independent source/config/test/assets/tools diff against the final helper commit returned exit0. All graphics-preset and timeline prototypes were removed from shipping source; only the test driver's real forward-input duty cycle changed.

| Exact command | Observed result |
| --- | --- |
| `CI=1 npm run test:e2e -- --output=test-results/visual-software-continuous` | **PASS, 6/6, 4.2 min total / 3.8 min full route, exit0** |
| `npm run test:e2e -- --output=test-results/visual-hardware-continuous` | **PASS, 6/6, 2.0 min total / 1.8 min full route, exit0** |

The complete same-bundle software route improved from7.2 to4.2 minutes with every position, collision, reward, two-species fishing, date, checkpoint/reload and manifest-credit assertion retained. Driver feedback records actual W held through forward polls and released before turning/arrival; no application state or clock was written by the driver. Both final suites completed with zero page errors and the expected195-coin wallet, parcel completion, Mira memory and home progress surviving refresh.

Final artifact paths under `docs/evidence/visual-reset/`:

- Native: `hardware-continuous-regression.log`, `hardware-continuous-metrics.json`, nine `hardware-continuous-*.png` files.
- Software: `software-continuous-regression.log`, `software-continuous-metrics.json`, nine `software-continuous-*.png` files.
- CI-generated checkpoints use **`test-results/checkpoints/`** (nine images and `gameplay-metrics.json`), covered by the browser-evidence uploader; local full native video is retained under ignored `test-results/visual-hardware-continuous/`.

The original pre-reset nine numbered images and metrics in `docs/evidence/` have been restored again. Final native DPR1 harbour/sea/landing p50/p95 were16.7/16.7 ms. Final software DPR.5 sea/landing p50/p95 were66.7/83.4 ms. These are distinct honest environments; software functional success is not a30 FPS or native-art-quality claim.

**Final local technical conclusion: READY FOR CREATOR VISUAL AND GAMEPLAY REVIEW.** The actual hosted run for71902b3 (`46019041111`) was still pending/in progress when this review finished; do not infer remote green from these local results. The coordinator will record that separate observed conclusion. No further local reruns or application changes are required by this review. Creator approval remains absent and Stage2 remains locked.
