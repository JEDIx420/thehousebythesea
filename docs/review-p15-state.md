# P1.5 — independent baseline contract review

Baseline: `90693e37ce009c5f44b19ac683c0c017aef0843c`. Read active AGENTS, polish plan and kickoff. Root remains sole implementer; this is planning/source audit, not completed implementation approval. No build, tests or GPU run performed. Stage 2 remains locked; final status must be WAITING FOR CREATOR PLAYTEST.

## Five contract systems

1. **Persisted domain:** schema 2 + `pixel-first-voyage-v1`, stable fish/job/story/island IDs, wallet25, parcel120, fish18/32, home500. Player mode/island and boat dock relationship must survive; transient velocity, locomotion phase, dialogue reveal position and audio nodes are not durable progress.
2. **Persistence/session:** strict scalar/enum validation precedes cloning, original schema0/1 COPY import remains readonly, open/read/write have separate five-second deadlines. Session protects unsupported/corrupt snapshots, serializes/coalesces writes and reports failed imports as temporary. Preserve these contracts; migration must not convert invalid/future data into a fresh writable save.
3. **Settings/audio:** existing `{muted, volume, reducedMotion}` requires explicit transformation. Interpret old volume as master, preserve mute and reduced motion exactly; add independent music/ambience/SFX defaults and instant-text preference. Recommended conservative defaults: master=.35 for a fresh game, music=.55, ambience=.35, sfx=.6, instantText=false. Old volume=0 must remain silent. Reduced motion should make text reveal immediate even if saved instantText=false; do not silently change that saved preference. Final levels require listening, not these suggested numbers alone.
4. **Dialogue/UI:** current paragraphs plus final choices dispatch stable actions. Convert to typed speaker/expression beats without changing choice effects; actions occur on explicit final choice only, never on text advance/skip/Escape. Keep keyboard/focus/inert/modal save-warning behavior. One physical key press cannot finish text, advance a beat and choose/reopen/board/fish together. Full-beat accessibility announcement should be separate from per-character reveal. Missing portrait/expression must fail asset validation or use a deliberately authored narrator layout, not silently show an unrelated face.
5. **Regression/evidence:** retain all eight baseline browser scenarios and add new migration/portrait/audio checks. Selector/coordinate updates may reflect the new world/UI but must preserve observable gameplay and protection assertions; snapshot fixtures must identify the historical world rather than derive all fields from current initialState.

## Migration recommendation — schema2/v1 → world v2

Use an explicit version-pair dispatcher: validate historical schema2/v1 with its own frozen shape, then migrate to the current shape/world. Do not merely relax the current validator to accept old missing settings. A structural settings change can use schema3/world-v2, or documented schema2/world-v2 if the pair is the actual format discriminator; reject every unknown pair either way. Current-state validation remains strict. Expose migration/relocation notices to the session.

Keep a literal immutable v1 map/checkpoint fixture and new-world surface/dock contract. Preserve economy, inventory, delivery, discoveries and every story flag bit-for-bit; migration must not dispatch visit/delivery/outing-completion rewards. First map coordinates into each island's new local/world frame if its centre moved. Preserve a walking checkpoint only if the new authoritative surface is walkable at the required elevation/layer, outside solids, and its companion boat is coherent and hull-clear. Derive elevation from the authoritative surface; persist a stable layer/zone identifier only if overlapping walkable layers make x/z ambiguous.

For a boat-mode save, preserve a valid sea checkpoint with hull clearance, bounds and player/boat position/heading consistency; retain boat mode, null dock and passenger story. Do not use the player's last-island label to teleport a valid midsea boat. Relocate only invalid relationships/positions to that island's centralized safe player/boat dock pair, with documented reason; do not preserve one invalid half or put an ashore player in water. Old docked boats must remap to the corresponding new canonical berth if the pier moved. An unchanged valid ashore player need not reset solely because the berth moved. Prefer validating each component then repairing only the necessary component while enforcing final pair consistency.

