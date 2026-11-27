# Stage 0 implementer prompt — foundation and proof

**Authority:** Stage 0 is authorised. Read AGENTS.md, docs/vision.md, docs/architecture.md, docs/assets-terrain.md, docs/roadmap.md, docs/quality.md, docs/agent-workflow.md and docs/decisions.md. Don't begin Stage 2 or the full twelve-island build.

## Goal
Establish a *real, locally runnable, GitHub Pages deployable* Three.js/TypeScript/Vite game scaffold, backed by a measured terrain/boat/ground proof and reliable state/persistence plumbing. End with a deliberate technical decision rather than a technical shopping list.

## Work sequence
1. Inspect current branch and repo; preserve authored docs. Initialise Vite + strict TypeScript + Three.js with a lockfile, small app lifecycle, error/loading screen, resize handling, proper disposal, useful developer commands and a clean README Quick start (once code exists).
2. Verify current procedural-terrains and Three.js compatibility and licensing from upstream; build an **actual** finite island, shoreline and water proof using the live runtime. Compare with using ProceduralTerrains as a design/export tool feeding compact static GLBs, collider data and a simpler Three.js scene. Check WebGL2, CPU-height approximation vs ground truth, nested-path loading and real browser frame time. Record screenshot, measured trade-offs and a chosen approach in docs/decisions.md. No pretend benchmark or unexplained substitution.
3. Demonstrate a basic third-person avatar walking on verified terrain, boarding a controllable little boat, steering, docking/disembarking and recovering when shore contact is unsafe. Use temporary assets only if labelled temporary. Make water visually alive even in the spike.
4. Create stable island/player/boat data contracts, event-driven domain actions, one versioned save/load fixture and an idempotent money/job reward test. Document ownership boundaries before asking other agents to edit overlapping files.
5. Add initial unit testing and Playwright or equivalent browser smoke path, build script, and minimally privileged GitHub Pages Action deploying Vite dist from main. Vite base must be /thehousebythesea/. Test the built game in a browser under a nested path. If repo Settings → Pages cannot be changed via available permissions, clearly note the single manual click needed; do not claim it is live.
6. Implement the third-party asset manifest / credits mechanism and validate one legitimately downloaded Polyfork GLB. Check licence/source, dimensions, triangles and animations before assigning behaviour.
7. Log all test commands, results, performance observations, technical choices and blockers in docs/progress.md. Open a coherent PR (or a focused series with clear dependency) and get an independent review using prompts/reviewer.md. Fix P0/P1 findings before declaring Stage 0 complete.

## Acceptance / guardrails
Runnable app and proof, accurate ground collision and boat transition, clean static production build, verified asset source/credits, save fixture, no backend/costs, no broken /thehousebythesea/ asset path. Don't spend the stage building shops, all quests, twelve islands or a custom engine. Explicitly label any prototype visual placeholders.

## Handoff
When Stage 0 passes technical review, continue directly to prompts/01-first-voyage.md without asking the creator to re-explain the concept. **After Stage 1, stop for creator approval.** Report exactly what is genuinely implemented and what was not tested.
