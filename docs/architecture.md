# P1.5 implementation — 28 November 2026

This section supersedes the historical P1 details below. Only the existing two islands and First Voyage systems are implemented.

- **Transient feel:** `Locomotion` owns idle/start/walk/stop velocity, 110ms acceleration/88ms stop, normalized screen controls, 120Hz collision substeps and distance-driven12-pose gait. Velocity is cleared by menus, blur, fishing, boarding and recovery. Four authored facings use20% hysteresis; independently phased four-pose idle and planted fishing/seated poses share foot anchors. Safe validated pier stepping is transient; the saved checkpoint remains coherent throughout. The camera uses a180ms time constant, small dead zone/velocity lookahead, rounded rendering and avatar-anchored integer zoom.
- **World:** `world.json` authors generous districts, ramps and24px/28px plateaus. `assets/source/surface.mjs` is shared by the offline baker and runtime: elevation, standing clearance, step transitions and pointer picking agree. Raised tops and short front-wall chunks have explicit offsets/depth; actors on top sort above rims, actors below behind them. Land extents/padding derive from contours. A2048px-wide padded atlas stays within4096px hardware dimensions; no runtime terrain painting. The CPU route/area audit produces an annotated map and radius-aware sampled area/BFS results.
- **Navigation/saves:** `src/data/navigation.ts` centralizes island offsets, docks, safe points and companion routes. Schema2 retains the stable economy/story IDs, but worldVersion is `pixel-first-voyage-v2`. IndexedDB pixel database version2 preserves its object store and blocks stale version1 clients. Current valid walking positions survive; old Saltglass local coordinates translate by−120; tagged berths remap together; valid midsea positions survive; invalid positions repair to the appropriate safe island/pier. No migration invokes rewards. New mix/text settings default around the existing master volume. The exact original v1 snapshot is retained once at `before-world-v2` in the same committing transaction as the new save; failures roll back both. Corrupt/future/legacy protection and explicit original3D COPY remain intact.
- **Dialogue/HUD:** small location/fund/objective and corner pixel icons leave the world open. Character conversations use a separate bottom view, typed ordered speaker/expression beats, original96×128 busts, stable NPC-left/Rowan-right exchanges, inactive dimming and blink. Typewriter34chars/s, reveal then advance, native accessible choices, full-beat announcements, release/repeat guards, focus restoration, instant text/reduced motion. Chart/book/pause retain existing action routes and readable storage warnings.
- **Audio:** one gesture-started WebAudio director owns music, ambience, effects and master gains. Three original96s32-bar arrangements use a common motif with distinct orchestration, lazy local MP3 decode, bounded two-buffer cache,2s crossfades, retained fading sources until stopped, dialogue ducking, visibility fade and disposal. District filters/bird intervals, material steps and short cast/catch/job sounds remain separate from music. Failures have10s deadlines/30s retry cooldown and visible status while gameplay/surf continue. Compressed total2,306,010bytes. Source score/seed and deterministic offline synthesis are committed; FFmpeg compresses the PCM. `music:check` verifies committed hashes, provenance, duration metadata and payload/header constraints; browser tests verify actual decoded duration, nonzero music-bus output and a real full-loop clock.

New independent reviews: [world](review-p15-world.md), [state/audio](review-p15-state.md), [art](review-p15-art.md). Actual executed outcomes and deployment are recorded in progress/evidence; source descriptions alone do not imply a hosted result or subjective approval.

---

# Implemented pixel architecture — 2026-11-28

This section records the PR #6 reboot implementation on `feat/pixel-first-voyage`. The original proposed3D architecture is retained below as history. Only Havenport and Saltglass Bay are playable; creator approval gates any expansion.

