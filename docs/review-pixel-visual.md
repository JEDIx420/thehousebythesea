# Independent pixel visual review

28 November 2026. Reviewer did not implement the art, alter source/build, or launch another browser/GPU session while the coordinator ran the First Voyage. This review concerns captured actual-game frames and a bounded source batch; creator approval remains separate.

## Batch V1 — harbour and Mira dialogue

**READY for these two visual checkpoints; no blocking visual defect found.** Inspected actual `docs/evidence/pixel/01-havenport.png` and `02-mira-dialogue.png`, compared with historical `golden-v1.png` and `golden-v3.png`, and read the current style guide. Sailing, Saltglass, docking, fishing, home-fund and animation-in-motion acceptance remain pending their captures and functional evidence.

- The actual harbour retains golden-v3's narrow-legged adult anatomy and shared pixel scale. Rowan's teal waistcoat, Mira's auburn hair/terracotta outfit/blue satchel and Ellis's blue harbour clothing are distinguishable at the captured gameplay size. There are no visible placeholder shapes, emoji people or converted 3D assets.
- Architecture, pots, timber hut, trees, sand, slate rocks and the cream sail share a restrained warm/coastal palette and crisp stepped edges. The developed town adds density and paths while retaining the golden sample's plaster/terracotta/sea palette. Compared with v1, shoreline speckle and sea marks are quieter and Rowan's limbs read more clearly. No obvious tile grid or atlas seam is visible in the inspected frames.
- Roof and trunk edges, cast shadows, shoreline shelf and pier create readable depth. The screenshot alone does not prove collision, every depth-sort crossing or foreground fade; those belong to the engine/browser route review.
- The Mira modal has readable high-contrast text, adequate paragraph spacing, a clearly focused primary button and an explicit optional response. Her illustrator work/deadline is visible, preserving independent ambition. It does not rely on an unreadable speech bubble or cover text with a sprite.
- The initial harbour toast plus interaction strip cover part of the pier/Rowan's lower body. This is acceptable as a transient welcome state; the route evidence should include unobscured pier/boat/feet views after the toast clears. The modal deliberately dims and covers the world, so it cannot establish Mira's animated facing or walking quality.

No change request is raised from these two still frames. This is not a claim that animation, zoom, pixel crawl, occlusion or boat passenger placement has been tested in motion.

## Batch A1 — five source files

Source audit scope: `assets/style-guide.md`, `assets/source/sprites.mjs`, `assets/source/land.mjs`, `tools/generate-assets.mjs`, `tools/check-assets.mjs`. Inspected source identity/anchors, representative character/boat/land recipes, frame construction, pinned effect invocation and validation logic. Palette/world JSON and vendor notices were supporting references, not a separate exhaustive code review. Reviewed working-tree source on base HEAD `aabee33e8b5a5a1924155f72b20c61793f80a0f5`; these new implementation files were not yet an immutable implementation commit.

**READY on inspected source scope, subject to asset-check execution and integration evidence.**

- Original integer raster recipes use deterministic seeds and a shared palette. Character source authors four facings with independent leg/arm stride and shared feet coordinates. The generator exports all five actors with idle/walk/sit metadata, 48×72 bounds and feet anchor (24,64). A still-image review does not establish actual runtime animation timing.
- Boat facings are authored into an eight-direction atlas using the same hull point data referenced by the world, rather than rotating one raster freely. Ground recipes derive sand/grass/paths/dock from authored world polygons. This is appropriate evidence of source consistency, not independent collision-route proof.
- Actual `Painter`/`ring` calls use the pinned pixelfx subset, project palette/seed, no hot/glint white and disabled additive lighting. The generator records upstream provenance for effect frames. The excluded gallery font is absent; the small MIT bitmap font is source code. No provider call or remote generation step is in these asset-generation paths.
- Validation regenerates and compares atlas bytes, metadata and manifest; checks unique IDs, credited frames, bounds/padding, approved alpha values, nonempty ink, fixed actor anchors, nonstatic frame hashes and four walking directions. These are meaningful checks, although distinct frame hashes do not themselves prove a convincing walk.
- Minor limitation, not a blocker: `check-assets.mjs` permits alpha 72 for authored shadows alongside 0/255, and does not independently assert every RGB belongs to the declared palette. The style's crisp/binary sprite edges are consistent with the screenshot; the shadow exception should remain intentional. No antialias halo is visible here.

No test command was run by this visual review, avoiding CPU/GPU contention with the coordinator's active journey. Do not attribute coordinator asset-test results to this reviewer.

### Reviewed source hashes (SHA-256)

```text
e2828b434ef966277609c4064a7bba757acbce4bbcfa462ddf1c7a7521013b91 assets/style-guide.md
8791356d0ae01b4ce21984cf7c4f48020d909278671f2a3e20d0a6c3ebc6ce44 assets/source/sprites.mjs
ff7bc54de6298481705be82353e0815b6be48ffdf8e172280cb77f982d5a4acf assets/source/land.mjs
0da8d5a6f3692d25694e101c9f76c96f49b17089b2c5dd8d741eb0a98d34d159 tools/generate-assets.mjs
c044bbcbcdad0a5cf844d5d4f5a18b63ca9494b162873d90c57f54d9b9340a5f tools/check-assets.mjs
```

