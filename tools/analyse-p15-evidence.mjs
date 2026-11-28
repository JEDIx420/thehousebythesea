import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { PNG } from "pngjs";
const prefix = "docs/evidence/p15/",
  before = JSON.parse(fs.readFileSync(prefix + "before/baseline.json")),
  after = JSON.parse(fs.readFileSync(prefix + "after/native-checkpoints.json")),
  final = JSON.parse(fs.readFileSync(prefix + "after/final-smoke.json"));
const a = Object.values(after.checkpoints).map((c) => c.metrics),
  atlas = PNG.sync.read(fs.readFileSync("public/assets/atlas.png"));
const clips = [
  "before/movement-surf.webm",
  "after/movement-after.webm",
  "after/audible-town-sea-arrival-dialogue.webm",
  "after/mira-expressions-audible.webm",
].map((file) => {
  const probe = JSON.parse(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration:stream=codec_name,codec_type",
        "-of",
        "json",
        prefix + file,
      ],
      { encoding: "utf8" },
    ),
  );
  const levelProbe = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-i",
      prefix + file,
      "-vn",
      "-af",
      "volumedetect",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  if (levelProbe.error || levelProbe.status !== 0)
    throw Error(
      `Audio measurement failed for ${file}: ${levelProbe.error?.message ?? levelProbe.stderr}`,
    );
  const level = (name) => {
    const match = levelProbe.stderr.match(
      new RegExp(name + ": ([-.0-9]+|-inf) dB"),
    );
    if (!match) throw Error(`Missing ${name} for ${file}`);
    if (match[1] === "-inf") return "-Infinity";
    const value = Number(match[1]);
    if (!Number.isFinite(value)) throw Error(`Invalid ${name} for ${file}`);
    return value;
  };
  return {
    file,
    bytes: fs.statSync(prefix + file).size,
    probe,
    meanDb: level("mean_volume"),
    peakDb: level("max_volume"),
  };
});
const report = {
  hardware:
    "Apple M4 / macOS26.5.2, native Chrome158.0.8127.37,1440x900 CSS viewport;640x360 logical2x",
  baseline: { source: "90693e3 docs,262e536 game", metrics: before.metrics },
  after: {
    elapsedSeconds: after.elapsedSeconds,
    checkpoints: a.length,
    p50Range: [
      Math.min(...a.map((m) => m.p50)),
      Math.max(...a.map((m) => m.p50)),
    ],
    p95Range: [
      Math.min(...a.map((m) => m.p95)),
      Math.max(...a.map((m) => m.p95)),
    ],
    heapRange: [
      Math.min(...a.map((m) => m.heap)),
      Math.max(...a.map((m) => m.heap)),
    ],
    firstTransferBytes: a[0].loadBytes,
    hudCoverage: final.hud.coverage,
    atlas: {
      width: atlas.width,
      height: atlas.height,
      bytes: fs.statSync("public/assets/atlas.png").size,
      decodedRGBABytes: atlas.width * atlas.height * 4,
    },
    frames: JSON.parse(fs.readFileSync("public/assets/manifest.json")).frames
      .length,
    finalBundle: final.bundle,
  },
  clips,
  caveats: [
    "Agent-driven real-time reading/exploration, not measured human playtime.",
    "Render callbacks use rolling1200-sample windows; checkpoints overlap, are not disjoint/full-session FPS measurements.",
    "CDP recording adds capture work;20fps clips are capture cadence, not game FPS.",
    "Local resource transfer counters depend on compression/cache/server headers; payload sizes are reported separately.",
    "Audio levels prove non-silent output/headroom; no human listening or subjective loop/mix approval is claimed.",
    "Chrome/Chromium tested; Safari/Firefox/touch-only unverified.",
  ],
};
fs.writeFileSync(
  prefix + "measurements.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report.after, null, 2));
