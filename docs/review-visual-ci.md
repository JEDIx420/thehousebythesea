# Stage1B — independent browser harness and CI review

Reviewer: environment implementer, with no implementation ownership of this batch. Scope is five files: `tests/browser/input.ts`, `tests/browser/voyage.spec.ts`, `tests/browser/resilience.spec.ts`, `playwright.config.ts`, `.github/workflows/deploy.yml`. Working-tree review on baseline HEAD32e1e1eb0befaea8fb649a93a924bedb9aaef507; immutable final SHA to follow integration. This review excludes the reviewer's own world code.

## Input and assertions

- PASS: navigation reads cloned game diagnostics and computes heading/distance, then sends actual Playwright keyboard presses. It does not teleport coordinates, write live domain state, invoke reward reducers, or call game interaction functions. The injected key probe owns a separate diagnostic Set observing DOM keydown/keyup/blur; it does not modify the production input Set.
- PASS: held input is one `page.keyboard.press` protocol operation with a real press delay, removing the former separate traced-command gap while keys remained held. The0.22rad heading tolerance only affects the test navigator's coarse aim; position tolerances, landing checks, payouts and story assertions are unchanged. It does not change the application's movement code.
- LIMIT, not a passing-runtime claim: the rAF awaited after a completed press verifies a subsequent frame, not necessarily a frame inside the held interval. Extremely slow software rendering can still miss short real presses. Final local/remote execution must establish whether this strategy is sufficient; this reviewer has not rerun or silently declared the previously failing Linux route green.
- PASS: the complete full-route test still starts through title/prologue, walks to Ellis, accepts the parcel, talks/invites Mira, physically boards, navigates both sea legs, docks/disembarks, walks Saltglass and its landmark, delivers once, catches both species on visible bite feedback, cancels another cast, sells for wallet195, returns to Mira, completes the outing, reaches the plot/journal, saves and reloads player position plus money/job/story, and opens credits. UI actions and independently read state assertions remain in place; successful screenshots alone are not used as substitutes.
- PASS: credits count derives from the imported current asset manifest rather than the obsolete fixed count5. It also checks nonempty source/licence data and visible licensed attribution text. This verifies presentation consistency, not independent legal provenance; actual asset audit remains separate.

## Resilience and deployment

- PASS: optional prop failures are explicitly limited to harbour/seafront lamps, dune grass and fish crates; the test still requires a playable start and actual movement. Critical-model failure is a separate test that aborts all model requests and requires an honest Try again loading error and no playable-start button. These distinguish optional degradation from mandatory geometry/character failures rather than making every failed asset optional.
- PASS: future-schema preservation test deliberately seeds IndexedDB from a plain resource to avoid an old game pagehide race, then verifies the original unsupported snapshot survives fallback play/autosave. This is a transparent corrupt/future-save fixture, not a shortcut inside the successful gameplay route.
- PASS: title Credits→Escape, memory skipping, audio setting and recovery checks remain. Full-game runtime errors are collected and asserted empty in the voyage test.
- PASS: one browser worker avoids parallel GPU contention; viewport remains1440×900 CSS pixels. CI-only deviceScaleFactor0.5 reduces software raster work and is recorded in metrics; it is not represented as hardware/full-resolution performance evidence. Local installed Chrome and CI Chromium are explicitly different environments.
- PASS: workflow still runs clean install, strict typecheck, all unit tests, production build and all browser tests before main-only deployment. No assertion bypass, `.skip`, unconditional successful exit, or failure-tolerant test step was introduced. Browser artifacts upload even on failure. Verify job has20minute upper bound; full voyage retains600second CI timeout. Contents permissions are read-only except deploy's Pages/id-token permissions, and deploy still requires main plus successful verification.

## Conclusion

**Five-file source review PASS; no demonstrated P0/P1 harness or workflow defect. Runtime execution NOT TESTED in this review.** Coordinator captures and the controls owner's single functional run have priority, so no duplicate GPU tests were launched. Remote CI remains a separate observed outcome, and must be reported honestly if it fails again. No visual, creator or Stage2 approval follows from this review.

Reviewed SHA-256 fingerprints:

```text
4e61349e90342b9464ca781ad9f9b25e366fb56d78d32b21f05242ebd585fef2 tests/browser/input.ts
b6e8ae96b40fca261161cec971085a897633e2093dcd17250f6af0bd9c064f28 tests/browser/voyage.spec.ts
93f1a326ef76f9aad171654edc39ed66905e0590df3f58fa138ee56aeba955c0 tests/browser/resilience.spec.ts
2e5f61eed582e12e3031b9993a9468f921b1c29e036efb614e8a4b5fd3251fc1 playwright.config.ts
2d3f201dc1b4903e7c8bc40bf4203c80d53c724fc3b28fbdf804a24c62e1ee30 .github/workflows/deploy.yml
```

