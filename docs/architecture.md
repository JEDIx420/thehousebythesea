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
