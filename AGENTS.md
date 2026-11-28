**ACTIVE TASK — P1.5 (creator feedback, 2026-11-28):** Read [docs/first-voyage-polish.md](docs/first-voyage-polish.md) and [prompts/first-voyage-polish-kickoff.md](prompts/first-voyage-polish-kickoff.md) first. PR #7 already contains the playable pixel First Voyage. Creator likes the pixel direction but requires walking, music, island scale/elevation, HUD and expressive dialogue improvements before approval. Implement on the existing PR #7 branch, preserve saves and gameplay, and stop for creator playtest. The latest plan overrides prior instructions to stop at the existing P1 build; Stage 2 remains locked.

**CURRENT PRIORITY (2026-11-28):** Read [docs/pixel-isometric-reboot.md](docs/pixel-isometric-reboot.md) and [prompts/pixel-reboot-kickoff.md](prompts/pixel-reboot-kickoff.md) BEFORE older rendering instructions. The preferred implementation is browser-based Phaser/TypeScript/Vite 2.5D pixel art, not Three.js/Polyfork/ProceduralTerrains; confirm in a real spike. The visual-tech override does NOT change the story, play loop, initial two-island checkpoint, quality gates or creator approval stop. No code exists yet on main. Preserve all existing documents and assets until reviewed.

# Agent operating contract

Read README.md, docs/vision.md, docs/roadmap.md and docs/first-voyage.md before changing code. The stage-specific briefs in prompts/ are executable assignments, not suggestions.

## Mission
Make a warm, beautiful single-player sailing, fishing, island exploration and romance adventure about a man who dreamed of the sea as a child, saved up for his first boat, and now works toward sharing a beachfront home with the woman he loves. Twelve permanent, distinctive islands are the long-term world; **only two are required for the First Voyage**.

## Authorisation boundary
**Implement Stage 0 (plumbing and proof) and Stage 1 (First Voyage), then STOP for the creator's hands-on approval. Do not implement Stage 2 onward until the creator explicitly says yes.** Do not mistake a merged PR, passing tests, or a deployed page for creative approval.

## Constraints
- Browser, desktop-first, third-person 3D, free/static, no backend. Deployment target: GitHub Pages /thehousebythesea/.
- Prefer Three.js, strict TypeScript, Vite, finite authored terrain via ProceduralTerrains after a measured spike, selected free low-poly Polyfork GLBs with attribution.
- No Cloudflare, multiplayer, authentication, online payments, server persistence, combat, hunger system, village building, infinite ocean, or mystery-as-main-plot.
- The female lead has her own ambitions and agency. Shared experiences and story choices matter more than buying affection.
- Development must be playable: pretty screenshots alone are not proof of walking, sailing, docking, fishing or talking.

## Rules for implementation
1. Read the source-of-truth docs and relevant stage prompt. Record unresolved choices in docs/decisions.md rather than silently changing the concept.
2. Keep systems modular: world, rendering, walking, boat, interaction, fishing, jobs/economy, narrative, UI, persistence. Gameplay state must not be stored solely in scene objects.
3. Use stable IDs, data-driven content, TypeScript strictness, a dependency lockfile and deterministic state transitions. Avoid undocumented one-off scripts.
4. Verify ground height and collision against the **same** world surface. ProceduralTerrains CPU sampling may differ from the rendered GPU surface.
5. Download only verified, appropriately licensed assets. Maintain individual URLs, licences, modifications and credits; do not assume Polyfork characters arrive rigged or animated.
6. Build for the GitHub Pages repository subpath; test actual static builds, refresh behaviour, asset loading, reload/save and shoreline interactions.
7. Test locally: build, typecheck, unit tests, real browser flows. State the actual commands and pass/fail evidence in the PR. Never report unrun tests as passing.
8. Keep PRs reviewable, never overwrite unrelated work, and favour one playable vertical slice over many disconnected placeholders.
9. Update docs/progress.md and an ADR when architecture or scope changes. Follow docs/agent-workflow.md for handoffs and reviewer responsibilities.
10. If blocked, leave a usable result and a precise blocker. Do not silently swap infrastructure, spend money or expand scope.

## Done means
A reviewer can open the built experience, play the full documented route, see saved money/progress after a reload, read credits, and verify the tests and known issues. Reports include demo URL only if independently confirmed live. After Stage 1, ask the creator to play it and approve changes **before** any expansion.
