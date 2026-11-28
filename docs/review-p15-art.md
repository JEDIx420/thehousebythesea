# Independent P1.5 art/audio preflight

28 November 2026. Baseline plan commit `90693e37ce009c5f44b19ac683c0c017aef0843c`. Read current AGENTS, `docs/first-voyage-polish.md`, kickoff, style guide and existing surf/UI source; prior independent review inspected the actual nine-frame First Voyage gallery and departure recording samples. This is a direction preflight across five cohesive systems, not a new browser playtest, audio listening pass or approval of unbuilt assets. Reviewer made no app/source/build changes and launched no GPU session. Root is sole implementer.

**GO to produce one in-engine golden prototype; NO-GO to mass-production until its visual and audible evidence is reviewed.** The creator likes the established warmth; preserve its palette, selective outlines and adult identities. Passing the earlier First Voyage screenshots does not override the creator's stiffness, crowding, flatness, HUD or music feedback. P1.5 is the active correction scope; Stage 2 remains locked.

## 1. Original expressive portrait family

Use newly drawn **96×128 logical-pixel busts**, common transparent canvas and bottom chest anchor, never an enlarged walking sprite. Keep head proportions, face landmarks and palette consistent within each character across every expression. Suggested adult proportions: head including hair roughly 40–48px wide and 52–60px tall, shoulders roughly 65–80px wide, chest cropped deliberately at the common baseline. Slight three-quarter view, one-pixel selective facial lines, asymmetrical hair silhouette and restrained highlights fit the existing world. Do not outline every face feature heavily or substitute a tiny emoji face on a flat torso.

Preserve identity: Rowan dark hair/ivory sleeves/teal waistcoat; Mira auburn bob/pale blouse/terracotta garment/blue satchel strap. Ellis older harbour-worker silhouette and blue clothing; Tomas practical market clothing and distinct hair; Nessa weathered working fisher identity. Supporters must differ in facial shape, brow, hairstyle and outfit, not just a recoloured Rowan bust. No copied Pokémon portraits, typefaces, melodies or character proportions.

Minimum expression matrix:

| Character | Required authored expressions | Narrative use |
| --- | --- | --- |
| Rowan | neutral, warm smile, reflective/concerned, surprised | listening; sea dream; uncertain future; unexpected response |
| Mira | neutral, bright smile, thoughtful, surprised/amused | professional introduction; shared dream; own deadline/outing decision; playful reply |
| Ellis | neutral, welcoming smile, earnest | parcel offer, reassurance, task explanation |
| Tomas | neutral, pleased, considering | greeting, catch sale, practical comment |
| Nessa | neutral, warm smile, focused/concerned | handoff, thanks, fishing advice |

That is **17 distinct expression assets**, plus optional blink variants. Change brow angle, eyelids, cheek shape, mouth and subtle shoulder/head attitude together; a one-pixel mouth swap alone is insufficient. Preserve the base jaw, hair mass and eye spacing. Thoughtful does not mean randomly sad. Smile must remain recognizable at actual 2× gameplay scale. Blink should briefly close authored lids, not remove the eyes. Use original layered recipe functions so shared identity landmarks cannot drift accidentally.

Golden gate: show Mira neutral/smile/thoughtful/surprise side by side AND actual bottom-strip conversation with at least two expressions. Check bust/choice fit at 640×360 logical viewport and 1280×720 output, plus small laptop layout. One speaker portrait plus text should leave most of the world visible; two portraits only for a real exchange. Full-beat accessible announcement, instant text and reduced-motion must remain available. Asset hashes/manifest prove coverage and reproducibility, not attractive expression quality.

## 2. Architecture and district composition

Current harbour repeats large steep roofs around a narrow pier; the old modal/quest cards amplify that density. Merely enlarging the ground or adding more identical roofs will retain the problem. Author districts as **open space bounded by varied silhouettes**, with useful paths and an identifiable activity at each destination.

Prototype three deliberately different masses: a low cargo shed with long lean-to roof; an asymmetrical cafe with shallow porch/awning and side chimney; a taller narrow residence with garden wall. Vary footprint, eave height, roof ridge direction and porch shape, then restrained colour accents. Preserve common pixel density and upper-left lighting. Doors should read human-sized against 60px actors. Avoid randomly scaled copies of one sprite or changing only shutter colour.

Havenport: working pier → open fish-market square/cafe → residential lane → meadow/quiet home beach and raised viewpoint. Keep cargo off the interaction path. Small stalls/benches can frame the square without filling it. Give the player an unobstructed view of a destination before requiring a turn. Saltglass: fewer buildings, weathered net sheds, cove/reef/tide-pool edge and stone path toward the shell arch. The existing arch is a strong identity asset; give it breathing room instead of surrounding it with extra huts. District motifs should be functional and visual, not another permanent HUD label.

