# Pixel First Voyage — independent deployment/test plumbing review

Status: **SOURCE REVIEW PASS; no P0/P1 findings. Hosted CI, generated Pages artifact and actual deployment remain pending independent observation.** Stage 1 only; creator approval remains required. Reviewer made no implementation changes, did not rebuild `dist`, package the site, launch a browser or interrupt the owner's running browser suite.

## Scope — exactly five files

- `.github/workflows/pixel-first-voyage.yml`
- `tools/package-pages.mjs`
- `vite.config.ts`
- `playwright.config.ts`
- `tests/browser/resilience.spec.ts`

Independently ran `npx --no-install playwright test --list`: **8 cases discovered in 2 files**, including 7 resilience cases and the full voyage. This is discovery only, not a gameplay pass. The voyage implementation/assertions are outside this batch.

## Findings and supported conclusions

Workflow gates deployment and packaging to **push events on exactly `refs/heads/feat/pixel-first-voyage`**; PRs and manual dispatch verify without deploying. Deploy requires successful verification. Global permission is contents-read; Pages write and OIDC write are restricted to the deploy job. Pinned action revisions are present. Repository/environment branch-policy settings are external to these files and were not independently queried here. Main is not merged or modified by this workflow; a successful deployment will replace the published site with the explicit composite artifact, as intended.

CI installs locked packages with install scripts disabled, checks assets/types/units, builds, then installs Chromium plus OS dependencies before running Playwright. Playwright's Chromium installation includes its video recorder dependency; the configuration uses bundled Chromium on CI, Chrome locally, one worker, retained failure traces/screenshots and video recording. Browser evidence uploads with `always()` and 14-day retention. No credentials or secret values found in the five files. Hosted browser launch/video creation and action revision resolution remain unexecuted by this reviewer.

Vite selects `/thehousebythesea/preview/pixel/` only for the explicit preview build. Packaging rejects an index lacking that nested asset prefix, replaces only `dist-pages`, copies the complete `dist` into `preview/pixel`, creates `.nojekyll`, and writes a root landing page with a relative playable link. The landing is explicit about creator review and Stage 1. This avoids publishing a nested-only artifact with a blank project root. The packaging build occurs after root-base browser tests: **nested asset/notice/manifest paths still require a packaged/live smoke check**, and the presence check alone is not such proof. No claim that Pages is live is warranted yet; prior main-site 404 status is unaffected until actual deployment.

Resilience fixtures write only deliberate fault/legacy snapshots, not gameplay rewards or quest completion to satisfy the route. Corrupt/future cases compare exact original bytes after temporary play/recovery/autosave and verify disabled save. Legacy import asserts economy/inventory and safe player/boat dock positions, preserves the source bytes and checks new schema 2. Failed import simulates a pixel write denial and asserts tab-only wording, unsaved status, preserved original and absence of a new snapshot. Missing/stalled atlas and malformed/missing-frame metadata assert honest retry states and bounded failure rather than falling through into gameplay. Native keyboard/menu/range controls, narrow laptop panel bounds and picking are asserted. These are meaningful fault/control checks; they are not substitutes for the full route or exhaustive focus/accessibility tests.

No blocking source defect found. Required release evidence: successful hosted eight-case run with actual video artifacts; inspect the complete packaged artifact; open root landing and nested game plus local notices/manifest at deployed paths. Creator review remains separate from technical readiness. No Stage 2 authorised.

## Reviewed source SHA-256

```text
126a92163f2f83983e8897468b707bd4173f99abb0ae21a487542566400fc790 .github/workflows/pixel-first-voyage.yml
785fa874aaa07bc4b98ffc3213b42ba367fe3f744a18cb4541d77ff11251479b tools/package-pages.mjs
3ccd46116cfe23bd3ef42fc8247dae9e3516c36cd5ba58f1bb1ea39dfd52e1f5 vite.config.ts
2a057f8c4dce3590c868ca747a9ee13568a5f7c2ed83741aaf7f74874f3a7460 playwright.config.ts
960ed1f0d4dc71f1c88a528b83ed2d5571869d8e12478c5c750ad0359bd68fa5 tests/browser/resilience.spec.ts
```


## Hosted runner corrective review — 03ffa4e

Independently inspected commit `03ffa4ef0b9a05a8f280ec7a644bcf118c7d5368`: the workflow delta contains only two `runs-on` substitutions, pinning verify/deploy from `ubuntu-latest` to `ubuntu-24.04`. Browser installation, all tests, WebGL launch settings, timeout budgets, artifact handling, branch gates and permissions are unchanged. **Narrow correction PASS.**

