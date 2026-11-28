# Pixel preservation and preview audit

Read-only review, 28 November 2026. Reference implementation: `1efeb5c`. Reviewed the pixel reboot plan and kickoff prompt against AGENTS, README, vision, world-story, gameplay, first-voyage, and the reference state, persistence, content and tests. The pixel override governs rendering and controls; the First Voyage narrative and two-island approval gate remain authoritative. No application, dependency, branch or GitHub configuration changes were made by this audit.

## Recommended imports

Reuse the pure data/reducer rules from `src/data/content.ts` and `src/state/game.ts`, adapting authored world checkpoints and recovery only. Keep rendering, input, camera, collisions, time and audio outside the reducer. Do not import the old Three.js scene or tank-style walking. The pixel plan requires world-relative movement with normalized diagonals and logical world coordinates separate from projected screen coordinates.

| Contract | Preserve |
| --- | --- |
| Delivery | `havenport-saltglass-parcel`; issuer `harbourmaster`; recipient `saltglass-fisher`; available → active → complete; reward 120 exactly once, only walking on Saltglass |
| Economy | Initial wallet 25; `sardine` Silver sardine 18; `bream` Sunlit bream 32; selling clears both inventories atomically; home goal 500, milestone 150 |
| Characters | Rowan, Mira, harbourmaster Ellis, fish seller Tomas, Saltglass fisher Nessa; keep role IDs stable even when UI NPC IDs differ |
| Story | `metMira`, `outingInvited`, `outingVisitedSaltglass`, `outingComplete`, `homeSeen`, `prologueSeen`; optional invitation requires meeting Mira; Saltglass visit must follow invitation; outing completion requires walking back on Havenport |
| Discoveries | Stable island IDs, unique and persistent; only `havenport` and `saltglass-bay` playable |
| Settings | Muted flag and volume 0–1; reference default volume 0.35 |

The home fund is the wallet displayed against a goal, not a second balance or spending action. Mira has no purchased affection or gift counter. A delivered parcel remains complete after reload/import and cannot pay again. Recovery must relocate player and boat together without changing wallet, inventory, discoveries or story.

Keep all twelve chart IDs: `havenport`, `saltglass-bay`, `willowmere`, `bellport`, `orchard-point`, `bracken-island`, `gullwatch`, `tideglass-reef`, `ashen-springs`, `lantern-key`, `observatory-isle`, `far-beacon`. The latter ten remain chart-only silhouettes and descriptions, not explorable content.

## Save compatibility

Reference storage is IndexedDB database `thehousebythesea`, version 1, store `snapshots`, key `first-voyage`. Schema 0 migrates to schema 1 by adding audio settings. Its `player.x/z` and `boat.x/z` are 3D metres: initial walking (48,0), berth (62,0), Saltglass z −220. They must not be silently interpreted as tile positions or projected pixels.

Recommended pixel storage: a separate database or slot, an explicit pixel coordinate/world discriminator, and a versioned validated payload. A schema-2 payload with `worldVersion: pixel-first-voyage-v1` is sufficient if legacy and pixel schemas have separate parsers. A fresh independent schema-1 database is also unambiguous if it never attempts to reinterpret the old slot. Ordinary exact pixel reloads restore logical coordinates, not camera screen positions.

For an optional legacy import, first validate schema 0/1 with the legacy parser, then copy economy, inventory, delivery, discoveries, story and settings. Relocate both actors to the pixel safe dock for the saved current island, with walking player and docked boat. Explain that world positions reset for the new map. Write only the new pixel slot, leave the original intact, and make the import idempotent. Do not award delivery or discovery rewards while migrating. Do not automatically repeat migration over newer pixel progress.

All Pages subpaths share the same origin and IndexedDB: `/preview/pixel/` is not a storage boundary. Namespace this preview so it cannot overwrite production or 3D snapshots.

Retain exact-string enum validation, safe nonnegative integer inventory/currency, finite bounded coordinates, complete boolean story flags, valid island IDs, unique discoveries, and valid audio settings. Reject unsupported future schemas and malformed saves without overwriting them. The legacy persistence module alone does not enforce that last promise: the scene integration must block autosave after a failed/unsupported load until explicit recovery. Preserve clear loading/saved/unsaved/error status, transaction completion semantics, serialized writes, and visible quota/blocked/unavailable errors. Avoid claiming a save succeeded on request success before transaction completion.

