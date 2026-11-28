# Independent pixel world/controller review

28 November 2026. Five-file batch only: `assets/source/world.json`, `src/world/world.ts`, `src/player/movement.ts`, `src/player/movement.test.ts`, `src/world/projection.ts`. Reviewer did not implement or edit these files. No Phaser visual parity or creator art approval is claimed.

Result: no P0/P1 found. The P2 authored-path issue was corrected and independently closed in the follow-up below. Collision, logical projection and mandatory interaction reachability pass the scoped checks below.

## P2 — painted routes cross solid building footprints (closed)

Paths are shared authored data, but several centerlines cross expanded building colliders. These do not strand the player because alternate walkable routes exist; they can guide a player into an invisible wall relative to the painted lane. Correct the path nodes around the building footprints, then regenerate terrain art if it embeds these paths. Preserve solid footprints rather than weakening collisions.

All coordinates below are island-local x/z; add −220 z for Saltglass:

- Havenport path index 3, segment (−12,−34) → (−16,−24): sampled blocked centerline extends approximately (−12.16,−33.6) to (−14.68,−27.3), through the shop anchored at (1,−18).
- Saltglass path index 0, segment (26,−12) → (16,−22): blocked approximately (19.6,−18.4) to (17.3,−20.7), through the fishing hut anchored at (19,−8).
- Saltglass path index 1, segment (−4,8) → (−13,−5), plus its approach: blocked approximately (−3.36,8.2) to (−12.1,−3.7), through the hut anchored at (−4,9).
- Saltglass path index 2, segment (16,−22) → (1,−17): blocked approximately (12.1,−20.7) to (6.4,−18.8), through the hut anchored at (19,−8).

## Evidence

- Existing controller suite: `npm test -- --run src/player/movement.test.ts`: **5/5 passed**.
- Independent runtime probe loaded the actual modules through Vite SSR without writing test/source files. Four-neighbor BFS on a one-world-unit grid from each authored landing reached **7,167 Havenport cells** and **4,379 Saltglass cells**. Every NPC and interaction position is itself walkable and reachable at exact grid distance zero: Ellis, Mira, Tomas, home plot, Nessa and shell arch. This proves logical connectivity at this grid resolution, not the visibility/readability of painted routes.
- Projection/unprojection round-tripped with zero measured error across a grid spanning the finite bounds (x step 7, z step 9). Screen-axis input is unprojected and normalized before applying physical movement, so cardinal/diagonal travel has equal logical speed.
- Both safe walking checkpoints and canonical berths are valid. Hull uses fore/right coordinates and the correct heading transform; canonical hull width is 7.35 logical units. Shore and bounds checks include sampled full perimeter and center; steering checks the candidate rotated hull before committing heading.
- Independent deterministic 30,000-update controller probe across valid open-water starting positions produced **zero invalid hull outputs**, including 150ms updates subdivided to at most 25ms. This is an invariant stress probe, not an exhaustive geometry proof.
- Dock departure followed by forward travel and braking/turning remained clear on both islands. Saltglass probe reached approximately (65.04,−245.29), then completed steering with a clear hull. Near-pier turn rejection is physically expected: only a narrow set of orientations fits the berth. Player instructions and browser route should move north into open water before turning 180 degrees, rather than demand turning through the pier.
- Docking rejects excessive speed, requires proximity to an authored berth, and snaps player/boat together to validated landing/berth positions. Recovery preserves economy/story and uses safe island checkpoints. Browser integration must synchronize the aboard player checkpoint with the boat, call these validated transitions, and keep the speed reset consistent; those scene call sites are outside this five-file batch.

## Reviewed SHA-256 inputs

```text
360241fd803447adc9108e1ce5c304d369014649271c95675a943d90eab243ed  assets/source/world.json
727c219a75a1e6c3fed5a9076f5a2560b8d4045873df62f084246ff5c392492c  src/world/world.ts
ef29f4d88bcbe56693c26f78b103b7c26a4b8638f688e1e521c7e961853539d6  src/player/movement.ts
4adf1ef4085f50b030053b20154a38682c3e7f6ed70c7e19c4f3a032f592f8e4  src/player/movement.test.ts
fe3a293dd3ae4fe694feffac60d1e9828d6b26cad4d22583cc781d827678ca21  src/world/projection.ts
```

Next gate: rerun path samples after correction, then test the actual Phaser-rendered First Voyage route, collision silhouettes, feet depth, boarding and safe departures. Stop after Stage 1 for creator approval.

## Independent road correction follow-up

Coordinator rerouted all four reported lanes around the unchanged buildings and tree obstacles. Independent resampling of **every authored centerline at intervals no greater than 0.1 world units**, using the actual `walkable(x,z,0.7)` radius-aware foot predicate, found **zero blocked samples**: Havenport 2,689 samples; Saltglass 1,945 samples. The former hut core `(18,-239)` remains blocked, confirming the fix reroutes paths rather than removing building collisions. Updated controller suite **6/6 passed**, including the new all-route sampling regression. P2 closed for these inputs.

```text
84fe2c9d756cf54243b564c88b029752ce5b69af50dff9b6bc46ee71991d40f8  assets/source/world.json
0e9a7c69fa021ecc787f84c572482d9221b9bd9820d6e7432ad62fcc48b5efde  src/player/movement.test.ts
```

The 0.7-radius clearance check supports a player centered on the painted route; it does not assert the entire decorative road width is free of props. Browser art/collision parity still requires the actual scene review.