### Inspected actual-frame hashes (SHA-256)

```text
e0c39fd08f441fc0446dbab1356b8e2e06ba6cb0e879b8bebaa110324c36b2ba 01-havenport.png
f1b7238e06efebb6611b58175131377019109343035161d2c7c6956e01859726 02-mira-dialogue.png
```

Approval boundary: this independent checkpoint review permits continuing the authorised First Voyage verification. It neither approves later islands nor substitutes for the creator's hands-on art/gameplay approval.


## Batch V2 — five route frames, frozen production

Inspected `03-sailing.png`, `04-docking.png`, `05-fishing.png`, `06-saltglass.png`, `07-home-fund.png` against the same style guide. The metrics accompanying all nine captures identify `/thehousebythesea/assets/index-DF9pH0Nz.js`, 640×360 logical viewport, zoom 1 and WebGL. Reopened the regenerated 01/02 frames as well; their current hashes supersede the initial review capture hashes above. The five asset-source hashes remain unchanged.

**READY for this captured visual batch; no blocking visual defect found.**

- Sailing: the boat, cream sail, Rowan and Mira are recognisable on the shared sea. Occupants visibly belong to the boat composition; no separate floating ground shadow or displaced duplicate actor is visible. The wake is visible behind the hull, with sparse water marks and gulls rather than a noisy full-screen effect. The large sea area is appropriate to the channel and is not an exposed blank renderer background. The screenshot cannot prove the wake/flag/occupant animation over time.
- Docking: Saltglass is visually distinct through weathered timber/net huts, blue roofs, slate rocks, a pale shell arch and a sheltered shore. Pier planks meet the beach; Rowan and Nessa have visible feet on its surface. A second moored decorative boat is discernible to the right. The transient welcome toast obscures part of the player hull, while the subsequent fishing frame reveals that hull.
- Fishing: the line reaches a visible ripple below the pier and the active bite card has clear Space/cancel instructions and a high-contrast timing bar. Rowan and the shoreline remain readable beside the card. No UI text clipping or frame bleed is visible. This frame establishes the rendered bite state, not success timing or both species' reactions.
- Saltglass landmark: the shell arch is identifiable in the docking/fishing backgrounds and its local story modal is readable. The `06-saltglass` capture primarily proves the modal; it is not an unobscured scenic-overlook showcase. This is an evidence limitation, not a gameplay blocker; an optional modal-closed vista would present the landmark more clearly to the creator.
- Home fund: the 195/500 value, partially filled bar and 150-coin milestone agree visually and are laid out without overlap. It teases one future home without depicting later construction. The modal hides the plot's bench/sign, so the frame proves the fund presentation rather than a full plot vista.

## Batch V3 — journal and credits

Inspected `08-journal.png` and `09-credits.png`. **READY for captured UI appearance.** Journal rows are legible, list the completed parcel/shared crossing/plot discovery, show zero remaining fish and the same 195/500 fund. Credits visibly distinguish original art/audio from Phaser and the actual offline PixelFX utility, with readable licence/manifest/source links and a return button. Link destinations and keyboard activation were not exercised by this screenshot review; those remain functional checks.

The coordinator reports 41 unit tests, 280 asset checks and the real-input voyage passing. Those are coordinator results, not tests rerun by this reviewer. Likewise, automation that skips the memory and reads dialogue instantly does not establish a 10–15-minute human route. No playtime acceptance or subjective audio-listening pass is claimed here. Recorded WebM exists in `test-results/pixel-voyage-3/`; this still-image review did not watch it, so animation-in-motion and feel must be assessed through the recording/creator session and independent browser controls review.

Current source/visual outcome: **READY to present the authorised First Voyage for creator hands-on approval, subject to the separate functional reviews and checks.** Do not interpret this as creative approval, a deployed-link verification, or authorisation for Stage 2.

### Frozen route frame hashes (SHA-256)

```text
83429c741d6219c1a9fc2a026160a9939684cbd61b1b95b3a6b0a6a7a3b2415e 03-sailing.png
9f8b7aa14b39c5fc8c05a0a2bea739d1e53686f895bfd8e9af9322e9ea098d69 04-docking.png
d7f8904c44bbfb1e46e162abd1db379d58764ea28aed9e8f2a2533d161884df5 05-fishing.png
7f053496f41f6b70303b7fb8480a7c0f1d7243bccc595e481c575fc7d7c58e98 06-saltglass.png
e3e210a026e4e93c8bdefd1eae92330f5219afbc1b0ad19b19bea5f80424eda1 07-home-fund.png
4c14d27169e1e837743351d0c7b77c3ec5a5fec1b805db8ddd839bfde83bd0f0 08-journal.png
a38411bbf9c6837cda9451cc6f224a8d66ec53597eaf265ce33a2e984214ae10 09-credits.png
```
