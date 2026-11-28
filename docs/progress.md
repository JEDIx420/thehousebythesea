## P1.5 ACTIVE — creator polish, 28 November 2026

Pulled creator instructions90693e3 on existing PR #7 branch. Previous First Voyage remains the historical baseline, not approved for expansion. One implementer; independent review batches≤5 systems. Stage2 locked.

| Gate | Work / observed state |
| --- | --- |
| A baseline / golden | Fresh1440×900 browser captures + actual composited movement/surf recording captured before source changes. Baseline usable area H7025.25/S4309.19. Original Mira portrait/five-face identity family, compact HUD, street/elevation and audible music prototype internally reviewed GO for B/C production. Four expressions/baked96s music are original; subjective listening remains creator gate.51 unit tests and298-frame audit PASS; before/after actual captures retained. |
| B feel / music | ACTIVE: transient locomotion, planted-foot cycles, camera, original96s arrangements and independent mixer. |
| C islands / saves | Versioned v1→v2 migration authored before geography changes; expanded district/elevation authoring follows golden. |
| D HUD / dialogue | Dedicated character-led beat view and compact navigational UI; preserve actions/accessibility. |
| E regression / live | Rerun all existing8 browser scenarios plus movement/audio/height/portrait/migration tests, actual audible two-island capture and deployed verification. |

Independent preflights: [world](review-p15-world.md), [state](review-p15-state.md), [art/audio](review-p15-art.md). New evidence under `docs/evidence/p15/`. No current P1.5 completion or new live gameplay is claimed.

---

# Execution status

## Creator feedback — P1.5 (2026-11-28)

**P1 prototype playable; CREATOR APPROVAL WITHHELD / P1.5 REQUIRED.** The creator likes the pixel direction but requested smoother walking, continuous music, larger more distinctive islands with elevation, a cleaner game-like HUD and expressive portrait dialogue. [Active polish plan](first-voyage-polish.md) and [handoff](../prompts/first-voyage-polish-kickoff.md) are committed to PR #7. Implementation and new tests are NOT started by this documentation update. Prior P1 test/deployment results below remain historical evidence, not verification of these improvements. Stage 2 remains locked; stop after the updated playable P1.5 preview for creator approval.

## Current pixel reboot — 2026-11-28

