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