Parsing/loading should produce an in-memory migrated copy and keep the original raw bytes until a successful explicit/normal save transaction. Recommended safeguard: atomically retain the first pre-migration snapshot in a versioned backup slot when committing the new current slot; failure must leave the original current slot intact. Do not repeatedly replace that backup. Protected corrupt/future saves must never enter this writable migration path. Original 3D COPY import routes directly through documented current safe docks/settings defaults, with its source DB untouched.

Required fixtures: both islands walking, old docked boat, valid midsea boat, invalid land/solid/cliff point, invalid hull/dock relation, active and complete delivery, invited/mid-crossing/returned/completed Mira outing, zero/partial/full volume+mute+reducedMotion, malformed/future/wrong-world snapshots. Assert no mutation of input, repeat migration idempotence, no reward duplication, no unrelated checkpoint reset, and reload after committed migration.

## Existing eight cases → additions

| Baseline case | Preserve | Add P1.5 coverage |
|---|---|---|
| Full voyage | Real walking/sailing/docking, parcel once, cancel+two fish, sale195, Mira return, home, exact save/reload | Portrait beat/choice replay idempotence; expanded elevated routes; migrated outing restoration; real soundtrack town→sea→arrival→dialogue |
| Native menus/settings/layout | Title credits return, keyboard activation/range input, picking, laptop bounds | All four mixer gains+mute and instant text persist; 1440/1280/narrow portraits/choices; focus/held-key clearing; HUD coverage |
| Future snapshot protection | Exact raw bytes survive temporary play/recovery/autosave, Save disabled | Unknown schema/world pair and unknown settings format remain protected |
| Corrupt snapshot protection | Exact raw bytes unchanged | Invalid new gain/text scalar and migration failure preserve raw source |
| Missing/stalled art | Bounded error, input lock, retry | Required portrait atlas failure; separately optional music failure keeps game usable with status |
| Malformed/missing frame | Honest error, no uncaught error | Each required speaker/expression/blink ID; distinct authored frames and correct identity |
| Explicit legacy COPY | Economy/items, safe pair, schema/world, original raw unchanged | Old settings→new gains/defaults; schema2/v1 migration via normal load, valid sea/walk retention and invalid-only repair |
| Failed import write | Temporary wording, no durable success, source intact | Failed migration commit/backup atomicity and retry/reload; no duplicate loops after retry |

Music additionally needs autoplay-gesture gating, independent gain isolation, mute/master zero, continued ducked dialogue music, crossfade without duplicate loops, visibility/resume/disposal and missing/decode-failed track recovery. Node/gain assertions alone cannot prove a pleasing arrangement or seamless loop; require listening and an audible real browser recording. Dialogue additionally needs first-confirm reveal/next-confirm advance/final choices, Escape/revisit, instant/reduced-motion modes and duplicate-confirm protection. These are new checks, not reasons to remove the original eight.


## Implementation batch 1 — migration/domain/navigation (five files)

Reviewed `src/data/navigation.ts`, `src/state/game.ts`, `src/state/persistence.ts`, `src/state/migrate-world.ts`, `src/state/migrate-world.test.ts` before geography changes. Supporting world JSON and prior tests read for context. Independently reproduced **45 unit tests PASS**; used Vite SSR for a read-only malformed-version probe, no app edits/build/GPU. **NOT APPROVED pending findings below.**

