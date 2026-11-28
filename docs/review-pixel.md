# Pixel reboot — independent review contract

Reviewer role: independent of the sole implementation owner. Authorised review output is this document only; no implementation/package edits. Baseline read: `ed60a83`, `feat/pixel-first-voyage`. **Status: golden v3 sample GO for First Voyage art production. This is not full gameplay, deployment or creator approval.**

The pixel reboot plan and kickoff supersede historical Three.js/Polyfork/terrain/camera prescriptions. Story, named islands, First Voyage activities, quality requirements and creator approval boundary remain binding. A locked angled 2.5D camera is expected; absence of free-orbit 3D is not a defect.

## First spike — GO / NO-GO before town production

Review batches contain at most five named changed files or one clearly scoped coherent subsystem. Implementer supplies exact source revision, preview URL, reproduction commands and screenshots from the running engine. The first gate is a compact composition containing Rowan, adult Mira, boat, pier, shoreline/water, one shop/home, tree/palm, rock and a small animated effect. It need not claim a completed town or quest.

- **Art coherence:** coordinated limited palette, shared light direction/outline/shadow treatment, recognisable adult human silhouettes, distinct Rowan/Mira, consistent building/door/boat scale and deliberate harbour composition. Inspect the actual gameplay resolution and a nearest-neighbour detail crop. Reject bland diamond grids, default shapes, emoji, cube/capsule figures, pixelated old 3D renders, arbitrary prop scatter or visibly inconsistent sprite families before multiplying them.
- **Pixel integrity:** declared logical tile/sprite dimensions, clean alpha, foot anchors, padding and frame bounds; integer/pixel-consistent upscale; no blur, halos, texture bleeding or crawl while the camera moves/zooms. Walk/idle must visibly animate, with at least four readable facings and no feet sliding or direction-dependent anatomy changes.
- **Depth and space:** world↔screen inverse tested at tile centres/edges; correct foot/bottom depth ordering; a player can pass behind and in front of a sample foreground object, with concealment relief when needed. Visual pier/shore/walkable authored data agree. Camera follows movement and keeps the player visible without exposing unfinished background.
- **Physical interaction proof:** real input moves the avatar, boards a controllable boat, turns/stops, docks and steps ashore in the same world; unsafe shore contact/recovery is observable. A screenshot is not proof of these actions. Full story/economy acceptance belongs to the later integrated checkpoint.
- **Asset pipeline:** pinned/audited free tools, exact source/licence/author/change records, deterministic local generation without credentials or runtime network calls, editable source art and checked-in atlas/metadata. Repeated generation must be reproducible; checks must catch overflow, missing frames/IDs, anchor/size mismatches and invalid alpha. Tool reputation or a README is not an audit of its install scripts/costs.

Poor art fidelity is P2 under the project rubric, but is a **NO-GO for mass production** at this explicit golden-sample gate. Passing code or atlas checks cannot override that decision. Findings need a concrete frame, file or reproduction; untested checks stay NOT TESTED.

## First Voyage integration acceptance

Preserve the optional childhood sea dream, adult boat ownership, Havenport with three visible neighbours/two meaningful interactions, Mira's independent coastal-art ambitions and optional invitation, an explorable Saltglass/fisher/landmark, real round-trip sailing/landing, two fish species with visible timing/cancel/retry, one parcel paid exactly once, sales/inventory and a clear home-fund tease. No construction or ten other playable islands.

Use real keyboard/menu gameplay through the complete route and verify visible outcomes plus read-only logical state. Assert reward idempotence, empty/cancelled fishing, safe docking/recovery and persisted wallet/items/job/discovery/player/boat/story/settings after refresh. Test malformed/unsupported/unavailable storage honestly; no lost existing save. Preserve local static `/thehousebythesea/` asset paths and loading/error states, keyboard-friendly menus, attributable adjustable audio and credits.

Final evidence includes clean install, strict typecheck, meaningful unit/asset checks, production build, actual browser route, six gameplay frames/recording when possible and measured device/browser/frame/load observations. Cross-browser gaps and failed attempts remain disclosed. Pages is live only after an actual successful deployment and independently opened page. Reviewer technical readiness is separate from **WAITING FOR CREATOR APPROVAL**; no Stage2 starts automatically.


