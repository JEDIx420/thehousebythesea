# Independent review — terrain authoring tools and notices

Date: 2026-11-27. Reviewer: state-system agent, independent of these five files. Batch: `tools/terrain-spike.html`, `tools/terrain-spike.ts`, `tools/run-terrain-spike.mjs`, `tools/inspect-assets.mjs`, `public/THIRD_PARTY_NOTICES.txt`. Baseline HEAD `fa4a43b427a6cb8fdc9ba29bc0782fd7e16b2dc3`; final implementation SHA to be attached after integration.

- PASS: terrain page uses a relative `./terrain-spike.ts` entry and runner opens the explicit repository-prefixed dev URL. It imports real published ProceduralTerrains runtime/export modules and authored heightfield; builds finite terrain, renders moving water, exports mesh/collision/heightmap files, parses a real GLB, then captures both approaches. This is an actual executable comparison, not synthetic numbers embedded in a page.
- PASS: no credentials, tokens, environment-file reads, paid API calls or runtime server dependencies in these tools. Runner writes only generated proof assets/screenshots from the exporter. It does not publish or push anything.
- PASS: production Vite entry is index.html → src/main.ts; no terrain tool/studio imports occur in that entry's dependency graph. ProceduralTerrains is a development dependency. Current dist inspection contains built app, CSS and public proof/model assets, not the authoring HTML or terrain-studio application. Final build must still be rechecked by coordinator after all edits.
- PASS: `node tools/inspect-assets.mjs`, exit 0, parses the actual GLB JSON chunks and reports all five assets. Scope is honestly mesh-local accessor bounds; no claim is made that it resolves skinned world dimensions. For these known triangle GLBs its triangle accounting matches manifest. It is a local inspection tool, not a general untrusted GLB validator.
- PASS: `public/THIRD_PARTY_NOTICES.txt` includes actual installed Three.js MIT text and the actual installed ProceduralTerrains licence text, including the upstream's unusual missing “and/or sell” phrase. Polyfork section references individual asset credits and CC BY 4.0 URL. No fabricated licence grants are added.
- ISSUE T-01 (P2): runner originally logged `window.spikeError` but exited 0 when it existed; this could misrepresent a failed runtime proof as successful command execution. Requested nonzero exit on proof error before sign-off.
- NOT TESTED: this reviewer did not rerun the long terrain benchmark, so did not overwrite existing measurement artifacts or claim an independent FPS result. Screenshot/source/artifact inspection is recorded in review-world.md. Browser environment for targeted world render is installed headless Chrome; production full gameplay remains a different review batch.

Initial file SHA-256:

```text
118c0a17b92297322fde06fae3ac126f3b559743d809ed51174a05404ba597b7  tools/terrain-spike.html
a76671867baea44915723b6c8de57304174f9de2b3caa4e7f531bfb713b486d5  tools/terrain-spike.ts
d2e45d53445d56c35822b51d8d0b5a57414a3d9c6444dd6659f91da3277c9117  tools/run-terrain-spike.mjs
19bcbfed8eb102719552aa1141540deb2afe2987576744bc1822ff6193c25267  tools/inspect-assets.mjs
96b2d47ca0351ce460bdf3f7b89d884ec9aa7f331bc5f6cf007b573876749959  public/THIRD_PARTY_NOTICES.txt
```

Conclusion: no P0/P1 found in this batch; T-01 correction pending. Technical checks are not creator approval. Stage 2 remains locked.

## T-01 corrective verification

Coordinator changed runner to throw on `spikeError` inside a try/finally that always closes the browser. It now also explicitly requires `terrain.glb` instead of choosing the first GLB entry (which could be the collider), and writes actual returned live/baked diagnostics to the metrics artifact on successful completion.

Independent failure injection replaced only the Playwright import in an in-memory copy with a mock page whose evaluate returns `Injected WebGL failure`. The actual remaining runner source executed in a Node subprocess, without touching the good screenshots or measurements. Result: **runner exit 1**, `Live terrain proof failed: Injected WebGL failure` reported, and finally-close marker observed. The outer assertion harness exited 0. Reproduction harness:

```js
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const source = fs.readFileSync('tools/run-terrain-spike.mjs', 'utf8');
const mock = `const chromium={launch:async()=>({newPage:async()=>({on(){},async goto(){},async waitForFunction(){},async evaluate(){return 'Injected WebGL failure';}}),async close(){console.error('REVIEW_BROWSER_CLOSED');}})};`;
const injected = source.replace('import { chromium } from "@playwright/test";', mock);
const result = spawnSync(process.execPath, ['--input-type=module'], {input: injected, encoding: 'utf8'});
if (result.status !== 1 || !result.stderr.includes('REVIEW_BROWSER_CLOSED') || !result.stderr.includes('Live terrain proof failed: Injected WebGL failure')) process.exitCode = 1;
```

Corrected runner SHA-256 `cad538345ff408573b8cbfc757f3aa7a36610be3f0f0edf14cf3adbbff3e935d`. **T-01 CLOSED; batch conclusion PASS, ready for integration review.** Successful GPU proof benchmark was not rerun by this reviewer, as previously disclosed. No whole-stage gameplay/Pages approval is implied.

## Immutable implementation sign-off

**Reviewed commit: `f788256bebd0d958b96c5397fbe4922746855d31`. Five-file tools/notices batch PASS.** All five scoped files are present in that commit and working-tree diff against it is empty. Hashes match the initial fingerprints except the corrected runner, which matches `cad538345ff408573b8cbfc757f3aa7a36610be3f0f0edf14cf3adbbff3e935d`. No source changed and no benchmark/evidence overwrite occurred during sign-off. T-01 remains closed. Stage 2 remains unauthorised until explicit creator approval.
