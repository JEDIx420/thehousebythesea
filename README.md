# The House by the Sea

*A cosy single-player sailing, fishing, island-life and romance adventure.*

A boy who dreamed of the ocean grows into a man, saves for years and finally buys his first little boat. He earns a living among twelve distinct islands, builds a meaningful relationship with a woman he loves, and works toward a modest beach home they can imagine sharing. The game celebrates honest work, exploration, little adventures and a life built over time—not combat, survival pressure or saving the world.

## Project status

**First Voyage implementation — 27 November 2026.** Stage 0 and Stage 1 now have a playable two-island approval build. See [execution status](docs/progress.md), [player guide](docs/player-guide.md), [terrain proof](docs/terrain-spike.md) and [test evidence](docs/test-evidence.md). **WAITING FOR CREATOR APPROVAL** before any Stage 2 work.

**Current authorised delivery:** Stage 0 (foundation and integration proof) **plus** Stage 1 (the First Voyage playable vertical slice). **Stop for the creator's explicit hands-on approval before Stage 2.** Follow the gates in [docs/roadmap.md](docs/roadmap.md) and the acceptance contract in [docs/first-voyage.md](docs/first-voyage.md).

## Read in this order

| Purpose | File |
| --- | --- |
| Every coding agent starts here | [AGENTS.md](AGENTS.md) |
| What must never drift | [docs/vision.md](docs/vision.md) |
| Characters, 12 islands and story | [docs/world-story.md](docs/world-story.md) |
| Activities, progression and house | [docs/gameplay.md](docs/gameplay.md) |
| Hosting, saves, code boundaries | [docs/architecture.md](docs/architecture.md) |
| Terrain/Polyfork pipeline and licensing | [docs/assets-terrain.md](docs/assets-terrain.md) |
| Stages, dependencies and approval gates | [docs/roadmap.md](docs/roadmap.md) |
| Exact first-playable definition of done | [docs/first-voyage.md](docs/first-voyage.md) |
| Tests, browser evidence and performance | [docs/quality.md](docs/quality.md) |
| Multi-agent coordination and handoffs | [docs/agent-workflow.md](docs/agent-workflow.md) |
| Decisions, risks and open questions | [docs/decisions.md](docs/decisions.md) |
| Actual progress and blockers | [docs/progress.md](docs/progress.md) |

## Implementation prompts

Use [prompts/00-foundation.md](prompts/00-foundation.md) then [prompts/01-first-voyage.md](prompts/01-first-voyage.md). Assign [prompts/reviewer.md](prompts/reviewer.md) to an independent reviewer if available. Stage 2 onward has separate briefs under `prompts/` **but is not authorised until the first experience is approved**.

## Non-negotiables

- **Platform:** browser; deploy a built static site to GitHub Pages at `https://jedix420.github.io/thehousebythesea/`.
- **Core:** Three.js, TypeScript, Vite; evaluate ProceduralTerrains for finite authored islands; favour free low-poly Polyfork GLBs with attribution.
- **Scope:** one interconnected, bounded archipelago of **12 fixed islands** in the eventual game; Stage 1 proves just **two**.
- **Play:** third-person walking, steering and docking a boat, fishing, paid work, recurring NPCs, relationship scenes, saving for a beach property; eventually build one personal house.
- **Not now:** multiplayer, Cloudflare, server, authentication, village management, infinite-generated ocean, combat, a mystery-as-main-plot, paid services or large-scale feature expansion.
- **Reality check:** an attractive concept illustration is not a playable mechanic. Every gameplay claim requires a visible in-browser implementation and evidence.

## Developer orientation

Requirements: Node.js 22+ and npm. Use a desktop WebGL2 browser with hardware acceleration.

```sh
npm ci
npm run dev
# http://localhost:5173/thehousebythesea/

npm run typecheck
npm test
npm run build
npm run preview -- --port 4173
# http://localhost:4173/thehousebythesea/

npx playwright install chromium
npm run test:e2e
```

Local browser tests use installed Google Chrome for hardware rendering; CI uses downloaded Chromium at half render scale for software rasterisation (the CSS viewport and complete gameplay assertions stay unchanged). To use Chromium locally, set `CI=1 npm run test:e2e`. Successful runs retain video in `test-results/`; failures retain screenshots and traces. Nine in-game screenshots and per-scene measurements are written to `docs/evidence/`. Read the [playtest route and controls](docs/player-guide.md).

Vite builds `/thehousebythesea/` into `dist/`. The workflow verifies pull requests and deploys **main only** using official Pages Actions. Pages source is configured to GitHub Actions; the deployment is not live until a successful main build/deploy. No runtime accounts, secrets or remote APIs are used.

Terrain proof: start dev on port 5173, then `node tools/run-terrain-spike.mjs`. Asset audit: `node tools/inspect-assets.mjs`. These documented authoring tools are separate from the shipped game.

**Creator approval is a release gate, not an invitation to start the next stage automatically.**
