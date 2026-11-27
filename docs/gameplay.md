# Gameplay systems and progression

## Core loop
Explore town → accept a job or go fishing → board the boat → sail to another island → dock and walk ashore → work, talk or explore → earn money / new memory → return → see progress towards the beach home. The player can also skip work to enjoy an unhurried voyage.

## Controls and camera
Desktop-first: WASD / arrows to move or steer, mouse/touchpad to orbit a smooth third-person camera, E for contextual interactions, F to fish when appropriate, M for chart, J for journal, Esc for pause/settings. Show contextual prompts, avoid tiny controls, respect camera sensitivity and motion comfort. Boat should accelerate and turn smoothly with a small wake, not behave like a car on a flat plane. Player can reliably board from a dock/beach and disembark onto verified ground, with a recover/return-to-boat safeguard.

## Economy and work
One simple in-game coin currency. Start with a small balance because the boat has just been purchased. Primary sources: fish sales, short cargo deliveries, small commissions and later passenger transport or farm supply errands. Pricing/earnings are stored in data. No real-money shop or daily rewards. Stage 1 must demonstrate that one delivery plus some fishing increases a displayed **home fund** balance; no detailed house building yet.

## Fishing
From either boat or pier: choose a spot, cast, see bite/audio feedback, perform a gentle timing/reeling interaction, catch one of at least two species, place in inventory, sell or keep. Make loss/retry painless. Test cancellation, movement during fishing and reload without duplicating rewards. Later: new species by region, gear upgrades, fish journal and different weather.

## Jobs
Data contract: jobId, issuerId, prerequisite flags, start interaction, objective type/target, completion event, reward, persisted completion flag. Stage 1: one fixed Havenport-to-Saltglass delivery plus an independently repeatable fish sale. Make jobs restartable if the player gets stuck, and never grant the same completion reward twice.

## People and dating
Several NPCs should move through bounded waypoint or idle routines. At least two have meaningful interactions. Mira is present in Havenport, has distinct dialogue and an optional short boat outing/date beat. She can say yes or propose another time based on story context; progress comes from a shared scene, not repeated gifts. Later relationship work expands her own pursuits and memorable trips. Use deterministic, authored dialogue; no backend LLM.

## Exploration
Player chart shows discovered islands and their markers. The world is finite; implement a visually reasonable boundary/recovery. Choose landing zones carefully. Include one scenic reason to leave the main road on the second island. Keep a clear return path. Future islands may offer caves, hiking, hot springs, festivals, markets and reefs without adding combat.

## House progression
Final game: discover three offered beachfront plots, choose and buy one, hire a carpenter, fund foundation/walls/roof, decorate interior, add porch/garden/private pier, celebrate the first evening together. Not a freeform building game. Stage 1: a discoverable future home site, visible home-fund target and one meaningful savings milestone. **No actual construction in Stage 1.**

## Progress saving
Stable IDs and a versioned snapshot for wallet, fish inventory, active/completed jobs, discoveries, player/boat checkpoint, story/romance flags and home fund. Autosave on major events, optional explicit save; load must restore correctly after refresh and prevent duplicate rewards. Prefer IndexedDB for game state, localStorage for tiny settings only.

## Experience quality
No hunger, combat, grinding or forced fail states. Subtitles, skippable intro, adjustable audio, readable UI, gentle error recovery and a clear pause/menu. The romance, work and world need to feel like one coherent game rather than disconnected minigames.