Judge density at the normal camera: at least two to three avatar widths in main walkways; no mandatory path through merged NPC/prop silhouettes; some views should contain foreground, player and distant landmark together. Measure usable area minus obstacles and route times, as the plan requires. A town that takes longer only because walking was slowed does not meet the scale goal.

## 3. Authored 2.5D elevation

Use a bounded authored height field / plateau polygons with explicit connected ramps, rather than fake height from background painting. At least one golden terrace should show its top surface, **12–20 logical pixels of visible retaining-wall height**, a ramp/stair connector and the avatar ascending it. Tune final heights after the source/world projection proof. A dark outline alone is not elevation.

Ground projection must subtract the same sampled height used by actor feet, shadows, props, prompts and camera target. Retaining walls need dark vertical faces and a clear top lip; paths must meet ramp ends without a visual step. Do not shadow a raised actor onto sea level. Stairs can be visually stepped while their actual navigable slope stays continuous and collision-safe. Heights and cliff-edge blocking must share authored world data, with access only at valid connectors. Y/depth ordering must include elevation and foreground-wall occlusion deliberately; simply adding height to a global depth scalar risks wrong floor ordering.

Golden proof: approach terrace from below, ascend, move along its top, descend, attempt an invalid cliff crossing and recover from a migrated save near the edge. Test both ascending and descending actor/prop occlusion. Keep docks and boat waterline at stable sea height and preserve real shoreline collision. No jump system, new island or procedural terrain dependency is needed.

## 4. Minimal game HUD and dialogue composition

The current cream objective panel, large fund panel, wordmark and footer consume attention before the town does. Retire that composition rather than restyling each card with a pixel border. Use a compact coin icon/amount upper-right, transient location name, short collapsible objective hint and three corner journal/chart/pause icons. A one-line world-space interaction label should sit beside the relevant actor, never on the avatar's head/feet. Keep nearby priorities stable; don't alternate prompts every frame between two neighbours.

Build a small original UI kit: ink outer edge, cream inner edge, sea-glass accent, corner cuts and purpose-drawn navigation icons. Avoid ornamental borders around every text item. Normal text must remain legible; tiny decorative letterspacing cannot replace hierarchy. Georgia/system text can remain accessible where appropriate; no unlicensed pixel font is necessary. Keep DOM semantics, focus and warning handling. Storage errors deserve a readable persistent exception to normal HUD minimalism.

Measure ordinary opaque HUD coverage below 10% of the 640×360 game area, excluding deliberately open dialogue/menu. Transparent containers still consume visual attention: assess real screenshot composition, not just CSS bounding boxes. Fishing should show a small local meter/line cue with Space/F instructions, not a second quest-sized card. Toasts must expire promptly and must not contradict the active fishing state (the prior public capture showed a stale “Rod put away” message while watching the float).

Golden screenshot set: clean walking HUD, coin reward, near-NPC prompt, Mira dialogue with final choices, fishing, keyboard focus and save-warning exception. At small layout, reflow choices and portraits without cropping or hiding recovery.

## 5. Original continuous music and layered sound

The existing four-second filtered-noise loop is ambience, not a soundtrack. Do not solve this with a six-second arpeggio or a constant pure-sine melody. Compose an original score with phrasing, contrast and space; retain source note events/tempo/instruments/seed and exact local render command. No remote model, paid service, unlicensed samples or game-music quotation is required.

Practical first arrangement: **32 bars in 4/4 at 80 BPM = 96 seconds**, A(8)–A′(8)–B(8)–A″(8). Author a two-bar coastal motif, then vary its answer, rhythm and register across phrases. Give B a distinct melodic contour and harmonic departure; use a gentle pickup/pivot back to the beginning. Chord tones, rests and voice-leading matter more than instrument count. Avoid every instrument striking on every beat. A composition should be memorable after listening yet leave dialogue space.

Suggested original synthesis family:

- Soft plucked-string lead: several low harmonics/noise transient, rounded low-pass, short attack and decaying envelope. Avoid harsh sawtooth attacks and a single unchanged oscillator.
- Breath-like wooden flute answer: sine/triangle partials, tiny filtered-noise onset and slow, restrained vibrato. Leave gaps after lead phrases.
- Warm sustained chord pad: quiet detuned partials, slow attack/release and minimal upper harmonics; voice chords smoothly rather than jumping whole stacks.
- Rounded bass: sparse root/approach notes, short release; very light brushed/shaker rhythm or soft taps only where useful. Do not make the entire coast sound like a drum loop.

Havenport can use the fuller pluck/flute dialogue; sailing should open the same motif into longer notes and thinner accompaniment; Saltglass can use lower register, different chord voicing and weathered quieter timbre. Write genuine arrangement variants, not three tempo-shifted copies. Keep all three compatible enough to crossfade over roughly two seconds. Dialogue ducks music gently without stopping it. District birds/wind/harbour wood sit beneath music; footsteps/interact/catch cues remain brief and quieter than a disruptive notification chime.

