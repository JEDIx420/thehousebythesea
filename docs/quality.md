# Quality strategy, evidence and release gates

**Principle:** a picture of a boat is not sailing, a path is not walkability, and a test name is not a passing test. Verify what the player can actually do on a rendered page.

## Verification layers
**Static checks:** dependency installation from a lockfile; TypeScript strict typecheck; lint if installed; Vite build. No warnings silently reclassified as successful errors.

**Pure-unit tests:** movement constraints, boat state transitions, inventory accounting, money rewards, fish catch states, quest ID state machine, home-fund math, versioned save parsing/migration. Fake time and random seeds where appropriate.

**Browser integration:** Playwright scenarios with actual 3D canvas rendering (test WebGL availability instead of skipping silently). Load start menu; skip intro; walk/interact; board; sail; dock; walk Saltglass; complete delivery once; catch/sell fish; invite Mira; return; save/reload; reopen credits. Verify both visible state and saved logical state. All failures produce trace/screenshot on local run. Browser screenshot does not stand in for interaction assertions.

**Human eyes/ears:** test seawater/shoreline seams, NPC appearance, camera tracking, dialog legibility, ambience licensing, confusing prompts, boat handling, emotional tone and a complete 10–15 minute playthrough.

## Minimum test matrix

| Area | Scenarios |
| --- | --- |
| Boot / deploy | Cold start, slow load, static nested project path, refresh, missing asset graceful fallback |
| Terrain | Dock elevation, foot on slopes, beach edge, obstacle collision, no fall-through, water level |
| Boat | Board / unboard repeatedly, cancel, approach dock, turn/stop, return from near boundary, recover from invalid landing |
| Economy | Fish payout, first delivery, repeated completion pays once, restart after interrupt |
| NPC / story | Interact, exit dialogue, re-enter, Mira invitation and optional deferral, skippable intro |
| Save | Refresh from each key state, schema validation, corrupted data fallback, no item/coin duplication |
| UX | Pause and resume, audio controls, readable text, chart/journal, keyboard-only UI, credits |
| Visual / performance | Harbour, open sea, approach, dock, island walking, evening, asset loading stutter |
| Compatibility | Latest Chrome desktop, Firefox desktop, Safari desktop if accessible; disclose untested browsers |

## Performance observations
Record browser/version, device class, viewport, render scale, FPS and frame-time at harbour, sea and dock, initial load payload, peak memory if measurable, draw calls and known expensive effects. Normal-scene **30 FPS sustained** is a target on a contemporary laptop, not a pre-verified guarantee; aim for 60 when feasible. If measured performance misses target, capture repro and reduce terrain/runtime cost before adding islands. Make low/medium quality settings possible if needed. No hard-coded mythical troop or texture budgets.

## Asset and licence audit
Every third-party mesh, audio file, texture, icon and font has an explicit source, licence and attribution obligation. Use local static files and credits. Compare shipped files with the manifest; remove unaccounted assets. Inspect character animation and model dimensions before relying on them. Do not copy copyrighted game music.

## Build / deployment evidence
At each stage, the PR contains exact commands and observed results for install, typecheck, tests and build. The Pages site is a separate verified outcome: open the live GitHub Pages path and demonstrate assets load with the /thehousebythesea/ prefix. If Pages is unconfigured, explicitly identify manual Settings → Pages → GitHub Actions as the dependency; local build success is not live deployment success.

## Reviewer exit severity
- **P0:** game cannot load, data loss, licence violation/security exposure. Block all approval.
- **P1:** sailing/landing/fishing/job/romance path broken, unearned reward, persistent softlock, major performance regression. Block Stage 1 creative approval.
- **P2:** poor visual fidelity, confusing UI, inconsistent animation, minor scene defects. Fix before creator acceptance or record explicit approved waiver.
- **P3:** polish/optional follow-ups. Record for later stages without expanding current scope.

## Required deliverables
Screenshots from the **actual browser build** (harbour, sailing, pier landing, Saltglass exploration, fishing, Mira, home fund, credits); a short playthrough recording when tooling permits; test logs; known issue list; version/commit SHA; optional verified live site. A reviewer cannot merely say "looks good"—they must list tests, problems and acceptance status.

## Stop rule
Technical checks and independent review are necessary but not sufficient: **only the creator can approve the First Voyage's feel and authorise Stage 2**.