Implementation [PR #7](https://github.com/JEDIx420/thehousebythesea/pull/7), branch `feat/pixel-first-voyage`, based on the unmerged PR #6 plan. Main and prior3D branches remain untouched. **P0 COMPLETE · P1 FIRST VOYAGE COMPLETE · WAITING FOR CREATOR VISUAL AND GAMEPLAY APPROVAL. No P2/Stage 2 expansion.**

**Verified playable:** https://jedix420.github.io/thehousebythesea/preview/pixel/ (root review landing also200). [Hosted verify + deploy success](https://github.com/JEDIx420/thehousebythesea/actions/runs/46119325130), [all eight public browser cases PASS](evidence/pixel/live-eight-browser-pass.log), [evidence index](evidence/pixel/README.md).

| Task | Owner | Observed outcome |
| --- | --- | --- |
| P0 renderer / golden | Coordinator + independent agents | Tested Phaser3.90 WebGL; rejected golden-v1, accepted v3 direction before full towns. Golden evidence retained. |
| Asset factory | Coordinator + tool auditor / visual reviewer |280 deterministic frames; five adult actors, four facings, idle/walk/seated; eight boat headings. Offline PixelFX subset genuinely used, audited tools/pins/licences documented. Exact-byte asset check PASS. |
| Domain / storage | Coordinator + state reviewer | Stable IDs/economy/story preserved;41 unit tests PASS. Separate protected schema2 saves, explicit original-save COPY migration, bounded storage errors and serialized writes. All eight final browser cases PASS locally, on hosted Ubuntu24.04 and against the live nested Pages game, including protected corruption/future saves, import and write failures. |
| Authored world / controls | Coordinator + independent geometry reviewer | Two complete islands on continuous sea, shared ground/collision data, reachable landmark and docks. Four path findings fixed; independent4,634 route samples/30,000 controller steps. Native input replay bug discovered in actual journey and fixed. Independent14-check real-browser controls/recovery smoke PASS, zero page errors. |
| Full First Voyage | Coordinator | Actual keyboard/UI route PASS2.4min accelerated automation: Ellis parcel, optional physical Mira boarding/crossing, sail/dock, once-only120 payout, cancel and catch both fish/sell→195, shell arch, return, Mira memory, home notice, journal/credits and exact save/reload equality. This skips the30s memory/reading and is NOT a measured10–15-minute human playtime. |
| Visual review | Independent visual agent | Nine native actual engine screenshots reviewed in batches≤5, no blocking appearance finding. Source art and tools reviewed; animation/feel remains creator judgement.40s silent actual browser excerpt retained. |
| CI / Pages | Coordinator + independent deployment reviewer | Workflow source passes review: full tests before exact-branch deployment, read-only PRs, complete root landing+nested review game. Added only implementation branch to Pages environment alongside main. Root was404 before publishing. Hosted run46119325130 verify/deploy SUCCESS (41 units,8 browser cases); artifact inspected with10 PNGs/metrics/report. Independent public smoke and all eight public browser cases PASS. Final HTML-only cleanup explicitly suppresses Chrome’s implicit site-root favicon404; app bundle/gameplay unchanged, final status recorded in PR checks/live review. |

Evidence: [full keyboard journey log](evidence/pixel/local-voyage-pass.log), [actual screenshots and raw metrics](evidence/pixel/), [engine review + independent browser checks](review-pixel-engine.md), [visual review](review-pixel-visual.md), [world review](review-pixel-world.md), [domain/UI review](review-pixel.md), [deployment source review](review-pixel-deployment.md), [tool audit](pixel-tool-audit.md). Retained failed logs show test discovery/video dependency and genuine queued-input bugs; these are historical failures, not passes. Latest native production bundle `index-DF9pH0Nz.js`.

Raw render-callback samples in native Chrome158/M4/1440×900,640×360 logical2×, show p50≈16.7ms and normal route p95≈16.9ms, with one cold-start>50ms stall. Each later checkpoint keeps a rolling1,200-sample window; not disjoint/full-session FPS samples. Heap after viewport-water fix is≈15–26MB at sampled checkpoints (earlier giant-water209MB is historical). Initial same-origin resource transfer counter≈800KB; navigation/headers and cold-cache conditions differ, see final deployment evidence for public payload. Standard Phaser>500KB chunk warning remains. Firefox/Safari/mobile-touch are untested; no universal performance claim.

Checkpoint decision: **GO for creator hands-on review; NO-GO for later stages without explicit approval.** The optional prologue, sailing, docking, parcel job, both fish/selling, Mira outing/memory, home-fund teaser, chart/journal/settings/credits and protected saves are integrated. All eight browser cases also pass on the public nested deployment (3.2min, full journey2.5min), with10 fresh actual captures under [live evidence](evidence/pixel/live/). Root/home dialogue and fund195 checkpoint survive exact reload.

The failing Actions browser setup was diagnosed as unsupported Ubuntu26 from `ubuntu-latest` and fixed with a supported24.04 pin. A subsequent genuine fishing-test flake was traced to screenshot/readback work during the real2.1s bite window; capturing while waiting and disabling continuous CI video preserved all gameplay assertions/timing. Both corrections have independent review and retained failure records. Native40s motion proof remains committed; hosted artifacts keep screenshots/metrics/report and failure traces.

No P0/P1 defect remains reported by the independent reviewers. Creator judgement on visual style, animation, tone, sound and relaxed10–15-minute pacing is still required; the2.5min automated route is deliberately fast and is not a human-duration claim. The standard Phaser chunk warning and untested Firefox/Safari/touch controls are disclosed. **Stop here.** The only next authorised game work is addressing creator feedback on this First Voyage; no additional island, construction or Stage 2 content has been built.

The older planning status below is retained as history. Its3D rendering direction is superseded by PR #6. Stop after the complete First Voyage for creator hands-on approval.

### Domain checkpoint

Golden sample is frozen at `aa6cc99` in [implementation PR #7](https://github.com/JEDIx420/thehousebythesea/pull/7), which targets the plan branch and keeps main untouched. Pure economy/story rules are ported from the prior implementation; pixel schema2 and a separate IndexedDB namespace prevent accidental legacy overwrites. Explicit legacy COPY migration resets only world positions. Independent five-file domain review and transaction-deadline follow-up pass. `npm test`:31 tests PASS, including fishing timing/terminal guards; typecheck PASS. These modules are not yet wired to the new full scene, so browser storage and complete voyage remain pending.

---

**Last updated: 2026-11-27.** Planning playbook initialised in GitHub. **No game implementation, demo, automated tests or GitHub Pages deployment are claimed completed.**

## Stage board

| Stage | State | Gate | Evidence |
| --- | --- | --- | --- |
| 0 — Foundation / terrain spike | NOT STARTED | Technical review | None yet |
| 1 — First Voyage | NOT STARTED | **Creator hands-on approval required** | None yet |
| 2 — Neighbourhood & livelihoods | LOCKED | Stage 1 approved | — |
| 3 — Full archipelago | LOCKED | Stage 2 approved | — |
| 4 — Love & home | LOCKED | Stage 3 approved | — |
| 5 — Polish / release | LOCKED | Stage 4 approved | — |

## GitHub stage tickets

- [#1 — Stage 0: foundation and terrain spike](https://github.com/JEDIx420/thehousebythesea/issues/1)
- [#2 — Stage 1: the First Voyage approval build](https://github.com/JEDIx420/thehousebythesea/issues/2)

## Next authorised work
Follow prompts/00-foundation.md, then prompts/01-first-voyage.md. Validate locally and in browser, open PR(s), get independent review and verify actual Pages deployment. Collect the creator's feedback, then update the stage state. **Do not start Stage 2 on agent initiative.**

## Progress update template
### YYYY-MM-DD — Stage N — status
- Delivered (with commit/PR links):
- Player-visible behaviour actually verified:
- Test commands / outcomes:
- Browser proof / environment:
- Pages deployment (confirmed link or blocker):
- Known defects/severity:
- Review batches and unresolved findings:
- Decisions updated:
- Approval required:
- Next authorised action:

## Deferred backlog
Later stages: remaining ten islands, richer regional activities, three land plots, staged cottage construction, deeper relationship scenes, festival content, mobile controls and release polish. Do not substitute this backlog for current Stage 1 acceptance.
