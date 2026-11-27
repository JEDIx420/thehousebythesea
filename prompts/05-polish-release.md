# Stage 5 prompt — release polish (LOCKED)

**Do not run unless the creator expressly authorises Stage 5 after approving Stage 4.**

## Outcome
Bring the single-player GitHub Pages game to reliable release quality without expanding its scope.

## Work plan
- Read outstanding P0–P3 findings and prior feedback. Prioritise reproducible gameplay defects, corrupted saves, collisions, inaccessible controls and poor performance over feature wishlists.
- Profile cold load, transfer size, busy-harbour frame time, water shader cost, transition spikes and island lazy-load memory. Add quality presets only if measurements justify them.
- Audit first-time user guidance, camera/control comfort, captions, contrast, audio volume, keyboard navigation, skip/retry and mobile behaviour if mobile support is separately approved.
- Exercise all twelve shore landings, paid job categories, relationship and home branches and several old save-schema versions.
- Audit all assets and third-party licences, ensure in-game credits and a legal audio library. Remove unused packages/source assets and avoid paid dependencies.
- Run a clean locked install, typecheck, unit tests, browser E2E and manual multi-browser session; check built GitHub Pages URL plus all static resources under project prefix. Capture actual evidence.
- Resolve blocking reviewer findings, prepare clear release notes and a small creator walkthrough, and seek final hands-on release approval.

## Exit
Verified static deployment, correct saves, clear credits, documented tests and remaining limitations, and explicit creator release sign-off.
