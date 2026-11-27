# Terrain, water and assets production pipeline

## Target look
Warm stylised low-poly-with-polish, not plastic toy and not photorealistic. Lush rounded hills, believable beaches, palms and hardwoods, a readable harbour, paths, cobbles, shop details, fishing piers, warm wooden interiors and inviting sea. Ocean should have motion, foam/wake and distance colour; terrain should look beautiful both from boat and on foot.

## Terrain first: technical facts
Upstream: https://github.com/ZyFou/ProceduralTerrains ; MIT. Its 2.0.0 README includes a finite **Tile** mode, export of mesh/height/collision information and separate Three.js runtime packages. Runtime docs specify Three.js peer ~0.185.1 and require WebGL2 for rendering. The CPU height sampler approximates GPU displacement: **do not treat sampleHeight as exact terrain collision**.

Stage 0 compare two tiny proofs:
A. One live finite runtime island + basic walking/sailing/water and scene composition.
B. Pre-authored/exported island geometry and matching collider/heightfield in a plain Three.js scene.
Measure visual quality, shoreline fidelity, foot placement, WebGL2 and low-power laptop performance, build compatibility, bundle size and loading. Select a justified option. A is not mandatory if B produces a better game. **Don't ship the entire terrain studio with the game.**

## Island authoring workflow
1. Pick a fixed island ID, world origin and rough bounding shoreline.
2. Generate finite land, then sculpt essential playing spaces and beach access by hand.
3. Define a distinct harbour/landing zone and unobstructed route through a meaningful destination, plus barriers/recovery for unsafe cliffs.
4. Add validated collision data and author NPC/player navigation markers.
5. Export or package low/medium/high detail terrain; ensure water meets shoreline without a visible gap or land clipping.
6. Add staged Polyfork props and environmental audio; optimise and measure in browser.
7. Approve a screenshot from boat, from shore, from village path and at dusk; then lock island geometry for integration.
8. Repeat for additional islands **only after Stage 1 approval**.

Never treat a render-only island as playable terrain. Test ascending slopes, docks and terrain seams with an actual player controller. Island data should be authored once and remain consistent between save sessions.

## Polyfork usage
Catalogue https://github.com/lucas-martinic/polyfork-catalog ; licence https://polyfork.dev/licensing . Self-host free low-poly **GLB mesh** files under CC BY 4.0 with credit and change notices. Do not assume the .mjs source modules, HD editions, images and catalogue text are CC BY. Do not scrape the full catalogue; select only what we need and check each specific licence and file.

Candidates: fishing boat, rowboat/sailboat parts, docks, crates, rope, rods, fish, houses, stalls, lanterns, trees, rocks, furniture, coastal human characters. Character rigs and animations require inspection. If a needed animation cannot be obtained from a legal free source, implement a small procedural motion or simple authored clip instead of misrepresenting asset capabilities.

## Asset provenance record
Create a machine-readable asset manifest inside the game source plus a human-readable credits screen:
~~~json
{
  "id": "small-boat",
  "file": "assets/models/small-boat.glb",
  "source": "REAL_VERIFIED_ASSET_URL",
  "license": "CC-BY-4.0",
  "credit": "Specific model by Polyfork",
  "modified": "optimised materials; recoloured sail",
  "bytes": 0,
  "triangles": 0
}
~~~
Replace all placeholders with verified values, keep unique IDs, and generate or audit player-visible credits. Original music and audio should also have clear provenance; use CC0 or properly attributed compatible licences. No copyrighted game music.

## Asset budgets and deployment
Stage 0 defines provisional transfer/geometry budgets from real measurements; Stage 1 locks and verifies them. Compress model files and textures, keep small bundles at startup, lazy-load island details and verify every asset path under /thehousebythesea/. Do not rely on a CDN that can disappear or a paid service. GitHub Pages release files remain under its repository/site size and bandwidth policies.

## Sign-off imagery
Before scaling content, demonstrate in-browser: (1) a delightful Havenport waterfront, (2) a recognisable Saltglass Bay approach, (3) a lively NPC scene, (4) a functioning boat-to-land transition, and (5) a believable sunset/late afternoon. Each should be captured from the playable game, not presented as generated concept art.
