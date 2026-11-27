# Independent review — scaffold, deployment and integrated route

Reviewer: controls agent. Date: 2026-11-27. No ownership of reviewed scaffold, deployment or main integration implementation.

Baseline HEAD: `fa4a43b427a6cb8fdc9ba29bc0782fd7e16b2dc3` plus working-tree implementation; final integrated SHA recheck required.

## Batch I-1 — five scaffold/deployment files

Files: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `.github/workflows/deploy.yml`.

| Check | Result | Evidence |
| --- | --- | --- |
| Dependency lock and installed graph agree | PASS | Independent `npm ls --depth=0`, exit 0 |
| Strict TypeScript | PASS | Independent `npm run typecheck`, exit 0 |
| Unit regression suite | PASS | Independent `npm test`, exit 0: 3 files, 29 tests |
| Static repository base and no server runtime | PASS | Vite base `/thehousebythesea/`; only bundled Three.js runtime dependency |
| Pages least privilege, production-only main | PASS | Workflow verify read-only; deploy job pages/id-token write; main guard; official upload/deploy Actions |
| Actual clean install and production build | NOT TESTED independently | Coordinator performing final clean sequence; reviewer avoided reinstall during active browser server |
| Actual GitHub Actions/Pages deployment | NOT TESTED | Requires pushed commit and observed remote run/site |

## Batch I-2 — coherent browser-test subsystem

Files: `playwright.config.ts`, `tests/browser/voyage.spec.ts`. Reviewed actual test code: diagnostics are read-only; navigation uses real keyboard inputs; route checks delivery once, both species, cancelling fishing, inventory sale, returning voyage, Mira milestone, plot, journal, reload/checkpoint, credits and page errors. Screenshots are captured from the rendered build. Independent browser execution is in progress against the production preview. `tests/browser/resilience.spec.ts` adds the title/memory escape, unsupported-save preservation and missing-prop fallbacks as a third file in this coherent batch. Reviewer corrected the save fixture to seed from a plain same-origin credits resource before app boot, avoiding an unload-autosave race.

## I-01 — P1 — title Credits → Escape hides the only start control

Affected integration: `src/main.ts` generic Escape branch. Reproduction: cold title; open Credits & provenance; press Escape. Expected: return to title, retaining Begin/Continue control. Observed code: generic close hides all overlays while `started` is still false; the frame loop refuses movement. No remaining action starts the session without reload. Required correction: pre-start Escape should restore title. Memory Escape should explicitly finish/skip prologue before closing so its persisted flag agrees with the skipped scene. Coordinator corrected both paths. Independent production-browser resilience test passed both the Credits/Escape return-to-title and memory Escape flag assertions. **I-01 CLOSED**; no remaining P0/P1 finding from this issue.

Conclusion at that intermediate round: final-route execution and immutable source recheck remained pending; I-01 was closed. See final review below. This review does not grant creative approval or authorise Stage 2.

## Reviewed file fingerprints

```text
15763a6a1a74e075934c3b2807923a8ed75489531716f34d31dda0aca5c4a78d  package.json
ac5ff9851da2b486ea829cb6fcbd52afabf2d210cd60688529571f918fdfb5e8  package-lock.json
56f455ddb898c1b8d32cc5a9df5d3d19eb1522ff6de1df2fa9486030956a080f  vite.config.ts
a61a8ea0d5ecdded434849c7f3c043fee50d507d8f0b54697d5b9468b84ed832  tsconfig.json
df6cc982c1437ba14e6cc802fcd3dce202e6e3957e5de212da5b1e9b8a8b858f  .github/workflows/deploy.yml
```

## Browser execution history

First independent full-route command: `npm run test:e2e -- --output=test-results-independent`. The real player completed delivery, both catches, sale, return, Mira memory and home plot, but the final reload failed with `net::ERR_CONNECTION_REFUSED` after the coordinator stopped/restarted the preview process. This attempt is **FAILED**, not a claimed route pass. Its trace/video are under `test-results-independent/voyage-First-Voyage-throug-cc2fb-and-contextual-interactions/`. A stable final-build rerun is required.