- **Runtime:** pinned Phaser3.90, strict TypeScript5.9, Vite7.3.8. One continuous `first-voyage` scene projects logical x/z at4/2 pixels. Both terrain images and walk/boat collision derive from the exact same `assets/source/world.json` contours, docks, footprints and boat hull. No physics server, 3D mesh, model API or runtime asset service.
- **Rendering:** 640×360 maximum logical viewport, integer2×/3× CSS upscale, nearest pixels, foot-Y depth ordering and foreground fading. Eight boat headings, four character facings and authored walk/idle/seated loops; separate required companion route and optional decorative motion. Water is viewport-sized, camera-relative tiled texture, avoiding a giant backing canvas. Mouse wheel switches integer camera zoom. Pointer diagnostics use the inverse world projection.
- **Movement:** pure `src/player/movement.ts` handles normalized screen-relative foot controls, bounded substeps, acceleration, inertia, braking, hull-aware steering and proximity-checked docks. At a pier, leave straight ahead before turning to give the hull room. R/pause recovery places both Rowan and boat safely at the last visited island pier while preserving progress.
- **Gameplay:** `src/state/game.ts` is the serializable deterministic economy/story reducer; `src/activities/fishing.ts` is a cancellable two-species timing machine. `src/game/dialogue.ts` contains authored conversations; `src/world/people.ts` moves Mira along the shared pier, into the boat and home after the outing. `VoyageScene` coordinates actual interaction, visuals and controls. It exposes cloned read-only state/metrics for browser assertions, no teleport or reward debug commands.
- **UI/audio:** accessible DOM title, prologue, dialogue, chart, journal, fund, settings, credits and warning panels over Phaser. Native keyboard events are handled once, with native button/slider behaviour preserved and gameplay input locked during panels. Surf is original seeded WebAudio noise, optional/muteable; no recording downloads.
- **Saves:** IndexedDB `thehousebythesea-pixel` / `snapshots` / `first-voyage`, schema2 and worldVersion`pixel-first-voyage-v1`. Validation and bounded open/read/write deadlines; saves complete only after transaction commit. Unsupported/corrupt existing data locks writes and offers temporary play. Explicit COPY import reads original `thehousebythesea` schema0/1, preserves money/items/jobs/story/settings, resets only positions to safe pixel docks, and never writes the original DB. Revisions serialize/coalesce autosaves; failures stay visible and retryable.
- **Assets:** deterministic offline raster recipes + pinned minimal MIT PixelFX helper;280 manifest frames, shared anchors and2px atlas padding. Source/contact sheets in `assets/source/`, compiled atlas/metadata and notices in `public/`. `assets:check` recompiles and compares exact bytes. No remote generation, credentials or paid services. See the style guide and tool audit.
- **Returning browser caches:** a content revision derived at build time from the art/audio manifests versions all atlas/metadata/portrait/music/provenance URLs. Shared `resourceUrl` keeps the canvas and DOM coherent; normal JS/CSS keep Vite fingerprints. Actual Pages600s caching is covered by a real warm-cache regression with old280-frame art and a completed v1 save. Markdown-only builds retain the same resource revision.
- **Deployment:** default build base `/thehousebythesea/`; `PIXEL_PAGES_PREVIEW=1` builds `/thehousebythesea/preview/pixel/`. `tools/package-pages.mjs` packages a complete site landing and nested review game into ignored `dist-pages/`. Official pinned GitHub Actions verify unit/assets/build/browser before uploading and deploying. Only pushes of this exact owned branch can publish; PR jobs have read-only permissions. The environment retains main and explicitly allows this branch. Main/source history is not merged or rewritten. Deployment status is recorded separately in progress/evidence, never inferred from workflow configuration.

Tests use Vitest only for `src/**/*.test.ts`, and Playwright for `tests/browser/`. Browser journeys use real controls, UI and read-only observations. CI screenshot capture occurs outside the real fishing response window; continuous CI video readback is disabled to avoid software-renderer contention, while the native40s gameplay recording is retained. Isolated corruption/import fixtures seed storage only in their own disposable browser contexts. A browser recording and a screenshot do not replace assertions of actual movement, payout, catch and persisted reload.

---

# Technical architecture (proposed; prove in Stage 0)

## Deployment constraint
This is a **fully static single-player browser game**. Source lives in GitHub and Vite produces a dist/ directory for GitHub Pages at https://jedix420.github.io/thehousebythesea/ . Configure Vite base as /thehousebythesea/. GitHub Pages must be set in Settings → Pages → Source: GitHub Actions; an implementation agent should report this as a human setup action if it cannot enable it. Do not invent a live URL or claim deployment success without opening the page.

No Cloudflare, own web servers, game servers, authentication, paid APIs, database services, real-money commerce or multiplayer.

