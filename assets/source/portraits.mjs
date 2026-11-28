import { PixelCanvas } from "../../tools/pixel-canvas.mjs";
import P from "./palette.json" with { type: "json" };
const poly = (c, points, fill) => c.poly(points, P[fill] ?? fill);
/** Original 3/4 busts, authored at portrait resolution; never enlarged actors. */
export function portrait(name = "mira", expression = "neutral", blink = 0) {
  const c = new PixelCanvas(96, 128),
    m = name === "mira",
    n = name === "nessa",
    e = name === "ellis",
    t = name === "tomas";
  const skin = n ? P.skinShade : P.skin,
    hair = m ? P.auburn : e ? P.wallShade : P.hairDark,
    coat = m ? P.coral : n ? P.blue : e ? P.blueDark : t ? P.woodDark : P.teal;
  // Silhouette: wind-lifted hair behind neck, sloping shoulders, tailored clothing.
  const outer = m
    ? [
        [23, 53],
        [19, 31],
        [25, 12],
        [40, 4],
        [59, 6],
        [73, 18],
        [77, 43],
        [70, 74],
        [59, 82],
        [31, 77],
      ]
    : n
      ? [
          [22, 52],
          [20, 29],
          [28, 10],
          [45, 5],
          [66, 13],
          [74, 33],
          [70, 62],
          [58, 70],
          [28, 64],
        ]
      : t
        ? [
            [20, 50],
            [18, 27],
            [24, 9],
            [45, 3],
            [66, 9],
            [76, 27],
            [76, 51],
            [65, 64],
            [29, 64],
          ]
        : e
          ? [
              [24, 49],
              [23, 25],
              [31, 11],
              [58, 9],
              [70, 26],
              [71, 49],
              [62, 64],
              [32, 64],
            ]
          : [
              [23, 48],
              [21, 24],
              [32, 7],
              [53, 4],
              [70, 16],
              [73, 44],
              [65, 57],
              [31, 58],
            ];
  poly(c, outer, "ink");
  poly(
    c,
    outer.map(([x, y]) => [48 + (x - 48) * 0.9, 36 + (y - 36) * 0.91]),
    hair,
  );
  poly(
    c,
    [
      [13, 128],
      [12, 103],
      [22, 89],
      [35, 83],
      [60, 84],
      [79, 95],
      [88, 128],
    ],
    "ink",
  );
  poly(
    c,
    [
      [15, 128],
      [16, 104],
      [25, 93],
      [37, 88],
      [59, 88],
      [76, 99],
      [83, 128],
    ],
    m ? "cream" : t ? "coral" : "cream",
  );
  c.rect(39, 69, 18, 22, skin);
  poly(
    c,
    [
      [40, 70],
      [57, 68],
      [56, 82],
      [45, 88],
      [39, 83],
    ],
    "skinShade",
  );
  poly(
    c,
    [
      [25, 96],
      [38, 87],
      [48, 96],
      [60, 86],
      [75, 99],
      [75, 128],
      [21, 128],
    ],
    coat,
  );
  poly(
    c,
    [
      [36, 85],
      [47, 94],
      [42, 104],
      [31, 93],
    ],
    "cream",
  );
  poly(
    c,
    [
      [59, 85],
      [48, 94],
      [54, 105],
      [66, 93],
    ],
    "sandLight",
  );
  c.line(47, 100, 48, 127, P.woodDark, 2);
  c.rect(50, 108, 2, 2, P.gold);
  c.rect(50, 120, 2, 2, P.gold);
  if (m) {
    c.line(65, 91, 35, 128, P.blueDark, 6);
    c.line(65, 91, 35, 128, P.blueLight, 2);
    c.rect(21, 120, 17, 8, P.blueDark);
  }
  // Fixed face anatomy and consistent complexion across all expressions.
  const face = m
    ? [
        [31, 27],
        [42, 18],
        [58, 20],
        [68, 30],
        [69, 49],
        [63, 66],
        [53, 77],
        [43, 76],
        [33, 66],
        [27, 48],
      ]
    : t
      ? [
          [27, 25],
          [42, 17],
          [60, 19],
          [72, 29],
          [72, 51],
          [66, 69],
          [54, 78],
          [39, 75],
          [28, 62],
          [24, 44],
        ]
      : n
        ? [
            [31, 26],
            [44, 18],
            [60, 22],
            [69, 33],
            [66, 54],
            [62, 67],
            [51, 74],
            [40, 70],
            [31, 58],
            [27, 42],
          ]
        : e
          ? [
              [33, 25],
              [45, 18],
              [60, 23],
              [68, 33],
              [68, 53],
              [61, 72],
              [51, 79],
              [40, 73],
              [32, 59],
              [29, 43],
            ]
          : [
              [30, 26],
              [43, 17],
              [60, 20],
              [69, 32],
              [69, 52],
              [62, 69],
              [52, 76],
              [40, 74],
              [31, 60],
              [27, 43],
            ];
  poly(c, face, "woodDark");
  poly(
    c,
    face.map(([x, y]) => [48 + (x - 48) * 0.89, 47 + (y - 47) * 0.91]),
    skin,
  );
  poly(
    c,
    [
      [33, 29],
      [44, 23],
      [54, 25],
      [57, 41],
      [53, 60],
      [45, 66],
      [36, 58],
      [31, 46],
    ],
    "skinLight",
  );
  c.ellipse(29, 47, 4, 7, skin);
  c.line(29, 45, 29, 50, P.skinShade);
  poly(
    c,
    [
      [51, 44],
      [54, 52],
      [51, 56],
      [55, 57],
      [58, 54],
      [55, 51],
    ],
    "skinShade",
  );
  c.line(54, 45, 55, 51, P.skinLight);
  // Brows and eyes carry authored emotions, no random swaps or emoji overlay.
  const happy = expression === "happy",
    thought = expression === "thoughtful",
    surprise = expression === "surprised";
  c.line(35, 35 + (thought ? 1 : 0), 44, 34 - (surprise ? 3 : 0), hair, 2);
  c.line(56, 34 - (surprise ? 3 : 0), 63, 36 - (thought ? 3 : 0), hair, 2);
  for (const [x, y] of [
    [39, 43],
    [60, 43],
  ]) {
    if (blink) {
      c.line(x - 4, y, x + 3, y, P.hairDark, 2);
    } else if (happy) {
      c.line(x - 4, y, x, y - 2, P.hairDark, 2);
      c.line(x, y - 2, x + 3, y, P.hairDark, 2);
    } else {
      c.ellipse(x, y, surprise ? 4 : 4, surprise ? 5 : 3, P.cream);
      c.rect(x, y - 2, 3, surprise ? 7 : 5, P.blueDark);
      c.pixel(x + 1, y - 2, P.glint);
      c.line(x - 4, y - 3, x + 3, y - 3, P.hairDark);
    }
  }
  c.line(35, 54, 39, 55, P.coralLight, 2);
  c.line(60, 55, 63, 53, P.coralLight);
  if (surprise) c.ellipse(49, 64, 3, 4, P.coralDark);
  else if (happy) {
    c.line(43, 62, 48, 65, P.coralDark, 2);
    c.line(48, 65, 55, 61, P.coralDark, 2);
    c.line(46, 63, 52, 63, P.cream);
  } else if (thought) c.line(45, 65, 52, 64, P.coralDark);
  else {
    c.line(44, 63, 50, 64, P.coralDark);
    c.line(50, 64, 54, 62, P.coralDark);
    c.line(45, 66, 51, 66, P.skinLight);
  }
  // Character-specific locks, hairlines and accessories preserve world identity.
  poly(
    c,
    [
      [25, 32],
      [29, 16],
      [43, 9],
      [59, 11],
      [69, 23],
      [66, 33],
      [59, 27],
      [50, 23],
      [44, 29],
      [37, 26],
      [32, 35],
    ],
    hair,
  );
  c.line(29, 24, 37, 16, m ? P.auburnLight : P.hair, 3);
  c.line(37, 16, 49, 14, m ? P.auburnLight : P.hair, 2);
  if (m) {
    poly(
      c,
      [
        [24, 32],
        [30, 35],
        [31, 57],
        [36, 65],
        [33, 73],
        [25, 66],
        [22, 48],
      ],
      "auburn",
    );
    c.line(25, 40, 27, 61, P.auburnLight, 2);
    c.rect(28, 53, 2, 4, P.gold);
    poly(
      c,
      [
        [65, 28],
        [71, 34],
        [68, 58],
        [63, 65],
        [62, 59],
      ],
      "auburn",
    );
  }
  if (e) {
    poly(
      c,
      [
        [22, 24],
        [26, 8],
        [58, 3],
        [74, 16],
        [75, 26],
      ],
      "blueDark",
    );
    c.rect(26, 21, 48, 6, P.blue);
    c.line(29, 27, 67, 27, P.gold, 2);
    c.rect(47, 13, 6, 5, P.gold);
    c.line(39, 60, 48, 58, P.wallShade, 2);
    c.line(48, 58, 57, 60, P.wallShade, 2);
  }
  if (e) {
    c.line(33, 51, 39, 53, P.skinShade);
    c.line(60, 54, 65, 51, P.skinShade);
    c.line(39, 68, 43, 71, P.skinShade);
  }
  if (t) {
    for (let x = 25; x < 68; x += 8)
      c.rect(x, 18 - (x % 3) * 2, 6, 7, P.hairDark);
  }
  if (!m && !n && !e && !t) {
    poly(
      c,
      [
        [26, 27],
        [35, 13],
        [56, 12],
        [67, 23],
        [52, 19],
        [37, 30],
      ],
      "hairDark",
    );
    c.line(33, 22, 47, 15, P.hair, 2);
  }
  if (n) {
    c.line(25, 24, 67, 21, P.gold, 4);
    poly(
      c,
      [
        [22, 22],
        [17, 31],
        [15, 59],
        [22, 75],
        [25, 65],
        [22, 48],
      ],
      "hairDark",
    );
  }
  if (t) {
    c.line(37, 65, 45, 73, P.hairDark, 3);
    c.line(45, 73, 55, 70, P.hairDark, 3);
    c.line(55, 70, 60, 63, P.hairDark, 2);
  }
  if (thought) {
    poly(
      c,
      [
        [70, 120],
        [62, 110],
        [61, 92],
        [54, 81],
        [51, 73],
        [55, 70],
        [61, 77],
        [67, 84],
        [69, 106],
        [78, 119],
      ],
      skin,
    );
    c.line(55, 76, 58, 83, P.skinShade);
  }
  return c;
}