Render locally to PCM with envelope tails, then encode using an already reviewed local codec tool if available; no installer is necessary solely for this audit. Three 96-second tracks at 48–64kbps total roughly 1.73–2.30MB before small container overhead, leaving room near the plan's ~3MB budget; verify actual quality/size and browser codec support rather than assuming that bitrate is enough. Lazy loading and supported fallback are implementation choices. Cross the loop with overlapped tails/periodic synthesis or an actual tested loop edit; fading to silence each 96 seconds is a perceptible gap, not a seamless loop.

Golden audio gate: an audible 30–45-second excerpt containing A→A′ or A′→B, plus a separate last-four-bars→first-four-bars seam and town→sea transition. Listen on ordinary headphones/speakers for clicks, harshness, clipping, excessive repetition, buried melody and over-loud surf. Review the full loop before sign-off. Numeric peak/RMS/duration checks and active WebAudio nodes cannot replace listening. Capture audio from the browser, not only the offline source, to prove autoplay unlock/mixer integration. Music, ambience, SFX and master/mute must be independently controllable, persistent and safe through pause, blur, dialogue, reload and disposal; audio failure must leave gameplay available.

## Next review gate

Bring one actual redesigned street/terrace, minimal HUD, Mira's expressive portrait dialogue and an audible original music prototype. Do not mass-produce the remaining portraits/district assets until those samples are internally coherent. This preflight has no claimed P1.5 gameplay, visual or listening PASS. Final acceptance requires real walking/boat/fishing/delivery/Mira/home-fund/save regression evidence, migration and relaxed creator playtest. Stop at **WAITING FOR CREATOR PLAYTEST**, with Stage 2 still unauthorised.

## Golden A — first actual sample review (partial, 2026-11-28)

Reviewed the first actual `golden-harbour.png`, `golden-mira-neutral.png` and initially named `golden-mira-happy.png`. The last is **thoughtful beat 2**, with a hand-to-chin gesture; it is not happy-expression evidence and must be relabelled. No new browser/GPU, build, generation or source mutation was performed by the reviewer. Five cohesive systems: portrait recipe/style; dedicated HUD/dialogue composition; architectural/height prototype (evidence pending); original score/audio; actual sample evidence. Supporting source inspected: portraits, dialogue-view/view/CSS, score JSON and synthesis renderer. This is a bounded art-direction review, not full functional approval of those modules.

**Partial GO: Mira neutral/thoughtful and the reduced HUD are coherent enough to retain. HOLD full golden gate pending actual happy expression and street/terrace evidence.** Supporting portrait mass-production also needs distinct face construction as noted below. Audio production is technically plausible, but perceptual listening remains untested.

Observed improvements:

- The ordinary world is now dominant. Pier, Rowan and hull are no longer covered by giant cream quest/fund rectangles; compact currency and corner controls retain useful contrast. The short objective remains readable without becoming a competing panel. Toolbar icons are simple and coherent with the navy/cream palette.
- Mira is newly authored at portrait resolution, not an enlarged walking sprite. Auburn hair, adult face, warm clothing and blue satchel strap preserve her world identity. Neutral and thoughtful differ meaningfully through brows/lids/mouth plus hand/shoulder gesture. The bottom strip leaves the town visible, speaker name reads clearly and text/button fit the captured 1440×900 output. The neutral face is somewhat pensive, but it is not a blocker; test the real happy pose before deciding the set's emotional range.
- Dedicated dialogue uses speaker/expression metadata, full-beat screen-reader text, optional instant reveal and reduced-motion handling. Screenshots cannot prove focus/input/typewriter behavior; that remains a functional review.

Concrete follow-ups before bulk production:

1. **Supporting portraits need facial identity, not just accessories.** The current recipe uses the same jaw polygon, nose, eye placements and base hair silhouette across all names; cap/beard/colour changes alone will read as one face in different outfits. Keep a shared stylistic construction but give each supporter and Rowan a deliberate head/jaw/hairline/brow silhouette variation. Mira's current prototype can remain the family reference. Show a five-person neutral contact sheet before the full expression atlas is multiplied.
2. **Town/elevation direction is not yet proven.** The harbour capture still shows the dense baseline street; a lower blue-roof building is a promising silhouette change but cannot establish open-square spacing or navigable height. Require the promised street/terrace capture and ascent/descent proof before a district-wide GO. Do not mistake the compact HUD's newly exposed space for expanded walkable land.
3. **Evidence labels must match expressions.** Rename the thoughtful image and capture an actual smile/reaction with corresponding beat ID. Source inspection shows a happy-mouth/closed-lid branch, but source existence is not actual in-game appearance evidence.