- **P1 OPEN — coerced world version bypasses corruption protection.** `parseSave` uses `includes(String(v.worldVersion))`. Input `worldVersion: ["pixel-first-voyage-v2"]` passes and returns a rewritten valid v2 snapshot, independently reproduced. Require exact string equality for both permitted version IDs and regress arrays/objects/null. This parser is also used by the cross-tab pre-write guard, so a malformed stored version can be treated as writable.
- **P2 OPEN — backup is not first-only.** The save transaction unconditionally puts each observed v1 source into `before-world-v2`. If an old tab later restores v1, the preserved first migration source is replaced. Check backup absence within the same transaction; preserve its exact raw form. Atomic ordering/abort behavior needs actual IndexedDB regression coverage, not only pure migration assertions.
- **P2 OPEN — dock tag does not establish a usable berth.** A hull-clear boat at `(95,-110)` tagged docked Havenport remains there when the player is valid ashore Havenport. Boarding requires the canonical berth, so this invalid relationship is not repaired. Canonicalize a docked-tagged boat to that dock, or require a matching berth before preservation; preserve actual midsea states with null dock. Regress both island berths and walk/boat relationships.
- **Test gap OPEN — historical fixture is not frozen.** `old()` starts from current `initialState`, changes version and removes settings. Once geography changes, this silently becomes a new-world position labelled historical. Replace/add literal baseline v1 coordinates/settings/story fixtures for both islands, docked/midsea and active/complete outing/job states. Test expected coordinate remapping explicitly if island offsets change; current migration has no general old-local→new-offset translation yet.

Positive source observations: navigation centralizes safe points/docks/routes; mixer/text defaults preserve old volume including zero; historical optional new settings are range/type checked; current new fields are required; migration clones input and avoids gameplay reward dispatch. Pre-write validation occurs inside the same readwrite transaction as the put, protecting an unsupported snapshot written since session load. Open/read/write timeout and settled guards remain present. No browser storage/concurrency/backup/migration success claim made by this batch. New geography/elevation must still prove valid-point preservation, raised-surface correspondence and no unsafe paired checkpoint.


### Batch 1 corrective follow-up — GO to geography authoring

Independently reread exact scalar version validation, conditional backup lookup/put in the same readwrite transaction, unconditional canonicalization of dock-tagged boats, and literal historical JSON fixture imports/new regressions. **P1 version coercion CLOSED; P2 first-backup overwrite CLOSED on source review; P2 dock/berth relationship CLOSED for the reviewed v1 migration.** Independently reran **51 unit tests PASS**. No app edits/build/GPU.

The fixture dependence on current initialState is removed: four fixed v1 JSON snapshots now preserve a historical coordinate/settings shape. Walk/Saltglass fixtures exactly match corresponding committed gameplay-metrics state; midsea/complete differ slightly in coordinates from that specific metrics file, so the implementation owner should identify their exact capture source/run rather than imply all came from that file. This provenance detail does not block geography work.

**GO for geography authoring**, not final migration/browser approval. Atomic backup and cross-tab failure behavior remain source-reviewed only, pending real IndexedDB tests. Once geography changes, verify old-offset→new-offset preservation, actual new walk/elevation/hull validity, both island routes and current v2 reload; unchanged-geography test success cannot establish these future results.


## Audio/recording batch — source and CPU review

Reviewed `src/audio/ambience.ts`, `tools/generate-music.mjs`, `assets/source/music-score.json`, `tools/record-browser.mjs`, plus the cohesive View settings/scene audio integration. No GPU/build/app edits or perceptual listening; **NOT APPROVED pending failure/lifecycle corrections**.

- **P1 OPEN — failed-track request storm.** Failed fetch/decode clears `loading`, while per-frame scene update keeps requesting the different target. Independently transpiled the module into a CPU mock and observed **10 failed fetches for 10 update calls**. Add bounded fetch/decode handling, cooldown/explicit retry, preserve working music/surf and avoid per-frame retry. A stalled fetch currently has no deadline and prevents same-track retry indefinitely.
- **P2 OPEN — fading voice accounting/cleanup.** Switching replaces `voices` with only the newest source, dropping previously fading sources until their scheduled stop. Rapid transitions accumulate overlapping fades, `voices` metrics undercount, and ended gain/source connections are not explicitly disconnected. Track current/fading voices until onended, disconnect them, and enforce a documented bound under rapid switching/dispose.
- **P2 OPEN — fallback is invisible to players.** Async load/decode failure appears only in metrics/status; scene handles synchronous construction failure but never presents async music failure. Surface a throttled readable notice while exploration/ambience continue.
- **P2 recording robustness:** recorder setup can spawn ffmpeg/start a timer before MediaRecorder setup rejects; no failure cleanup or ffmpeg spawn-error handler, and unbounded writes ignore encoder backpressure. Ensure setup/stop failure releases timer/CDP/encoder, handles spawn errors and bounds queued frames. Avoid claiming the helper is robust outside the observed successful capture.

