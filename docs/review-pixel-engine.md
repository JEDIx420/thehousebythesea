# Independent pixel engine integration review

28 November 2026. Source-only five-file batch: `src/scenes/VoyageScene.ts`, `src/main.ts`, `src/style.css`, `src/world/people.ts`, `src/world/world.ts`. Coordinator is sole implementer. Reviewer made no app edits and started no GPU/browser sessions while the coordinator ran gameplay. Frozen advertised build: `index-CZtf_t52.js`; source hashes below identify the inspected inputs.

## Findings

**P1 — loading has no application-bounded escape from a stalled asset request (closed by follow-up below).** `preload()` registers a `loaderror` listener but specifies no finite XHR timeout or independent boot watchdog. A request whose connection remains pending does not trigger loaderror or create(), leaving the loading UI indefinitely without retry. Add a finite load timeout/watchdog and route failure to the existing retry view; clear the watchdog when successful scene initialization completes or a terminal failure occurs. Verify with a deliberately stalled atlas/manifest request, not merely an immediate aborted request.

**P2 — valid HTTP but malformed manifest/frame metadata can escape initialization error handling (closed by follow-up below).** `create()` asserts the manifest type and immediately calls `m.frames.forEach`; `setFrame()` throws for absent metadata. The top-level `boot().catch` surrounds construction of Phaser.Game, while normal asynchronous Phaser asset completion/create callbacks occur later. Missing/non-array frames, missing anchor fields or absent required atlas entries can therefore produce a console exception and frozen/loading scene instead of the promised error/retry UI. Validate required metadata/frame IDs and catch scene initialization failure into `view.error`; treat corrupted required art as critical rather than silently substituting unrelated frames. Verify malformed successful JSON and a required missing atlas frame.

No other P0/P1 found in this batch. Both source findings are closed by the independent fix review below; browser confirmation remains separately required.

## Passing source contracts and independent probes

- The scene calls the pure foot/hull controller in logical world coordinates, checkpoints boat and aboard player together, and uses validated board/disembark transitions. Disembarking dispatches island discovery and saves. No direct second delivery reward path exists in this scene; payout is delegated to the idempotent state reducer.
- Modal opening clears held keys; keyboard repeat does not retrigger interactions; movement is paused during modal UI and fishing. Escape closes ordinary panels and completes/skips the memory prologue without abandoning its state flag. Blur clears keys. Fishing cancellation/recovery clear rod overlay, line and ripple, and safe recovery zeros boat speed.
- Fishing requires a stopped boat or proximity to an authored pier, chooses an actual water point, freezes movement, and only grants inventory after a successful reel result. The scene alternates cast species through the activity module rather than hardcoding inventory grants. The fishing line and floating catch are scene visuals, not substitutes for the activity outcome.
- Rowan and NPCs use projected feet depth. Buildings/trees/arch in front of Rowan fade when the actor is covered. Boat passengers use seats transformed from the same boat heading/hull convention. Actual sprite footprint alignment, fade quality, readability and scene art remain unverified here.
- Mira is explicitly walked to the pier, boarded through a timed transition, rendered seated aboard, and walked home after a completed return. The scene blocks propulsion until she is aboard; this avoids leaving her behind.
- Independent CPU-only Vite-module probe: inviting Mira from authored Havenport home reaches `aboard` in **9.488s** at 16ms steps. After a visited-Saltglass return she becomes visible and returns exactly to `(35,-12)`, which passes `walkable`. Preparing another boarding from home succeeds again in **9.488s**. No teleport/state bypass was used in this probe; it calls the production People state machine.
- Camera is fixed-direction with integer zoom and pixel rounding. Main layout uses integer 2×/3× CSS scale and resizes the logical canvas. The DOM panel has bounded height and scrolling; narrow styling reduces HUD footprint. Actual responsive/accessibility behavior still needs the browser.
- Save/import actions report persistence outcome, reconstruct companion state after import/recovery, and leave economy changes in Session/reducer. The read-only debug facade exposes detached snapshots/metrics rather than a state-writing test API. Session/persistence implementation itself is outside this batch.

## Scope limits / next evidence

The coordinator owns the running real-input First Voyage browser route. This source audit does not claim that route passed, that art is approved, that error cases were browser-reproduced, or that a public preview was deployed. After loading fixes, verify stalled/aborted/malformed critical art recovery plus the full walking → delivery → fishing → optional outing → reload route in the actual rendered build. Preserve the First Voyage approval gate.

## Inspected SHA-256 inputs

```text
1d55c74eac0abf646ee1e8957d9a0bbee3a3d5fcee4c7ded8c82dc93f6749608  src/scenes/VoyageScene.ts
e58c67c23e4e980a550399f259adea02dd58efcac6112d3e2850f9a64404155e  src/main.ts
5b82b17b23fdae4e340f630e91128c3c7105cd669a88fb6d92013cafe20e8b51  src/style.css
9884f29a9c3f2fa8b1f09b67e78f7876d85c0e1ed25c896a7dc7b7932961012b  src/world/people.ts
34f0ace2db54269d00194773f80f83dc0c2f45e8a67afa01020d352b3401ad8c  src/world/world.ts
```