Audio facts verified using local ffprobe/ffmpeg decode only: Havenport is stereo MP3 at 22,050Hz, exactly 96.000s and 768,670 bytes. Mean decoded level is -23.5dBFS; maximum -8.3dBFS, with headroom rather than clipping. The recorded browser WebM contains VP9 video plus stereo 48kHz Opus audio and is 18.6s long. Its diagnostics report one running music voice and a decoded 96-second loop. This verifies an audio stream exists, **not that it sounds pleasant or correctly mixed**.

Source uses an original 32-bar/80BPM score, AABA-related motif/reply/bridge/cadence material, separate pluck/piano/flute/pad/bass synthesis, seeded percussion, stereo placement and circular room tails. No sampled music, model/API or remote dependency occurs in this rendering path. Three-millisecond edge de-click and MP3 duration tags are sensible technical measures, but neither proves an inaudible loop seam. The 18.6-second recording is too short to demonstrate the full AABA development or end/start seam. Current sailing/Saltglass configurations mostly alter gain balance/transposition over the same arrangement; if adopted later, independently audition whether they feel meaningfully different as required.

**No actual perceptual audio audition was possible through this review's tools.** Do not mark listening PASS from waveform, score source, successful decode or a running WebAudio diagnostic. A human/creator must hear the complete loop and seam plus actual browser dialogue/transition mix. This limitation must stay explicit even if the visual golden later passes.

Sample identity at review time (SHA-256):

```text
a322a175e05bbfc14e2de1971c9943d954dbb81c4d8cf211ecbe135b5da98ea5 golden-harbour.png
22440f9e62c3071f92b8a8f2c118e44ed71625f40142f674327a996dc32ef31c golden-mira-neutral.png
e0ac5ad10bd2c80ce9a294aaaafde541db9e7cadc54633c3ad09552c5ba29f7c initially misnamed golden-mira-happy.png (thoughtful)
941a3951d9d1ced64f700198f6ce2d9293b2bfa152d6147a54099c53ff7f025c public/audio/havenport.mp3
```

## Golden A follow-up — portrait closure, terrace evidence hold

Inspected revised five-person neutral contact sheet plus actual happy/choice screenshot and new street/terrace files. **Portrait/HUD direction GO:** the neutral identities now have distinguishable outer hair/head/jaw silhouettes (short-haired Rowan, soft bob Mira, capped longer-faced Ellis, broader bearded Tomas, angular ponytail Nessa), while remaining one art family. Actual Mira happy reads as a warm smile and fits final choices; it closes the earlier mislabelled-expression gap. Portrait recipe retains newly separated facial polygons. Supporting expression production may proceed within that coherent family, preserving these identities.

The street image confirms a low asymmetrical blue-roof mass alongside the existing terracotta family, but the old district remains dense; this is prototype style evidence, not final expanded-town acceptance. Spacious composition and usable-area targets still belong to the forthcoming district pass.

**Terrain/elevation gate remains HOLD on the currently inspected capture.** `golden-terrace.png` at SHA `61183a8e5b604c447f9e96b231f13fd5f59efb942cb78400598831c614ad7cff` shows Rowan projected into/above the faded POST building's roof, with no clearly visible terrace wall or ramp. It does not yet prove a readable raised surface. The author reports a recapture in progress; do not treat this stale/incorrect-target evidence as a rejection of the corrected implementation. Request final capture at the actual garden terrace (`x=-28..-8,z=-52..-30`, ramp `x=-8..4,z=-39..-31`) showing top, front retaining wall and connector. A source height value of 18 alone is not visual proof. The independent controls reviewer owns traversal correctness; this reviewer has launched no GPU session.

Current follow-up hashes:

```text
8e00fa14fca2e9767e5a49b661a6c78946ac333b25492897b6658dcb744e6c55 portrait-identities.png
bd919fb0a03fd84f963fbd84c4e28983960578c1113cc56b9fd52c0988a226c2 golden-mira-happy.png (actual happy/choices)
754002d9016506f3401e62e5e6eb0fd229c7c95920558df00ec88441eb26d02a golden-street.png
```

No subjective music-listening PASS is added. The previously documented technical decode/score evidence remains valid; creator must hear it. Full B/C production GO waits for the one remaining visual elevation demonstration; portrait/HUD sample direction itself is coherent.

## Golden A closure — corrected raised terrace

Inspected fresh `golden-terrace.png` SHA-256 `1d64a73551b2bbf0d4db6cad2d79b65c256597b3a14f786521378c9fa9c65a56`. **GO for B/C art-family and world production within the authorised two-island P1.5 scope.** This supersedes the stale terrace-image HOLD above. Rowan is fully visible on a clearly separate upper ground plane, the front masonry retaining wall expresses the rise, and the right-side ramp/stair connector reads against the lower path. The misleading POST roof/fade composition is gone. Accompanying `golden.json` records actual walk checkpoint x=-11.3438324,z=-34.9890344 and sampled height 18 pixels. This is adequate prototype visual geometry evidence; independent controls review owns ascent/descent and cliff collision correctness.