Source positives: one master with independent music/ambient/effects gains, gesture-started context resume, muted/hidden master attenuation, continued ducked music in dialogue, generation/target checks before switching, pending decode sharing/cache, and scene disposal are present. Exact settings values flow from DOM controls to state/director. Browser lifecycle/gain/crossfade tests remain pending. Caught stale-load errors should not overwrite the status for a newer successful target; only report errors for the current generation/target.

Offline score is explicit seeded original melody/harmony/instrument synthesis, no samples/API, 32 bars at80BPM =96seconds, circular tails and3ms edge fade. CPU `ffprobe` independently confirms prototype MP3 **96.0s /768670bytes**. Three similarly sized tracks plausibly fit3MB, but only Havenport is shipped now; no full soundtrack/transition approval yet. Generation requires ffmpeg/libmp3lame; record encoder version for reproducibility and ensure --all artifact manifest contains every shipped track. Edge de-click/circular echo math alone cannot prove a seamless MP3 decoded loop or pleasant arrangement; those require listening to actual decode/playback and the audible recording.

Recorder captures actual composited browser frames and a parallel live WebAudio destination, not invented replacement audio. Its20FPS repeated-latest-frame cadence is a capture representation, not a source-render FPS measurement; disclose frame duplication and potential AV start offset. No visual/audio quality conclusion made from source or ffprobe.


### Audio corrective follow-up

Read revised director, recording helper and visible status call sites. Independently repeated the CPU404 probe: **10updates →1fetch**, with a30-second retry timestamp and readable failure status. **Retry-storm P1 CLOSED.** Load timeout now races fetch/decode after10seconds and aborts fetch; stale-generation errors are suppressed. **Async user-notice P2 CLOSED on source review**: once-per-error nonmodal toast plus settings status preserve playable ambience fallback. Fading sources are now retained/removed/disconnected onended and disposal owns them.

Two P2 details remain: every rapid switch reissues old-source stop(now+35ms), which can move an existing earlier stop into the future repeatedly. Record an immutable/shorten-only stop deadline so already-fading voices cannot be kept alive by later switches. Recorder still lacks setup-failure try/finally around screencast/MediaRecorder initialization; page-close cleanup does not immediately release timer/CDP/encoder when record() itself rejects. Add direct setup rejection cleanup. Recorder spawn errors and8MB backlog rejection handling are improved; no failed-recording execution or GPU test performed here.

Full audio lifecycle approval remains pending these details and browser/listening evidence. Source composition/variant generation can proceed as offline authoring; no claim that music arrangement, decoded loop seam, transitions or audible capture quality passed perceptual review.


### Final audio source/CPU correction — PASS

The remaining fade/recorder P2s are CLOSED. Stop deadlines now use `min(previous, desired)` and cannot be postponed. Independently executed30rapid mocked track transitions: every reissued stop time was nonincreasing. Source keeps fading voices owned until onended/disconnect. Recorder setup is now wrapped in rejection cleanup (interval clear, screencast stop, CDP detach, stdin destroy and encoder kill). Independently injected a CPU-only MediaRecorder setup failure: original error propagated and stop/detach were observed. No GPU, audio playback or perceptual quality claim.

**GO for continued offline soundtrack authoring/source integration**, with actual crossfade, mute/lifecycle, decoded loop seam and listening approval still required at the browser checkpoint. Historical fixture provenance README now identifies `docs/evidence/pixel/live/gameplay-metrics.json`; independently confirmed all four fixture states exactly match that recorded public-run source. Provenance detail CLOSED.