Read `docs/evidence/pixel/failed-hosted-runner.log`: recorded run `46118787973` on `ac44` reached successful clean install, 280-frame asset checks, typecheck, 41 unit tests and build, then failed before browser cases because Playwright 1.56.1 rejected Ubuntu 26.04.1 (`ubuntu26.04-x64`). This file is a short recorded failure excerpt/summary, not a complete independently fetched hosted log. The explicit supported runner pin addresses that concrete installation mismatch without removing assertions. **Subsequent hosted install/browser success and deployment remain UNPROVEN/PENDING** in this review. No duplicate browser/build run performed.


## Timed-input/evidence correction — 19b94d9

Independently reviewed exactly the three-file delta in `19b94d97c23cdb49576b71b3de5fd0df510fac80`: `tests/browser/voyage.spec.ts`, `playwright.config.ts`, `.github/workflows/pixel-first-voyage.yml`. **Narrow correction PASS; no application code changed.** The fishing checkpoint moves from after observed “A bite!” to the waiting phase; after bite detection the next operation is real Space input, followed by the unchanged species inventory assertion. The finite game response window, both-species requirement, cancelled cast, wallet/sale, delivery idempotence, companion/return, home, save/reload equality and error assertions remain intact. No state/reward injection or timing tolerance increase was introduced.

CI video capture is disabled while local video stays enabled; retained failure traces/screenshots and the HTML report remain configured. Upload now includes explicit checkpoint files and the report, avoiding the duplicate raw result tree/full videos. Playwright's HTML reporter carries referenced failure attachments in its report data; actual hosted artifact contents still require verification. Motion evidence therefore comes from the separately committed local recording, not from a claimed hosted video. This supersedes the earlier release-evidence request for a CI video artifact; inspect hosted checkpoints/report/trace and the local motion excerpt instead.

These changes reduce synchronous screenshot/recording work around finite gameplay input without bypassing gameplay assertions. Capturing while waiting still consumes real time and is not a guarantee against an arbitrarily stalled runner. The reported eight-pass PR run and contrasting push failure were not independently fetched in this source-only follow-up; the new push must establish hosted success. No GPU test, build or duplicate route run performed by reviewer.


## Independent LIVE Pages smoke — 2026-11-28

**Public gameplay smoke PASS with cosmetic favicon-console qualification.** HTTP-only polling observed the nested URL change from 404 to 200 at approximately 07:07:23 UTC. Opened a fresh disposable native Chrome 158 context at `https://jedix420.github.io/thehousebythesea/preview/pixel/`; verified exact `index-Da1gQADU.js`, WebGL, title → Begin → skip memory → real held-key movement changing coordinates → R recovery → pause/manual Save with confirmed toast → reload → Continue → complete logical state equality. No debug state writes or reward injection. Root landing returned 200 and points to `./preview/pixel/`; nested manifest returned 200 with 280 frames and nested third-party notices returned 200.

Fresh evidence: `docs/evidence/pixel/independent-live-smoke.png` and `.json`, containing URL, bundle/browser, metrics, before/moved/recovered/saved/restored state, same-origin page responses and error locations. Both disposable browser contexts are CLOSED. The initial smoke reached the same successful gameplay checks but its strict clean-console assertion failed; the follow-up preserves the actual result rather than suppressing it.

**Cosmetic P2:** three console resource-404 messages all identify Chrome's implicit site-root `https://jedix420.github.io/favicon.ico`, not a missing game resource. No uncaught page error, failed game request or HTTP≥400 page-response event observed. Thus this is not a clean-console pass. An explicit project-relative or data favicon would remove the implicit site-root lookup; root notified. Actual public game and ancillary paths are independently proven reachable. Full hosted/public eight-case route results are separate evidence and were not rerun by this reviewer. Creator visual/gameplay approval remains PENDING; no later stage authorised.


### Favicon follow-up — two-file source correction PASS

Independently inspected the working-tree delta in `index.html` and `tools/package-pages.mjs`: each adds only `<link rel="icon" href="data:,">` to the game HTML or generated root landing HTML. This supplies a local inline empty icon instead of Chrome's implicit site-root network lookup; no third-party artwork, new network dependency, gameplay JS or route/assertion change. **Narrow source correction PASS.** The observed live favicon P2 remains awaiting post-deployment fresh-context verification; source review alone is not a zero-console live claim. No rebuild or browser run performed during the owner's public suite. Hosted eight-case successes/artifact inspection reported by the coordinator are not independently fetched in this follow-up.
