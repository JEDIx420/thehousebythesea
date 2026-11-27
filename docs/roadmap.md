# Stage-by-stage production roadmap

**Execution status:** only Stage 0 and Stage 1 are authorised now. Later stages are proposals, not active tickets. Hard creative approval gate after the First Voyage.

| Stage | Objective | Must demonstrate | Exit / approval |
| --- | --- | --- | --- |
| **0 — Foundation and terrain spike** | Static game pipeline and validated technical approach | Three.js + TypeScript + Vite shell; deployable nested-path build; terrain, water, collision, boat/character/Polyfork import proofs; save scaffold; test harness | Implementation lead + independent reviewer technical pass |
| **1 — The First Voyage** | First 10–15-minute complete playable | Havenport → meeting Mira/jobs → board/sail → Saltglass Bay → fish, dock and explore → return, earn money and see home fund; reload works | **Creator plays and explicitly approves or requests changes; freeze Stage 2 until then** |
| **2 — Neighbourhood and livelihoods** | Grow into a small connected region | Six explorable authored islands total, richer jobs, stable world streaming and map, house plot options, repeatable voyages | Creator reviews region map, travel rhythm and economy |
| **3 — Full archipelago** | Finish the twelve-location living world | All 12 islands walkable/meaningfully furnished with at least one unique local activity/landmark, NPC routines, regional fish and special outings | Creator reviews completeness and world liveliness |
| **4 — Love and home** | Deliver the primary emotional progression | Relationship story scenes with Mira, three candidate beachfront plots, buy one, staged construction, decorating, shared home evening, post-story play | Creator approves narrative tone and completed home arc |
| **5 — Release-quality polish** | Make the experience reliable and delightful | Accessibility and controls, audio, optimised loading, recovery, browser compatibility, save migration, credits, final static deploy | Release checklist and hands-on sign-off |

## Stage 0 detail
Prompt: prompts/00-foundation.md. Deliver concrete prototype/test results for live ProceduralTerrains vs export-first terrain; select compatible Three.js versions; establish player/boat modes and island coordinates; create GH Pages build pipeline and local tests; prove saving and restoration works with a fixture; keep a playable minimal proof. Avoid content expansion here. Record architecture decision and measurements before committing to the terrain runtime.

Exit evidence: clean install and build; direct local browser proof; optional live Pages proof if settings permit; no unverified pipeline claims. Reviewer follows prompts/reviewer.md.

## Stage 1 detail
Prompt: prompts/01-first-voyage.md. Strict acceptance contract: docs/first-voyage.md. Two fully explorable connected islands, one compact trip and payout loop, one optional date moment, early home-fund direction. Must feel atmospheric and functionally complete, not just have boxes and stub NPCs.

Exit: video/screenshots, one 10–15 minute player path, verified persistence, clean tests, known issues and a reviewable PR. The creator determines whether the look, feel and story justify expansion. Fix Stage 1 feedback before authorising any Stage 2 task.

## Stage 2 detail (not yet authorised)
Prompt: prompts/02-neighbourhood.md. Add Willowmere, Bellport, Orchard Point, Gullwatch or another creator-approved set to reach six islands; adjust travel time, populate useful neighbourhoods, improve jobs/currencies, preview all three house plots without building the home yet. Maintain one world and save compatibility.

## Stage 3 detail (not yet authorised)
Prompt: prompts/03-full-world.md. Fill the remaining six authored islands, enrich NPC life, fishing and markets, stitch recurring characters and outings. Add progression without making travel work; optimise world loading before heavy content creation.

## Stage 4 detail (not yet authorised)
Prompt: prompts/04-love-and-home.md. Expand authentic romance with consequences and consent, plot purchase, staged house build/ furnishing and story completion. Test save migration and a completed campaign flow.

## Stage 5 detail (not yet authorised)
Prompt: prompts/05-polish-release.md. Fix defects and performance bottlenecks; accessibility and browser QA; licence review; final credits, save continuity and publish.

## Coordinator rules
- One stage gate at a time. Cross-stage ideas go to the backlog in docs/progress.md.
- Each stage splits into 3–6 vertical tasks, with owner, dependencies, acceptance and proof, rather than giant parallel branches.
- Independent reviewer checks in batches of **five changed files or coherent systems**; severe defects return to implementer for another round before the next batch.
- Work should be committed to a focused PR with structured test evidence and a playable URL if one exists.
- Stage 1 ends in an explicit **WAITING FOR CREATOR APPROVAL** state, never auto-start Stage 2.