## C migration/integration follow-up — five systems

Reviewed current `persistence.ts`, `migrate-world.ts`, `navigation.ts`, `tests/browser/polish.spec.ts`, fixture provenance README. Root browser suite is running; reviewer launched no browser/build. **DB upgrade/protection source strategy PASS; migration signoff pending P2 below.** Pixel DB now opens version2, retains snapshots store when present, and legacy original DB remains explicit version1 readonly. Prior clients explicitly opening version1 cannot reopen upgraded DB2; versionchange handlers close existing connections, with honest blocked/error fallback. Same-transaction prior-slot validation and first-only raw backup remain intact. Future DB versions fail safely rather than downgrading.

**P2 OPEN: Saltglass offset preservation.** Navigation now uses offset−340, but historical walking migration tests only old absolute coordinates before resetting to safe. Independently CPU-probed the literal Saltglass fixture: old `(55,-220)`, translated `(55,-340)` is walkable, yet migration returns safe `(48,-340)`. Try historical island-local→current-offset placement (including surface/island/solid checks) before safe fallback. Preserve valid midsea absolute positions; do not translate the sea merely by last-island label. Test expected retained relative position and heading, not only unchanged money/story.

Browser tests are meaningful additions: historical progress preservation, save/reload equality, exact raw first backup, old-writer VersionError, missing-music request bound + movement, real audio analyser/clock/loop and actual portrait/raised walking. No reward/state mutation is used to satisfy the gameplay route; seeding historical fixtures/faults is appropriate. However current migration cases seed only after `ready()` creates DB2, so **existing DB1→DB2 store preservation is not exercised**. Seed a real version1 database before first app load. “First-only backup” currently asserts initial creation only; deliberately seed a different validv1 after the first backup, save and verify first bytes unchanged. Atomic failed commit also needs a dedicated browser test when claiming verified backup safety. Audio test title mentions ducking without a ducked-vs-unducked gain assertion; limit the claim or add the assertion. Responsive portrait assertion checks horizontal1280 bounds only, not all requested viewport/vertical/choice constraints.

These are source/test-scope findings, not claims of failures in the owner's running browser suite. Current v2 coordinate parser does not remigrate, so final new-world reload/validation and movement boundary checks remain separate gates. Stage2 remains locked.


### C migration corrective review — source/test design PASS

Reviewed five coherent changes: historical Saltglass local-coordinate translation, migration regression, persistence callback-abort handling, browser storage/backup scenarios, and dialogue ducking assertion. **P2 Saltglass coordinate preservation CLOSED**: v1 walking coordinates try current offset minus historical−220 before safe fallback; literal55,−220 now retains55,−340. Boat-mode absolute sea coordinates are not translated. Independently reran **60unit tests PASS across8files**; no GPU/browser launch.

Browser coverage design gaps CLOSED on source: migration cases deliberately reseed a second differing v1 snapshot and verify the original backup bytes remain; a separate blank same-origin fixture page creates a real DBversion1/store/raw snapshot before first app navigation, then validates retained translated progress through the actual DB2 upgrade. Injected current-slot put denial asserts unchanged original raw current slot, no partial backup, visible unsaved status and no pageerror. Persistence request callbacks now catch synchronous put/backup failures and abort the transaction instead of leaking exceptions; existing completion/error/abort handling preserves failure reporting. Dialogue audio test compares settled music gain before/after opening Ellis and asserts reduced gain while music RMS stays nonzero, making ducking a real assertion rather than title-only claim.

These are independently reviewed source/regression designs, **not reviewer-executed browser PASS claims**. Root's active full browser suite must supply actual results. Responsive portrait vertical/choice bounds and final audio listening/perceptual loop quality remain separate verification requirements; they are not established by these migration corrections. No new blocker found in this narrow batch.


## Final source integration batch — five coherent systems

