// Original First Voyage art recipes. Integer raster drawing, fixed palette/seed.
import {
  PixelCanvas,
  noise,
  lettering,
  rgba,
} from "../../tools/pixel-canvas.mjs";
import P from "./palette.json" with { type: "json" };
import WORLD from "./world.json" with { type: "json" };
export const SEED = 11282026;
const poly = (c, p, k, o) => c.poly(p, P[k] ?? k, o ? (P[o] ?? o) : undefined);
function grain(c, box, colors, seed, density = 0.12) {
  c.stipple(
    ...box,
    colors.map((k) => P[k]),
    seed,
    density,
  );
}

export function tile(kind, variant = 0) {
  const c = new PixelCanvas(64, 40),
    base =
      kind === "grass"
        ? "grass"
        : kind === "path"
          ? "sandLight"
          : kind === "deck"
            ? "wood"
            : "sand";
  poly(
    c,
    [
      [0, 17],
      [32, 1],
      [63, 17],
      [32, 33],
    ],
    base,
  );
  const mask = Uint8Array.from(c.data);
  if (kind === "deck") {
    for (let i = -24; i < 60; i += 6) {
      c.line(
        Math.max(0, i),
        17 + Math.max(0, -i) / 2,
        Math.min(63, i + 32),
        Math.max(1, 17 - (i + 32) / 2),
        P.woodDark,
      );
    }
    c.line(1, 18, 32, 34, P.woodDark, 2);
    c.line(32, 34, 63, 18, P.woodDark, 2);
    for (let i = 0; i < 6; i++) {
      const x = 10 + i * 8,
        y = 17 + (x < 32 ? x / 2 : -x / 2 + 32) - 8;
      c.pixel(x, y, P.woodLight);
    }
  } else {
    const colors =
      kind === "grass" ? ["grassLight", "grassShade"] : ["sand", "sandShade"];
    grain(c, [0, 0, 64, 34], colors, SEED + variant * 11, 0.09);
    if (kind === "path")
      for (let i = 0; i < 8; i++) {
        const x = 8 + noise(i, variant, 9) * 48,
          y = 8 + noise(i, variant, 13) * 17;
        if (c.get(Math.round(x), Math.round(y))[3])
          c.rect(x, y, 2, 1, P.sandShade);
      }
  }
  for (let i = 0; i < c.data.length; i += 4)
    if (!mask[i + 3]) c.data.fill(0, i, i + 4);
  return c;
}
export function character(name, dir, frame, walking) {
  const c = new PixelCanvas(48, 72),
    isMira = name === "mira",
    isEllis = name === "ellis",
    isNessa = name === "nessa",
    isTomas = name === "tomas";
  const back = dir === "n",
    side = dir === "e" || dir === "w",
    mirror = dir === "w" ? -1 : 1;
  // Twelve authored contact/passing poses: planted stance, compression, swing.
  const gait = [
    [-1, 0, 0, 1],
    [0, 1, -1, 0],
    [1, 2, -1, -1],
    [2, 1, 0, 0],
    [2, 0, 1, 1],
    [1, 0, 2, 0],
    [0, -1, 2, -1],
    [-1, -2, 1, 0],
    [-2, -1, 0, 1],
    [-2, 0, -1, 0],
    [-2, 0, -2, -1],
    [-1, 0, -1, 0],
  ][frame % 12];
  const step = walking ? gait[0] / 2 : 0,
    bob = walking ? gait[3] : frame === 1 ? -1 : frame === 2 ? 1 : 0;
  const x = 24,
    y = 64,
    skin = isNessa ? P.skinShade : P.skin,
    hair = isMira ? P.auburn : isEllis ? P.wallShade : P.hairDark;
  const shirt = isMira
      ? P.cream
      : isEllis
        ? P.blue
        : isTomas
          ? P.coral
          : P.cream,
    vest = isMira
      ? P.coral
      : isEllis
        ? P.blueDark
        : isNessa
          ? P.blue
          : isTomas
            ? P.woodDark
            : P.teal;
  c.ellipse(26, 65, 10, 3, rgba(P.deep, 72));
  // Shoes and independently planted legs, knees alternate with arms.
  const stride = Math.round(step * 3),
    leftLift = walking ? Math.max(0, gait[1]) : 0,
    rightLift = walking ? Math.max(0, gait[2]) : 0,
    strideX = side ? Math.round(step * 5) * mirror : 0;
  poly(
    c,
    [
      [x - 7, y - 25],
      [x, y - 25],
      [x - 2 + strideX, y - 2 - leftLift],
      [x - 8 + strideX, y - 2 - leftLift],
    ],
    "blueDark",
  );
  poly(
    c,
    [
      [x, y - 25],
      [x + 7, y - 25],
      [x + 8 - strideX, y - 2 - rightLift],
      [x + 2 - strideX, y - 2 - rightLift],
    ],
    "ink",
  );
  c.line(x - 5, y - 21, x - 5 + strideX, y - 5 - leftLift, P.blue);
  c.rect(x - 9 + strideX, y - 3 - leftLift, 8, 3, P.woodDark);
  c.rect(x + 1 - strideX, y - 3 - rightLift, 8, 3, P.woodDark);
  if (isMira) {
    poly(
      c,
      [
        [x - 7, y - 31 + bob],
        [x + 7, y - 31 + bob],
        [x + 11 + stride, y - 13],
        [x - 10 - stride, y - 13],
      ],
      "coralDark",
      "ink",
    );
    poly(
      c,
      [
        [x - 5, y - 30 + bob],
        [x + 6, y - 30 + bob],
        [x + 7 + stride, y - 15],
        [x - 6 - stride, y - 15],
      ],
      "coral",
    );
    c.line(x - 2, y - 29 + bob, x - 2 + stride, y - 15, P.coralLight);
  }
  // Sleeves behind the tailored torso, cuffs/hands articulate in the walk.
  const swing = walking ? Math.round(-step * 3) : frame === 3 ? -3 : 0;
  poly(
    c,
    [
      [x - 7, y - 42 + bob],
      [x - 11, y - 39 + bob],
      [x - 11 + Math.round(swing / 2), y - 31 + bob + swing],
      [x - 7 + Math.round(swing / 2), y - 30 + bob + swing],
    ],
    shirt,
    "woodDark",
  );
  c.rect(x - 10 + Math.round(swing / 2), y - 31 + bob + swing, 4, 7, skin);
  poly(
    c,
    [
      [x + 6, y - 42 + bob],
      [x + 10, y - 39 + bob],
      [x + 11 - Math.round(swing / 2), y - 31 + bob - swing],
      [x + 7 - Math.round(swing / 2), y - 30 + bob - swing],
    ],
    shirt,
    "woodDark",
  );
  c.rect(x + 8 - Math.round(swing / 2), y - 31 + bob - swing, 4, 7, skin);
  poly(
    c,
    [
      [x - 7, y - 43 + bob],
      [x + 6, y - 43 + bob],
      [x + 5, y - 30 + bob],
      [x + 6, y - 23 + bob],
      [x - 6, y - 23 + bob],
      [x - 5, y - 30 + bob],
    ],
    vest,
    "ink",
  );
  if (!isMira) c.rect(x - 6, y - 25 + bob, 13, 2, P.woodDark);
  c.line(
    x - 5,
    y - 42 + bob,
    x - 5,
    y - 26 + bob,
    isMira ? P.coralLight : P.blueLight,
  );
  if (!back) {
    poly(
      c,
      [
        [x - 4, y - 43 + bob],
        [x, y - 38 + bob],
        [x + 3, y - 43 + bob],
      ],
      "cream",
    );
    c.line(x, y - 36 + bob, x, y - 25 + bob, P.woodDark);
    c.pixel(x + 1, y - 32 + bob, P.gold);
  } else c.line(x - 3, y - 40 + bob, x + 5, y - 30 + bob, P.woodDark, 2);
  // Head: adult proportions, neck and directional face; never mirror lettering/satchel.
  c.rect(x - 2, y - 47 + bob, 5, 6, skin);
  poly(
    c,
    [
      [x - 6, y - 56 + bob],
      [x - 4, y - 60 + bob],
      [x + 4, y - 60 + bob],
      [x + 7, y - 56 + bob],
      [x + 7, y - 49 + bob],
      [x + 3, y - 44 + bob],
      [x - 3, y - 45 + bob],
      [x - 6, y - 49 + bob],
    ],
    skin,
    "hairDark",
  );
  c.rect(x - 6, y - 57 + bob, 13, 5, hair);
  c.rect(x - 4, y - 60 + bob, 9, 3, hair);
  if (back) c.rect(x - 5, y - 54 + bob, 12, isMira ? 12 : 7, hair);
  else if (side) {
    const face = x + mirror * 6;
    c.rect(x - mirror * 4 - 2, y - 54 + bob, 5, 8, hair);
    if (!walking && frame === 2)
      c.line(face - mirror * 2, y - 52 + bob, face, y - 52 + bob, P.skinShade);
    else c.pixel(face - mirror, y - 52 + bob, P.ink);
    c.pixel(face + mirror, y - 50 + bob, P.skinLight);
    c.pixel(face, y - 47 + bob, P.skinShade);
  } else {
    c.rect(x - 6, y - 54 + bob, 2, isMira ? 11 : 6, hair);
    c.rect(x + 6, y - 54 + bob, isMira ? 3 : 1, isMira ? 11 : 5, hair);
    if (!walking && frame === 2) {
      c.line(x - 3, y - 52 + bob, x - 1, y - 52 + bob, P.skinShade);
      c.line(x + 3, y - 52 + bob, x + 5, y - 52 + bob, P.skinShade);
    } else {
      c.pixel(x - 2, y - 52 + bob, P.ink);
      c.pixel(x + 4, y - 52 + bob, P.ink);
    }
    c.pixel(x + 1, y - 50 + bob, P.skinLight);
    c.line(x, y - 47 + bob, x + 2, y - 47 + bob, P.skinShade);
  }
  if (isMira) {
    c.line(x - 4, y - 57 + bob, x + 3, y - 58 + bob, P.auburnLight);
    c.line(x - 7, y - 38 + bob, x + 7, y - 23 + bob, P.woodDark, 2);
    c.rect(x + 6, y - 25 + bob, 8, 9, P.blueDark);
    c.rect(x + 7, y - 25 + bob, 6, 3, P.blue);
    c.pixel(x + 10, y - 21 + bob, P.gold);
  }
  if (isNessa) {
    c.rect(x - 5, y - 54 + bob, 12, 2, P.gold);
    c.ellipse(x - 5, y - 57 + bob, 3, 3, P.hairDark);
    poly(
      c,
      [
        [x - 6, y - 31 + bob],
        [x + 6, y - 31 + bob],
        [x + 8, y - 13],
        [x - 8, y - 13],
      ],
      "blueDark",
    );
    c.line(x - 4, y - 29 + bob, x - 4, y - 15, P.blueLight);
  }
  if (isTomas && !back) {
    c.line(x - 3, y - 46 + bob, x + 4, y - 46 + bob, P.hairDark);
    c.rect(x - 5, y - 31 + bob, 11, 15, P.blueDark);
    c.line(x - 5, y - 31 + bob, x + 5, y - 31 + bob, P.woodLight);
  }
  if (isEllis) {
    c.rect(x - 8, y - 58 + bob, 17, 4, P.blueDark);
    c.rect(x - 6, y - 62 + bob, 12, 5, P.blue);
    c.rect(x - 2, y - 61 + bob, 5, 2, P.gold);
  }
  return c;
}
// Dedicated hands-together rod grip, feet stay planted on the shared anchor.
export function fishing(dir, frame) {
  const c = character("rowan", dir, 0, false),
    left = dir === "w" || dir === "n",
    hand = left ? 16 : 32;
  c.line(24, 29, hand, 37, P.cream, 4);
  c.line(24, 33, hand, 37, P.teal, 2);
  c.rect(hand - 2, 35, 5, 4, P.skin);
  c.line(hand, 38, hand + (left ? -10 : 10), 21 - frame, P.woodDark, 2);
  c.pixel(hand + (left ? -10 : 10), 21 - frame, P.gold);
  return c;
}
export function seated(name, dir, frame) {
  const original = character(name, dir, frame, false),
    c = new PixelCanvas(48, 72);
  c.ellipse(25, 65, 10, 3, rgba(P.deep, 72));
  for (let y = 0; y < 44; y++)
    for (let x = 0; x < 48; x++) {
      const a = original.get(x, y);
      if (a[3] === 255) c.pixel(x, y + 12, a);
    }
  c.rect(18, 53, 14, 6, name === "mira" ? P.coral : P.blueDark);
  c.rect(17, 57, 6, 5, P.blueDark);
  c.rect(28, 57, 6, 5, P.ink);
  c.rect(15, 61, 9, 3, P.woodDark);
  c.rect(28, 61, 9, 3, P.woodDark);
  if (name === "mira" && dir !== "n") {
    c.poly(
      [
        [18, 52],
        [31, 52],
        [34, 58],
        [20, 58],
      ],
      P.cream,
      P.sandShade,
    );
    c.line(23, 54, 29, 55, P.blue);
    c.line(17, 51 + frame, 27, 55, P.woodDark);
  }
  return c;
}
export function house(kind = "shop") {
  const c = new PixelCanvas(160, 200),
    roof = kind === "cafe" ? "blue" : kind === "hut" ? "wood" : "coral";
  c.poly(
    [
      [20, 141],
      [80, 111],
      [150, 156],
      [115, 182],
      [78, 179],
    ],
    rgba(P.deep, 72),
  );
  poly(
    c,
    [
      [20, 141],
      [80, 111],
      [140, 141],
      [80, 171],
    ],
    "woodDark",
    "ink",
  );
  // Plaster walls form a consistent 2:1 projection, with a timber foundation.
  poly(
    c,
    [
      [22, 75],
      [80, 104],
      [80, 167],
      [22, 138],
    ],
    kind === "hut" ? "wood" : "cream",
    "woodDark",
  );
  poly(
    c,
    [
      [80, 104],
      [136, 76],
      [136, 139],
      [80, 167],
    ],
    kind === "hut" ? "woodDark" : "wallShade",
    "woodDark",
  );
  c.line(24, 135, 78, 162, P.plaster, 3);
  c.line(82, 163, 133, 137, P.woodDark, 3);
  for (let i = 0; i < 9; i++) {
    const xx = 27 + i * 6;
    c.pixel(xx, 140 + (xx - 22) * 0.49, P.woodLight);
  }
  // Offset roof slopes, ridge and individual handmade terracotta/shingle marks.
  poly(
    c,
    [
      [13, 73],
      [73, 43],
      [143, 72],
      [80, 107],
    ],
    roof === "blue" ? "blueDark" : roof === "wood" ? "woodDark" : "coralDark",
    "ink",
  );
  poly(
    c,
    [
      [13, 70],
      [72, 19],
      [83, 73],
      [80, 101],
    ],
    roof,
    "woodDark",
  );
  poly(
    c,
    [
      [72, 19],
      [143, 69],
      [80, 101],
    ],
    roof === "blue" ? "blueDark" : roof === "wood" ? "woodDark" : "coralDark",
    "woodDark",
  );
  c.line(72, 19, 143, 69, roof === "blue" ? P.blueLight : P.coralLight, 2);
  for (let row = 0; row < 7; row++) {
    const yy = 32 + row * 8,
      left = 72 - (yy - 19) * 1.14,
      right = 80;
    c.line(
      left,
      yy,
      right,
      yy + 22,
      roof === "blue" ? P.blueLight : P.coralLight,
    );
    for (let col = 0; col < 7; col++) {
      const xx = left + col * 9 + (row % 2 ? 4 : 0);
      if (xx < right)
        c.line(
          xx,
          yy + (xx - left) * 0.27,
          xx - 3,
          yy + 6 + (xx - left) * 0.27,
          roof === "blue" ? P.blueDark : P.coralDark,
        );
    }
    c.line(
      87 + row * 6,
      36 + row * 5,
      137 - row * 6,
      70 + row * 3,
      roof === "blue" ? P.blue : P.coral,
    );
  }
  // Dormer, chimney, shutters and a glowing window, all at the same pixel scale.
  poly(
    c,
    [
      [40, 60],
      [53, 43],
      [64, 65],
      [52, 72],
    ],
    "woodDark",
    "ink",
  );
  poly(
    c,
    [
      [43, 61],
      [53, 50],
      [61, 65],
      [52, 69],
    ],
    "cream",
  );
  c.rect(50, 57, 5, 9, P.blueDark);
  c.pixel(51, 58, P.gold);
  poly(
    c,
    [
      [102, 40],
      [111, 35],
      [118, 39],
      [109, 45],
    ],
    "plaster",
    "woodDark",
  );
  poly(
    c,
    [
      [102, 40],
      [109, 45],
      [109, 62],
      [102, 57],
    ],
    "cream",
  );
  poly(
    c,
    [
      [109, 45],
      [118, 39],
      [118, 56],
      [109, 62],
    ],
    "wallShade",
  );
  // Front door on the sunlit left plane.
  poly(
    c,
    [
      [47, 98],
      [62, 106],
      [62, 157],
      [47, 149],
    ],
    "blueDark",
    "woodDark",
  );
  poly(
    c,
    [
      [50, 102],
      [59, 107],
      [59, 116],
      [50, 111],
    ],
    "gold",
  );
  c.pixel(58, 146, P.cream);
  for (const wx of [29, 102, 121]) {
    const left = wx < 80,
      yy = left ? 90 + (wx - 29) * 0.5 : 110 - (wx - 102) * 0.5;
    poly(
      c,
      [
        [wx, yy],
        [wx + 10, yy + (left ? 5 : -5)],
        [wx + 10, yy + 16 + (left ? 5 : -5)],
        [wx, yy + 16],
      ],
      "blueDark",
      "woodDark",
    );
    c.line(wx + 4, yy + 2, wx + 4, yy + 13, P.gold);
    c.line(wx + 1, yy + 8, wx + 9, yy + 8 + (left ? 4 : -4), P.plaster);
    c.line(wx - 3, yy - 1, wx - 3, yy + 15, P.blue, 2);
    c.line(
      wx + 12,
      yy + (left ? 5 : -5),
      wx + 12,
      yy + 19 + (left ? 0 : -9),
      P.blue,
      2,
    );
  }
  // A striped canvas awning and readable original signboard.
  if (["shop", "cafe"].includes(kind)) {
    poly(
      c,
      [
        [18, 103],
        [70, 129],
        [70, 117],
        [18, 91],
      ],
      "woodDark",
    );
    for (let i = 0; i < 8; i++)
      poly(
        c,
        [
          [18 + i * 6, 91 + i * 3],
          [24 + i * 6, 94 + i * 3],
          [26 + i * 6, 108 + i * 3],
          [20 + i * 6, 105 + i * 3],
        ],
        i % 2 ? "cream" : roof,
      );
    c.line(22, 110, 22, 157, P.woodDark, 2);
    c.line(70, 134, 70, 175, P.woodDark, 2);
    c.rect(54, 83, 36, 13, P.woodDark);
    c.rect(56, 85, 32, 9, P.cream);
    lettering(c, kind === "cafe" ? "CAFE" : "POST", 58, 86, P.blueDark);
  } else if (kind === "hut")
    for (let y = 91; y < 128; y += 7) c.line(25, y, 76, y + 25, P.woodLight);
  return c;
}
export function tree(frame = 0) {
  const c = new PixelCanvas(96, 128);
  c.ellipse(55, 114, 33, 10, rgba(P.deep, 72));
  poly(
    c,
    [
      [44, 111],
      [46, 53],
      [55, 43],
      [57, 111],
      [53, 116],
    ],
    "woodDark",
    "ink",
  );
  c.line(48, 108, 50, 58, P.woodLight, 2);
  c.line(49, 77, 29, 57, P.woodDark, 4);
  c.line(52, 69, 71, 43, P.woodDark, 3);
  const sway = frame % 2;
  const clusters = [
    [31, 45, 20, 23],
    [57, 29, 24, 24],
    [70, 55, 18, 22],
    [42, 65, 29, 23],
    [20, 65, 14, 16],
  ];
  for (const [x, y, rx, ry] of clusters) {
    c.ellipse(x + sway, y, rx, ry, P.leafDark);
    c.ellipse(x - 2 + sway, y - 4, rx - 3, ry - 4, P.leaf);
    c.ellipse(x - 7 + sway, y - 9, rx - 9, ry - 10, P.leafLight);
  }
  grain(c, [5, 8, 82, 75], ["leafDark", "leafLight"], SEED, 0.02);
  for (let i = 0; i < 12; i++) {
    const x = 15 + noise(i, 2) * 60,
      y = 22 + noise(i, 6) * 57;
    if (c.get(Math.round(x), Math.round(y))[3] === 255)
      c.rect(x, y, 2, 2, P.gold);
  }
  return c;
}
export function prop(kind) {
  const c = new PixelCanvas(64, 80);
  c.ellipse(36, 68, 22, 6, rgba(P.deep, 72));
  if (kind === "tidepool") {
    c.ellipse(32, 65, 27, 10, P.blueDark);
    c.ellipse(31, 63, 24, 8, P.wallShade);
    c.ellipse(32, 62, 20, 6, P.teal);
    c.ellipse(31, 61, 16, 4, P.teal);
    c.line(20, 61, 30, 59, P.foam);
    c.line(35, 64, 42, 63, P.blueLight);
    for (const [x, y] of [
      [9, 63],
      [18, 56],
      [48, 61],
      [41, 69],
    ]) {
      c.ellipse(x, y, 5, 3, P.blueDark);
      c.line(x - 3, y - 2, x + 2, y - 2, P.plaster);
    }
    c.line(28, 65, 25, 61, P.leafDark);
    c.line(28, 65, 29, 60, P.leafDark);
    c.pixel(36, 60, P.coral);
    c.pixel(37, 61, P.coralLight);
  }
  if (kind === "rock") {
    poly(
      c,
      [
        [8, 59],
        [16, 43],
        [35, 38],
        [50, 47],
        [56, 62],
        [36, 71],
        [15, 67],
      ],
      "blueDark",
      "ink",
    );
    poly(
      c,
      [
        [8, 59],
        [16, 43],
        [35, 38],
        [30, 58],
      ],
      "wallShade",
    );
    poly(
      c,
      [
        [16, 43],
        [35, 38],
        [50, 47],
        [30, 58],
      ],
      "plaster",
    );
    c.line(19, 48, 28, 46, P.sandLight);
    c.line(37, 59, 45, 53, P.blue);
  }
  if (kind === "pot") {
    poly(
      c,
      [
        [20, 49],
        [44, 49],
        [40, 70],
        [24, 70],
      ],
      "coralDark",
      "woodDark",
    );
    c.rect(20, 48, 25, 5, P.coral);
    c.line(25, 55, 27, 66, P.coralLight, 2);
    for (let i = 0; i < 7; i++) {
      const x = 24 + (i % 3) * 7,
        y = 39 - (i % 2) * 10;
      c.line(32, 50, x, y, P.leafDark, 2);
      c.ellipse(x, y, 5, 4, P.leaf);
      c.rect(x - 2, y - 2, 4, 3, i % 2 ? P.coralLight : P.lavender);
    }
  }
  if (kind === "crate") {
    poly(
      c,
      [
        [14, 51],
        [33, 41],
        [52, 51],
        [32, 62],
      ],
      "woodLight",
      "woodDark",
    );
    poly(
      c,
      [
        [14, 51],
        [32, 62],
        [32, 75],
        [14, 64],
      ],
      "wood",
      "woodDark",
    );
    poly(
      c,
      [
        [32, 62],
        [52, 51],
        [52, 65],
        [32, 75],
      ],
      "woodDark",
      "ink",
    );
    for (let i = 0; i < 3; i++)
      c.line(16, 54 + i * 4, 30, 61 + i * 4, P.woodLight);
    c.line(17, 54, 30, 71, P.woodDark, 2);
    c.line(34, 65, 49, 57, P.woodLight, 2);
  }
  if (kind === "lamp") {
    c.ellipse(32, 69, 7, 3, P.woodDark);
    c.rect(31, 22, 3, 47, P.woodDark);
    c.rect(27, 19, 12, 13, P.gold);
    c.rect(25, 18, 16, 3, P.ink);
    c.rect(27, 32, 12, 3, P.ink);
    c.line(29, 21, 29, 31, P.cream);
    c.line(37, 20, 37, 32, P.woodDark);
    poly(
      c,
      [
        [24, 18],
        [33, 11],
        [42, 18],
      ],
      "blueDark",
    );
  }
  if (kind === "bollard") {
    poly(
      c,
      [
        [23, 58],
        [35, 52],
        [43, 57],
        [33, 63],
      ],
      "woodLight",
      "woodDark",
    );
    poly(
      c,
      [
        [23, 58],
        [33, 63],
        [33, 72],
        [23, 67],
      ],
      "woodDark",
    );
    poly(
      c,
      [
        [33, 63],
        [43, 57],
        [43, 66],
        [33, 72],
      ],
      "wood",
    );
    c.line(18, 66, 47, 60, P.sandLight, 2);
    c.line(19, 69, 45, 63, P.sandShade);
  }
  if (kind === "bench") {
    poly(
      c,
      [
        [10, 54],
        [34, 42],
        [55, 53],
        [31, 65],
      ],
      "woodLight",
      "woodDark",
    );
    for (let i = 0; i < 3; i++)
      c.line(12, 54 - i * 4, 35, 42 - i * 4, P.wood, 3);
    c.line(12, 43, 12, 70, P.woodDark, 2);
    c.line(33, 32, 33, 58, P.woodDark, 2);
    c.line(52, 54, 52, 69, P.woodDark, 2);
    c.line(31, 65, 31, 77, P.woodDark, 2);
  }
  if (kind === "sign" || kind.startsWith("sign-")) {
    c.rect(30, 35, 4, 37, P.woodDark);
    c.rect(12, 29, 42, 20, P.woodDark);
    c.rect(14, 31, 38, 16, P.cream);
    lettering(
      c,
      kind.includes("-") ? kind.split("-")[1].toUpperCase() : "HOME",
      16,
      35,
      P.blueDark,
    );
    c.rect(16, 44, 21, 1, P.coral);
  }
  if (kind === "net") {
    for (let i = 0; i < 9; i++) {
      c.line(7 + i * 5, 58, 25 + i * 3, 75, P.sandShade);
      c.line(7 + i * 5, 58, 10 + i * 3, 74, P.woodLight);
    }
    c.line(6, 58, 54, 58, P.woodDark, 2);
    for (let i = 0; i < 6; i++) c.ellipse(9 + i * 8, 58, 2, 2, P.coral);
  }
  const grounded = new PixelCanvas(64, 80);
  grounded.ellipse(36, 68, 22, 6, rgba(P.deep, 72));
  let bottom = 0;
  for (let y = 0; y < 80; y++)
    for (let x = 0; x < 64; x++)
      if (c.get(x, y)[3] === 255) bottom = Math.max(bottom, y);
  for (let y = 0; y < 80; y++)
    for (let x = 0; x < 64; x++) {
      const color = c.get(x, y);
      if (color[3] === 255) grounded.pixel(x, y + 68 - bottom, color);
    }
  return grounded;
}
export function boat(direction, frame = 0) {
  const c = new PixelCanvas(128, 144),
    a = (direction * Math.PI) / 4;
  const world = (f, r, h = 0) => {
    const x = Math.sin(a) * f + Math.cos(a) * r,
      z = -Math.cos(a) * f + Math.sin(a) * r;
    return [64 + (x - z) * 2.1, 106 + (x + z) * 1.05 - h];
  };
  const hull = WORLD.boatHull.points.map(([f, r]) => [f / 0.525, r / 0.525]),
    points = hull.map(([f, r]) => world(f, r));
  // Soft water footprint; the actual animated wake is a separate ripple sprite.
  c.ellipse(65, 109, 46, 15, rgba(P.deep, 72));
  poly(
    c,
    points.map(([x, y]) => [x, y + 6]),
    "blueDark",
    "ink",
  );
  poly(c, points, "cream", "woodDark");
  poly(
    c,
    hull.map(([f, r]) => world(f * 0.88, r * 0.73, 1)),
    "woodLight",
  );
  for (let f = -10; f < 9; f += 4) {
    const p = world(f, -4, 2),
      q = world(f, 4, 2);
    c.line(...p, ...q, P.wood);
  }
  const stern = world(-12, 0, 5),
    bow = world(11, 0, 5);
  c.line(...stern, ...bow, P.cream, 2);
  const base = world(-1, 0, 2),
    top = world(-1, 0, 88);
  c.line(...base, ...top, P.woodDark, 2);
  c.line(top[0] - 1, top[1], base[0] - 1, base[1], P.woodLight);
  const sailTip = world(11, 0, 18 + (frame % 2)),
    sailBase = world(-1, 0, 15);
  poly(
    c,
    [[top[0] + 2, top[1] + 4], sailTip, [sailBase[0] + 2, sailBase[1]]],
    "cream",
    "sandShade",
  );
  c.line(top[0] + 4, top[1] + 12, sailTip[0] - 3, sailTip[1] - 2, P.sandLight);
  c.line(...top, ...world(13, 0, 3), P.sandShade);
  const cabin = world(-8, 0, 15);
  c.rect(cabin[0] - 9, cabin[1] - 7, 17, 15, P.plaster);
  c.rect(cabin[0] - 10, cabin[1] - 10, 19, 4, P.blueDark);
  c.rect(cabin[0] - 6, cabin[1] - 4, 6, 5, P.blueDark);
  c.rect(cabin[0] + 2, cabin[1] - 4, 4, 5, P.blue);
  c.rect(top[0], top[1] - 3, 10, 4, P.coral);
  c.rect(top[0] + 8, top[1] - 2, 4, 2, P.coralLight);
  const coil = world(-12, -2, 3);
  c.ellipse(...coil, 4, 2, P.sandShade);
  c.ellipse(...coil, 2, 1, P.woodDark);
  return c;
}
export function gull(frame = 0) {
  const c = new PixelCanvas(32, 24),
    dy = [0, -3, 0, 3][frame % 4];
  c.line(15, 12, 5, 9 + dy, P.cream, 2);
  c.line(16, 12, 26, 9 + dy, P.cream, 2);
  c.rect(14, 11, 5, 3, P.sandLight);
  c.pixel(19, 12, P.coral);
  return c;
}
export function glint(frame = 0) {
  const c = new PixelCanvas(24, 16),
    r = [1, 3, 5, 3][frame % 4];
  c.line(12 - r, 8, 12 + r, 8, P.foam);
  if (frame % 4 === 2) c.line(12, 5, 12, 11, P.glint);
  return c;
}
export function fishingHut() {
  const c = new PixelCanvas(128, 176);
  c.poly(
    [
      [16, 128],
      [64, 104],
      [120, 131],
      [87, 160],
      [64, 154],
    ],
    rgba(P.deep, 72),
  );
  poly(
    c,
    [
      [16, 128],
      [64, 104],
      [112, 128],
      [64, 152],
    ],
    "woodDark",
    "ink",
  );
  poly(
    c,
    [
      [18, 72],
      [64, 95],
      [64, 149],
      [18, 126],
    ],
    "wood",
    "woodDark",
  );
  poly(
    c,
    [
      [64, 95],
      [110, 72],
      [110, 126],
      [64, 149],
    ],
    "woodDark",
    "ink",
  );
  for (let y = 81; y < 126; y += 6) {
    c.line(19, y, 62, y + 22, P.woodLight);
    c.line(66, y + 23, 109, y + 1, P.wood);
  }
  poly(
    c,
    [
      [12, 68],
      [51, 27],
      [117, 66],
      [65, 97],
    ],
    "blueDark",
    "ink",
  );
  poly(
    c,
    [
      [12, 68],
      [51, 27],
      [65, 97],
    ],
    "blue",
    "woodDark",
  );
  c.line(51, 27, 117, 66, P.blueLight, 2);
  for (let i = 0; i < 6; i++) {
    c.line(46 - i * 5, 36 + i * 6, 64, 51 + i * 7, P.blueLight);
    c.line(61 + i * 6, 35 + i * 4, 111 - i * 6, 68 + i * 3, P.blue);
  }
  poly(
    c,
    [
      [35, 91],
      [50, 99],
      [50, 142],
      [35, 134],
    ],
    "blueDark",
    "ink",
  );
  poly(
    c,
    [
      [38, 97],
      [47, 102],
      [47, 114],
      [38, 110],
    ],
    "gold",
  );
  c.pixel(47, 130, P.cream);
  poly(
    c,
    [
      [82, 100],
      [97, 92],
      [97, 111],
      [82, 119],
    ],
    "blueDark",
    "woodLight",
  );
  c.line(89, 98, 89, 114, P.woodLight);
  c.line(83, 110, 96, 103, P.woodLight);
  c.line(74, 125, 105, 109, P.sandShade, 2);
  for (let i = 0; i < 6; i++)
    c.line(76 + i * 5, 124 - i * 3, 82 + i * 3, 137 - i * 2, P.sandShade);
  c.rect(50, 83, 27, 11, P.woodDark);
  lettering(c, "NETS", 52, 85, P.cream);
  return c;
}
export function arch() {
  const c = new PixelCanvas(192, 160);
  c.ellipse(108, 143, 77, 10, rgba(P.deep, 72));
  const shape = [
    [21, 138],
    [20, 98],
    [26, 63],
    [48, 34],
    [76, 20],
    [112, 22],
    [140, 42],
    [158, 77],
    [160, 124],
    [149, 139],
    [128, 142],
    [128, 93],
    [117, 68],
    [101, 57],
    [80, 55],
    [61, 69],
    [49, 91],
    [48, 138],
  ];
  c.poly(
    shape.map(([x, y]) => [x + 10, y + 4]),
    P.blueDark,
  );
  poly(c, shape, "plaster", "blueDark");
  poly(
    c,
    [
      [21, 137],
      [20, 98],
      [26, 63],
      [47, 35],
      [50, 53],
      [37, 78],
      [35, 116],
      [36, 138],
    ],
    "sandLight",
  );
  c.line(49, 35, 78, 24, P.cream, 3);
  c.line(78, 24, 111, 27, P.cream, 3);
  c.line(112, 29, 137, 46, P.sandLight, 3);
  for (let i = 0; i < 7; i++) {
    c.line(
      29 + i * 17,
      68 - Math.sin((i / 6) * Math.PI) * 36,
      35 + i * 16,
      86 - Math.sin((i / 6) * Math.PI) * 27,
      P.sandShade,
    );
  }
  c.line(137, 90, 140, 122, P.wallShade, 2);
  c.line(24, 108, 37, 106, P.sandShade);
  c.line(130, 126, 153, 119, P.sandShade);
  return c;
}
export function fish(species, frame = 0) {
  const c = new PixelCanvas(40, 32),
    bream = species === "bream";
  c.ellipse(
    20,
    17,
    bream ? 12 : 13,
    bream ? 8 : 4,
    bream ? P.gold : P.blueLight,
  );
  c.ellipse(
    18,
    15,
    bream ? 8 : 10,
    bream ? 5 : 2,
    bream ? P.sandLight : P.foam,
  );
  poly(
    c,
    [
      [29, 17],
      [38, 11 + frame],
      [36, 23 - frame],
    ],
    bream ? "coral" : "blue",
  );
  c.pixel(11, 15, P.ink);
  c.line(16, 19, 23, 19, bream ? P.coral : P.blue);
  return c;
}
export function youngRowan() {
  const c = new PixelCanvas(32, 48);
  c.ellipse(17, 43, 9, 3, rgba(P.deep, 72));
  c.rect(12, 33, 5, 9, P.blueDark);
  c.rect(19, 33, 4, 9, P.ink);
  c.rect(11, 41, 7, 3, P.woodDark);
  c.rect(19, 41, 7, 3, P.woodDark);
  poly(
    c,
    [
      [11, 22],
      [21, 22],
      [24, 35],
      [10, 35],
    ],
    "blue",
    "blueDark",
  );
  c.rect(8, 24, 4, 12, P.skin);
  c.rect(22, 24, 4, 12, P.skin);
  c.rect(13, 18, 7, 6, P.skin);
  c.ellipse(16, 15, 7, 8, P.skin);
  c.rect(10, 8, 12, 5, P.hairDark);
  c.rect(9, 12, 3, 7, P.hairDark);
  c.pixel(16, 15, P.ink);
  c.pixel(20, 15, P.ink);
  c.rect(12, 26, 11, 6, P.sandLight);
  return c;
}