## Tests worth carrying over

1. Parcel pays once, including after restore; reject wrong island and handing over from boat.
2. One sardine plus one bream sells for 50; wallet 25 → 75; empty resale cannot pay again. Complete voyage with delivery reaches 195.
3. Mira invitation/visit/return gates, including a Saltglass visit before invitation not counting.
4. Recovery preserves all progress and creates reachable matching player/boat checkpoints on either island.
5. Home fund at 180 is 180/500 (0.36), milestone true; no wallet debit.
6. Save round-trip preserves every field and detaches caller references. Legacy schema-0 settings migration, explicit schema-1-to-pixel migration, repeated import safety, and source snapshot preservation.
7. Corrupt JSON, future schema, invalid enums/IDs, duplicate discovery, negative/fractional/nonfinite values, malformed flags and unavailable/blocked/quota storage. Browser regression verifies fallback boot cannot overwrite a seeded bad/future snapshot.
8. Pixel-only movement/projection tests: normalized diagonal speed, collision in logical space, shoreline blocking, safe board/disembark/recovery, depth ordering by feet. These replace coordinate-specific 3D controller tests; do not loosen collisions to fit obsolete waypoints.

The browser route still proves intro skip, real walking among three NPCs, parcel acceptance, Mira introduction, boarding/sailing/docking, one delivery, both fish species and sale, return/optional outing, home/chart/journal, reload, and credits. No direct state writes or teleport shortcuts in the end-to-end route.

## Free Pages preview without a main merge

Observed through GET-only GitHub APIs: repository public, default branch `main`, Pages `build_type: workflow`, canonical URL `https://jedix420.github.io/thehousebythesea/`. The `github-pages` environment has custom deployment branch policies and currently allows **only `main`**. Its deployments list was empty at inspection; this is not proof that a playable site exists. No policy was changed.

GitHub Pages supports custom workflow publishing; the deploy job needs `pages: write`, `id-token: write`, and a suitable environment. The official deploy action exposes `preview`, but documents native PR previews as alpha and unavailable publicly. Therefore do not use `preview: true` as the delivery plan. [Custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [official deploy action](https://github.com/actions/deploy-pages/blob/main/README.md).

Practical path:

1. Build the verified pixel branch with asset base `/thehousebythesea/preview/pixel/`.
2. Assemble an entire Pages artifact whose root contains `preview/pixel/index.html` and its assets. Include the existing root site and any retained previews in the same artifact; a Pages deployment deploys a site artifact, not a path-level overlay. If no production site is established, use an explicit root review landing page rather than accidentally promoting the pixel game to the root.
3. Add the exact owned implementation branch to the Pages environment allowlist, retaining `main`; run a `push` workflow on that branch with the official upload/deploy actions and serialized Pages concurrency. This changes deployment configuration, not main source or merged PR state. It is an execution step for the coordinator after verification, not performed here.
4. Preserve the same composite-tree policy in future root deployments, or they can remove the preview. Prefer an auditable pinned root build or deployment-tree source, not an HTML-only scrape of the live site. Keep privileged publishing restricted to the owned branch; avoid fork code through `pull_request_target`.
5. Verify deployed HTTP, asset URLs, a refresh at the exact preview path, and real gameplay before claiming this playable URL: `https://jedix420.github.io/thehousebythesea/preview/pixel/`.

An alternative is a dedicated `gh-pages` branch containing the composite published tree, configured as Pages branch source. It also avoids merging main, but changes the publishing source and adds another maintained branch; the existing workflow mode is the smaller change. GitHub branch-source paths are limited to root or `/docs`, so `/preview/pixel/` must be a directory within the published tree, not the configured source path. [Publishing source configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Pages REST API](https://docs.github.com/en/rest/pages/pages), [environment deployment protection](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment).

No later-stage work is recommended. Technical preservation and deployment readiness do not substitute for creator approval of the First Voyage.
