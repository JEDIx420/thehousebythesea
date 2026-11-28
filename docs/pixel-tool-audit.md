# Pixel tool audit — bounded offline adoption

Research date: 2026-11-28. Scope: asset-tool source review for PR6; not an approval of game art or a report of an executed asset pipeline. Coordinator remains the sole implementer. No installers, package lifecycle scripts, external skills, generation APIs, downloaded executables or editor builds were run in this audit. No credentials were read. Repositories were cloned without recursive submodules into `/tmp/house-pixel-audit/`, outside agent skill-discovery directories.

## Decision

**Adopt a small pinned pixelfx source subset for offline water/foam frame baking.** Keep the game runtime independent of the VFX library. Render original characters/buildings/boat with the project's deterministic drawing pipeline. Use sprite-forge's QA ideas as references, rather than its default generation router. Pixelorama or LibreSprite may be optional manual editors; neither should become a required build dependency without an actual export test.

This audit provides a source-reviewed invocation below. Its successful execution, byte-repeatability, seam appearance and browser appearance must be recorded by the implementation owner after running it. Static inspection alone does not establish those results.

## Pinned candidates

| Candidate | Exact inspected commit | Licence / cost boundary | Decision |
| --- | --- | --- | --- |
| [pixelfx](https://github.com/patch-gg/pixelfx/tree/5294518ce7c72e48b6100a744596e0acf57f2826) | `5294518ce7c72e48b6100a744596e0acf57f2826` | MIT; dependency-free selected JS. Gallery Patch Pixel font is excluded from MIT. | Adopt bounded water module; no CLI publishing or whole runtime. |
| [agent-sprite-forge](https://github.com/0x0funky/agent-sprite-forge/tree/25203d03900b46b444bdd72a75768c33d1895ad6) | `25203d03900b46b444bdd72a75768c33d1895ad6` | MIT code; default art generation routes to configured provider keys or model tools. Code-art path can be offline with Python dependencies. | Reference palette/anchor/alpha/animation checks; no default skill activation. |
| [sprite-gen](https://github.com/aldegad/sprite-gen/tree/7cef2bf356665e320855a95bbef12836202623c1) | `7cef2bf356665e320855a95bbef12836202623c1` | Apache-2.0 code; generation may use subscriptions or billed APIs. Optional RIFE downloads a large binary bundle. | No generation or RIFE install; offline utilities are optional future candidates, not verified here. |
| [Pixelorama](https://github.com/Orama-Interactive/Pixelorama/tree/efa7baef2b2029b993cf9df28f32211cb5309e04) | `efa7baef2b2029b993cf9df28f32211cb5309e04` | MIT editor; current source README requires Godot 4.7.1. Optional remote palettes/images/extensions exist. | Optional offline editor; no source build or batch export executed. |
| [LibreSprite](https://github.com/LibreSprite/LibreSprite/tree/5f8c7ed908245d0663bb2715f1730d76273c032e) | `5f8c7ed908245d0663bb2715f1730d76273c032e` | GPL-2.0 application; native build dependencies and submodules. Scripts expose network-capable fetch. | Optional editor only; do not copy application code into game. |
| [game-dev-skills](https://github.com/mulosbron/game-dev-skills/tree/1a692b36a67e8bacb1a3f285012e281660190d84) | `1a692b36a67e8bacb1a3f285012e281660190d84` | No root code/content licence found; embedded assets/libraries carry individual terms. Broad skill collection. | No install or code copying. Independently implement basic pixel-scale recipes. Collection review incomplete. |

Code licences do not automatically license showcase images, downloaded model outputs or every bundled asset. None of that art was adopted. No remote asset-generation service is required by the recommended pipeline.

## Exact pixelfx extraction and invocation

Local source: `/tmp/house-pixel-audit/pixelfx`. Package version at this pin: `0.3.1`; Node >=18. No npm install is necessary for the following pure ES modules. Preserve the relative tree under a project tooling vendor directory:

```text
src/core/math.js
src/core/color.js
src/core/font.js
src/core/painter.js
src/fx/water/_lib.js
```

Add a **project-authored replacement** `src/core/index.js` containing only:

```js
export * from './math.js';
export * from './color.js';
```

This shim satisfies `_lib.js` imports without loading upstream actors, rigs, physics, scenes or unrelated effects. `painter.js` imports `math.js`, `color.js`, and the small code-defined bitmap `font.js`; that last file is distinct from excluded `gallery/fonts/`. Do not copy upstream's full core index. The selected dependency graph has no IO, network, process execution or package imports.

Copy upstream `LICENSE` and `NOTICE.md` alongside the vendored subset, retain source attribution headers, and record the pin and modifications in the project manifest. MIT copyright notices name Patch and Hugo Duprez. `_lib.js` includes Sprite Fusion adaptations, so preserve its Hugo Duprez attribution. Keep NOTICE intact even though its Hollow Crown `act.js` notice refers to a module we do not need. **Do not vendor `gallery/fonts` or Patch publishing tools.**

Minimal frame adapter (paths relative to the extracted tree; coordinator owns integration):

```js
import { Painter } from './src/core/painter.js';
import { hex } from './src/core/color.js';
import { ring, lace } from './src/fx/water/_lib.js';

// waterRamp: eight project palette hex strings, dark to light.
// baseWater: project palette hex string. i: 0..15.
export function waterFrame(i, waterRamp, baseWater) {
  const f = { w: 64, h: 32, ox: 0, oy: 0,
    color: new Uint32Array(64 * 32),
    light: new Uint32Array(64 * 32) };
  f.color.fill(hex(baseWater));
  const p = new Painter(f).place(32, 16);
  p.lightK = 0; // Bake crisp palette pixels, without additive glow.
  const C = waterRamp.map(hex);
  const phase = i / 16;
  for (let q = 0; q < 2; q++) {
    const age = (phase + q * 0.5) % 1;
    ring(p, 0, 0, 2 + age * 27, 0.5,
      Math.sin(Math.PI * age), C,
      { n: 2, gap: 3, seed: 42 + q, wob: 0.7 });
  }
  // Optional foam: periodic input avoids upstream's linear-time drift.
  lace(p, 0, 1, 25, 10, 0.5, C,
    Math.sin(phase * Math.PI * 2) * 0.4, 42);
  const rgba = new Uint8Array(64 * 32 * 4);
  for (let n = 0; n < f.color.length; n++) {
    const c = f.color[n];
    rgba[n * 4] = c & 255;
    rgba[n * 4 + 1] = (c >>> 8) & 255;
    rgba[n * 4 + 2] = (c >>> 16) & 255;
    rgba[n * 4 + 3] = (c >>> 24) & 255;
  }
  return rgba; // Hand to project's PNG encoder/atlas packer.
}
```

This uses actual upstream `ring` and `lace`, rather than recreating a similarly named effect. `ring` is at `_lib.js:98`; `lace` at `:155`; packed colour interpretation at `color.js:1`. `ring` supports `half=-1/1` for far/near crests around an object. Its default no-hot/no-glint mode uses ramp colours. `lace` can emit literal white (`:165`), so include white in the approved palette or explicitly palette-map its output; do not silently claim a strict eight-colour result. Light output is deliberately disabled, avoiding the full `fx.js` compositor dependency.

The loop wraps at zero ring opacity; periodic foam input has matching endpoints. These are source-level properties, **not a measured visual seam pass**. A repeated tile can still reveal identical circular motifs or edge discontinuities. Treat this as an accent/water frame recipe: mask to the isometric diamond if required, test adjacent tiles, and layer shore foam from authored shoreline data. It does not generate a terrain shoreline or collision map.

Before adoption evidence is marked PASS, run the adapter twice with fixed inputs and compare hashes; check exactly 64×32 RGBA, finite palette, alpha policy, 16-frame atlas bounds and 0↔16 endpoint identity; inspect the animated 15→0 transition and 3×3 tile repetition in the actual browser. Frame 15 should not equal frame 0; it should advance smoothly into it. Record command, output hashes and screenshot/contact sheet. No paid API, CLI login, native image binary or optional npm dependency is needed.

## Security and workflow review

Applied the local `codex-security:check-skills` review procedure to candidate skill text as untrusted data. Nothing was installed into skill discovery paths or activated. Verdicts below concern inspected scope, not entire repositories.

- **pixelfx bounded source: PASS static review / execution pending.** Reviewed imports, painter/colour/math, water helpers and rendering path. Its full skill is **REVIEW** for this task: it can suggest fetching an unpinned checkout and optional global Patch CLI installation, `curl | sh`, login and publishing. Those steps are unnecessary and outside this offline asset task. Its local render script can export PNG/JSON without npm; optional GIF/video calls ffmpeg. Prefer the smaller adapter above.
- **agent-sprite-forge default generation: REVIEW; do not activate.** `skills/generate2dsprite/SKILL.md` art-source routing and `skills/generate2dmedia/scripts/route_media.py:462` treat configured keys as consent for execution. The current project's explicit zero-API constraint overrides that assumption. Codeart2d uses deterministic PixelSpec and local numpy/Pillow; optional SVG adds `resvg-py`. Its skill still requests a sibling route capability probe. We did not run it. `render_pixelspec.py` can invoke a local clip builder through Python subprocess when requested. The full helper dependency graph was not exhaustively reviewed, so no complete-tool PASS is claimed. The installer writes/replaces user skill folders only with apply mode; do not run it for this project.
- **sprite-gen generation: REVIEW; do not activate.** `sprite_gen/gen/address.py:43` onward contains real provider endpoints; Codex/provider execution is reachable from generation. Vision-facing inspection may call a model. Optional RIFE installation downloads roughly 830 MB before retaining the platform binary; checksums do not make it needed or offline. Python package dependencies include Pillow and numpy; optional torch adds substantial requirements. Offline slicing/recolouring/export commands exist but were not executed or fully audited.
- **game-dev-skills: INCOMPLETE collection review.** Inventory found 236 recursive `SKILL.md` files, including hidden directories. Inspected the relevant pixel-perfect, web-2d-games, pixelfx and pixelorama instructions, plus polyspoon bootstrap references; did not audit all skills. Several recommend broad stacks, submodules or local bootstrapping. No root copying permission was found. Do not treat the repository as a trusted instruction pack or install it wholesale.

Pixelorama's `src/Main.gd` contains headless export argument handling (`--export`, `--spritesheet`, `--output`, integer `--scale`, frame/tag selections). The documented form is `Pixelorama --headless --quit -- [user args] [FILES]...`; it is a plausible optional export workflow, **not tested here**. Remote palette/image imports and extensions are optional capabilities, so “offline editor use” does not mean “no network code exists.” LibreSprite similarly exposes fetch from script APIs (`src/app/script/api/http_script.cpp`, `storage_script.cpp`); avoid unreviewed scripts/extensions. Neither editor was installed or launched.

## Useful independent design recipes

- Pick one logical pixel scale, integer upscale and nearest sampling; avoid arbitrary sprite rotation. Give characters authored four-way facings, common standing height and a feet anchor shared by all frames.
- Fixed palette, binary transparency, atlas padding and consistent frame extents are cheap automatic checks. Also inspect foot contact, stride, silhouette and directional identity visually; passing dimensions alone cannot establish good art.
- Draw sea, shore foam, ground, feet-sorted props/actors and foreground roofs/canopies as separate layers. Use logical authored obstacle data for collision rather than transparent-pixel inference.
- A pixel-size estimator based on equal-colour run GCD is only a heuristic. A result of one does not prove authentic pixel art or coherent scale. The actual gameplay-resolution golden sample remains the art gate.
- Do not take unrelated web-stack suggestions (React/Tailwind/Zustand/desktop packaging/infinite maps) from a generic skill as project requirements.

## Coverage and limitations

Read licences, package/build declarations, skill entry points and targeted dependency/network/process paths. No recursive submodules were fetched. Snapshot inventory excluding `.git`: pixelfx 313 regular files / 2 opaque assets; agent-sprite-forge 875 / 86; sprite-gen 731 / 56; Pixelorama 1,383 / 213; LibreSprite 2,008 / 59; game-dev-skills 1,758 / 133. No snapshot symlinks were found. These inventory counts are not claims of complete file review. Binary/sample art contents, all editor internals, all transitive Python/native dependencies and the remaining skill collection are outside substantive coverage. No sample art was copied and no whole-repository safety endorsement is made.

Research outcome: **GO for coordinator to execute the bounded pixelfx adapter and original deterministic golden sample; NO-GO for default remote generation workflows or wholesale skill/library installation.** Browser visual acceptance and reproducibility evidence remain separate implementation gates. Stage 2 remains unauthorised.