## Integration finding CI-01 — P1 verification-loader failure

After this source-only review, the functional-test owner ran Playwright test discovery and found a real Node ESM loader failure: voyage.spec.ts imports the manifest, whose src/data/assets.ts JSON import lacks the required `with {type:'json'}` attribute under the Node test loader. Browser Vite bundling had accepted it, so application typecheck/browser boot alone did not prove Playwright discovery. Required narrow correction is the JSON import attribute (or an equivalent explicit Node-compatible manifest read) and successful Playwright `--list` execution. This reviewer did not change implementation while source was frozen. **Whole harness execution readiness is BLOCKED pending CI-01 correction**, even though the five-file route/assertion review above remains valid.

## CI-01 correction — independently verified

Coordinator added the exact Node-compatible JSON import attribute in src/data/assets.ts. Independently ran `npx playwright test --list`:exit0, all5tests discovered across2files, including both optional-decoration and critical-model cases plus the full real-input voyage. The five scoped source fingerprints above are unchanged. **CI-01 CLOSED; five-file source and discovery review PASS.** No duplicate GPU/browser functional run was launched; execution outcomes remain for the designated test owner and remote CI.

## Immutable Stage1B harness sign-off and sixth resilience case

**Reviewed implementation SHA: `5ecd019efb9a0e32915d71ddfa47918bccc463cd`. Five-file source/discovery review PASS.** All five scoped files are present in the immutable commit and working-tree diff against it is empty. The new sixth case aborts only `boardwalk-deck.glb`, leaving characters, boat and pier-head healthy, then requires Try again, no Begin button and the relevant loading-error text. This is legitimate regression coverage of the exact-surface contract; it does not reclassify mandatory geometry as optional or skip the previous tests.

The helper's new blocked-position diagnostic fails promptly after repeated unsuccessful actual forward presses instead of consuming the full timeout at a bad waypoint. Updated walking waypoints route along the authored stone path via(37,0)/(37,−11), avoiding a former waypoint now in the sculpted cove. Saltglass likewise uses the safe inland path. All travel still uses keyboard input and the core job/fishing/outing/wallet/reload/credits assertions remain. There is no teleport, reward mutation, collision disable or easier position threshold. This source review does not assert that the final full route has passed; functional execution remains with its designated owner.

Final reviewed SHA-256:

```text
47a54728b96032ebb56cb726ea419c8148c553a189468e61f8e17c22bbc36ed1 tests/browser/input.ts
684cd93c5b352f33a084cd9801c6b34dc5deaf0ffad33ffeee19f8c1ea4407bc tests/browser/voyage.spec.ts
1c250b8d7f893181f5487fed6fe1d4748af85090ab2f1bac9717a661ac661465 tests/browser/resilience.spec.ts
2e5f61eed582e12e3031b9993a9468f921b1c29e036efb614e8a4b5fd3251fc1 playwright.config.ts
2d3f201dc1b4903e7c8bc40bf4203c80d53c724fc3b28fbdf804a24c62e1ee30 .github/workflows/deploy.yml
```

No tests were rerun or source edited during this immutable sign-off. Final remote CI remains an observed outcome, not inferred from source approval. Stage2 still requires explicit creator approval.

## Hosted-software-rendering capture profile — one-file independent review

**Reviewed SHA: `20e6c416ed8905843f2f9faaae287f37255e54fd`; scope `playwright.config.ts` only. Source review PASS.** Verified this commit changes only that file, with no application, render, input, test assertions, viewport or DPR change relative to its parent. Final config SHA-256 `18d3375c922082f5e86f5234853dcd21f1cea18d01e3abd084a917a49fb17227`; working-tree diff against the commit is empty.

CI-only trace configuration retains failures with actions/network/source data but disables per-action trace screenshots and DOM snapshots, and CI video is off. Local full trace/video stay enabled; explicit checkpoint screenshots and failure PNG calls remain. This removes capture overhead rather than avoiding a gameplay assertion or disabling WebGL. Actual installed Playwright types support these options. Independent lightweight `CI=1 npx playwright test --list`:exit0, all6cases discovered. No duplicate functional/GPU run was launched. The prior Linux log shows slowly progressing navigation and600second timeout, with5other cases passed; capture overhead is a plausible mitigation target, not proof of a fixed remote run. Remote outcome remains pending until observed.

**Retention caveat E-01 (P2):** explicit route checkpoint PNGs and metrics are written under docs/evidence, while the workflow artifact currently uploads only test-results/. Thus failure PNGs and trace action/source/network evidence are retained remotely, but the9explicit CI checkpoint PNGs are not retained after the job unless artifact paths are expanded. Local committed screenshots and the actual-play clip are unaffected. Coordinator was asked to expand the artifact paths or describe this limit accurately. This does not reduce behavioral test coverage or make a failing run pass.
