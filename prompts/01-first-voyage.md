# Stage 1 implementer prompt — The First Voyage

**Authority:** Stage 1 is authorised following technical foundation. This is the **creator approval build**. Read AGENTS.md, docs/vision.md, docs/world-story.md, docs/gameplay.md, docs/first-voyage.md, docs/quality.md and docs/agent-workflow.md. Do not work on Stage 2.

## Mission
Deliver a beautiful, playable 10–15 minute **single-player** story slice on GitHub Pages. The player is a young adult who has finally bought the boat he dreamed of since childhood. He meets the girl he loves, works a little, sails to another island, fishes, docks, walks and interacts, earns coins and begins saving for a beach house. All of this must work in **one contiguous game**; nothing is a disconnected fake menu or screenshot.

## Milestones, in order
1. **First impression:** skippable short childhood memory, pleasant start screen and readable UI. Introduce Havenport with a lively waterfront, dock, ambience and at least three visible NPCs. Quality first; no feature dump.
2. **Character and boat:** reliable third-person walking/camera, interact hints, board, sail, turn, stop, dock, disembark and reboard. Water should have life, and neither character nor boat should get stuck.
3. **Two real islands:** Havenport and Saltglass Bay are complete small walkable areas. Saltglass has a fisher NPC, a distinct view and a safe route ashore. The main sailing link is clear and pleasant. Leave ten other islands as future map entries or silhouettes only.
4. **Meaningful work:** one paid parcel delivery between islands and a functioning fishing/catch/inventory/sell loop (at least two fish types). Wallet visibly changes, rewards cannot double-pay and the player can cancel/retry gracefully.
5. **Romance + purpose:** authored conversations with Mira, one optional short outing/date interaction, a look at a potential beachfront home site and an understandable home-fund milestone. Mira has an independent personality and choices. Do NOT implement full building or gift-grinding mechanics.
6. **Continuity:** functional chart and journal, pause/audio settings, credits generated from verified asset records, serialised versioned save and reload of wallet, job/story state, discoveries, boat/player checkpoint and relationship milestone.
7. **Polish and prove:** believable shoreline/camera/animations, actual in-browser snapshots and a full player path. Validate static assets under GitHub Pages project prefix and confirm deployment if available.

## Minimum proof script
Start → skip/see intro → walk Havenport → meet harbourmaster → accept delivery → talk to Mira → board and sail → dock at Saltglass → walk and deliver → fish and earn coins → return / optional outing → check home fund and journal → refresh → correct state restored. Confirm no repeat payouts, fall-through, permanently stranded boat or trapped dialogue.

## Required engineering discipline
Follow docs/first-voyage.md as acceptance contract; all jobs, currency and story flags use stable IDs and idempotent actions. Use selected, provenance-checked Polyfork GLBs and a tested terrain surface. If an asset isn't animated, add legally sourced/procedural basic animation and disclose limitations. Do not trade away safe docking to get prettier water.

## Review and stop
Run clean install, typecheck, tests, production build and real browser flows. Fix reviewer P0/P1 defects in iterative batches of at most five changed files/systems. Provide screenshots/video, actual test output, a clear PR and a confirmed Pages link **only if live**. Update docs/progress.md to **WAITING FOR CREATOR APPROVAL**. Ask the creator to play and provide feedback. **Do not start Stage 2 or expand to twelve islands without explicit approval.**
