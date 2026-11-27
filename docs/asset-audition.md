# V0/V1 — real people and vessel audition

Issue #4 is a visual remediation of the First Voyage, not Stage 2. Actual local licensed GLBs were loaded into a browser contact sheet, animated and inspected. Catalogue thumbnails are not the evidence. Reproduce: `npm run dev -- --port 5175`, then open `/thehousebythesea/tools/model-showroom.html`. Idle and Walk buttons play the actual embedded animation clips. Screenshot evidence: `docs/evidence/visual-reset/asset-audition-idle.png` and `asset-audition-walk.png`.

## Art selection, including rejected attempts

The first attempted Polyfork Characters v2 flannel man and cardigan woman have real rigs and clips but still visibly cuboid heads, hands and clothing. They failed the creator's non-blocky standard and were rejected. Holidaymaker is explicitly a woman in her fifties in vacation/swimwear and did not suit Mira. Hiker, road-tripper, backpacker, attendant and other relevant public catalogue candidates were examined; these shared the same blocky anatomy. The Mediterranean waiter has better rounded anatomy, but the only matching female audited was an explicitly elderly basket-carrying grandmother. Recolouring her hair was considered and rejected: it would not make her a suitable adult working illustrator. No such age disguise is shipped.

**Current selection after the creator decision:** Mira uses the creator-selected [Polyfork Family Traveller](https://polyfork.dev/asset/family-traveller-9af47e), without further auditioning or an outfit delay. Her original face, auburn hair silhouette, wardrobe vertex colours and adult scale are preserved. The source's Idle and Walk clips drive her movement. Final styling still awaits creator review.

Rowan and supporting harbour people use Quaternius Ultimate Modular Characters/Women, Casual_2 male and Casual female, both licensed **CC0-1.0** by their original author. Rowan's muted teal shirt/navy trousers, Nessa's green-blue clothing, and Ellis/Tomas wardrobe and hair differences keep them readable. The legacy filename `mira-casual.glb` now supplies **Nessa only**, not the heroine. All people are actual skinned models, with no primitive-box substitute bodies. Earlier conclusions about the Polyfork candidate family were the implementer's provisional curation, superseded by the creator's explicit Family Traveller selection.

Primary author/licence verification: [Ultimate Modular Characters](https://quaternius.com/packs/ultimatemodularcharacters.html), [Ultimate Modular Women](https://quaternius.com/packs/ultimatemodularwomen.html), [author's women release and CC0 statement](https://www.patreon.com/quaternius/posts/ultimate-modular-64940180). Downloaded converted GLBs are from the converter's pinned commit `fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08`, not an unversioned runtime service:

- Male source: https://raw.githubusercontent.com/LuanDucate/Ducz.CharacterCreator/fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08/public/models/Male/Casual_2.glb
- Female source: https://raw.githubusercontent.com/LuanDucate/Ducz.CharacterCreator/fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08/public/models/Female/Casual.glb
- Converter repository credits the original models and animations to Quaternius under CC0. The supplied licence text is preserved in `public/assets/LICENSE-Quaternius.txt`; primary author independently confirms CC0 for the female pack too.

The Polyfork Small Fishing Boat and Mediterranean Caique were both actually rendered. The small boat's trestle/dangling gear and outboard silhouette were unsuitable for this sailing/boarding presentation. **Selected:** [Caique Fishing Boat by Polyfork](https://polyfork.dev/asset/caique-fishing-boat-262c24), mesh CC BY 4.0. Curved stem, cabin, rubbing strake, mast, boom and jib create a recognisable coastal working vessel. Source/download/licence are in the runtime asset manifest and credits. Family Traveller is likewise a free self-hosted Polyfork mesh under CC BY4.0, with source https://polyfork.dev/cdn/family-traveller-9af47e.glb and attribution in the runtime manifest.

## Verified files and real animation

| Runtime GLB | Bytes | Triangles | GLB skins | Embedded clips |
| --- | ---: | ---: | ---: | --- |
| rowan-casual | 1,611,824 | 5,776 | 1 | 24, including Idle, Walk, Interact, Wave |
| mira-casual (Nessa) | 1,668,252 | 6,424 | 1 | 24, including Idle, Walk, Interact, Wave |
| mira-family-traveller (Mira) | 892,448 | 4,137 | 8 | Idle, Walk, Run |
| caique-fishing-boat | 310,208 | 2,636 | 0 | tick, one rotating part track |

`node tools/inspect-assets.mjs` reads actual GLB chunks, mesh-local bounds, primitive topology, skins, clip names and joint counts. GLB skin count is not the number of skinned render primitives: character materials are separate draws sharing one skeleton/skin definition. Combat/death clips exist in the original source pack but are not exposed or used by this game. There are no combat mechanics.

`AnimationMixer` plays verified embedded Idle/Walk clips with 0.2-second crossfades. Quaternius actors use their genuine **Wave** clip for conversation: actual in-game inspection revealed that their clip named Interact is a pickup/crouch motion, so it was deliberately not used as a conversation pose. Family Traveller has **no interaction clip**; Mira uses a small original greeting layer on her real named RightArm, RightForeArm and Head bones after the Idle mixer update. This is disclosed authored bone motion, not a fabricated embedded animation.

`SkeletonUtils.clone` makes each avatar's skeleton independent; no shared-bone animation corruption. Material clones provide wardrobe distinctions without altering shared source materials; Mira's authored palette is deliberately unchanged. Feet are normalised to the root ground plane, with Rowan about1.79m and Nessa about1.72m, and Mira retaining the source adult height. Source +Z facing is turned by π on the visual child so the controller's -Z convention stays intact. Horizontal root-motion components are removed from cloned relevant translation tracks so the movement controller remains authoritative. No generated cube limbs, network animation service or fallback root-bob is used.

## Boat, boarding and wake proof

The caique's source bow is +Z. The visual rotates π, scales uniformly by 0.94 and offsets Z by -0.36, placing its approximately 6.88m hull inside the established lightweight controller footprint. No controller/state/saving contracts were rewritten. Browser-measured model bounds while gently bobbing: X −1.267..1.264, Z −3.803..3.096 (including the tiny visual pitch), Y −0.456..4.211 relative to boat root. The controller samples remain the collision authority.

Stern deck seats, relative to boat root: Rowan `(-0.376,0.762,2.272)`, Mira `(0.376,0.762,2.272)`. These were selected by downward raycasts on the actual GLB, outside the cabin. Raw source deck sample at X ±0.4,Z −2.8 was Y 0.799998; after the visual transforms and gentle bob the test found deck Y 0.726–0.727 under both feet, leaving about 3.5cm visual clearance in that sampled bob phase. Main adds the boat root height to the seat height. Occupants do not stand inside the cabin/roof.

Rectangular wake quads were removed. One instanced mesh of circular foam discs uses a soft radial falloff and irregular shader alpha, with speed-dependent intensity and slight ripple motion. This is original procedural work, no third-party texture. The vessel's legitimate `tick` clip is played and gentle hull rocking is a small visual layer.

## Self-test and ownership handoff

Browser: installed Google Chrome 158 on macOS Apple M4, real WebGL2. Targeted actual module execution confirmed: different skeleton object identities, updating Rowan's Walk leaves a second Rowan pose unchanged, conversation greeting changes the animated pose, the preferred Family Traveller node is present, Mira’s real forearm responds to her authored greeting, avatar root position remains `[0,0,0]`, circle wake geometry, and disposing three actors plus boat leaves the test scene with zero children. This is an implementer self-test, not an independent review. `npm run typecheck`: PASS after integration.

Loader contract: `preloadCharacters()` and `preloadBoat()` must resolve before synchronous creation. `src/assets/models.ts` caches only local relative URLs, fetches with a 20-second abort deadline, and reports a visible boot/retry error rather than silently reinstating primitive placeholders. `disposeModelAssets()` releases shared source geometry/materials after all instances are disposed. No Polyfork API key appears in the client, downloaded assets or logs.

The user-authorised key was used **only server-side in memory** with the official `Authorization: Bearer` header for `/api/me` and relevant model metadata. The account returned **free** plan. No paid HD files, subscriptions, purchases, remix generation or external publishing were performed. Public free GLB downloads need no key; authentication was used for honest entitlement and metadata verification, not invented as a runtime requirement.

Rejected/audition-only GLBs are stored under `tools/model-showroom-assets/`, outside Vite's `public/` release payload. Their individual canonical source/download URLs, licences, changes and measured file data are recorded in `tools/model-showroom-sources.json`. Source files remain unchanged; runtime reorientation, material changes and normalisation are recorded in credits for the four selected runtime models.

Independent V1 art/code review, full gameplay regression and creator visual/gameplay approval remain separate required gates. No Stage 2 is authorised.