The plain rectangular green garden is acceptable as a bounded urban retaining-terrace prototype, not final landscape polish. Final district work must give its top planted texture/path/use, keep connectors readable and routes spacious, and use more authored natural coast/hill shapes where appropriate. Do not multiply empty identical green platforms. The reviewed neutral-face family, actual Mira smile/thoughtful dialogue and compact HUD remain coherent production references.

This GO permits implementation and subsequent independent review of B/C; it is not P1.5 completion, final world acceptance or creator approval. Full-loop music/seam/mix **perceptual listening remains untested by this reviewer and explicitly a creator/human check**. No subjective audio PASS is inferred from original score structure, decode metrics or the actual audio stream. Preserve old saves/gameplay and the Stage 2 stop.

## C/D production batch — five systems, preliminary source/contact review

Reviewed five cohesive systems: (1) full portrait recipes and asset-validation contract; (2) district architecture recipes/contact sheet; (3) raised terrain rendering and current authored world data; (4) minimal HUD CSS; (5) dedicated dialogue exchange layout plus view integration. Supporting screenshots: `test-results/checkpoints/01-havenport.png` and `04-docking.png` from the preceding build, not a final gallery. No app/art edits, build or GPU/browser session were made. Ran only a small pure-CPU `portrait()` hash probe.

**P2 blocking required asset check — duplicate happy blink frames.** `portraits.mjs` uses `if (blink || happy)` for the same closed-eye geometry, and has no other happy-blink difference. Independently hashing `portrait(actor,"happy",0/1).data` gives identical output for all five actors. `check-assets.mjs` now explicitly requires unique hashes for every expression×blink pair, so the current source cannot pass that assertion. The contact sheets visibly confirm the duplicate happy pair. Fix the authored happy blink pose or honestly represent an already-closed-eye smile as a static eye pose with matching metadata/validation; do not claim distinct blink frames solely because IDs differ. Preserve the 17 distinct expressions and clear smile. Await source/output recheck before READY.

Otherwise, the inspected direction remains coherent:

- Contact sheets 1/2 show the complete five-person family, lead surprise plus three supporter emotions, at fixed bust scale and identity. Thoughtful uses a clear hand-to-chin pose; happy and surprise have meaningful facial changes. No missing/transparent head or detached face is visible. Supporters retain distinct outer silhouettes. The duplicate happy pair is the concrete issue, rather than a need to restart this style.
- Architecture contact sheet 4 shows genuinely different masses: low blue-roof cafe, open striped fish stall, side-gabled garden cottage/porch, narrow beacon and lower net shed, alongside the established tall plaster/timber houses. Shared lighting/palette/pixel density hold. These provide enough variety for districts without arbitrary scaled copies.
- World data now uses irregular multi-edge plateau polygons, 24px Havenport meadow and 28px Saltglass cliff levels with explicit connectors. Raised tops add path/grass texture; camera-facing wall segments remain separate depth layers with ramp gaps. Static source establishes the intended data/render relationship, not proof of all terrain occlusion or cliff routes. Independent traversal tests and final hill/cliff captures remain required. Reported usable-area ratios are implementer measurements, not rerun here.
- Prior-build harbour/dock screenshots show more breathing room, purposeful market stall/cafe and readable lower-path→stairs→upper-land structure. Old HOME signs in those captures are a known superseded issue; author reports separate destination-sign frames now. Require fresh captures before treating those labels as fixed visually.
- HUD stays compact and the world remains dominant. Dialogue reserves left/right portrait space for actual Rowan exchanges, dims the counterpart and hides the counterpart on narrow layouts rather than overlapping choices. Notice-style dialogue omits portraits intentionally. Text/choices wrap; narrow CSS adds scrolling. Final screenshots must exercise the longest exchange/choices at 1280×720 and the narrow state before layout PASS. Screenshot/source review does not establish keyboard debounce, full focus restoration or screen-reader announcements.

Status: **HOLD only on the reproduced asset-validation defect; final visual acceptance pending fresh full-map/portrait/layout captures.** Audio perceptual listening remains the explicit creator check documented earlier. No Stage 2 authorisation.

## C/D fix recheck — duplicate blink closed

Independently rechecked the updated portrait source and strict validation contract without GPU/build/atlas regeneration. Happy now has its curved smile-eyes in pose 0 and a separately authored horizontal closed-lid blink in pose 1; the smile/mouth/identity remain intact. A pure-CPU SHA-256 probe over all required generated portrait RGBA buffers reports Rowan **8/8**, Mira **8/8**, Ellis **6/6**, Tomas **6/6**, Nessa **6/6** unique expression/blink frames. This closes the reproduced P2 duplicate-frame issue. The assertion still requires every pair to be distinct; it was not weakened to hide the defect. Source SHA-256: `4abf3c79a20bba13b8ffc45c7c27d18e36e0665fa1acb7e90c92a0d25ad9218d` for `assets/source/portraits.mjs`.

