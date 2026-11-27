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
    id: "small-fishing-boat",
    file: "assets/models/small-fishing-boat.glb",
    source: "https://polyfork.dev/asset/small-fishing-boat-4ac0e3",
    license: "CC-BY-4.0",
    credit: "Small Fishing Boat by Polyfork",
    modified:
      "None; inspected reference asset, original sailboat used in gameplay",
    bytes: 350988,
    triangles: 2999,
    animations: 1,
    skins: 0,
  },
  {
    id: "beach-hut",
    file: "assets/models/beach-hut.glb",
    source: "https://polyfork.dev/asset/beach-hut-fc7649",
    license: "CC-BY-4.0",
    credit: "Beach Hut by Polyfork",
    modified: "Instance scaling and rotation in scene; source file unchanged",
    bytes: 80380,
    triangles: 652,
    animations: 1,
    skins: 0,
  },
  {
    id: "holidaymaker",
    file: "assets/models/holidaymaker.glb",
    source: "https://polyfork.dev/asset/holidaymaker-in-a-sun-2ba5e5",
    license: "CC-BY-4.0",
    credit: "Holidaymaker in a Sun Hat by Polyfork",
    modified:
      "None; inspected rig reference, original procedural people used in gameplay",
    bytes: 949788,
    triangles: 4431,
    animations: 3,
    skins: 8,
  },
  {
    id: "seafront-lamp",
    file: "assets/models/seafront-lamp.glb",
    source: "https://polyfork.dev/asset/seafront-lamp-post-28bada",
    license: "CC-BY-4.0",
    credit: "Seafront Lamp Post by Polyfork",
    modified: "Instance scaling; source file unchanged",
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
    modified: "Instance rotation; source file unchanged",
    bytes: 91248,
    triangles: 786,
    animations: 0,
    skins: 0,
  },
];
export const assetManifest = assets;
export const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
