import { PNG } from "pngjs";
export function rgba(hex, alpha = 255) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    alpha,
  ];
}
export function noise(x, y, seed = 17) {
  let n = Math.imul(x + seed, 374761393) ^ Math.imul(y - seed, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
export class PixelCanvas {
  constructor(w, h) {
    this.width = w;
    this.height = h;
    this.data = new Uint8Array(w * h * 4);
  }
  pixel(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const c = typeof color === "string" ? rgba(color) : color;
    this.data.set(c, (y * this.width + x) * 4);
  }
  get(x, y) {
    return [
      ...this.data.slice(
        (y * this.width + x) * 4,
        (y * this.width + x) * 4 + 4,
      ),
    ];
  }
  rect(x, y, w, h, c) {
    for (let yy = Math.round(y); yy < Math.round(y + h); yy++)
      for (let xx = Math.round(x); xx < Math.round(x + w); xx++)
        this.pixel(xx, yy, c);
  }
  line(x0, y0, x1, y1, c, width = 1) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    let dx = Math.abs(x1 - x0),
      sx = x0 < x1 ? 1 : -1,
      dy = -Math.abs(y1 - y0),
      sy = y0 < y1 ? 1 : -1,
      e = dx + dy;
    for (;;) {
      this.rect(x0, y0, width, width, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) {
        e += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        e += dx;
        y0 += sy;
      }
    }
  }
  poly(points, c, outline) {
    const min = Math.floor(Math.min(...points.map((p) => p[1]))),
      max = Math.ceil(Math.max(...points.map((p) => p[1])));
    for (let y = min; y <= max; y++) {
      const xs = [];
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [a, b] = points[i],
          [d, e] = points[j];
        if (b > y + 0.5 !== e > y + 0.5)
          xs.push(a + ((y + 0.5 - b) * (d - a)) / (e - b));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i < xs.length; i += 2)
        for (let x = Math.ceil(xs[i] - 0.5); x < xs[i + 1] - 0.5; x++)
          this.pixel(x, y, c);
    }
    if (outline)
      for (let i = 0; i < points.length; i++)
        this.line(...points[i], ...points[(i + 1) % points.length], outline);
  }
  ellipse(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1)
          this.pixel(x, y, c);
  }
  blit(other, x, y) {
    for (let yy = 0; yy < other.height; yy++)
      for (let xx = 0; xx < other.width; xx++) {
        const c = other.get(xx, yy);
        if (c[3]) this.pixel(x + xx, y + yy, c);
      }
  }
  stipple(x, y, w, h, colors, seed = 17, density = 0.16) {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++)
        if (noise(xx, yy, seed) < density) {
          const old = this.get(xx, yy);
          if (old[3])
            this.pixel(
              xx,
              yy,
              colors[Math.floor(noise(xx, yy, seed + 13) * colors.length)],
            );
        }
  }
  png() {
    return PNG.sync.write(
      { width: this.width, height: this.height, data: Buffer.from(this.data) },
      { filterType: 4 },
    );
  }
}
// Original five-pixel lettering for signs; no downloaded font.
const glyphs = {
  G:["01111","10000","10000","10111","10001","10001","01110"],
  K:["10001","10010","10100","11000","10100","10010","10001"],
  V:["10001","10001","10001","10001","10001","01010","00100"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
};
export function lettering(canvas, text, x, y, color) {
  for (const letter of text) {
    const g = glyphs[letter];
    if (g) {
      for (let yy = 0; yy < g.length; yy++)
        for (let xx = 0; xx < g[yy].length; xx++)
          if (g[yy][xx] === "1") canvas.pixel(x + xx, y + yy, color);
      x += g[0].length + 1;
    } else x += 4;
  }
}