Destination-sign source recheck confirms `sign-home`, `sign-light`, `sign-market` and `sign-cliff` are generated and referenced by world props. The sign recipe derives the rendered word from the variant instead of painting HOME on every instance; the 38px inner board has sufficient width for the current short labels. Final screenshots must confirm correct placement/wayfinding, not merely existence of IDs. The distinct architecture recipes and expanded irregular raised-world direction remain as reviewed; no new meaningful source-level artistic blocker found.

**C/D source/contact direction READY within this five-system review, with the P2 closed.** Coordinator reports strict 492-frame asset validation passing; this reviewer independently reran only the bounded 34-frame portrait uniqueness probe, not the full atlas command. Full rendered acceptance remains pending fresh after-captures of market/garden/lighthouse, Saltglass cove/cliff/arch, final signs, exchange/choice layout and narrow viewport. Remaining meaningful artistic checks are coherent open-space density, readable ramp approaches/height/occlusion, no repeated empty raised platforms, portrait identity during exchanges and HUD/prompt placement away from faces. These require the actual final scenes and must not be inferred from CPU geometry/area ratios. Subjective music-loop/mix listening remains explicitly untested by this reviewer and assigned to creator/human review. No Stage 2 approval.

## Native after-gallery batch 1 — four available captures

Inspected actual `after/01-harbour.png`, `03-cafe-square.png`, `02-ellis-rowan-happy.png`, `04-tomas-tomas-neutral.png`, comparing `before/harbour.png` as reference. `05-garden-street.png` was not yet available; did not block waiting or launch any browser/GPU. This is a four-file after batch, with the before image used only as baseline reference.

The retained coastal palette/pixel density is coherent. Ordinary HUD is substantially less intrusive than the baseline: large cream fund/objective panels and footer wordmark are gone, allowing the actual pier and coastline to be read. Harbour paths have breathing room and market/cafe silhouettes make the working district distinct. Cafe-square foreground fading keeps the avatar readable rather than hiding it behind an opaque stall. The varied low facade/stall/tall roof family remains original and consistent. The garden/hill and second island require their forthcoming captures; this batch is not a whole-map acceptance.

Portrait dialogue is substantially more character-led than the baseline centered prose panel. Rowan's happy reaction and dimmed Ellis counterpart are distinguishable, with speaker tab, readable line breaks, choices/continue and progress contained in the strip. Tomas preserves his beard/clothing identity. His closed eyes in the neutral-labelled screenshot are compatible with the authored blink frame, not evidence of missing neutral art. No portrait crop or text collision is visible at the captured output size. Narrow viewport/long choices and motion are not established by these stills.

**P2 layout finding — contextual prompt covers another NPC's face.** In `01-harbour.png`, the “E Ellis · harbourmaster” label lies across Mira's lower face/upper torso behind Ellis. Rowan is unobscured, but the prompt hides the adjacent character's identity in the initial composition. Avoid nearby actor head rectangles when choosing prompt position, or shift the label to a clear side of Ellis/Rowan rather than always centering above the player. Preserve prompt discoverability and viewport clamping; verify the resulting harbour composition. This is a concrete layout correction within the authorised HUD work, not an art-style rejection.

Status: art/portrait direction remains READY; **hold final HUD appearance closure on the prompt overlap**, and defer full world/gallery sign-off until remaining actual after frames arrive. No audio listening or runtime keyboard/focus claim is added. Stage 2 stays locked.

## Native after-gallery batch 2 — garden, hill and lead exchange

Inspected exactly five actual after files: `05-garden-street.png`, `06-hill-foot.png`, `07-lighthouse-meadow.png`, `08-mira-intro-rowan-happy.png`, `08-mira-intro-mira-happy.png`. **READY for this captured visual batch; no new blocker found.** No browser/GPU or build was run.

Garden street has a readable broad connecting path, coastal edge and different cottage/roof silhouettes instead of the previous densely repeated houses. Foreground tree fading keeps Rowan discernible at the coastal turn. Hill-foot and meadow views establish a visible raised plane, continuous front retaining face, lower route and access connector; grass/path texture, beacon and bench make the plateau a destination rather than the earlier empty green test rectangle. Rowan is fully readable on the upper level. Bench foreground occlusion at the lighthouse is visually plausible; this still is not proof of every bench/cliff crossing. The meadow intentionally has open ground and sea sightlines; do not fill it with more buildings merely to increase detail. Final creator taste and traversal/motion checks remain separate.