Second independent suite: `npm run test:e2e -- --output=test-results-independent-final`. The first three resilience tests passed (870 ms, 6.1 s, 1.2 s); voyage route still running at review update time.

## Final immutable implementation review

**Reviewed implementation SHA: `f788256bebd0d958b96c5397fbe4922746855d31`.** Independent `git diff --exit-code` against that SHA for src, package files, configs, tests, workflow, tools and public assets returned exit 0. The tested production bundle was `dist/assets/index-B9p-1-bv.js`, SHA-256 `3932b576a948e758e171b38a774da479290259e9e4d917897bba17b09cd9c210`. No application source changed during this final review.

Command: `npm run test:e2e -- --output=test-results-reviewed` (captured through tee with shell pipefail enabled). **PASS: 4 tests, 1.8 minutes, exit 0.** Full route used real walking/steering inputs and contextual interactions on the built `/thehousebythesea/` preview: parcel accepted, Mira invited, boat steered, Saltglass docked/walked, parcel paid once, both fish caught, fishing cancelled, inventory sold (195 coins), landmark visited, return sailed, Mira memory completed, home plot visited, journal opened, save/reload restored wallet/job/outing/home/checkpoint, credits showed five sourced records, zero page errors. Three additional resilience cases passed: title/credits/memory/menus/settings/recovery; future-save preservation; missing optional GLB fallback with actual walking. The plain-origin fixture correction and CI-specific route timeout are included in the reviewed commit.

Evidence: `docs/evidence/independent-browser.log`, `docs/evidence/gameplay-metrics.json`, nine numbered screenshots, and **`docs/evidence/first-voyage.webm`** copied from the passing route recording.

Environment: Apple M4, Mac16,12, arm64; installed headless Chrome 158, viewport 1440 × 900, WebGL2 true. Frame samples: harbour p50/p95 16.7/16.7 ms (245 draw calls); sea 16.7/16.7 ms (293); landing 16.7/16.8 ms (193). Per-snapshot sampled JS heap 13.5–51.1 MiB; this is not GPU or process memory. Resource Timing reported 447,640 transferred resource bytes at first harbour snapshot; see raw entries rather than treating this as the total size of all shipped files. Samples are this hardware only; Firefox, Safari and other laptops were not independently exercised. The automated direct route took 1.7 minutes and does not by itself establish a human 10–15-minute leisurely play duration.

Coordinator separately completed a clean npm ci/typecheck/29-unit-test/build sequence. Reviewer independently ran typecheck and the 29-unit suite, and played the production build; a duplicate clean reinstall was not claimed.

Pages configuration was prepared by the coordinator. **No live Pages site is claimed by this reviewer**: this branch is a PR and production deploy is main-only. Remote Actions/site verification remains a separate release outcome. The persistent local preview is `http://localhost:4173/thehousebythesea/`.

Final conclusion: **READY FOR CREATOR REVIEW** of the First Voyage, with no remaining demonstrated P0/P1 in these reviewed subsystems. Visual style, camera/boat feel, tone and leisurely duration require creator hands-on judgement. This is technical readiness, never creative approval. **Stage 2 remains prohibited until the creator explicitly approves.**

Additional exact-final independent command: `node docs/evidence/review-state-browser.mjs` (preview 4173). **PASS, exit 0**, Chrome 158.0.8127.37 at 1280 × 800: title Credits/Escape; memory Escape with reload continuation; unsupported schema99 preserved; corrupt raw snapshot preserved; unavailable IndexedDB warns on title/Pause and still permits play. Zero page errors. Raw results: `docs/evidence/state-review-results.json`; log: `docs/evidence/independent-state-browser.log`.
