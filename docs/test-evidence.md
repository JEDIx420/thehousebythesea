# First Voyage — execution evidence

Date: 2026-11-27. Authorised scope: Stage 0 and Stage 1 only. Read the independent reports rather than treating this summary as another review.

## Clean local verification

Working directory: repository root. Node v22.23.1, npm10.9.8, macOS on Apple M4. Actual final clean sequence:

| Command | Observed result |
| --- | --- |
| `npm ci` | PASS, exit0;49 packages installed,50 audited,0 vulnerabilities |
| `npm run typecheck` | PASS, exit0; strict TypeScript |
| `npm test` | PASS, exit0;29 tests across3 files:21 domain/schema,6 movement,2 terrain |
| `npm run build` | PASS, exit0; Vite7.3.8,20 modules,592ms build; JS690.34KB /184.12KB gzip; CSS5.14KB /1.82KB gzip |
| `node tools/inspect-assets.mjs` | PASS, exit0; actual five GLB counts match manifest |
| `npx vitest run --config docs/review-controls.vitest.config.ts` | PASS, independent real-geometry hull regression |

Vite reports its standard >500KB chunk warning for bundled Three.js/application code. This warning remains disclosed; no build errors were suppressed. Only259,764 uncompressed bytes of GLB props are requested at startup. Reference boat/character and terrain proof exports are static files but are not initial game requests.

Final production JS: `dist/assets/index-B9p-1-bv.js`, SHA256 `3932b576a948e758e171b38a774da479290259e9e4d917897bba17b09cd9c210`. Vite base is `/thehousebythesea/`; preview uses the built files at http://localhost:4173/thehousebythesea/ .

## Browser verification and evidence

Installed Google Chrome158, headless hardware renderer,1440×900 viewport, render ratio capped1.5. Initial coordinator full-route run passed. Independent reviewer then ran four production-browser tests successfully, including the complete real-input voyage and state restoration, then repeated all four against the final batched-world bundle named above: **4/4 PASS, exit0,1.8 minutes**. The full route took1.7 minutes under automated input. Exact final output is [independent browser log](evidence/independent-browser.log).

The browser route uses only keyboard/mouse/menu actions to move and interact; `window.voyage` diagnostics expose read-only state and metrics. It does not teleport, mutate domain state, or invoke reward actions. Tests assert walking, both sea journeys, docking/stepping off, delivery120 once, catches of both species, cancellation, fish sale50, wallet195, Mira outing, plot/journal, reload checkpoints and credits. Separate resilience cases test title Credits→Escape, memory skipping, audio/recovery, future-schema preservation and missing model fallback. Reviewer-only [storage script](evidence/review-state-browser.mjs) additionally checks corrupt and unavailable storage.

[Actual full-route recording](evidence/first-voyage.webm) (WebM, approximately11MB).

Actual screenshots:

- [Havenport](evidence/01-havenport.png)
- [Mira](evidence/02-mira.png)
- [Sailing](evidence/03-sailing.png)
- [Landing](evidence/04-landing.png)
- [Fishing](evidence/05-fishing.png)
- [Saltglass exploration](evidence/06-saltglass.png)
- [Home fund](evidence/07-home-fund.png)
- [Journal](evidence/08-journal.png)
- [Credits](evidence/09-credits.png)

[Per-scene gameplay metrics](evidence/gameplay-metrics.json) record actual frame samples, request transfer sizes, JS heap estimate, draw calls and browser user agent. The terrain [tiny-proof measurements](terrain-spike.md) are separate and do not represent gameplay performance. Independent static batching check reduced harbour calls609→242 with median16.7ms/p9516.8ms at that check's view; final full-route scene numbers are in the JSON. Shader memory, Safari/Firefox and low-power Intel hardware are not measured. Programmatic audio toggling passed; subjective listening is not claimed.

## Failures and corrective work retained honestly

- First high-detail software terrain attempt stalled88.47s and lost graphics context. Reduced-detail installed Chrome proof succeeded; direct production triangle meshes chosen. Exported GLB visual mismatch is recorded, not passed off as production integration.
- First software Chromium full-route attempt timed out240s during concurrent GPU tests. A parallel run overwrote its trace staging directory. No pass is claimed for that attempt. Local installed-Chrome route succeeded; CI's software route timeout is600s. Remote CI is a separate outcome.
- One independent repeat reached the home fund but failed final reload because the preview server belonged to a completed earlier test process. It was restarted with explicit ownership, then the full four-test suite passed. Final independent test owns its preview process; no reload failure is hidden.
- Review found mirrored/undersized hull collision, stationary-turn clipping, missing hut colliders, unreadable-save overwrite, startup credits Escape and unhandled WebGL constructor failure. Each has corrective evidence in the independent reports. Modal focus follow-up also passed.

## Review and deployment

Independent batches: [controls](review-controls.md), [state](review-state.md), [world](review-world.md), [UI/audio/fishing](review-ui.md), [tools](review-tools.md), [scaffold/integration](review-integration.md). Reviewed immutable implementation is `f788256bebd0d958b96c5397fbe4922746855d31`; independent reviewers verified the committed inputs match their tested files. Reports and evidence are a separate documentation commit. No open P0/P1 findings remain in the reviewed scope.

GitHub Pages source was configured successfully through the API with `build_type=workflow`. Workflow verifies PRs and deploys only main; this branch's PR is not auto-merged. No public game deployment is claimed until a live page is independently opened. No Stage2 work is authorised by passing CI or publishing.

## Final gameplay measurements

Across nine real route snapshots: p50=16.7ms; p95=16.7–16.8ms;141–293 draw calls; estimated JS heap14.1–53.5MB. Initial asset resource transfer measured447,640bytes including compressed JS/CSS and three GLBs (HTTP header overhead included). These Apple M4/Chrome158 samples are vsync-limited; no universal minimum-FPS claim is made. Final reload screenshot has72 frame samples; sailing and landing snapshots contain much longer accumulated histories.

## Handoff

[PR #3](https://github.com/JEDIx420/thehousebythesea/pull/3) contains the pushed implementation and evidence. Public Pages returned HTTP404 on verification before merge, as expected for this main-only deployment setup. The confirmed playable local preview is http://localhost:4180/thehousebythesea/ . Remote CI status is recorded separately after completion.

## CI software-renderer corrective round

The first Linux Actions run [46002980135](https://github.com/JEDIx420/thehousebythesea/actions/runs/46002980135) passed install/typecheck/unit/build and all three resilience browser tests, then failed the voyage after its600s timeout. Logs show the initial walking helper oscillating3m from its target over150 iterations; it did not progress to the sailing section. This is not reported as a Linux gameplay pass. A local software-renderer probe at1440×900 measured DPR1 p50/p9550/83.3ms versus DPR0.5 p50/p9516.7/33.4ms with identical244draw calls/71,931triangles.

Corrective test infrastructure keeps the1440×900 CSS viewport, real keyboard route and full assertions; CI uses0.5 render scale, key holds span an animation frame, and fishing waits for visible bite feedback. Local hardware visual evidence remains at full render scale. Workflow verification is bounded20minutes. This changes test execution only; the production B9bundle is unchanged. Corrected software/remote outcomes are recorded after execution.
