# The House by the Sea — pixel First Voyage

A Phaser/TypeScript pixel-isometric reboot implementing [PR #6's direction](docs/pixel-isometric-reboot.md). Only **Havenport ↔ Saltglass Bay** is built. Rowan owns his first boat, earns a living, meets Mira on her own creative path, and starts saving for a beach home. Main and earlier3D PRs remain untouched.

**First Voyage verified — WAITING FOR CREATOR APPROVAL:** [implementation PR #7](https://github.com/JEDIx420/thehousebythesea/pull/7). [Play the First Voyage](https://jedix420.github.io/thehousebythesea/preview/pixel/) — independently opened and tested live. Current tests, screenshots, review findings and publishing proof are in [progress](docs/progress.md) and the [evidence index](docs/evidence/pixel/README.md). Stop after the First Voyage for creator visual and gameplay approval; further islands and construction remain locked.

## Run locally

Node 22.12+ and npm. No credentials, accounts, paid APIs or external runtime services.

```sh
npm ci --ignore-scripts
npm run assets:build
npm run assets:check
npm run typecheck
npm test
npm run build
npm run preview -- --port 4190
```

Open `http://localhost:4190/thehousebythesea/`. Original art sources, palette, contact sheets and recipes are checked in; compiled art is deterministic. Read the [style guide](assets/style-guide.md), [free-tool audit](docs/pixel-tool-audit.md), [architecture](docs/architecture.md) and [notices](public/THIRD_PARTY_NOTICES.txt).

## Play the checkpoint

WASD/arrows walk relative to the screen. E talks, boards or ties up. At sea W accelerates, A/D steer and S slows; leave the pier straight ahead before turning. M opens the chart, J the journal, F casts/puts away the rod, Space reels during a bite, Esc pauses. Mouse wheel toggles integer zoom. R or pause recovery returns both Rowan and boat safely to the current island's pier, preserving progress.

Skip or watch the 30-second childhood memory. Take Ellis's 120-coin parcel at Havenport, talk with Mira and optionally invite her across. Board at the pier and wait for her to walk aboard. Sail north through the continuous channel; slow beside Saltglass's pier and E to step ashore. Give Nessa the parcel once, fish/sell a catch, and follow the pale path to the shell arch. Return to Havenport, share the crossing with Mira and read the beachfront plot notice. The wallet/home-fund tracker and journal record progress. No romance purchase or mandatory affection grind.

Saving is local IndexedDB, automatic after story/economy changes and periodically during movement; manual Save is in pause. Only confirmed commits report saved. Unknown/corrupt snapshots are protected and offer temporary play. The optional original3D save import makes a COPY into a separate pixel database, retaining progress and resetting only coordinates to safe pixel docks. Saves are specific to your browser/device/origin; there is no cloud service.

## Browser tests and Pages package

```sh
npx --no-install playwright install chromium ffmpeg
npm run test:e2e
PIXEL_PAGES_PREVIEW=1 npm run build
node tools/package-pages.mjs
```

Local tests use installed Google Chrome; CI uses Playwright Chromium (`CI=1` locally selects it). Recording requires Playwright's ffmpeg dependency. Eight isolated browser cases exercise native menus/layout, protected corrupt/future saves, stalled/missing/malformed art, legacy COPY import, failed writes and the full journey through both fish species and exact save/reload. They drive real keys and buttons; only storage-fault tests seed their own disposable IndexedDB fixtures. Screenshots/metrics are saved alongside checkpoint evidence; native videos and failure traces are under ignored `test-results/`; CI uploads checkpoint images/metrics and an HTML report with failure traces, without continuously recording video. `PIXEL_TEST_BASE_URL` runs the same journey against a verified remote/static nested base without starting a local server.

The exact implementation branch's workflow verifies assets, 41 unit tests, build and all browser tests before deploying a complete Pages landing plus `/thehousebythesea/preview/pixel/` review game. PRs run checks with read-only permissions. No merge to main is needed for review publishing. See [independent source/review records](docs/review-pixel.md) and [deployment review](docs/review-pixel-deployment.md). Chromium/Chrome are tested; Firefox/Safari and touch-only play are not claimed.

---

## Original planning context (preserved)

The following reflects the original pre-implementation brief. The current pixel rendering and asset direction above supersedes its3D instructions; its story and approval gates still apply.

*A cosy single-player sailing, fishing, island-life and romance adventure.*

A boy who dreamed of the ocean grows into a man, saves for years and finally buys his first little boat. He earns a living among twelve distinct islands, builds a meaningful relationship with a woman he loves, and works toward a modest beach home they can imagine sharing. The game celebrates honest work, exploration, little adventures and a life built over time—not combat, survival pressure or saving the world.

## Project status

**Planning baseline created 27 November 2026.** This repository starts as a production brief, **not a playable game**. Gameplay implementation and deployment must be verified by the implementation agent; do not infer they exist merely because they are described here.

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

The implementation agent will create the scripts and workflow. Until then there is no valid `npm install` or `npm run dev` expectation. Once scaffolded, document the actual commands and keep them reproducible with a lockfile. GitHub Pages requires Settings → Pages → **GitHub Actions**; the game build must set Vite's repository base to `/thehousebythesea/`.

**Creator approval is a release gate, not an invitation to start the next stage automatically.**