The Rowan/Mira exchange preserves both original adult identities and correct active-speaker name. Their clothing/hair/satchel differences remain stable across active and dimmed counterpart positions. At the new 0.76 inactive opacity, the listener is identifiable while attention still favours the speaking portrait. Faces and chest crops fit the strip, text wraps cleanly between portraits, and no choice/text overlap is visible. The Mira happy frame was captured during reveal (continue triangle visible), so the absent final choices there are expected and not claimed as choice-layout proof. These screenshots do not establish typewriter/debounce/accessibility correctness.

The earlier harbour prompt overlap is **not closed by this batch**: coordinator reports actor-avoiding candidate placement in the next build, with visual recapture pending. Keep the issue pending until that actual final harbour image is inspected. Saltglass cove/cliff/arch, final fishing/home, narrow layout and audio listening also remain outside this batch. Stage 2 remains locked.

## Native after-gallery batch 3 — Saltglass quay, fisher and shore

Inspected exactly five actual files: `12-saltglass-quay.png`, `13-nessa-choices.png`, `14-fishing.png`, `15-tide-pools.png`, `16-sheltered-cove.png`. No browser/GPU/build was used. **Art direction READY for these views. The initially reported clipping finding was withdrawn after reopening the image; see correction below.**

Timber/net huts, cooler roofs, shore rocks and lower urban density give Saltglass a distinct working-settlement identity without a palette/style restart. Quay/pier meet visually; Nessa and Rowan remain readable. The different shed/roof masses and raised-ground access behind them add depth. Rock-rimmed water basins read as authored shore pools, with small contrasting glints/details rather than unrelated decorative icons. The sheltered cove offers a quiet coast view; faded foreground hut keeps the avatar visible. Cliff/arch upper vista is still a forthcoming separate check.

Nessa's authored portrait matches her world outfit/hair identity. Speaker role, fishing-price text and all four choice buttons fit the bottom strip with clear spacing. This frame demonstrates a meaningful supporting portrait/choice layout at native captured size; no narrow-layout or input correctness claim is inferred. Fishing now includes Rowan's rod pose, a line reaching a visible local ripple and a readable waiting meter/cancel cue. The earlier contradictory “Rod put away” toast is absent. This still is waiting-state proof, not a bite/success timing or both-species animation pass.

**P2 HUD clipping — sheltered-cove objective crosses left game boundary.** In `16-sheltered-cove.png`, the objective visibly begins “urn to Havenport…” at the left game edge, losing the beginning of “Return”; location/currency/footer remain inside their normal bounds. The same objective is fully visible in 14/15. Investigate the capture/state-specific position or clipping, then show a final cove frame with the complete objective inside the game area. Do not treat this as an art-style defect, and do not infer its cause from the screenshot alone. The earlier harbour prompt-over-Mira issue remains pending its separately promised final-build screenshot.

Coordinator reports an 88.2-second VP9+Opus town→sea→arrival→dialogue recording. This reviewer has not perceptually listened to it, and stream metadata cannot establish pleasant music/mix/seam quality. Preserve that listening limitation and final creator approval stop. No Stage 2.


### Batch 3 correction — cove clipping finding withdrawn

Reopened the exact `after/16-sheltered-cove.png` with the image viewer. The complete objective **“Return to Havenport and share the crossing with Mira.”** is clearly visible starting around output x=108, inside the game boundary at x=80. The earlier clipping report was an incorrect visual inspection and is **WITHDRAWN**, not an application defect or a defect requiring a source change. Do not include it as an unresolved PR finding. Saltglass batch 3 is READY with no new blocker. Harbour prompt avoidance still awaits its final-build screenshot; music listening and remaining final-gallery checks retain their stated limits.

## Native after-gallery batch 4 — cliff, return, quiet shore and menus

Inspected exactly five actual after files: `17-shell-cliff.png`, `19-mira-return-choices.png`, `21-quiet-home-shore.png`, `23-chart.png`, `24-journal.png`. No browser/GPU/build. **Four views READY; chart initial presentation has one P2 layout finding.**

The shell arch now sits on a clearly elevated destination with readable masonry wall, upper path, access stairs, bench and sea view. Rowan remains visible within the opening. This is convincing spatial identity at the captured scale, not merely a landmark pasted onto the original flat shore. The quiet home shore provides room around bench/sign/coast rather than implying completed construction; the world remains a two-island First Voyage teaser. Mira's return choices fit cleanly in the portrait strip and retain her own plans/optionality. The journal has readable completed-route entries, empty sold inventory and consistent 163/500 fund/milestone presentation. Static images do not independently prove payout/save idempotency; coordinator reports the 569-second native route and reload passed with no errors.

