# Isometric pixel-art reboot — implementation blueprint
Status: PROPOSED DESIGN / AUTHORISED ONLY FOR FOUNDATION + FIRST VOYAGE. 2026-11-28.
This document supersedes the *rendering/asset pipeline* prescriptions in docs/architecture.md, docs/assets-terrain.md and earlier prompts. It does NOT supersede the story, scope, gameplay goals, approval gate, or safety/quality requirements of docs/vision.md, docs/world-story.md, docs/gameplay.md, docs/first-voyage.md. Do not delete earlier material. Do not confuse a planning PR with a playable build.

## 0. What actually exists
At review of main (fa4a43b, 2026-11-27), the repo contains README.md, AGENTS.md, docs/, prompts/, and .github/pull_request_template.md. There is **no committed game source, package.json, asset pipeline, art, test suite or deployed playable build**. Docs/progress.md says stages 0 and 1 are not started. This is a planning reset, NOT a rewrite of implemented mechanics. Archive the old Three.js/Polyfork concept as an optional research reference only. Do not spend time converting unrigged characters.

## 1. Creative contract
A lush handcrafted 2.5D pixel-art archipelago; coastal warmth, depth, and an inviting world, not bland flat tilemaps, cheap cubes, placeholder emoji or pixelated screenshots of Polyfork. Maintain exactly the existing 12 permanent islands and geography identities in docs/world-story.md. Preserve Rowan (provisional), Mira (provisional; adult, independent ambitions), the childhood sea dream, ownership of a modest boat, fishing, deliveries, island friendships, meaningful romance, saving toward a single beachfront house and a quietly satisfying ending. No combat, survival hunger, world-saving mystery, multiplayer, village manager or forced grind.
The **first playable checkpoint** is Havenport ↔ Saltglass Bay, and a 10–15-minute integrated route. Don't build the ten other islands yet.

## 2. Visual and camera specification
- Perspective: locked 3/4 angled, near-isometric projection; maintain depth ordering and correct occlusion. No free-orbit third-person camera. A fixed compass orientation and optional 90-degree camera rotation may be evaluated later, not in slice.
- Art: hand-readable sprite silhouettes; deliberately limited coordinated palette per island and day phase; 32–64 logical px per walking tile, character drawn at ~40–64 px standing height depending on final art scale; 2x/3x pixel-perfect upscale; no blurry nearest-neighbour mismatches, mixed resolutions, or pixel crawl.
- Layers: sea below land; shoreline foam/shallows; walkable ground; walls/props; character/boat; roof/foreground cover; canopy/translucency and particles; foreground occluders reveal player when hidden.
- Distinct look: Havenport's colourful harbour shops, pier, boats, market awnings and warm windows; Saltglass's fishing huts, sheltered cove, rocks, reef edge and scenic overlook. Both need purposeful landmarks, different terrain silhouettes and people.
- Motion: idle/walk (4 or 8 direction), boat wake/turning/rocking, NPC idles, water currents and shore foam, birds, lantern glow, wave highlights. Prefer consistent authored animation loops; code-driven VFX only when tasteful.
- Camera: smoothly track player on foot or boat, gentle look-ahead, sensible bounds and zoom; never expose empty background or lose player under roof; handle mouse/touchpad zoom. Interior scenes not part of slice.
- HUD: lightweight visual hierarchy, high-contrast text, contextual E prompt, active job direction, coins/home fund, chart (M), journal (J), fishing (F), pause (Esc). Playable at laptop sizes.

## 3. Architecture decision: Phaser + TypeScript + Vite
**Preferred for spike:** Phaser 3/4-compatible stable release chosen/pinned by agent after testing, strict TypeScript, Vite, Vitest for deterministic logic, Playwright for real browser. Static GitHub Pages deployment, Vite base=/thehousebythesea/. No backend/cloud/paid API.
Why: 2D sprites, atlases, layered maps, animation/state, WebGL/Canvas and browser tooling are simpler to automate than a bespoke Three.js 3D animation pipeline. Isometric here means a 2D projected world with depth sorting, not actual 3D terrain. Do NOT claim real 3D traversal or physically correct water. Keep camera/picking/docking seamless by tracking **world-space** coordinates and projecting them to screen coordinates. Suggested projection x_screen=(worldX-worldY)*tileWidth/2; y_screen=(worldX+worldY)*tileHeight/2 - elevationPx. Navigation and boat motion run in world coords, not screen pixels.
If Phaser's built-in isometric map support proves inadequate, implement a small tested projection/depth layer on top; no large new dependency. Evaluate PixiJS only if spike demonstrates a real improvement; avoid rebuilding an engine.
Systems: boot/render/scenes; projection and depth/layers; world data (authored island tile maps and landmarks); characters/NPCs; boat with finite acceleration/steering; water and shore FX; interaction; fishing; jobs/economy; story/dialogue; inventory; HUD/journal/chart; versioned persistence; audio; asset generation and manifest. Serializable gameplay state separate from scene objects.
World: **one navigable continuous logical sea** with fixed authored island coordinates. Camera follows boat smoothly. Two islands may be stream-loaded in chunks with visual prefetch; no page navigation/scene reset when docking. Shared docking points with walkable destination and proximity checks. Depth-sort by logical foot/bottom Y. Use collision layers built from exact authored ground and obstacle data (not visually inferred alpha bounds). Bound ocean with friendly navigation warning and recovery.
Save: versioned IndexedDB game snapshot; settings may use localStorage. Stable IDs, event/action reducer and idempotent delivery payout. Deterministic fixtures and migration tests. No external runtime services or auth.

