# Independent review batch — main, UI and audio

Reviewer: terrain implementer, **independent of the main/UI/audio implementation**. Scope is three files: `src/main.ts`, `src/ui/style.css`, `src/audio/ambience.ts`. The reviewer owns world code; this is not independent approval of the terrain work. Baseline commit `fa4a43b427a6cb8fdc9ba29bc0782fd7e16b2dc3`, reviewed integration working tree 2026-11-27; final committed SHA recheck remains coordinator responsibility.

Environment: installed Google Chrome 158.0.8127.37 via Playwright, macOS 26.5.2 Apple M4, 1365×900. Actual rendered WebGL2 page `http://localhost:5174/thehousebythesea/` with real keyboard and button input. Diagnostics read-only; no state teleporting.

| Check | Result | Evidence |
| --- | --- | --- |
| Title, begin, skipped prologue | PASS | Visible buttons and actual route into game |
| Startup credits, Escape to title | PASS after fix | Original finding reproduced: Escape removed title while unstarted. Fixed: Begin visible again |
| WebGL-unavailable startup | PASS after fix | Forced canvas WebGL contexts unavailable; visible “The harbour needs WebGL2” retry UI shown |
| Real walking | PASS | W moved player from z0 to z−4.64; render visible |
| Chart and journal keyboard entry/escape | PASS | M/J opened their expected visible headings; Esc closed |
| Pause and muted settings | PASS | Muted checkbox reflected saved logical setting `muted:true` |
| Credits asset sources and modifications | PASS | All five manifest records visible with source link, CC-BY-4.0 and change notice |
| Surf provenance and volume implementation | PASS static | Original generated WebAudio noise; gain set from saved setting |
| Surf sound quality and comfort | NOT TESTED | Headless playback not a listening test |
| Complete gameplay and reload | NOT TESTED in this batch | Separate end-to-end and state reviewers cover these |
| Live Pages | NOT TESTED | This batch used local development prefix |

Fixed findings: P0 render constructor failure previously bypassed error screen; P2 credits Escape could hide startup. Neither remains open in the tested tree. Nonblocking P3: modal focus is initially moved to a button but not trapped, so Tab can reach background HUD controls. Keyboard close/back works. UI remains readable at the tested laptop viewport; mobile not evaluated.

`docs/evidence/independent-harbour.png` is the rendered harbour after the separate pier z-fighting correction. Warm sample: 178 frames, p50 16.7ms, p95 16.8ms, 609 draw calls, 62,221 triangles; this short sample is not a broad performance guarantee. Own terrain implementation is **not independently approved by this report**.

Conclusion for this batch: **READY FOR CREATOR REVIEW**, subject to other subsystem reviews and final SHA checks. No Stage 2 authorization is implied.

## Follow-up one-file batch — fishing display

Reviewed `src/activities/fishing-view.ts` independently of implementation. PASS: root hidden on creation, active cast displays a three-point rod/line and offshore float, bite changes float motion, cancellation hides the display, dispose removes root from scene and disposes all four owned geometry/material resources. Actual Chrome module execution at the local nested project prefix returned linePoints=3, bobber position `[61,0.297,-6]` from pier `(55,1.68,0)`, bite Y=0.472, cancelled hidden=true, scene children after dispose=0, four disposal events. Domain catches remain owned by the reducer; this view does not award money or fish. No blocking findings. Full gameplay cast/catch route remains covered by the separate E2E reviewer.

## Final targeted main/UI recheck — Rowan aboard and keyboard focus

Independent actual Chrome check of the final display changes: PASS. Used D to turn and W to walk from x48 to x54.08, pressed E to board (boat mode at x62,z0), then W to sail to z−12.21. Rendered screenshots inspected: Rowan is visibly standing on the stern deck both tied alongside the pier and sailing, rather than disappearing. The avatar transform reads boat heading/position only; it does not mutate saved gameplay state, and walking animation is disabled aboard. Temporary screenshots retained by reviewer at `/tmp/final-rowan-aboard.png` and `/tmp/final-rowan-sailing.png` (not durable PR artifacts).

Modal focus trap PASS with real Tab input: Shift+Tab on first title button wrapped to Credits & provenance; Tab wrapped back to Begin your voyage. On pause, Shift+Tab on the first input wrapped to Return to the afternoon, and Tab returned to the mute input. The prior P3 focus escape finding is CLOSED. Audio subjective listening remains NOT TESTED. This recheck did not modify implementation files or rebuild the game while the final integration E2E run was active.

## Immutable implementation sign-off

Reviewed implementation commit **`f788256bebd0d958b96c5397fbe4922746855d31`**. `git diff f788256bebd0d958b96c5397fbe4922746855d31 -- src/main.ts src/ui/style.css src/audio/ambience.ts src/activities/fishing-view.ts` returned no differences: the committed four-file batch exactly matches the independent source/browser checks above. Commit contents inspected; no unreviewed implementation edits in this batch remain. Final result: **READY FOR CREATOR REVIEW**, subject to the complete integration route and other subsystem sign-offs. The historical modal-focus P3 is closed by the final browser recheck. Subjective audio listening and compatibility outside tested Chrome remain NOT TESTED. This sign-off does not review the author's own world implementation and does not authorize Stage 2.
