# Independent review — controls batch

Reviewer: state-system agent, with no implementation ownership of these controls. Date: 2026-11-27. Scope is four files: `src/player/avatar.ts`, `src/player/movement.ts`, `src/player/movement.test.ts`, `src/boat/boat.ts`. Baseline HEAD: `fa4a43b427a6cb8fdc9ba29bc0782fd7e16b2dc3`; implementation was an uncommitted working-tree addition at review time. This is a subsystem review, not Stage 1 sign-off.

## Evidence and checklist

- PASS: `npx vitest run src/player/movement.test.ts`, exit 0, four tests. These exercise forward walking, steering, water/cliff/structure rejection, world boundary, passenger-coordinate sync, and momentum stop.
- PASS: avatar and boat own explicit geometry/material disposal and remove their roots. Their original geometry and procedural animation do not introduce third-party asset licence requirements.
- PASS: movement operates on serialisable state and queries a supplied terrain/collision surface rather than treating scene objects as authoritative.
- ISSUE: hull collision uses a reflected footprint and shorter bow than the rendered geometry; see C-01.
- NOT TESTED: actual terrain-triangle alignment, browser walking/camera feel, boarding/disembark integration, slope/dock seams, long gameplay route, real runtime performance, asset loading and deployment. Production world was not available for this review. No independent browser or screenshot evidence is claimed.

## C-01 — P1: collision footprint differs from rendered boat

Affected: `src/player/movement.ts` footprint transformation in `clear()`, compared with `src/boat/boat.ts` hull and the integration's `root.rotation.y = -heading`.

Reproduction: run `npx vitest run --config docs/review-controls.vitest.config.ts`. The independent probe places the boat at `(0,0)`, heading `π/2`, and land at `x > 3`. The real rendered hull points east and extends beyond x=3, but one forward update advances boat.x from 0 to `0.04997437484868676` rather than refusing the move. Exit 1, one test failed. Geometry extent is computed from the actual Three.js boat scene graph.

Expected: shoreline contact is rejected consistently for every heading, using at least the rendered hull envelope. Actual: collision local-to-world rotation has the opposite sign to render rotation, and bow sampling reaches only 2.4 m while hull geometry reaches 3.7 m plus bevel. The main diagonal bow/stern corners are unsampled as well.

Required fix: use the same local-to-world transform as rendering (`x += ox*cos(h)-oz*sin(h)`, `z += ox*sin(h)+oz*cos(h)`), expand/sample the actual hull envelope, and add regression cases at north/east/south/west headings. Re-review the updated files and probe before closing the finding. Browser shoreline validation remains required after that.

## Reviewed file fingerprints

```text
6ba7ba8d479bc78d789126fdbb257a297b3f417415db1e5c9eea45ecbfb9e68c  src/player/avatar.ts
0262a08c6f13994e00d8bb5199e97e46857321d5aabab7d5d0269f312eb93b44  src/player/movement.ts
634841cce57a25772adbd9e9dfec791e7a8eff357095de3ae03ab7b4549a10b2  src/player/movement.test.ts
55437b56650b2dfcab3a37675e9077c0c8b8fa225610109cb531d55babc0824a  src/boat/boat.ts
```

Conclusion: **NOT READY** while C-01 remains open. Other First Voyage systems and live Pages are outside this batch. Passing a later technical review cannot authorise Stage 2; the creator must play and explicitly approve Stage 1.

## Corrective review round

The controls implementer corrected C-01 in the working tree. Independent rerun: `npx vitest run src/player/movement.test.ts` exits 0 (5 tests); `npx vitest run --config docs/review-controls.vitest.config.ts` exits 0 (1 independent rendered-geometry probe). The local-to-world transform now matches rendering, and thirteen footprint samples include a 4 m bow, 3.1 m stern and 1.6 m sides. **C-01 is CLOSED** based on code inspection and reproduced tests.

Corrected fingerprints:

```text
66d6326939e77150c30ec590701e5d7d91fe8d0f7519720bdbd9806f3e85069c  src/player/movement.ts
1c0995978c317d1814edfc5ec5d2a15ea7ed90d4026aac309d7464f5fb2efbd7  src/player/movement.test.ts
```

**C-02 — P2, open:** heading commits before collision validation, so turning in place can rotate the hull into shore while translation remains blocked. Reproduction: centre `(0,0)`, heading 0, ground where `x>2`, then 80 updates of `{forward:0,turn:1}`, dt `.05`. Heading reaches about 1.6 radians; the bow faces east into the shore. Expected: candidate rotation should respect hull clearance. Requested candidate-heading validation and a regression test; browser shoreline testing will assess player-facing impact.

Updated conclusion: this four-file controls batch has no open demonstrated P0/P1 findings; **C-02 and browser/world integration remain pending**, so it does not independently establish whole-stage readiness.

## C-02 corrective verification

Independently inspected candidate-heading collision validation and reran `npx vitest run src/player/movement.test.ts`: exit 0, **6 tests passed**, including stationary turn beside the east shoreline. Separate `npx vitest run --config docs/review-controls.vitest.config.ts`: exit 0, one real-geometry probe passed. **C-02 CLOSED.** No open defects remain in this controls-only review; world integration and complete gameplay remain separate review responsibilities.

Latest reviewed controls SHA-256 after formatting: movement `3532f6f87b8c455ad25768777d002f6e00c1048bd2877503018ebfa645ae7992`; movement tests `494948949acb87d8f95984051fc31f4fc16f6d9c080eeb4134650a87a480cf2c`. Baseline HEAD remains as above; final integration commit must be attached by coordinator.

## Immutable implementation sign-off

**Reviewed commit: `f788256bebd0d958b96c5397fbe4922746855d31`. Controls batch PASS.** Verified all four scoped files are present in that commit and working-tree diff against it is empty. Movement and test hashes match the corrected independent review. Avatar and boat were reformatted; re-read confirms unchanged geometry, animation and disposal behavior. Final avatar SHA-256 `d73510fd4f3f9f1e126f2db33a7b804e9202d00bbc49d0637e52ada00e124c27`; boat `5e580d1166e30ca9465560f7228c1545f2eb580cd25f6ef56ec41b7acf2b7c62`. No source changed during sign-off and no unnecessary test rerun was performed. C-01 and C-02 remain closed. Full-game readiness is established by separate integration review, and Stage 2 still requires explicit creator approval.
