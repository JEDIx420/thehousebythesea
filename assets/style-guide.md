# First Voyage pixel art bible

Original authored raster art; warm late-afternoon coastal storybook, with crisp pixels and a fixed southwest view. No old 3D captures or remote image generation. Town production follows the in-engine golden-sample review.

- Logical viewport640×360, integer2×/3× CSS upscale where space permits; nearest texture filtering, integer camera pixels. Tile64×32; humans60px tall in48×72 frames. Feet at(24,64), shared across idle/walk/four directions. Houses use the same pixel density.
- Palette in source/palette.json: ink/navy outlines; deep blue/teal sea; pale sea-glass foam; warm sand/cream; sage/olive foliage; terracotta/coral/sea-blue roofs. No pure black/white. Sun from upper left, shadows toward lower right. One-pixel selective outlines and broken highlights, no antialiasing or gradient filters.
- Rowan: indigo trousers, ivory rolled sleeves, teal waistcoat, dark hair. Adult Mira: auburn bob, pale blouse, terracotta skirt, blue sketch satchel. Other adults share anatomy and pixels, with distinct palettes/hair. Eyes/nose/hands are authored per facing; walking has planted feet, opposite arms and weight transfer.
- Layering: sea, shallow shelf, shoreline, ground, ground shadows, foot-sorted props/people/boats, foreground canopy/roof. Foreground covering the protagonist fades. Building collision is authored logical footprint, not opaque pixels. Atlas sprites have two transparent padding pixels and explicit anchors/footprints.
- Architecture: cream plaster, deep blue shutters, terracotta roofs, timber porch, striped market awnings, pots and fishing details. Havenport welcoming and colourful; Saltglass weathered wood, cooler stone, rope/net details and a reef overlook. Distinct silhouettes; no random palette mixing.
- Water uses pre-baked, seeded pixel frames and sparse authored glints/ripples/wake. Trees/flags/lanterns/gulls add bounded motion; reduced-motion preference stops decorative loops. No expensive full-scene CPU pixel painting at runtime.
- tools/generate-assets.mjs regenerates source PNGs, a padded atlas and metadata/contact sheet locally. No credentials, API, editor or paid service required. Source recipes and seed are committed. tools/check-assets.mjs validates alpha, anchors, names, dimensions, frame distinctness, licences and byte reproducibility.

Visual approval belongs to the creator. An independent golden-sample review permits producing this checkpoint's remaining assets, not Stage2 expansion.

## P1.5 direction approved for production

Original96×128 three-quarter busts, shared face anatomy across expression/blink frames; four lead expressions and three per supporting adult. Distinct hair/jaw/cheek silhouettes rather than enlarged walk sprites. A compact navy/cream pixel kit replaces the old HUD panels. Raised terrain uses shared authored height zones/ramps and separately foot-sorted top/front-wall images, not a flat painted illusion. The reviewed urban18px terrace is a prototype; final islands need natural coastal forms, paths, planting and open districts. Music is an original96s32-barAABA coastal arrangement; no game-theme copying or external samples. Renderer/input/music source review is not creator acceptance.


## P1.5 final asset family

540 character/terrain/portrait frames grew to541 with the original Saltglass tide-pool tile. Twelve planted walk poses; four quiet idle poses with independent blink/gesture timing; two seated and two rod-grip poses, four facings. Distinct96×128 busts maintain world identities across34 expression/blink frames. Buildings include an asymmetric cafe, striped fish stall, porch house, beacon and weathered net shed. Havenport has warm garden/market/meadow motifs; Saltglass cooler timber, shell stone, tide pools and a sheltered working cove. Natural raised24/28px surfaces have explicit ramps and layered cliffs. Portrait speakers retain their side of the strip; no scaled walk-sprite faces. Pixel focus rings use the established warm palette.

The score is original music under the project MIT license, not a tool-license inference or a borrowed game theme. Three96s arrangements share a composed motif and32-bar form. Only creator listening can approve pleasantness and perceived looping/transition quality.
