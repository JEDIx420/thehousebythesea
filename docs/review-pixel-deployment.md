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
