import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
const root = new URL("../public/", import.meta.url),
  m = JSON.parse(fs.readFileSync(new URL("audio/manifest.json", root), "utf8"));
const score = JSON.parse(
  fs.readFileSync(
    new URL("../assets/source/music-score.json", import.meta.url),
    "utf8",
  ),
);
for (const key of ["title", "author", "license", "bpm", "bars"])
  assert.equal(m[key], score[key]);
assert.equal(
  m.source,
  "assets/source/music-score.json + tools/generate-music.mjs",
);
assert.equal(m.license, "MIT");
assert.equal(m.bpm, 80);
assert.equal(m.bars, 32);
assert.deepEqual(
  m.tracks.map((t) => t.id),
  ["havenport", "sailing", "saltglass"],
);
let total = 0;
for (const t of m.tracks) {
  assert.equal(t.file, `audio/${t.id}.mp3`);
  assert.equal(t.duration, 96);
  assert.equal(t.license, "MIT");
  const b = fs.readFileSync(new URL(t.file, root));
  total += b.length;
  assert.equal(b.length, t.bytes);
  assert.equal(crypto.createHash("sha256").update(b).digest("hex"), t.sha256);
  assert.ok(
    b.includes(Buffer.from("Xing")) || b.includes(Buffer.from("Info")),
    "Missing MP3 seek/header marker",
  );
}
assert.ok(total <= 3_000_000, "Compressed music budget exceeded");
console.log(
  `PASS: three original96s loops, ${total} bytes total, SHA256/score provenance/seek-header presence (decoded looping verified separately).`,
);
