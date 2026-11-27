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

## D-008 — 2026-11-27 — CONFIRMED: measured terrain production approach

Tested `procedural-terrains@2.1.0` with its `three ~0.185.1` peer, real finite runtime and real GLB/collision export in installed Chrome. [Terrain report](terrain-spike.md) records screenshots, source verification, exact small-proof timings and a failed default-detail software-rendered attempt. Both reduced-detail runtime and exported GLB succeeded. Chose a compact authored finite heightfield in plain Three.js whose mesh indices and collision sampler share exact triangle data. This is an explicit variation of export-first; production does not falsely claim to load the proof GLB. Hand-authored harbour ramps make dock reliability straightforward, while avoiding runtime shader complexity. Reversal: replace the mesh/collider pair with the preserved GLB export workflow after visual review. Live runtime is a dev-only dependency.

## D-009 — 2026-11-27 — CONFIRMED: two-island data and save boundaries

World/rendering, original avatar/boat controllers, domain state/actions, IndexedDB persistence, synthesised audio, fishing view and UI are separated. A single animation loop updates serialisable checkpoints independently of scene objects. Stable delivery action pays once; fish sale clears inventory atomically. Versioned JSON snapshots include settings, discoveries, relationship milestones, wallet/inventory and boat/player checkpoints. Unsupported/corrupt saves disable writes for that session to preserve the original snapshot; storage failure shows a visible warning. No cloud or backend. Recovery returns to the current known island dock without changing earnings. Tests and independent browser preservation checks support this choice.

## D-010 — 2026-11-27 — CONFIRMED: original motion and licensed prop scope

Three selected Polyfork free CC BY 4.0 GLBs (hut, lamp, bench) are loaded locally. Two additional boat/character GLBs were inspected as integration references, with actual animation/skin counts in the manifest, and are disclosed as unused references. Gameplay people and sailboat are original articulated geometry with procedural animation, not a claimed rigged Polyfork character. Surf audio is original synthesised filtered noise, adjustable and muted in settings. No external fonts, audio recordings or runtime hotlinks. The manifest generates readable in-game source, licence, author and modification credits.

## D-011 — 2026-11-27 — CONFIRMED: publishing and approval gate

One focused implementation PR targets main; least-privilege GitHub Actions verifies the built project-path site before deployment. Pages was configured through the GitHub API with `build_type=workflow`. Production deployment remains main-only. Opening a PR or enabling Pages is not a claim of a live game, and no auto-merge is enabled. Local preview remains available for creator playtesting while PR approval/merge is pending. Stages 2–5 remain locked regardless of CI or deployment success.