Reviewed: music integrity tool/package/workflow gate; district/material/catch audio integration; gangway locking/recovery and migration browser cases; architecture/decisionD012; original score/licence provenance. No GPU/browser/build while root's suite runs. **No P0/P1 found. One narrow evidence-label refinement remains.**

Independently `npm run music:check` PASS: three expected tracks, committed SHA256/bytes, metadata96s and aggregate2306010bytes. CPU ffprobe separately confirms **all three MP3s96.000s /768670bytes each**. Source/author/licence manifest and original offline score are present; no APIs/samples/runtime services. Package and CI invoke the check. However the tool's “provenance/gapless headers” result overstates its assertions: it checks MIT and ASCII Xing/Info presence, not author/title/source equality or actual gapless decoded seams. Assert score provenance fields and call this header-presence validation, or narrow the claim. Browser real96s-clock/music-RMS checks and listening remain separate evidence.

District filters and bird intervals are driven by actual district/track, material steps by traveled-footstep events, and catch SFX by the real caught-state/reward branch. No economy values changed by these hooks. Auditory pleasantness/material recognisability/loop seam are not proven by source.

Gangway actions now refuse interaction/fishing/reel while the transient validated pier step is active; recovery clears it, update suppresses locomotion during it and completion clears input/velocity. Added browser assertions exercise repeated E/F rejection, recovery without delayed post-recovery drift, boarding then landing completion. Current storage/migration assertions retain real historical fixtures, first-only backup, genuine pre-app DB1 upgrade, rollback and old-writer rejection. Test source retains real input/reward/state checks; no weakening or new debug reward/teleport writes observed in the reviewed additions. Actual final17-case execution belongs to the owner's running evidence, not this source review.

Architecture/D012 distinguish source descriptions from hosted/perceptual results and keep Stage2 locked. Migration/volume defaults, indexedDB2, paired checkpoints, one-time atomic backup and motif/payload descriptions match source. Final creator judgement, audible capture quality and deployed newest-bundle smoke remain required. Historical review findings stay recorded with explicit closures rather than erased.


### Music checker claim follow-up — CLOSED

Independently reread and reran `music:check`: PASS2306010bytes. Tool now compares title/author/licence/BPM/bars against committed score and exact source identifier; output correctly limits the MP3 marker check to seek-header presence and explicitly separates decoded-loop verification. The evidence-label/provenance refinement is **CLOSED**. This is source/CPU closure only, not subjective seam/listening approval; no GPU/build/app edits.


## Final documentation / evidence-tool audit — five coherent items

Reviewed P1.5 evidence index against recorded logs; measurement script methodology; README commands/counts/live status; original music notices/score licence; architecture/D012 save/audio descriptions. No GPU, app changes or generation/build. **No new implementation blocker; final evidence publication still pending material items below.**

Recorded logs support prior16browser PASS (6.7min), native1capture PASS (9.5min),60unit PASS,541asset-frame PASS and clean-install zero-reported vulnerabilities. Evidence correctly distinguishes569s relaxed agent route/wallet163/onefish from regression195/twofish, and keeps final17/hosted/live pending. This is not measured human playtime or human listening approval. Score/manifest/notices retain original project MIT authorship, reproducible offline source and no bundled FFmpeg/sample/API claim. Architecture/D012 distinguish source mechanisms from execution and keep Stage2 locked.

**Publication gap:** at audit time ten linked outputs were absent: final harbour26/Mira27/chart30/settings29, dialogue28 at1280/1024/840, Mira audible excerpt, final-smoke JSON and measurements JSON. These align with ongoing capture work, but the index must only publish them as present after files land. The analysis tool currently cannot complete without final-smoke JSON. **Live wording gap:** README's P1.5 status plus “independently opened and tested live” is ambiguous while public still serves prior P1; qualify historical live verification until the newest P1.5 bundle is independently opened.

