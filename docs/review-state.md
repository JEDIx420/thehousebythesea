# Independent review — state and persistence

Reviewer: controls agent (no implementation ownership of this batch). Date: 2026-11-27.
Reviewed baseline HEAD `fa4a43b427a6cb8fdc9ba29bc0782fd7e16b2dc3` plus the then-uncommitted implementation. Final integrated SHA must be rechecked before release.

Batch (four files): `src/state/game.ts`, `src/state/persistence.ts`, `src/state/game.test.ts`, `src/data/content.ts`.

| Check | Result | Evidence |
| --- | --- | --- |
| Parcel pays once, including after parsing/restoration | PASS | Executed domain regression |
| Parcel requires being ashore at Saltglass | PASS | Executed domain regression |
| Both fish prices, atomic sale, empty resell | PASS | Executed domain regression |
| Mira invitation, destination visit, return prerequisites; no coin exchange | PASS | Code and executed domain regression |
| Recovery retains earnings/job state | PASS | Executed domain regression |
| Schema v0 migration and v1 field round-trip | PASS | Executed snapshot tests |
| Negative/nonfinite currency, fractional inventory, malformed/unsupported snapshots rejected | PASS | Executed snapshot cases |
| Storage unavailable gives visible caller warning | PASS | Unit test and Chromium UI with indexedDB unavailable: title and Pause both warn, session starts normally |
| Existing unreadable/newer snapshot preserved through playing a fresh fallback session | PASS after fix | Chromium preserved schema99 object and corrupt string through Begin/Skip plus >5 seconds |
| Actual IndexedDB preservation and reload | PASS | Headless Chromium 159.0.8154.6; schema99 and corrupt strings survived reload/play |
| Full gameplay route and deployed Pages | NOT TESTED | Integration browser reviewer owns these checks |

Command: `npx vitest run src/state/game.test.ts`. Observed result: exit 0; 1 file, 21 tests passed (78 ms). This is Node/Vitest evidence, not a browser claim.

## S-01 — P1 — fallback session overwrites a protected save

Affected: `src/state/persistence.ts` loadGame/saveGame and caller boot/persist integration. Reproduction: put a schemaVersion 99 snapshot (or corrupt saved data) into the existing first-voyage IndexedDB slot; reload. loadGame returns null state plus a warning saying the existing save has been kept. Boot substitutes initialState. Begin or skip memory, or trigger any autosave; saveGame unconditionally writes into the same slot. Expected: existing unreadable/newer save remains intact unless the player explicitly elects to replace it. Actual: fallback-session autosave replaces it with fresh progress. Required fix: inhibit writes to a protected slot following failed read/validation, preserve the actionable warning, and add a regression proving the old value survives an attempted fallback-session save.

## S-01 correction and independent reproduction

Coordinator added `saveProtected` to bootstrap when load returns warning with no valid state; `persist()` returns before any write while protected. All current write entry points flow through persist. The title and session toast disclose the unsaved fallback session.

Independently executed Node scripts importing `chromium` from `@playwright/test`, launching headless Chromium with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`, at 1280 × 800. Actual WebGL game boot was awaited through its read-only diagnostics. On `http://localhost:5173/thehousebythesea/`, wrote `{schemaVersion:99,wallet:999,marker:'do-not-overwrite'}` into IndexedDB, reloaded, clicked Begin then Skip memory, waited 5.5 seconds, and read the slot back. It was byte-for-field unchanged. Repeated on `http://localhost:5174/thehousebythesea/` with corrupt raw string `{broken-save`; warning was visible and raw string survived the same play/reload flow. Both scripts exited successfully for these assertions. A fresh Chromium page with indexedDB unavailable also loaded, displayed the warning, allowed Begin/Skip, and retained the warning in Pause. These checks exercise actual IndexedDB and actual UI inputs; they do not set gameplay state through diagnostics.

Conclusion: **READY FOR CREATOR REVIEW for this state subsystem**, subject to final integrated-SHA recheck and the coordinator's complete gameplay/deployment review. S-01 closed after code and independent browser evidence. No other P0/P1 finding in this batch. Technical state readiness never authorises Stage 2; creator hands-on approval remains required.

## Reviewed file fingerprints

```text
1ca0b7eaadd75cdaccb48d37c02bdbd036341eca622d80e5320854b87bd44f42  src/state/game.ts
6154b4f89dc5a47745694697d3526f06dd5b5627211552e0cc954d6f19a6c0a0  src/state/persistence.ts
ea58922371f4ea2ede7f933db057bec6c718df57ded5cb304c190ce3783cbc27  src/state/game.test.ts
819fab1b115568f33690a82665ea2da600c9c8114a1b0466a9f49cfecf4c166a  src/data/content.ts
```

## Immutable commit confirmation

State-source fingerprints above match implementation commit **`f788256bebd0d958b96c5397fbe4922746855d31`**. Independent git diff across implementation inputs returned exit 0. The exact final production browser suite passed all four tests, including future-save preservation, full wallet/job/discovery/Mira/home/checkpoint refresh and menu recovery. Final tested bundle SHA-256: `3932b576a948e758e171b38a774da479290259e9e4d917897bba17b09cd9c210`.

Additional exact-final independent command: `node docs/evidence/review-state-browser.mjs` (preview 4173). **PASS, exit 0**, Chrome 158.0.8127.37 at 1280 × 800: title Credits/Escape; memory Escape with reload continuation; unsupported schema99 preserved; corrupt raw snapshot preserved; unavailable IndexedDB warns on title/Pause and still permits play. Zero page errors. Raw results: `docs/evidence/state-review-results.json`; log: `docs/evidence/independent-state-browser.log`.
