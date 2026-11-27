# Issue #4 — Stage 1B visual reset

Creator verdict: prior appearance rejected. First Voyage remains unapproved. Branch `fix/stage1-visual-baseline` derives from #3 without force-pushing or merging it. No Stage 2.

| Package | Owner | Evidence / state |
| --- | --- | --- |
| V0 art direction / actual asset auditions | Coordinator + model implementer | art-direction.md, six before game captures, actual GLB contact sheet; blocklike flannel/cardigan candidates rejected after visual inspection |
| V1 people and vessel | Model implementer | Selecting sculpted human family and Mediterranean caique; genuine clip/skin audit, no fake animation claims |
| V2 terrain/water/light/camera | Environment implementer + coordinator | Exact surface retained; closer/lower camera and moderated lighting prepared for A/B; new coast geometry in progress |
| V3 settlement / life | Environment implementer | Curated Mediterranean/coast models downloaded with provenance; full dressing follows first integrated checkpoint |
| V4 independent art/code / regression / CI | CI implementer and cross-reviewers | Existing Linux browser timeout investigated separately; full before/after, real clip and review required before handoff |

Before captures use isolated IndexedDB checkpoint fixtures then ordinary playable-game rendering; no user save is changed. Positions and camera orientation are reproducible via `node tools/capture-visual-baseline.mjs before URL`. These are game frames, not catalogue images. User's credential remains in the external ignored environment file; only local official-service tooling may use it, never Vite/client code or public logs.
