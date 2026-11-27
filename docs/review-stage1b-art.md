# V4 — integrated visual evidence cross-review

Implementation: **`5ecd019efb9a0e32915d71ddfa47918bccc463cd`**. Reviewed the final19:27 frozen-build gallery, matched checkpoint baseline images, lighting A/B and sampled frames from the actual recorded gameplay. This reviewer implemented the character/vessel presentation, so this is a cross-review of the integrated composition/camera/environment evidence, **not independent approval of their own model code or final creative approval**. Model code has a separate environment-owner review; app integration has a separate five-file review. Only the creator can approve the visual baseline.

## What the actual images show

| View | Observed change from baseline |
| --- | --- |
| Harbour arrival | Recognisable blue-door/limewashed buildings, rope-edged deck, bollards/lifebuoys, fish/net work clusters and shaped coastal water replace the large sign, basic houses and bare plank platform |
| Near characters | Readable adult-scale skinned people, closer camera and distinct clothes; creator-selected Family Traveller is present as Mira beside Rowan |
| Sailing | Real caique silhouette has curved stem, cabin, mast/boom/jib and a visible standing Rowan; distant Saltglass is a continuous destination, not a separate menu |
| Docking | Physical deck, mooring details, beach access and fishing hamlet remain legible from the walking camera; the recorded camera orbit also reveals the tied-up caique |
| Saltglass | Quieter timber/stone composition and rock arch differ from Havenport's café/shopfront; ground/tree/building shadows now render on this second island, closing the fixed-shadow-frustum issue |
| Home vista | Final image has a clear open beach-plot notice and shaded bench, without the earlier café-chair overlap at the player's checkpoint; sea remains the focal view |

The baseline and current captures use the same authored player checkpoints. Camera distance/pitch intentionally change as part of the remediation, so these are comparable gameplay positions rather than pixel-identical camera matrices.

`after-mira-front.png`, `after-mira-three-quarter.png`, and `after-mira-walking.png` were each inspected. The front/three-quarter images show the original auburn hair, adult face, freckles and green jacket palette with facial visibility; the walking image shows her real gait/limb pose on the harbour path. These are current controllable-game captures using the camera's actual orbit/scroll controls, not showroom or catalogue renders. The close-up captures also demonstrate that scroll zoom changes the rendered composition while the HUD and interactions remain live. The optional coastal-outfit restyling was not used to delay the creator's selected base.

Matched `after-harbour.png` / `lighting-reference-harbour.png` visibly separate the moderated lighting/fog from the paler reference. The selected pass retains darker blue doors, foliage and shadow contrast. The distant island stays recognisable. Water reaches the shore without the previously exposed straight sea-band gap. Repeated stone-paving pattern and the cypress partially overlapping the arch opening remain minor composition notes for creator feedback; they are not hidden as a claim of finished taste/polish.

## Recording and limits

`ffprobe -v error -show_entries format=duration -of csv=p=0 docs/evidence/visual-reset/sail-dock-walk-interact.webm` returned **31.920000seconds**. Frames sampled at2,8,26 and30seconds show the in-game sail/arrival, walking on the dock, tied-up caique, interaction prompt and delivery-result wallet145. The separate recording verification log confirms the actual input route completed the parcel from its isolated mid-voyage save fixture. This cross-review sampled rendered frames rather than claiming a full subjective audio/video watch. That clip is a short proof of sail→dock→walk→interact, not the full First Voyage narrative regression; the latter belongs to the functional browser suite.

Final gallery metrics are recorded by the capture tool in `after-metrics.log`. They are short warm-scene samples on the tested desktop, not proof of all-device performance. Audio listening, non-Chrome rendering and artistic pacing still require hands-on creator feedback.

**Conclusion: evidence is coherent and ready to present for creator visual/gameplay review.** No new blocking visual integration defect found in the inspected final frames. This does not approve the creator's art standard on their behalf, does not self-approve model/world code, does not claim CI results, and does not authorize Stage2.
