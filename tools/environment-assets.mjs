/** Curated free mesh downloads only. No API credential or source module is used. */
import fs from "node:fs/promises";
const selection = [
  ["shaded-bench", "shaded-bench-1078c2", "Shaded Bench"],
  ["boathouse", "boathouse-cf20e6", "Boathouse"],
  ["village-shopfront", "village-shopfront-d3088e", "Village Shopfront"],
  ["kafeneio", "kafeneio-25e357", "Kafeneio"],
  ["taverna-table-set", "taverna-table-set-6b4bc1", "Taverna Table Set"],
  ["olive-tree", "olive-tree-3cb4a4", "Olive Tree"],
  ["pencil-cypress", "pencil-cypress-73f3f4", "Pencil Cypress"],
  ["bougainvillea", "bougainvillea-cb4728", "Bougainvillea"],
  ["harbour-quay", "harbour-quay-edge-run-95df75", "Harbour Quay Edge Run"],
  ["harbour-lamp", "harbour-lamp-post-3d8032", "Harbour Lamp Post"],
  ["fish-crate", "fish-crate-3c3f7b", "Fish Crate"],
  ["fishing-net", "fishing-net-heap-d0ce10", "Fishing Net Heap"],
  ["boardwalk-deck", "boardwalk-deck-run-c1f678", "Boardwalk Deck Run"],
  [
    "boardwalk-railing",
    "boardwalk-railing-run-4851f1",
    "Boardwalk Railing Run",
  ],
  ["pier-head", "pier-head-platform-63662b", "Pier Head Platform"],
  ["harbourmaster-hut", "harbour-master-s-hut-226f34", "Harbour Master’s Hut"],
  ["boat-shed", "boat-shed-74c94f", "Boat Shed"],
  ["lifebuoy-post", "lifebuoy-on-a-post-57421b", "Lifebuoy on a Post"],
  ["mooring-bollard", "mooring-bollard-2d4bc9", "Mooring Bollard"],
  ["dune-grass", "marram-grass-tuft-8c7a99", "Marram Grass Tuft"],
  ["tamarisk-bush", "tamarisk-bush-ba4337", "Tamarisk Bush"],
  ["rock-pool", "rock-pool-937f01", "Rock Pool"],
  ["rock-armour", "rock-armour-revetment-aea1ca", "Rock Armour Revetment"],
  [
    "wayfinding-post",
    "seafront-wayfinding-post-67fc84",
    "Seafront Wayfinding Post",
  ],
  ["rowing-dinghy", "rowing-dinghy-022673", "Rowing Dinghy"],
  ["painted-rowboat", "painted-rowing-boat-ca5c1a", "Painted Rowing Boat"],
  ["lane-paving", "lane-paving-tile-4cca8b", "Lane Paving Tile"],
  ["flowering-agave", "flowering-agave-84b67c", "Flowering Agave"],
];
const root = new URL("../public/assets/models/", import.meta.url);
await fs.mkdir(root, { recursive: true });
const records = [];
for (const [id, slug, name] of selection) {
  const file = new URL(`${id}.glb`, root);
  let bytes;
  try {
    bytes = await fs.readFile(file);
  } catch {
    const response = await fetch(`https://polyfork.dev/cdn/${slug}.glb`, {
      headers: { "User-Agent": "TheHouseByTheSea/Stage1B asset-audition" },
    });
    if (!response.ok) throw new Error(`Asset ${id}: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(file, bytes);
  }
  if (bytes.readUInt32LE(0) !== 0x46546c67)
    throw new Error(`Invalid GLB ${id}`);
  const json = JSON.parse(
    bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
  );
  let triangles = 0;
  for (const mesh of json.meshes ?? [])
    for (const primitive of mesh.primitives ?? []) {
      if (primitive.mode !== undefined && primitive.mode !== 4)
        throw new Error(`Nontriangle ${id}`);
      triangles +=
        json.accessors[primitive.indices ?? primitive.attributes.POSITION]
          .count / 3;
    }
  records.push({
    id,
    file: `assets/models/${id}.glb`,
    source: `https://polyfork.dev/asset/${slug}`,
    license: "CC-BY-4.0",
    credit: `${name} by Polyfork`,
    modified:
      id === "lane-paving"
        ? "Source GLB unchanged; runtime vertices conform to exact terrain triangles with0.035m inset and original stone relief"
        : "Scene placement, instance scale/rotation; GLB source file unchanged",
    bytes: bytes.length,
    triangles,
    animations: json.animations?.length ?? 0,
    skins: json.skins?.length ?? 0,
  });
  console.log(`${id}: ${bytes.length} bytes, ${triangles} triangles`);
}
await fs.writeFile(
  new URL("../src/world/environment-assets.json", import.meta.url),
  JSON.stringify(records, null, 2) + "\n",
);
