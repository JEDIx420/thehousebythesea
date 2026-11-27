import fs from "node:fs";
const root = new URL("../public/assets/models/", import.meta.url);
for (const name of fs.readdirSync(root).filter((n) => n.endsWith(".glb"))) {
  const b = fs.readFileSync(new URL(name, root));
  if (b.length < 20 || b.readUInt32LE(0) !== 0x46546c67)
    throw new Error(`${name}: invalid GLB header`);
  const j = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString());
  let triangles = 0;
  const min = [Infinity, Infinity, Infinity],
    max = [-Infinity, -Infinity, -Infinity];
  for (const m of j.meshes ?? [])
    for (const p of m.primitives) {
      const a = j.accessors?.[p.attributes?.POSITION];
      if (!a) continue;
      const count =
        p.indices !== undefined ? j.accessors[p.indices].count : a.count;
      const mode = p.mode ?? 4;
      if (mode === 4) triangles += Math.floor(count / 3);
      if (mode === 5 || mode === 6) triangles += Math.max(0, count - 2);
      for (let i = 0; i < 3; i++)
        if (a.min && a.max) {
          min[i] = Math.min(min[i], a.min[i]);
          max[i] = Math.max(max[i], a.max[i]);
        }
    }
  console.log(
    JSON.stringify({
      file: name,
      bytes: b.length,
      triangles,
      meshLocalBounds: { min, max },
      animations: j.animations?.length ?? 0,
      clips: (j.animations ?? []).map((a) => a.name),
      skins: j.skins?.length ?? 0,
      bones: new Set((j.skins ?? []).flatMap((s) => s.joints)).size,
      nodes: j.nodes?.length ?? 0,
    }),
  );
}