## 4. Agent-first *free* asset factory
No dependency on Polyfork for the new visuals. Bundled open assets are optional prototypes ONLY with verified licences and source/author/credit. Original generated assets should be produced deterministically and checked in, not generated by remote APIs during gameplay.
Research candidates, verified 2026-11-28:
- https://github.com/patch-gg/pixelfx — MIT; code-based pixel VFX, Claude skill. Selectively adapt wave foam, particles, fireflies, etc., after testing perf and visuals; DO NOT install entire library blindly.
- https://github.com/0x0funky/agent-sprite-forge — MIT; Codex/Claude skill for sprite sheets/maps/PNG/GIF. Audit setup and dependencies before using, and verify reproducibility.
- https://github.com/aldegad/sprite-gen — Apache-2.0; agent skill/CLI for sprite atlas/motion loops. Inspect reliance on image-generation APIs and costs before adoption; no paid model calls assumed.
- https://github.com/Orama-Interactive/Pixelorama — MIT editor with spritesheet exports and tile/isometric support. Useful locally and for batch export; not a game runtime dependency.
- https://github.com/LibreSprite/LibreSprite — GPL-2.0 app; optional free editing tool; do not copy application code into our game.
- https://github.com/phaserjs/phaser — MIT browser game framework.
- https://github.com/mulosbron/game-dev-skills — broad skills index, low-star/unproven; selectively evaluate instructions, never execute unfamiliar install scripts without review.
These are useful candidates, not endorsements of production readiness or guarantees they run entirely offline/free. Pin audited versions/commits; inspect scripts, licenses, network calls and output reproducibility. Never copy viral repos blindly. Avoid runtime AI-generated art, unlicensed packs or image scraping.
Create assets/style-guide.md defining exact target palette, pixel scale, shadows/light source, anatomy proportions, outline width, 4-direction facing, sprite anchor (feet), transparent alpha and atlas padding. Produce source sprites in assets/source/ and compiled atlases in public/assets/. A CLI pipeline generates tile variants, animation frames/atlases, metadata JSON (frame name, bounds, direction, origin, fps, collision, licence/source), and contact sheets. Provide deterministic generator seeds for code-generated assets; image/ML-based outputs require recorded prompt/model/source and human visual QA. Asset check script catches transparent/misaligned frames, atlas overflow, inconsistent tile dimensions, alpha halos, missing IDs, uncredited sources and cross-direction style changes. Run asset checks in local tests.
**Golden sample before mass production:** one protagonist, Mira, boat, dock, palm/tree, one home/shop, rock, water/foam and small animated effect as a coherent composition. Show at actual gameplay resolution. Reviewer can reject the *art direction* before agents multiply assets.

## 5. Story / gameplay preservation map
Keep docs/world-story.md and docs/gameplay.md as source of truth. First route: optional 20–45s illustrated childhood memory (skippable); adult Rowan in Havenport; harbourmaster offers parcel delivery; Mira talks about her coastal sketches, plans and independence; board own boat; sail continuous sea to Saltglass; dock and walk ashore; fisher receives parcel, exactly one payment; fish one of two species using visible timing prompt; sell catch; return to Havenport; optional Mira memory/outing invitation; notice future beach home site and home fund; save/reload resume all. NPC count: three visible at Havenport, two meaningfully interactive there; Saltglass fisher interactive. Preserve player ability to enjoy the world without compulsory romance.
Controls default WASD/arrows (world-relative intuitive walking; ensure diagonal normalization), E interact, F fish, M chart, J journal, Esc pause, mouse/touchpad zoom; document boarding as E. Sailing acceleration/inertia and readable wakes. Recovery button/shortcut prevents permanent stranding.
Work and relationship advance through actual interaction, not menu-only claims. All story text authored, short and warm; no generative NPC chatter.

## 6. Foundation (P0) measurable spikes
P0a Bootstrap locked install, strict TS, Phaser renderer and GH Pages nested-base build; browser launch; diagnostics overlay optional.
P0b Author 32x32 tile / chosen resolution sample and two-slice isometric map, correct world-to-screen inverse, y-depth sort, foreground occlusion, accurate walkable bounds, mouse pick and moving camera. Golden sample art approval evidence.
P0c Character idle/walk sheet and boat steering/foam/shore/dock proof. At least 4 facings and idle/walk; no floating cutout or sliding during travel; boat can change heading smoothly and stop at pier.
P0d Asset CLI runs locally without credentials, checks atlases, outputs manifest and attribution. Try the candidate skills in a safe sandbox, document which genuinely worked and whether they require optional paid services.
P0e State/save fixture, tests, versioning, recovery and deterministic reward proof.
P0 Exit: executable local tech demo + screenshots/video, reproducible commands, build/deployment evidence, measured initial render/perf on real browser. Do NOT claim the game is complete at P0.

