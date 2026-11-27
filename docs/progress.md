# Current status — Stage 1B visual baseline reset

**2026-11-27: creator rejected the prior visual baseline. Issue #4 corrective work is ACTIVE on `fix/stage1-visual-baseline`. PR #3 is preserved and unmerged. No visual approval and no Stage 2.**

Follow [art direction](art-direction.md), [corrective board](visual-reset-progress.md) and [review evidence](visual-reset-evidence.md). V0–V3 are implemented and independently reviewed: creator-selected **Polyfork Family Traveller is Mira**, Quaternius people are Rowan and the neighbours, and the real Polyfork caique and coastal models are in the game. Six matched comparisons, Mira front/three-quarter/walking views and a verified 31.92-second gameplay recording are complete. Strict typecheck, build, 33 unit tests and the six-case hardware browser suite passed. The same six-case software Chromium suite passed in7.2 minutes and, with final continuous real-key navigation, in4.2 minutes. Hosted Linux verification is tracked separately in [PR #5 checks](https://github.com/JEDIx420/thehousebythesea/pull/5/checks); source-reviewed real-key helper follow-up `71902b3` preserves all assertions and the original graphics/gameplay. [PR #5](https://github.com/JEDIx420/thehousebythesea/pull/5) preserves #3 unmerged. **Creator visual/gameplay approval is still required; no Stage 2.**

The historical First Voyage reports below establish gameplay and local tests only. They do **not** grant visual approval. Linux CI timeouts, measured causes and corrective test-input changes are documented in the new review and logs; current hosted status is linked above.

---

# Execution status

**Last updated: 2026-11-27.** Stage 0 and Stage 1 are implemented and independently reviewed. **WAITING FOR CREATOR APPROVAL.** No Stage 2 work is authorised. Production deployment remains separate from local proof.

## Stage board

| Stage | State | Gate | Evidence |
| --- | --- | --- | --- |
| 0 — Foundation / terrain spike | COMPLETE — technical review passed | Reviewed implementation `f788256` | [Measured proof](terrain-spike.md), [world review](review-world.md), [state review](review-state.md), [controls review](review-controls.md) |
| 1 — First Voyage | WAITING FOR CREATOR APPROVAL | Creator hands-on approval required | [Playtest guide](player-guide.md), screenshots in evidence/, [integration review](review-integration.md) |
| 2 — Neighbourhood & livelihoods | LOCKED | Explicit Stage 1 approval | No implementation |
| 3 — Full archipelago | LOCKED | Later approval | No implementation |
| 4 — Love & home | LOCKED | Later approval | No implementation |
| 5 — Release-quality polish | LOCKED | Later approval | No implementation |

## Coordinator work packages and ownership

| Package | Owner | Dependencies / acceptance | Outcome |
| --- | --- | --- | --- |
| 0A — scaffold / static deployment | Coordinator | Strict TS, lockfile, nested-path build, workflow | Implemented; local typecheck/build pass, Pages Actions source configured |
| 0B / 1A — terrain and environment | Terrain implementer | Real runtime/export comparison, exact production triangle surface, two authored islands, licensed GLBs | Proof and scene complete; independent world reviewer found/fixed hut collision and documented export mismatch |
| 0C / 1B — avatar and boat | Controls implementer | Ground/shore collision, bounded sea, walk/board/sail/dock | Implemented; independent reviewer found/fixed mirrored hull footprint and rotation clearance; six movement tests pass |
| 0D / 1C — domain and persistence | State implementer | Stable IDs, repeat-safe rewards, schema/load/save, relationship and fund | Implemented; 21 state tests pass; independent browser verifies corrupt/newer saves preserved and unavailable storage warns |
| 1D — integrated UI / story / audio | Coordinator | First-person-independent camera, interactions, fishing, Mira, chart/journal, original ambience and credits | Full local route passed; independent UI review closed title-Escape and WebGL startup defects |
| 1E — final proof / review / PR | Coordinator + independent reviewers | Build/install, browser route, actual screenshots, reviewed SHA, Pages status | Final four-test browser suite passed; PR and remote CI handoff below |

## Review process

Independent agents review work they did not implement in batches of at most five files or one coherent subsystem. Initial findings, exact reproductions, corrective rounds and pass/not-tested distinctions remain in `review-*.md`. No P0/P1 finding is silently waived. Reviewed immutable implementation: `f788256bebd0d958b96c5397fbe4922746855d31`. Final installed-Chrome suite passed all four tests in 1.8 minutes, including the real-input round trip. See [test evidence](test-evidence.md), [exact log](evidence/independent-browser.log), [recording](evidence/first-voyage.webm) and [metrics](evidence/gameplay-metrics.json).

## Decisions and scope

D-008 through D-011 appended to [decisions](decisions.md): measured terrain fallback, IndexedDB protection, original motion/verified props, main-only publishing and creator gate. Only Havenport and Saltglass are playable. Ten later islands, construction, wider economy, deeper romance and mobile work remain deferred.

## Current deployment state

GitHub API configured Pages `build_type=workflow` successfully. [PR #3](https://github.com/JEDIx420/thehousebythesea/pull/3) is open with independent review reports and test evidence; remote verification is in progress. Deployment workflow publishes only main. No live game is claimed before an actual successful deployment and page visit. Local built preview: http://localhost:4180/thehousebythesea/ (open in the app browser). A separate test preview uses port4173.

## Known limits to disclose at creator gate

- Terrain runtime/export spike is a small benchmark, not a full-game performance guarantee; exported proof has visual artifacts and is not production terrain.
- Original people and boat use procedural geometry/animation. Polyfork huts, benches and lamps are integrated; inspected character/boat assets are reference-only.
- Decorative plants, rocks and benches are not walking colliders; main buildings and shore are.
- Firefox/Safari and subjective audio listening remain untested. Modal keyboard focus was corrected and independently rechecked.
- The automated route is much faster than the intended 10–15 minute reading/exploring first play. Human pacing/art/handling needs creator feedback.

## GitHub stage tickets

- [#1 — Stage 0](https://github.com/JEDIx420/thehousebythesea/issues/1)
- [#2 — First Voyage](https://github.com/JEDIx420/thehousebythesea/issues/2)

## Next authorised action

Creator plays the First Voyage and provides feedback or explicit approval. Apply requested changes within Stage 1 only. No Stage 2 work until explicit approval. The PR is not auto-merged.

## Final local result

Clean `npm ci`, typecheck,29 unit tests, production build and asset audit passed. Final exact-bundle independent browser suite:4/4 passed. On Apple M4 / Chrome158 /1440×900, measured scene p50 was16.7ms and p95 was16.7–16.8ms; scene draw calls141–293; estimated JS heap14.1–53.5MB. These are this hardware's observed samples, not universal guarantees. Delivery plus fish sales restores195coins, completed work, discoveries, shared outing and checkpoints after refresh. All reported P0/P1 review findings are closed. Initial failed attempts and untested areas remain in test-evidence.md.

## Remote CI follow-up

First Linux verification passed build/unit and3browser resilience cases, but the full route timed out in its initial walking helper under slow software rendering. Test-only render-scale/input-timing fixes are under independent review and retry. Production code and local creator preview remain unchanged. See test-evidence.md for the failed run and corrective measurements.
