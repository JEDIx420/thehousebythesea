# Stage 0 — finite terrain and asset proof (2026-11-27)

The actual live runtime and its real exported GLB both rendered in installed Google Chrome with WebGL2. This is an isolated technical proof, not a claim that the production game uses the runtime renderer. Reproduce with `npm run dev -- --port 5173` then `node tools/run-terrain-spike.mjs`. It opens `/thehousebythesea/tools/terrain-spike.html`, renders both approaches, exports meshes and captures screenshots. The proof tools are development-only and not included in the production Vite entry.

## Version and source verification

- npm registry: `procedural-terrains@2.1.0`; peer `three: ~0.185.1`; package MIT licence inspected. The repository's package README still describes the 2.0.0 extraction; this test uses the actual newer published package.
- [Upstream runtime](https://github.com/ZyFou/ProceduralTerrains/blob/main/packages/procedural-terrains/README.md) explicitly documents CPU height approximation and identity transforms. Tested finite heightmap source, one 120-unit chunk, segment LOD `[16,8,4,2]`, minimal detail shader. Both proofs use the same authored heightmap.
- [Polyfork licensing](https://polyfork.dev/licensing) verified 2026-11-27: free low-poly GLB mesh files may be self-hosted under CC BY 4.0 with credit/change notice. Source modules and HD assets have different terms and were not downloaded.

## Actual measurements

Host: Apple M4 MacBook Air, 16 GB, macOS 26.5.2. Installed Google Chrome 158.0.8127.37, headless, WebGL2, 512×384 page and deliberately small **320×240 canvas**. These are small-proof numbers, **not** full gameplay performance claims. Last 180 requestAnimationFrame intervals were sampled after warmup; vsync limits comparison. Browser screenshots: [live](evidence/terrain-live.png), [baked](evidence/terrain-baked.png); [machine-readable metrics](evidence/terrain-metrics.json).

| Proof | Median frame interval | p95 | p99 | Draw calls | Rendered triangles |
| --- | ---: | ---: | ---: | ---: | ---: |
| Live runtime, reduced detail | 16.65 ms | 17.70 ms | 18.20 ms | 2 | 1,440 |
| Exported GLB, plain Three.js | 16.70 ms | 18.30 ms | 18.60 ms | 2 | 8,000 |

Live create/prepare completed in 46.4 ms in the final warm-cache run (450 ms in the prior cold attempt). Rendered water is the same original lightweight moving mesh in both proofs. GPU memory and low-power Intel performance were not measured. Initial default-detail 1024×768 SwiftShader attempt stalled a frame for 88,470 ms and lost its WebGL context; exporting then failed with `Graphics context is lost`. A second software attempt timed out. The successful reduced-detail installed-Chrome run above is recorded separately; the failure is not hidden.

Real runtime exporter produced `terrain.glb` 163,568 bytes, `collision.glb` 133,652 bytes, `terrain.json` 97,295 bytes and 1,823-byte heightmap PNG, committed under `public/assets/`. These are proof artifacts and not loaded by the game. GLB parse and subsequent render succeeded, but **visual parity failed**: the baked screenshot shows a broad square cream sheet with jagged cut-out corners rather than the live bounded island silhouette. That export shoreline/composition mismatch is an additional reason the exported mesh is not used as production terrain. The live CPU samples at (40,0), (0,0), (49,0) were 1.599609375, 6.5703125, 1.599609375, showing half-float heightmap quantisation relative to authored 1.6m dock heights. This is a CPU sample comparison only; the live GPU-versus-CPU collision error was not measured and is not claimed validated. The production triangle-raycast test is separate.

## Production decision / explicit variation

Use plain Three.js authored heightfield mesh with the **same exact triangle data** for collision and lightweight original shader water. ProceduralTerrains has now been genuinely evaluated as a live runtime and export authoring candidate. The final production mesh is assembled directly from our finite authored heightfield rather than claiming the proof GLB is shipped terrain: this preserves exact harbour ramps, terrain triangle interpolation and subpath simplicity, with no runtime shader compilation risk. This is a deliberate variant of export-first, not a fabricated ProceduralTerrains integration. The proof files preserve a reversal path to GLB terrain if later visual feedback warrants it.

`src/world/surface.test.ts` casts rays against the actual generated triangle topology at hill, shore, seam and harbour points and checks height parity to 1e-5; dock berth tests ensure x55 is the 1.68m pier top (raised above the 1.6m ramp to prevent z-fighting) and x62 water on both islands. Command `npx vitest run src/world/surface.test.ts`: **2 passed**. Production mesh uses those same position arrays and exact index ordering. No CPU noise sample is treated as the GPU triangle collider.

Only two islands are rendered. Original meshes supply houses, trees, palms, pier, shell arch and birds. Selected Polyfork huts, lamps and benches provide detailed harbour props. Original houses and Polyfork huts have main structure colliders (hut envelopes are computed from their actual scaled/rotated world-space GLB bounds); fine decorative trees/benches are not navigation obstacles, a disclosed simplification.

## Verified asset inventory and budgets

Run `node tools/inspect-assets.mjs`. This parses the actual GLB JSON chunks; bounds reported are mesh-local, not promised skinned world-space dimensions. Source files remain unchanged; instance scaling/rotation disclosed in manifest and `public/assets/CREDITS.txt`.

| GLB | Bytes | Triangles | Animation clips | Skins |
| --- | ---: | ---: | ---: | ---: |
| beach-hut | 80,380 | 652 | 1 | 0 |
| seafront-lamp | 88,136 | 758 | 0 | 0 |
| promenade-bench | 91,248 | 786 | 0 | 0 |
| small-fishing-boat | 350,988 | 2,999 | 1 | 0 |
| holidaymaker | 949,788 | 4,431 | 3 | 8 |

The latter two were inspected integration references and are not loaded at startup; production uses original procedurally animated characters and sailboat. Actual render-time asset model transfer is 259,764 bytes before HTTP compression. Provisional budget: ≤500 KB initial external model payload, ≤2 MB all reference models, no external runtime model requests. Complete application JS transfer and gameplay frame data are tracked by coordinator. Credits are generated from `src/data/assets.ts` with individual canonical source URLs and CC BY 4.0. Runtime/export terrain proof files are original generated project work, with ProceduralTerrains MIT attribution.