## 7. First Voyage (P1) integrated deliverables
P1a Detailed authored Havenport and Saltglass maps: distinct walkable shore, piers, buildings, 3+ Havenport NPCs, landmark/viewpoint at Saltglass and readable routes.
P1b Integrated foot↔boat mode transition; sail both ways in the same world; water shallows/foam, docks and recovery.
P1c Fishing from dock or boat with 2 fish species, bite/timing, cancel/retry and inventory.
P1d Parcel job with exactly-one payout; fish seller and home-fund progress; active objectives and map.
P1e Mira introduction and optional authored outing/memory scene; no shallow affection grind.
P1f Audio controls, menus, credits, persist/reload, controls help, screenshots + Playwright player journey.
P1 Exit: a real 10–15 minute playable route with verified saves and meaningful emotional/narrative ending teaser. Capture six actual browser screenshots: harbour, walking/NPC dialogue, sailing, docking/shore, fishing, Mira/home fund. Independent reviewer checks in batches of five files/systems. Fix blocking defects, mark **WAITING FOR CREATOR APPROVAL**, stop before P2.

## 8. Definition of polished enough
Artwork: coherent palette, no default Phaser shapes in visible final scene; composition, deliberate sprite design, varied buildings/plant life, occlusion and readable silhouettes. No blurry antialiasing, obvious repeated tile seams, random AI sprite morphology, inconsistent frame dimensions, robotic teleport animations or static lifeless docks.
Feel: fast controls, small steering inertia, audible water, coherent day lighting, short meaningful NPC dialogue, clear destination, at least two fish reactions, animations actually visibly cycle. Avoid cramming scene with decorative objects that block play.
Gameplay: 10–15 minute start-to-checkpoint without developer console; time budget measured; no soft locks; repeated conversations don't duplicate rewards; boat cannot become inaccessible.
Perf target: sustained ≥30 FPS on modern laptop in normal play; aim 60. Record device/browser, actual frame samples, initial download size and any long stalls. No unverified performance claims.
Quality: npm install clean; typecheck, unit, build, asset audit, Playwright browser flow, deployed GH Pages subpath asset check; no remote runtime calls, secrets or surprise billing. Show unrun tests honestly.
Access: text readability, scalable HUD, optional reduced motion and volume, keyboard-only menus and captions/subtitles for story beats.

## 9. Execution rules
1. Create implementation PR separate from this plan. Keep main untouched until reviewed; retain old documentation as history. First commit a decision record choosing tested renderer and dependencies, not assumption.
2. Build *one complete vertical slice* rather than scaffold empty modules, and keep evidence in docs/progress.md. Prefer simple data and visibly working game over architectural grandiosity.
3. Create one art sample first, render it in engine, screenshot it and compare to the specified cohesive mood before designing whole towns. No generic placeholders as completion.
4. One implementing agent + independent reviewer in batches of five changed files or cohesive systems; reviewer tests gameplay in browser, not just prose. Fix defects, repeat.
5. Each checkpoint: exact commit, screenshots/video artifacts, commands/results, performance samples, blockers, next phase and a clear **GO / NO-GO** decision. If unable to automate a skill, revert to reproducible drawing/canvas tools and document limits.
6. No stage 2 expansion without explicit creator approval after P1. No replacing story, names, geography or systems to simplify an art bottleneck without approval.
7. Document which tools truly work for zero cost; a free GitHub repo can still call a paid API. No unauthorized destructive cleanup or dependency install hooks.

## 10. First playable acceptance walkthrough
Load title → skip/view prologue → walk Havenport → E harbourmaster take parcel → E Mira talk → E board boat → sail to Saltglass (no scene reload) → dock/E disembark → fisher E delivery: payout exactly once → F fishing, catch one of two species → sell → boat back → optional Mira beat → discover home-fund tease → save/refresh/reload → verify wallet, inventory, completion, island discovery, location and story flags. Retry delivery and fishing cancellation; test edge/shore recovery. Every action must render in browser and be observable, not simulated by a passing unit test alone.

## 11. Explicit non-goals for checkpoint
Other 10 fully built islands, dynamic weather, house construction, advanced boating physics, multi-camera rigs, character creator, online asset gen, multiplayer, complex economy, full romance campaign, mobile-first touchscreen, procedural infinite ocean. Add these only after player sign-off.

## 12. Deliverables from agents
- Actual game source, lockfile, setup README, license/asset manifest and scripts.
- assets/style-guide.md, source sprites, generated atlases, manifest and audited generation tooling.
- Updated docs/architecture.md with the implemented solution, ADR in docs/decisions.md, docs/progress.md with real state.
- Tests and evidence, Playwright route, recorded browser screenshots, PR with objective limitations and deployment status.
- Creator approval checkpoint and no automatic expansion.