## Small technology stack
- **Three.js** for rendering and GLB asset loading, camera, animation and world; TypeScript strict mode; Vite build.
- **ProceduralTerrains** as the preferred finite island authoring/generation candidate. Test its standalone runtime versus baking authored terrain GLB/collision data; use the approach that best supports reliable walking, water, performance and static deployment.
- **Polyfork** free low-poly GLB model assets, self-hosted with attribution; verify character animation rather than assuming it exists.
- **Vitest** for isolated logic; **Playwright** for gameplay and deployed-build browser testing.
- **IndexedDB** for versioned game save snapshots; localStorage acceptable for small preferences. No secret credentials or network-dependent runtime.
- Avoid a physics library until proven necessary. Reliable lightweight boat motion and ground/collision surfaces are more important than elaborate rigid-body physics.

## Suggested source boundaries (not existing files)
~~~text
src/
  app/             boot, render loop, scene switching, resize and diagnostics
  data/            fixed islands, jobs, prices, fish, NPC definitions
  world/           land, shared sea, island loading/LOD and collision surfaces
  player/          controller, walking state, camera, animations
  boat/            steering, boarding, docking, disembark, wake
  activities/      fishing, delivery and sales
  people/          NPC schedules, interactions and dialogue
  story/           quest state, memories, relationship, home fund
  state/           events, serialisable state, persistence/migrations
  ui/              HUD, chart, journal, dialogue, credits, settings
  audio/           licensed ambience, music, effects
public/assets/     verified, compressed models/sounds + attribution
tools/             terrain authoring/export/asset-check scripts if needed
~~~
Use these as **module responsibilities**; create only the files needed by Stage 0/1. Do not construct a fictional enterprise engine before gameplay is proved.

## Game update architecture
Own one animation loop with time-step clamping and explicit pause/dispose. Separate: player input → game state changes → movement and interactions → visual/animation sync → camera/render. Use stable IDs, data-defined objectives and idempotent events. Completing one delivery must pay once, even if callback fires twice, game reloads or a dialogue is replayed.

Keep state independent of Three.js objects. Save wallet, fish/inventory, job flags, island discoveries, story/relationship flags, player and boat checkpoint, home-fund status, settings and schemaVersion. Save on major transitions, handle load errors visibly and test migration paths. Never serialise textures or scene graph objects.

## World coordinates and collision
Use Three.js Y-up, one shared coordinate standard (meter-like scale), fixed island origins and landing points. Boat water height, terrain visible geometry, nav/walk surface and interactable trigger points must all agree. The ProceduralTerrains runtime documentation explicitly warns sampled CPU heights are approximate compared with GPU-rendered terrain and not exact triangle collision; create/test a collision mesh or a sampled baked heightfield to avoid falling through slopes. Use a return-to-safe-dock recovery when docking state fails.

NPCs can follow authored waypoints and idles at Stage 1. Do not assume every Polyfork humanoid has animation clips. Provide a simple procedural fallback until an asset passes inspection.

## Island loading
One shared ocean surface, fixed 12-location map and a bounded sailing region. Stage 1 loads detailed Havenport and Saltglass only, with LOD/distant silhouettes and friendly boundary feedback. Asynchronous assets need progress, retries, fallback visuals and disposal. No whole-world eager download, no excessive frame-wide mesh cloning.

## Static deploy contract
Use locked npm dependencies with scripts for dev, build, typecheck and test. Create a minimal .github/workflows/deploy.yml to build and deploy dist via official GitHub Pages Actions; least-privilege permissions and only production on main (manual dispatch optional). No history-router deep-path failures; hash route if needed. Test relative GLB/audio URLs against the project prefix. Include a visible version/build label in a nonintrusive settings/about view.

Official references:
- https://vite.dev/guide/static-deploy
- https://docs.github.com/en/pages
- https://github.com/ZyFou/ProceduralTerrains/blob/main/packages/procedural-terrains/README.md

## Performance philosophy
Initial desktop goal: stable 30 FPS minimum in normal scenes, target 60 if practical; avoid persistent stutters in sailing and dock transitions. Record actual hardware, browser, 1% lows or frame-time percentiles, asset transfer and memory; do not quote unmeasured numbers as achievements. Texture/geometry compression, merged static props/instancing, level of detail and distance loads are preferable to blind resolution reductions.

## Risk-driven fallback
Live ProceduralTerrains water/render pipeline may add cost or conflict with custom scene effects. If the test fails, keep ProceduralTerrains as an offline design tool and render exported terrain/collider GLBs in standard Three.js, with lightweight water. Document the chosen tradeoff in docs/decisions.md. Never secretly substitute a generic flat island while claiming ProceduralTerrains integration.
