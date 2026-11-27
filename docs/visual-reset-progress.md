# Issue #4 — Stage 1B visual reset

Creator verdict: prior appearance rejected. First Voyage remains unapproved. Branch `fix/stage1-visual-baseline` derives from #3 without force-pushing or merging it. No Stage 2.

| Package | Owner | Evidence / state |
| --- | --- | --- |
| V0 art direction / actual asset auditions | Coordinator + model implementer | art-direction.md, six before game captures, actual GLB contact sheet; blocklike flannel/cardigan candidates rejected after visual inspection |
| V1 people and vessel | Model implementer | Complete: creator-selected Family Traveller Mira, rounded Rowan/neighbours, caique; genuine clip/skin and deck audit |
| V2 terrain/water/light/camera | Environment implementer + coordinator | Complete: exact rendered surface/deck queries, sculpted coves, water cleanup, closer camera and actual light/fog A/B |
| V3 settlement / life | Environment implementer | Complete after V0 checkpoint: curated settlements, continuous paths, NPC loops and clear home vista |
| V4 independent art/code / regression / CI | CI implementer and cross-reviewers | Hardware 6/6 pass, full before/after and actual clip complete; software 6/6 passed; [hosted CI tracked independently](https://github.com/JEDIx420/thehousebythesea/pull/5/checks) |

Before captures use isolated IndexedDB checkpoint fixtures then ordinary playable-game rendering; no user save is changed. Positions and camera orientation are reproducible via `node tools/capture-visual-baseline.mjs before URL`. These are game frames, not catalogue images. User's credential remains in the external ignored environment file; only local official-service tooling may use it, never Vite/client code or public logs.

## Frozen candidate and V4

Implementation `5ecd019`; test-readiness follow-up `5a55a3e`; CI capture/retention follow-ups `20e6c41` and `0a95198`; independently reviewed continuous real-key helper `71902b3`. Corrective [PR #5](https://github.com/JEDIx420/thehousebythesea/pull/5) targets `feat/first-voyage`. V0–V3 are complete with the creator-selected Polyfork Family Traveller as Mira. Final six views, front/three-quarter/full-body walking captures, light/fog A/B and 31.92-second actual gameplay clip are recorded. Independent app/model/world/test/art reviews close blocking findings.

V4 hardware browser: **6/6 PASS in2.1 minutes**, reconfirmed **6/6 PASS in2.0 minutes** with final helper. Typecheck, build and 33 unit tests pass. Failed cove-route and stale fishing-cue attempts remain documented; fixes preserve all core assertions. Software Chromium passes all six cases in7.2 minutes with the historical pulsed helper and in4.2 minutes after final continuous real-key helper `71902b3` (same game, graphics and assertions). Current hosted Actions is linked from the PR checks and reported separately from local proof. See [evidence](visual-reset-evidence.md). **No creator approval is inferred; no Stage 2.**
