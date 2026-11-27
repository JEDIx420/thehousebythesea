# Decision record and risk register

Decisions here state choices that are *actually made*, and identify hypotheses that remain to be proved. New architectural decisions append dated entries, rationale, alternatives, impact and reversal path.

## Confirmed product decisions (27 Nov 2026)
- **D-001:** Browser-only first release; GitHub Pages, no Cloudflare/backend/multiplayer. Reason: keep cost and implementation simple.
- **D-002:** Persistent 12-island bounded archipelago, rather than an endless random ocean. Reason: quality, liveliness and authored story.
- **D-003:** Core story is boy grows up dreaming of the sea, buys a boat, works, woos a woman, and saves for a shared beachfront home. No fog conspiracy as main plot.
- **D-004:** Single personal cottage build, not village construction. Fishing/deliveries/exploration/relationship are primary loops.
- **D-005:** Only Stage 0 + Stage 1 authorised. First experience must be played and explicitly approved before expanding.
- **D-006:** Three.js + Vite + TypeScript are the proposed core; selected free Polyfork GLBs preferred for assets, respecting their actual licences.
- **D-007 (candidate, not confirmed integration):** ProceduralTerrains for island authoring; live runtime versus authored/exported terrain is **OPEN** pending Stage 0 measurement.

## Technical risks

| Risk | Why it matters | Mitigation / owner | Status |
| --- | --- | --- | --- |
| Terrain GPU/CPU collision mismatch | Player falls through ground / wrong slope height | Stage 0 owner tests/export collider alignment and disembark | OPEN |
| Rendering incompatibility / GPU cost | Water, clouds and game scene may not blend or perform | Compare runtime versus baked mesh; use simpler water as fallback | OPEN |
| Polyfork animation uncertainty | Characters look inert in a lively harbour | Audit rigs/clips per model; use valid free animations/procedural fallback | OPEN |
| GitHub Pages path/size or settings | Blank screen, 404 assets, no demo | Vite /thehousebythesea/ base + built preview; owner enables Pages Actions | OPEN |
| Softlocks at dock / out of bounds | Player stranded without reload | Validated boarding points, safe checkpoint / recover option | OPEN |
| Save schema and repeatable payment | Lost money / duplicate economy rewards | Versioned save data, atomic/idempotent job completion, unit/browser tests | OPEN |
| Visual scope creep | Twelve empty islands or generic cubes | Two-island playable quality gate, authored environment checklist | OPEN |
| Licence attribution omissions | Unacceptable release liability | Verify source+license for each shipped asset; credits in game | OPEN |

## Open design decisions for creator review
- Protagonist and woman's final names and visual appearances (Rowan and Mira are placeholders).
- Art style target as tested in the browser (stylised/cozy, not fixed to any particular reference).
- Exact home plot locations and money balance after real playtesting.
- Mobile controls and accessibility extensions after the first desktop milestone.

## Change procedure
Write: ID/date/status; motivation; observed evidence; decision; rejected alternatives; consequence; how to reverse. For Stage 0 terrain choice include screenshots/metrics and the version tested. No tech decision is "done" merely because a library appeared in an earlier conversation.
