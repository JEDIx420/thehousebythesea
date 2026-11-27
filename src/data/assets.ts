import environmentAssets from "../world/environment-assets.json" with { type: "json" };
export interface AssetRecord {
  id: string;
  file: string;
  source: string;
  license: string;
  credit: string;
  modified: string;
  bytes: number;
  triangles: number;
  animations: number;
  skins: number;
}
export const assets: AssetRecord[] = [
  {
    id: "mira-family-traveller",
    file: "assets/models/mira-family-traveller.glb",
    source: "https://polyfork.dev/asset/family-traveller-9af47e",
    license: "CC-BY-4.0",
    credit: "Family Traveller by Polyfork — creator-selected Mira",
    modified:
      "Source GLB, face, hair and outfit palette preserved. Runtime ground/facing alignment only; real Idle/Walk/Run clips and a small authored greeting on named bones. No interaction clip is claimed.",
    bytes: 892448,
    triangles: 4137,
    animations: 3,
    skins: 8,
  },
  {
    id: "rowan-casual",
    file: "assets/models/rowan-casual.glb",
    source: "https://quaternius.com/packs/ultimatemodularcharacters.html",
    license: "CC0-1.0",
    credit: "Ultimate Modular Characters by Quaternius",
    modified:
      "Converted GLB source unchanged; runtime height/facing normalisation, wardrobe retint and cloned animation root-motion removal. Converted source: https://raw.githubusercontent.com/LuanDucate/Ducz.CharacterCreator/fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08/public/models/Male/Casual_2.glb",
    bytes: 1611824,
    triangles: 5776,
    animations: 24,
    skins: 1,
  },
  {
    id: "mira-casual",
    file: "assets/models/mira-casual.glb",
    source: "https://quaternius.com/packs/ultimatemodularwomen.html",
    license: "CC0-1.0",
    credit: "Ultimate Modular Women by Quaternius — Nessa",
    modified:
      "Used for Nessa, not the creator-selected Mira. Legacy filename mira-casual is retained for cache compatibility. Converted GLB source unchanged; runtime height/facing normalisation, wardrobe retint and cloned animation root-motion removal. Converted source: https://raw.githubusercontent.com/LuanDucate/Ducz.CharacterCreator/fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08/public/models/Female/Casual.glb",
    bytes: 1668252,
    triangles: 6424,
    animations: 24,
    skins: 1,
  },
  {
    id: "caique-fishing-boat",
    file: "assets/models/caique-fishing-boat.glb",
    source: "https://polyfork.dev/asset/caique-fishing-boat-262c24",
    license: "CC-BY-4.0",
    credit: "Caique Fishing Boat by Polyfork",
    modified:
      "GLB unchanged; runtime scale0.94, bow facing correction, deck alignment. Gameplay uses separate invisible simple hull.",
    bytes: 310208,
    triangles: 2636,
    animations: 1,
    skins: 0,
  },
  {
    id: "beach-hut",
    file: "assets/models/beach-hut.glb",
    source: "https://polyfork.dev/asset/beach-hut-fc7649",
    license: "CC-BY-4.0",
    credit: "Beach Hut by Polyfork",
    modified: "Legacy audited reference; not loaded by Stage1B; GLB unchanged",
    bytes: 80380,
    triangles: 652,
    animations: 1,
    skins: 0,
  },
  {
    id: "seafront-lamp",
    file: "assets/models/seafront-lamp.glb",
    source: "https://polyfork.dev/asset/seafront-lamp-post-28bada",
    license: "CC-BY-4.0",
    credit: "Seafront Lamp Post by Polyfork",
    modified: "Legacy audited reference; not loaded by Stage1B; GLB unchanged",
    bytes: 88136,
    triangles: 758,
    animations: 0,
    skins: 0,
  },
  {
    id: "promenade-bench",
    file: "assets/models/promenade-bench.glb",
    source: "https://polyfork.dev/asset/back-to-back-promenade-8c153b",
    license: "CC-BY-4.0",
    credit: "Back-to-Back Promenade Bench by Polyfork",
    modified: "Legacy audited reference; not loaded by Stage1B; GLB unchanged",
    bytes: 91248,
    triangles: 786,
    animations: 0,
    skins: 0,
  },
  ...environmentAssets,
];
export const assetManifest = assets;
export const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