**P2 chart heading clipped at initial captured panel position.** In `23-chart.png`, the upper portion of “The Saltglass channel” is cut off at the panel's top border (around output y=118); the eyebrow/title region is not fully visible. Reopened the chart image alone and confirmed this appearance. The map, instructions and Fold button remain visible. Investigate the panel's default overflow/scroll position when keyboard focus is placed on Fold; do not infer the exact cause solely from this screenshot. Opening the chart should show its heading without sacrificing focus or hiding the close action. Supply a final chart frame with the complete heading and map instructions visible, including the narrow-layout check where appropriate.

The earlier actual harbour prompt overlap still requires `26-final-harbour-prompt` visual closure. The withdrawn cove-clipping report stays withdrawn. No new identity/art/terrain blocker is raised from these five captures, and no music-listening PASS is claimed. Final creator approval remains mandatory; Stage 2 locked.

## Final viewport batch — prompt closed; narrow speaker tab finding

Inspected five final actual captures: `26-final-harbour-prompt.png`, `27-final-mira-choices.png`, `28-dialogue-1280x720.png`, `28-dialogue-1024x720.png`, `28-dialogue-840x640.png`. No GPU/browser/build.

**Harbour prompt P2 CLOSED by actual final evidence.** In 26 the Ellis label has moved left into clear scenery, avoiding Mira, Ellis and Rowan; all three faces/bodies remain visible. This is the promised rendered closure, independent of the coordinator's additional DOM rectangle-overlap assertions. Do not use old 01 as final prompt evidence.

27 and the 1280×720 / 1024×720 dialogue captures retain stable Mira/Rowan identities, legible text, intact speaker tabs and both final choices without overlap. The two-portrait layout compresses text at 1024 but remains readable. **Those layouts READY.**

**P2 narrow speaker-name clipping at 840×640.** In `28-dialogue-840x640.png`, the Mira speaker-name tab is clipped at the strip's top: only the navy rectangle bottom is visible and “Mira” is absent. Reopened that exact image alone and confirmed. Role, dialogue text, portrait and choices fit, and omitting the inactive counterpart on narrow screens is sensible. The narrow strip's scrolling/overflow must not clip its negative-top speaker heading; place the tab within the visible narrow content or otherwise separate it from the scrolling region. Show an updated 840×640 capture with full speaker name and choices before narrow-layout READY. Do not count accessible hidden/full speaker text as visual closure.

Chart P2 remains pending `30-final-chart` inspection. Music perceptual-listening and creator approval limitations remain unchanged; Stage 2 locked.

### Chart P2 closure — final actual capture

Inspected `30-final-chart.png` alone. **Chart heading P2 CLOSED.** Full eyebrow, “The Saltglass channel” heading, map, adjacent docking instructions, discovery/recovery text and Fold button are visible within the panel. The revised bounded chart height/two-column body and reset scroll position in source are consistent with the actual corrected presentation. No new chart visual issue found at this captured size. Narrow dialogue speaker-tab source now places the heading in normal flow inside the scrolling strip, which addresses the identified mechanism; actual updated 840×640 screenshot is still required before closing that separate finding. No GPU/browser/build was run.

## Final visual closure — 840 speaker tab and chart

Reopened the two final actual images `28-dialogue-840x640.png` and `30-final-chart.png`. **Narrow speaker-tab P2 CLOSED:** Mira's complete name is now visible in normal flow inside the strip, with portrait, role, complete final beat, both choices and progress visible at 840×640. The inactive counterpart is omitted intentionally to preserve text space. **Chart P2 remains CLOSED:** full heading/map/instructions/Fold button fit without clipping in the new final capture. Harbour prompt P2 was already closed by 26. Duplicate happy-blink P2 was closed by the independent 34-frame uniqueness probe. The incorrect cove-clipping finding remains withdrawn.

**No open P2 finding remains in this independent art/layout review. GO to present the completed P1.5 visual checkpoint for creator hands-on review**, subject to the separate functional/state/audio-control/static-host checks. This is visual evidence acceptance, not creator approval or authorisation to expand beyond the two islands. The coordinator reports final native viewport and targeted keyboard regressions passing; this reviewer inspected the resulting images, did not rerun browser/GPU tests. Original music structure, decode and audible-stream evidence were technically assessed; subjective full-loop/seam/mix listening remains explicitly untested by this reviewer and a creator/human check. Final movement feel likewise requires hands-on/recorded-motion acceptance rather than inference from still images. Stop at WAITING FOR CREATOR PLAYTEST; Stage 2 stays locked.

Final closure SHA-256:

```text
dafa392e716359eb240ed7c3c14938d633af371601ad2aa1eec13cfaea774725 after/28-dialogue-840x640.png
53450d4f8562e28fd1ce16ee3192af83caa121c04fb0d3352e2a430056b6eca2 after/30-final-chart.png
9f2b1a4146a2e776809e3b133bd63d307d8329354dbaf4171ef411617c307eb5 after/26-final-harbour-prompt.png
```
