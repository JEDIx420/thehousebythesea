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

## D-008 — 2026-11-28 — tested pixel renderer / foundation

PR #6 supersedes D-006/D-007's rendering proposal. Use pinned **Phaser3.90.0 (MIT), TypeScript5.9.3 and Vite7.3.8**, Node22, for this separate implementation branch. A real production build loaded a199-frame atlas in Chrome158/WebGL at640×360 logical /1440×900 browser viewport, integer2× pixels. Golden-v3's short107-frame raw render-callback sample measured p50≈16.70ms, p95≈16.80ms, zero>50ms stalls and zero page errors. Earlier v1/v2 JSONs record Phaser-smoothed update deltas and are not raw frame-time evidence. This establishes renderer feasibility, not sustained performance or complete gameplay. Four projection/depth/input/contour unit tests pass; asset checks prove byte reproducibility. Screenshots/JSON live in docs/evidence/pixel/.

Choose stable Phaser3's tested sprite/atlas/camera API instead of an unmeasured engine rewrite. Small tested world projection uses source-world JSON factors4/2 and logical x/z; no 3D physics or free orbit is claimed. Vite7.2.2 was rejected during initial dependency audit;7.3.8 resolves the reported development-server advisories. Final install audit reported zero vulnerabilities. Phaser's1.22MB JavaScript /≈336KB gzip produces the standard >500KB chunk warning, retained honestly.

The original recipes and palette are versioned; a small pinned MIT PixelFX Painter/ring subset generates transparent ripple frames offline. No runtime asset generation, model/API calls, gallery fonts, installer scripts or credentials. Original source/art is MIT; third-party notices remain separate. PixelFX is credited for its effect utility and contact-sheet labelling, not for original characters/buildings. See pixel-tool-audit.md for the exact pin, bounded adapter and rejected model-routing workflows.

First art sample v1 was **NO-GO**: water repetition, noisy ground, small hull and character proportions. V2 fixes those; independent native browser review passed walking/boarding/steering/stopping/disembarking and accepted the art direction. V3 corrects the final lamp placement and raw timing; final image placement is independently verified and the golden sample is GO for First Voyage production. No visual approval is implied by this decision. The prior Three.js implementations remain intact on their separate branches/PRs; nothing is deleted or merged. Reversal is a separate reviewed renderer decision, keeping state/story/assets intact.