## Asset batch 1 — golden sample v1/v2

Reviewed five implementation files: `tools/pixel-canvas.mjs`, `assets/source/sprites.mjs`, `assets/source/land.mjs`, `tools/generate-assets.mjs`, and `tools/check-assets.mjs`. Supporting world/style/licence/manifest data and rendered evidence were read without implementation edits. No P0/P1 found in this batch.

Golden v1 was **NO-GO for town production**: repeating water grid, excessive ground stipple, a small hull relative to adults, clipped tree framing and disconnected hip/leg anatomy weakened the composition. Golden v2 (`docs/evidence/pixel/golden-v2.png`, preview bundle `index-tUW18o_7.js`) resolves those direction-level problems: quieter water/ground, connected adult silhouettes, readable warm shop details, a more plausible hull and an authored cove/pier form a coherent pixel coast. No further style reset is requested. Known sample placement correction: move the lamp from water at `(40,-5)` to land at `(36,-6)` and inspect the final rebuilt frame before closing this gate. **Conditional GO is for this checkpoint direction only, not a finished town/game or creator sign-off.**

Asset review P2, now **CLOSED**: the original contact sheet clipped the oversized land frame and omitted the actor/boat set. Independently inspected the replacement paginated sheets: labelled actors/facings/walk cycles, boat directions, houses and props are present. Checker now validates required contact IDs, page bounds/pages and continuous anatomical rows, catching the reported hip gap. Character source probe found opaque foot bottom row 63 with anchor row 64 across all four Rowan facings and six walk frames.

Original drawing recipes use deterministic offline pixel operations. Atlas metadata preserves source and author/licence records; the reviewed vendored PixelFX subset is pinned and MIT-noticed. No credentials or runtime API/network calls occur in the five source files. This review does not claim an exhaustive audit of every vendor module.

Independently reproduced: `npm run assets:check` **199 PASS**; `npm run typecheck` **PASS**; `npm test` **4 projection tests PASS**. Native Chromium 158, 1280×720, actual production preview: real keyboard movement from `(48,0)` to `(50.14,-2.14)`, E boarding, W propulsion, A heading change to approximately `-0.3595`, S stopping, and E landing at `(55,0)` all observed with frame settling. No page errors or navigation reset. A short native sample reported 151 frames, median 16.64 ms / p95 16.67 ms, WebGL, 199 assets; this is a short sample, not sustained performance or integrated First Voyage evidence. All reviewer browser contexts were closed before implementer rebuild.

NOT TESTED in this batch: full story/economy/fishing/save/reload/error recovery, full island navigation, sustained animation/depth/shore collision parity, accessibility/audio and deployment. Next engine/world batch should give asset footprint metadata explicit world units, origin and rotation semantics and prove it against the drawn base/hull; nominal metadata alone does not establish collision parity.

Reviewed working-source SHA-256 (no immutable implementation commit supplied yet):

```text
7a8e187cc63ad5da2ce716ad76bbb19a223897916c74f31777420c3cde3f0d89 tools/pixel-canvas.mjs
248665233a03e0c7f12906425bc9085d5b7fd277b687cc84398a83ca2e986f07 assets/source/sprites.mjs
5a5a1bd2156b3855d09022f7a3c0c1d8309c67a976c01e05cf8f87edf4b070ff assets/source/land.mjs
313e2164fb72b7501c28f9299839ab4444fc0fd48631da15d0761ee5662169ed tools/generate-assets.mjs
2655520a080c4575294ec89dde61548d0be930101d44e3a4ceed1ef41bd2328d tools/check-assets.mjs
```


### Golden v3 — final sample gate CLOSED / GO

Independently inspected the actual `docs/evidence/pixel/golden-v3.png`: the lamp base is visibly on the sandy shore, separated from Mira, with Rowan on the pier. The composition retains the coherent v2 palette, connected figures and readable boat/shop. The known placement condition is **CLOSED**. **GO to extend this established art direction into the two-island First Voyage checkpoint**, with further integrated navigation/gameplay and final art review still required. This does not authorise later stages or replace creator approval.