Measurement methodology is reasonable and qualified: ffprobe codec/duration, ffmpeg volumedetect, compressed/decoded atlas bytes, checkpoint heap/transfer, ranges of rolling overlapping1200frame-window medians/p95. Capture20FPS is explicitly not rendering FPS. No whole-session average or human perception inference. Script hardcodes hardware identity, so preserve that exact matching provenance and do not reuse for other machines unchanged. Robustness refinement: inspect volumedetect process exit/status and explicitly represent unavailable/−infinite levels; current failed/missing regex becomes NaN then JSONnull without failure explanation. This does not invalidate separately successful existing level evidence but should be handled before treating automated measurement output as self-validating.

Final gate requires actual completed17-case/newest hosted bundle results, generated measurement JSON, resolved links and live source identity; none inferred from pending workflow configuration. Creator playtest remains mandatory.


### Evidence/measurement corrective closure

Source review confirms volumedetect spawn failure/nonzero exit now throws, missing/invalid level parses throw, and genuine silence uses explicit string `-Infinity` rather than unexplained JSONnull. Independently CPU-probed finite/silent/missing/malformed parse cases:4assertions PASS. Measurement robustness refinement CLOSED on source/CPU. Full report generation remains pending the owner’s final recording/analysis; not rerun by reviewer.

Final-capture network assertion now compares canonical URL origins rather than string prefixes. Independently CPU-probed ordinary local asset, local-origin blob, external HTTP/blob and different-port cases:5assertions PASS. A local WebAudio recording blob is correctly accepted without permitting external origins. This is a legitimate recording-origin correction, not a weakened external-network restriction.

README now explicitly distinguishes the previously live P1 from P1.5 pending deployment; live wording gap CLOSED. Final linked captures now exist except measurements.json at this audit; that final publication gap remains pending actual generation. No GPU/build/app edits, no claim the newest17-case/hosted/live results were independently executed here.


### Final linked evidence/analysis fields — publication gap CLOSED

All previously missing linked captures and measurements JSON now exist; independently checked README/evidence-index local Markdown links: zero missing. CPU recomputation against42native checkpoints exactly matches reported p50range16.6–16.7ms, p95range16.9–18.5ms and heap15613383–28903501bytes. Final HUD coverage0.0485217158, bundle`index-CEto77Ge.js` and empty recorded pageerrors match final-smoke source. Atlas independently checked at2048×4096/866951encoded bytes (33554432RGBAbytes). No measurement script regeneration/GPU run performed.

Recorded local log supports17cases PASS/6.8min, including full voyage3.4min. Per coordinator this precedes the final narrow CSS name-layout correction; targeted UI checks cover that correction and newest hosted all17 remain pending. Do not relabel the earlier local run as execution of an untested newer tree. Native final capture is recorded evidence, not a reviewer-executed gameplay pass. Keep rolling-window/agent-time/codec/mix/listening caveats and creator playtest gate intact. No remaining linked-file/source-field finding in this batch.


## Independent hosted303 verification — historical baseline, NOT final cache fix

Independently fetched both GitHub run statuses/logs at exact implementation `303e1d86723316d8da38c64d53e62a1fbf9017a2`. PRrun46139119871 **SUCCESS**:60units and17browser cases PASS9.8min, fullvoyage5.0min; PR deployment correctly skipped. Downloaded artifact15261402448 (2561210bytes), inspected ten checkpointPNGs/ten metrics records/HTMLreport and actual fishing image. All metrics identify WebGL and default-base`index-CEto77Ge.js`; finalwallet195/worldv2. Compact independent log/proof/file hashes and metrics retained under `docs/evidence/p15/hosted/303e1d8-pr-*`.

Pushrun46139115650 **FAILURE**, deployment skipped:60units PASS,16browser cases PASS12.1min including fullvoyage5.6min. Sole failure: portraits/release/raised-walking/HUD case exceeded its120000ms total test budget; same case passed the PR run1.3min. Failure excerpt retained, artifact trace investigation in progress. Do not combine PR success with push deployment status or call this published. Later returning-browser cache fix/new18th case is outside303 and requires its own final hosted verification. No GPU/browser/app edits by reviewer.