## Independent loading fix re-review

Frozen advertised build `index-BHa0x3gC.js`; source-only re-review of the narrow loading delta, without rebuilding or editing implementation. **P1 and P2 closed at source level.**

Main config now bounds loader XHR requests to 10 seconds. Scene preload also starts an independent 12-second watchdog, covering a request that remains pending without a loader event. `failBoot` latches failure, clears the timer/held input, stops updates, displays an honest error and installs only the retry action. A late loader completion cannot revive gameplay because initialization checks the failed latch. Successful initialization and disposal clear the watchdog.

`create` catches initialization exceptions into the same recoverable error path. Before building the scene, initialization validates manifest shape; unique IDs; bounded integer frame dimensions; finite, in-bounds two-coordinate anchors; nonempty license/source; matching atlas IDs and actual dimensions. It checks every required runtime frame family, including `tree-1`, all directional actor idle/walk/sit frames, water/ground/props, boat headings, ripple/gull/catch animations. This closes the delayed missing-animation-frame failure as well as malformed initial metadata.

No additional actionable issue found in this narrow fix. The coordinator is running eight browser cases, including missing/stalled art and malformed/missing-required-frame cases; this reviewer deliberately did not launch a competing GPU/browser session. Their browser results should be attached separately rather than attributed to this source re-review. No art approval or Stage 2 authorization is implied.

```text
1fa14a1386ba83817067f844cf83b8dd875a53dd4e7677c61fe051decc636a02  src/scenes/VoyageScene.ts
87cc705f8ff500091863ff3c693a468a78271dcfe5dd15af2050f5242718c5e1  src/main.ts
```

## Independent native-input and test-harness review

Four-file batch: scene native keyboard subscription delta, `tests/browser/input.ts`, `tests/browser/voyage.spec.ts`, `vitest.config.ts`. Coordinator observed real queued Phaser keyboard replay (one physical E boarding then immediately docking), and replaced queued forwarding with named native window callbacks. **Source review PASS, no new actionable finding in this delta.**

There is now exactly one gameplay keydown route and one keyup deletion route; prior Phaser keyboard event subscriptions are removed. Named callbacks are removed by dispose. Existing modal-open key clearing, blur key clearing, repeat suppression, native button/link arrow/Space/Enter guards and modal Escape handling remain. Native handling does not wait for a later Phaser input queue before releasing movement keys. This directly addresses the reported source of stale forwarding without weakening interaction conditions or adding timing-based duplicate suppression. Actual regression outcome remains owned by the coordinator browser rerun.

Browser helpers issue real key events only, derive screen-input direction from the production logical projection, keep forward held across feedback polls, and release held walking/sailing keys in finally. They fail on modal interruption and blocked movement rather than teleporting around obstacles. The voyage preserves parcel-once, wallet145/195, fishing cancellation plus both caught species, authored arch detour, physical north/open-water return turn, companion boarding, outing completion, home, exact save/reload, chart and credits assertions. Unit discovery explicitly limits Vitest to `src/**/*.test.ts`, keeping Playwright cases in their own runner. Independent `npm test` rerun: **5 files / 41 tests passed**. No GPU/browser session or app edit performed.

```text
aee9aceeb431e88e8798b68164600a0d10b60e32d4aa5d7c1aa3072365ad9971  src/scenes/VoyageScene.ts
0fb3bf3eb03e65941d1a0244531d9bf71c21f9a7425d1284eae4d62a966ad142  tests/browser/input.ts
eb8f7940d1bbacfc5bf57db55d14cd70201fe8d306c259a8cd7e3f061bd7279d  tests/browser/voyage.spec.ts
ef37271d6e36a38ac90641cb406afb1ef6e919047e5b09d08b3e0c5108a8ebc8  vitest.config.ts
```

## Independent actual-browser input smoke — PASS

Fresh disposable native Chrome context, 1440×900, `http://localhost:4190/thehousebythesea/`, exact production module `/thehousebythesea/assets/index-DF9pH0Nz.js`. Executed with a temporary stdin Node/Playwright script (`node --input-type=module`), Chrome WebGL enabled. No source/build changes, storage seeding, debug mutation, teleport or competing browser were used. `window.voyage.getState/getMetrics` were read only; ordinary gameplay naturally updated the disposable context. Browser and context were closed in finally and closure was reported before the coordinator resumed GPU tests.

**14 checks passed:** normal walking to the pier; three separate cycles where one physical E boarded and remained aboard after 350ms, followed by a second physical E docking and remaining ashore; 4.5 seconds held W moved north off the berth; R recovered player and boat together while preserving wallet25; opening pause during held A and closing after key release left the actor stationary for600ms without stale replay; wheel zoom selected integer2 then1; picking returned finite logical coordinates; zero page errors.

Evidence: [JSON results/state/metrics](evidence/pixel/independent-engine-smoke.json), [final browser frame](evidence/pixel/independent-engine-smoke.png). This independently confirms the native input replay correction under real browser events. It is a bounded smoke test; the coordinator separately owns the full First Voyage and eight-case resilience suite.
