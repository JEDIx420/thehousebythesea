# Stage 1B — independent model and vessel code review

**Current conclusion: PASS for implementation `5ecd019efb9a0e32915d71ddfa47918bccc463cd`.** Mira is the creator-selected Polyfork Family Traveller:8skins,31bones per skin,3real Idle/Walk/Run clips plus the documented named-bone greeting. Quaternius female is Nessa only. Final boat offset is−0.36Z and occupant seatZ2.272. Earlier candidate/boat measurements below are historical and explicitly superseded by the final creator-selection and immutable sign-off sections. Full gameplay and creator visual approval remain separate.

Scope: `src/player/avatar.ts`, `src/boat/boat.ts`, `src/assets/models.ts` (three-file coherent V1 batch). Reviewer: environment implementer, who did not implement these files. This review does not approve the reviewer's own environment work or the creator's visual gate.

## Initial candidate asset checks — historical, before creator Mira selection

Parsed the then-selected candidate GLBs independently with Three.js GLTFLoader in Node. The initial Quaternius Rowan/female pair each contain one glTF skin, with multiple skinned mesh parts, and 24 actual embedded clips. Required Idle, Walk and Interact clips exist with nonzero durations. A separate SkeletonUtils clone probe confirms each clone has distinct bone objects; playing Walk and advancing0.37seconds changes the LowerLegL quaternion in both models. These are real skeletal animations, not procedural box limbs or invented clip names. Source primary pages explicitly identify these packs as CC0: [men](https://quaternius.com/packs/ultimatemodularcharacters.html), [women](https://quaternius.com/packs/ultimatemodularwomen.html). Pinned converted GLB URLs and original authorship are preserved in the manifest.

Caique is a real Polyfork GLB, not the old procedural toy boat. Independently applied the implementation's0.94scale, π facing correction and−0.34Zoffset to actual geometry. Bounding envelope is X±1.263384m, Z−3.780159..+3.100159m, fitting the existing conservative controller footprint to0.2mm at stern and comfortably within the broader sampled hull sides/bow. Actual downward deck rays at the two configured standing positions hit Y0.7519985m; configured feet Y0.762m leave approximately1cm intentional clearance. This is a measured deck alignment, not an assumed model origin.

## Initial candidate code review — historical

- PASS: avatar independently clones skeletons, retints owned cloned materials by role, normalises height/facing, crossfades actual Idle/Walk/Interact actions, and owns mixer/material disposal. Source geometry is shared through the cache and not disposed by individual avatars.
- PASS: no unsupported seated clip is claimed. Both people stand on measured deck positions. Horizontal tracks matching root/hips/armature are flattened in cloned clips; actual selected Walk has only ~4.4cm lateral Body sway and effectively zero forward Body translation, so it does not propel the gameplay controller.
- PASS: vessel has actual local GLB geometry and a soft circular instanced foam shader, replacing the rectangular wake cards. Gameplay hull remains independent of the scene graph.
- PASS: loader uses local repository-base URLs, caches completed/pending loads, checks HTTP errors, uses AbortController20second network/body deadline, clears failed pending promises and exposes honest retry errors. No credential or remote runtime URL enters these files. Actual shipped GLBs contain no external-image dependency; no claim is made that a generic arbitrary GLB's asynchronous external decoder is covered by the fetch abort.
- PASS: model cache has central geometry/material cleanup, while instances clean up their owned animation/material state.
- NOT TESTED in this batch: complete in-browser visual/sail/dock/animation composition, final viewport performance, CI, or creator aesthetic approval. Coordinator's V0 checkpoint and subsequent independent art review must cover those, followed by full gameplay regression.

Result: **V1 code/actual-asset batch PASS; no demonstrated P0/P1 findings.** Final immutable source SHA and fingerprints are to be attached after integration. No Stage2 authorisation is implied.

## Final five-file V1 batch and small boat adjustment

Expanded this coherent review to include `docs/asset-audition.md` and `tools/model-showroom-verify.mjs` (five files total). The audit honestly distinguishes rejected Polyfork candidates, actual CC0 selection, implementer self-test and outstanding creator approval. The browser probe uses the real preload/create modules, checks independent skeletons/poses, real action changes, deck ray hits and scene disposal; it does not mutate game state or fake a rig. No credentials or paid operations are present in that probe. Its successful browser execution remains implementer evidence; this reviewer independently ran the CPU GLB/skeleton/deck checks described above.

After review, the boat visual Z offset and both seat Z coordinates moved back together by0.02m: visual−0.36, seats2.272. This is a targeted conservative stern-envelope correction, with unchanged relative foot/deck position. Static final geometry envelope is Z−3.800159..+3.080159m; the implementer's actual bobbing probe includes the small visual pitch and reports stern below+3.1m. No gameplay controller or reward behavior was changed by this adjustment. **Targeted source re-review PASS.**

Reviewed working-tree fingerprints (baseline HEAD32e1e1eb0befaea8fb649a93a924bedb9aaef507):

```text
46c59a66a734e7db7779ddfa2e4cd594e5d0a4b1ea0ae18f44a58879ccf7a2ad src/player/avatar.ts
3995f1bb838b524a07390ab486ff8bf8b8961bb0fb8971747b71401558848b8a src/boat/boat.ts
365b9e3071730176ab3a142fea1be7b1a1419ea10673bae31ee2139ded0afe20 src/assets/models.ts
426cc1843de4634330f5ef9a1af5ea2e05c6638d6c98cb4aa6073bfc1b680e3f docs/asset-audition.md
5a48f0237fb641f7175af6d8671a3a3b7e199bfed33ec40c91f9f42ea13c2fb7 tools/model-showroom-verify.mjs
```

## Creator-selected Mira supersedes the earlier candidate

Issue#4 was updated during implementation: the creator explicitly chose [Family Traveller by Polyfork](https://polyfork.dev/asset/family-traveller-9af47e) as Mira. The earlier Quaternius female assessment remains historical candidate evidence; it is now used for Nessa only. New targeted three-file review covers `src/assets/models.ts`, `src/player/avatar.ts` and the manifest integration. The reviewer wrote the factual manifest entry from independently parsed GLB metadata, so does not claim an independent review of their own manifest text; actual-file consistency is verified separately below.

Independently parsed actual `mira-family-traveller.glb`:892,448bytes,4,137triangles,8skins with31joints each, and exactly3embedded clips:Idle2.5s,Walk1.3333s,Run0.9333s. Raw height1.74683m. Primary source page identifies the free GLB and CC BY4.0 credit. Source face, hair, clothing colours and mesh proportions are preserved: the Mira material branch clones materials but performs no palette retint, scale remains1, and runtime only grounds/turns the visual to the controller convention. This respects the creator's selected base rather than substituting the earlier female model.

The asset has no Interact/Wave clip, and code honestly selects Idle during dialogue plus a small authored layer on the real RightArm, RightForeArm and Head bones. Those named nodes exist. Every embedded clip has quaternion tracks for all three, so mixer update resets the base pose before additive local gesture each frame. An independent600frame CPU probe using actual Idle and the implemented layer measured a maximum arm deviation0.1600001rad, with no cumulative spin. No fake interaction animation is claimed. Other Quaternius roles now use their genuine Wave clip rather than the old pickup/crouch Interact pose, a suitable dialogue change.

Loader adds a mandatory local Mira cache key and includes it in character preload; the heroine cannot silently fall back to another model. Existing independent skeleton cloning/material ownership and error behavior remain. `npm run typecheck`:PASS after integration. A manifest/file audit found exactly35records and35public GLBs, every path present and no unlisted GLB; Quaternius female credit explicitly saysNessa and discloses its retained legacyfilename. Runtime credits therefore include the actual selected heroine and all shipped files.

**Targeted new-Mira code/actual-asset review PASS, no demonstrated P0/P1 finding.** Final front/three-quarter/walk visual frames, actual game animation and creator visual approval remain separate; this CPU/source review does not approve appearance or authorise Stage2.

## Immutable Stage1B implementation sign-off

**Reviewed implementation SHA: `5ecd019efb9a0e32915d71ddfa47918bccc463cd`. V1 code/actual-asset review PASS.** Verified scoped avatar, boat, loader, audition document and verification script are all present in that commit and working-tree diffs against it are empty. Formatting was re-read without finding behavioral changes to the reviewed skeleton/material/animation/boat contracts. Confirmed the live Issue#4 creator-decision section explicitly requires `family-traveller-9af47e` as Mira, matching the committed cache key, mandatory preload, runtime visual name and35-entry manifest. Earlier female-candidate review is superseded as documented, not a licence or creative approval for a different heroine.

Final reviewed SHA-256:

```text
acdb9eb809f65f41ac58f00f4cadd2a084e0c34dbae78a97a4caca03ce9204dd src/player/avatar.ts
9fe462d6ae8b5b01c2041b939b37b9bf87790ed42467ae714f49dcd85759b5a7 src/boat/boat.ts
f0b5d067ef0477c55e0f9dc20e8fbd33353466bd720a1456cb988477aed6c426 src/assets/models.ts
0a9a2836600bcc139d0b19322c8d592d7b4104566ecc4bfadf3c5c62ce1bbb8d docs/asset-audition.md
36cc44afdb0d088d58954ebe56c9a764fde3cc5e234da98ad256d1e992f9efbb tools/model-showroom-verify.mjs
```

No source was changed during sign-off, and no duplicate functional/GPU run was launched. Complete gameplay execution, final independent art evidence and creator visual/gameplay approval remain separate gates. Stage2 is not authorised.