Read v3 evidence JSON: bundle `index-BXS9RwYF.js`, Chromium 158.0.8127.37, WebGL, 199 assets, 107 **raw render-callback interval** samples, median 16.70 ms / p95 16.80 ms, zero intervals over 50 ms, empty recorded errors. This is implementer-captured evidence inspected by the reviewer; no duplicate GPU run performed. Earlier v1/v2 timing figures (including the reviewer short metrics readback) came from Phaser-smoothed update deltas and must not be interpreted as raw frame-time measurements or proof of absent stalls. V3 remains a short sample, not sustained performance evidence.

All five reviewed asset-source SHA-256 values above remain unchanged at this final visual inspection. No implementation edits by reviewer.


## Domain batch 2 — pure state / persistence / fishing

Reviewed exactly `src/data/content.ts`, `src/state/game.ts`, `src/state/persistence.ts`, `src/state/game.test.ts`, `src/activities/fishing.ts` on the uncommitted working tree after the golden-sample foundation. **No P0/P1 found; PASS for pure API scope**, conditional on the integration obligations below. No scene/autosave/browser-storage implementation is claimed by this batch.

Independently reproduced `npm test`: 28 PASS (24 domain/snapshot and 4 projection); strict typecheck PASS. Also ran a read-only transpiled fishing-module probe: species alternation, early reel miss, just-before/exact bite boundary, exact/after expiry boundary, caught terminal identity on reel/tick, negative/nonfinite delta and fresh cast all PASS (12 assertions). These fishing probes are reviewer evidence, not checked-in regression tests; automated fishing regression coverage should be added by the implementation owner.

Economy payment and sale idempotence, invitation/travel/return flags, recovery and snapshot validation are covered. Current schema 2 explicitly identifies `pixel-first-voyage-v1`, uses a separate pixel database and rejects unsupported worlds. Legacy schema0/1 import clones progress then resets both player/boat to the appropriate pixel dock without paying rewards. Verified the original database/store/slot names against the previous implementation; legacy loading uses a readonly transaction and aborts creation if absent. Parsing clones object references; malformed delivery arrays, invalid numbers/settings, duplicated discoveries and unsupported schemas are rejected. IndexedDB reads resolve after transaction completion; writes likewise wait for completion, with abort/error rejection and database closure.

Integration obligations: the caller must honour `loadGame().protected` and inhibit autosave until an explicit safe reset/import, because `saveGame` itself does not enforce that protection. The 5-second deadline bounds database opening only; read/write transactions after successful open have no deadline, so do not advertise a bounded total save/load operation. Add bounded transaction failure/retry handling if the integrated loading UI awaits these operations. Actual IndexedDB success/quota/blocked/abort/legacy-copy behavior and scene reward/fishing-session cancellation are **NOT TESTED in a browser** here. Domain actions assume trusted scene dispatch (island visit and fish award guards belong to that integration).

Reviewed SHA-256:

```text
819fab1b115568f33690a82665ea2da600c9c8114a1b0466a9f49cfecf4c166a src/data/content.ts
40a06958d03bc0f2275e7aaace045465ebca4ad29f3b1531a0f609ac6ba02c88 src/state/game.ts
3eca8d93d27502bedf9c47c000356a7c2536b64930e635797c3c057c6750949d src/state/persistence.ts
f8b8c86e9fb45de7b548b3710df6d5ff41fdb1ee46d3f7306f159480af988885 src/state/game.test.ts
5c616704ecd68a22e935fe0acc02776c2f714442bcaab85081b140ee71e24456 src/activities/fishing.ts
```


### Domain follow-up — transaction bounds / fishing regressions

Independently reread changed `src/state/persistence.ts` and new `src/activities/fishing.test.ts`; reran the suite: **31 PASS across 3 files**. Read/write transaction timers now abort after 5 seconds, settle once and ignore late completion; a late database upgrade after the open timeout is aborted. The earlier unbounded transaction observation is **CLOSED on source review**. Opening and transaction phases each have their own 5-second bound (not a single 5-second total operation). Added fishing regressions cover both species, precise bite/expiry boundaries, early/late retry, terminal idempotence and invalid delta handling. Automated fishing-coverage observation is **CLOSED**. Browser IndexedDB failure/success paths and protected-save scene integration remain NOT TESTED/pending; no application integration approval added.
