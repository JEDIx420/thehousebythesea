# Stage 1 acceptance contract — The First Voyage

## Purpose
A complete, emotionally coherent **10–15 minute** first experience that proves sailing, disembarking, island exploration, work, fishing, relationships, a home-saving goal and persistent progress work together on GitHub Pages. This is the creator's approval build. **Do not implement the full archipelago or house system.**

## Story and space
- Optional 20–45 second illustrated/in-world childhood moment: boy watches the sea and dreams of a boat. Skippable.
- Adult starts at **Havenport**, already owner of a modest small boat. Friendly waterfront with buildings, ambience, signposts, at least **three visible NPCs**, two interactive ones, and walking routes with no unintentional dead ends.
- **Mira** has an authored introductory conversation and a brief optional outing beat, appropriate to her agency and schedule. Working name; visual/personality may be refined at creator review.
- **Saltglass Bay** has a distinct shoreline, usable dock/beach, fisher NPC and a short walkable route to a landmark. A playable place, not a static background mesh.
- A visible scenic beach plot or notice foreshadows the home dream. The **home fund** tracker reflects savings or a milestone; actual construction is future-stage.
- World has a convincing water plane, coastline, subtle motion, lighting, ambient sound and readable art style. No endless random ocean or mystery plot.

## Proposed player route (all actually playable)
1. Load quickly enough for a useful initial interaction; read/skip the childhood memory; appear safely on Havenport ground.
2. Walk with third-person follow/orbit controls, interact with harbourmaster, accept one paid parcel delivery.
3. Talk to Mira; learn about her wish to explore and the protagonist's beach-home dream.
4. Board own boat, steer through open water with recognizable motion; travel to Saltglass without loading a new page.
5. Dock and **physically step off**, walk ashore, talk to fisher, deliver parcel and receive exactly one payment.
6. Fish from dock or boat: at least two catchable species, visible input feedback, inventory update; optionally sell and earn more coins.
7. Reboard, return to Havenport, interact with Mira for a short optional sailing invitation/date moment (or invite her before step 4 if scene flow is stronger); see meaningful relationship story flag.
8. View wallet/home fund and journal/map; use pause/settings, save or autosave, refresh page and resume without losing money, completed work, discovery or boat/player location.
9. Open Credits/Attribution and read sourced Polyfork / other third-party licences.

## Hard functional criteria
- WASD/arrows, camera orbit, contextual E interactions, fishing control and keyboard-friendly menus work in a desktop browser.
- Movement on slopes and docks has validated collision. No falling through terrain, walking through main structures or teleporting into the sea. No stranded player after disembarking; safe recovery exists.
- Boat can steer, turn, stop near shore, dock, reboard and leave without resetting the world. A boat can never fly, sink permanently or be lost due to simple user input.
- Jobs use stable IDs and cannot pay twice; fishing is cancellable and repeatable; player can return after an unsuccessful catch.
- Clear wayfinding: map or directional hint to Saltglass, active job, home-fund explanation, contextual controls.
- Save contains wallet, items, quests, discoveries, relationship flag, player checkpoint/boat dock and version; refresh/resume passes. If storage is unavailable, show an honest warning without hanging.
- Assets bundled for static GH Pages base path, not network hotlinked; credits available from title/settings; no runtime secrets.
- Audio is attributable and muted/adjustable; prologue/dialogue can be skipped/closed; menus usable on laptop screen.
- Basic graceful loading, error states and one clear route back to known safety.

## Visual / feel gate
Water is more than a flat blue rectangle: gentle waves, reflection/colour movement or shoreline foam, boat wake and ambient sea sound. Both islands have recognizable composition and at least one picturesque spot. Humans should look/behave recognizably in the scene, even if animation is simple. Provisional art may be used but do not present unanimated capsules and plain boxes as approved final art. Capture actual in-browser screenshots: harbour, sailing, landing, fishing, Mira, home-fund screen.

## Performance and stability gate
Targets: modern laptop Chrome/Firefox; sustained normal scene 30 FPS minimum as a quality goal; record device/browser, approximate frame-time statistics, initial transfer and memory usage instead of asserting performance. No frequent long stalls when approaching shore or opening UI. Verify reload, empty inventory, skipped prologue, fishing cancellation, dock retry and repeated job interaction.

## Required evidence
- GitHub PR with code, brief release notes and screenshots.
- Local tests: install, typecheck, unit, build, Playwright/browser flows (include exact command, exit status, and what was not run).
- Published GH Pages URL **only if confirmed accessible**; otherwise give Settings → Pages → GitHub Actions as an explicit remaining setup step and record local preview.
- Independent reviewer signs off against checklist, records defects and any remaining limitations.
- Creator plays first. Mark **WAITING FOR CREATOR APPROVAL**, then apply feedback to Stage 1. **No work on Stage 2 without an explicit go-ahead.**

## Out of scope for Stage 1
Ten remaining playable islands, all house-building mechanics, deeper romance branches, a world-scale economy, character creator, multiplayer, cloud saves, backend/API, real-time AI NPCs, full weather/seasons, mobile-first controls, combat.
