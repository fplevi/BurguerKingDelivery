// Code-generated noise and textures for the Camadas (ADR 0001: no downloaded images).
//
// Everything is deterministic (seeded), so the burger looks the same on every load.
// Canvases are generated once per page and cached; each build() wraps them in its own
// CanvasTexture, so every stage (one WebGL context each) uploads its own copy.
import { CanvasTexture, SRGBColorSpace, RepeatWrapping } from 'three';

/** Small seeded PRNG (mulberry32). */
export function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (x, y, z, seed) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647) ^ Math.imul(seed, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/** 3D value noise in [0, 1]. `period` (integer) makes x and y tile, for seamless textures. */
export function noise(x, y, z = 0, seed = 0, period = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const wrap = (v) => (period ? ((v % period) + period) % period : v);
  const corner = (dx, dy, dz) => hash(wrap(xi + dx), wrap(yi + dy), zi + dz, seed);
  return lerp(
    lerp(lerp(corner(0, 0, 0), corner(1, 0, 0), xf), lerp(corner(0, 1, 0), corner(1, 1, 0), xf), yf),
    lerp(lerp(corner(0, 0, 1), corner(1, 0, 1), xf), lerp(corner(0, 1, 1), corner(1, 1, 1), xf), yf),
    zf,
  );
}

/** Fractal noise in roughly [0, 1]: `octaves` layers of value noise, each twice as fine. */
export function fbm(x, y, z = 0, { octaves = 4, seed = 0, period = 0 } = {}) {
  let sum = 0, amplitude = 0.5, total = 0, frequency = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amplitude * noise(x * frequency, y * frequency, z * frequency, seed + i * 17, period * frequency);
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum / total;
}

const cache = new Map();

/**
 * Tileable fractal noise precomputed on a res × res grid, read back with bilinear filtering.
 * Evaluating fbm for every texture pixel is too slow on a phone; a small periodic field
 * sampled at any scale (it wraps seamlessly) is nearly free.
 */
function field(res, cycles, octaves, seed) {
  const key = `field:${res}:${cycles}:${octaves}:${seed}`;
  if (!cache.has(key)) {
    const data = new Float32Array(res * res);
    for (let y = 0; y < res; y++)
      for (let x = 0; x < res; x++)
        data[y * res + x] = fbm((x / res) * cycles, (y / res) * cycles, 0, { octaves, seed, period: cycles });
    cache.set(key, data);
  }
  const data = cache.get(key);
  return (u, v) => {
    const fx = u * res - 0.5, fy = v * res - 0.5;
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const tx = fx - x0, ty = fy - y0;
    const xa = ((x0 % res) + res) % res, xb = (xa + 1) % res;
    const ya = (((y0 % res) + res) % res) * res, yb = ((ya / res + 1) % res) * res;
    const top = data[ya + xa] + (data[ya + xb] - data[ya + xa]) * tx;
    const bottom = data[yb + xa] + (data[yb + xb] - data[yb + xa]) * tx;
    return top + (bottom - top) * ty;
  };
}

/**
 * Paints one or more same-sized canvases in a single pass. fn(u, v, out) fills `out`
 * with one [r, g, b] triple (0..255) per canvas, flat: [r0, g0, b0, r1, g1, b1, ...].
 */
function paintAll(contexts, size, fn) {
  const images = contexts.map((ctx) => ctx.createImageData(size, size));
  const pixels = images.map((image) => image.data);
  const out = new Float32Array(contexts.length * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      fn(x / size, y / size, out);
      const i = (y * size + x) * 4;
      for (let k = 0; k < pixels.length; k++) {
        const data = pixels[k];
        data[i] = out[k * 3]; data[i + 1] = out[k * 3 + 1]; data[i + 2] = out[k * 3 + 2]; data[i + 3] = 255;
      }
    }
  }
  contexts.forEach((ctx, k) => ctx.putImageData(images[k], 0, 0));
}

/** Draws a set of canvases together once (by key) and returns them. */
function canvases(key, count, size, draw) {
  if (!cache.has(key)) {
    const list = Array.from({ length: count }, () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      return c;
    });
    draw(list.map((c) => c.getContext('2d')), size);
    cache.set(key, list);
  }
  return cache.get(key);
}

function texture(source, { color = false } = {}) {
  const t = new CanvasTexture(source);
  if (color) t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const blend = (a, b, t) => a + (b - a) * t;

/** Fine tileable grain for the bun crust bump: tiny pores and dimples. Repeats over the bun. */
export function crustBump() {
  const [c] = canvases('crust-bump', 1, 256, ([ctx], size) => {
    const fine = field(128, 16, 3, 3);
    paintAll([ctx], size, (u, v, out) => {
      out[0] = out[1] = out[2] = 128 + (fine(u, v) - 0.5) * 200;
    });
  });
  const t = texture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/**
 * Cut face of the bottom bun (miolo), seen from above when the burger is opened:
 * lightly toasted golden crumb with open pores, darker toasted rim. Planar UV over the disc.
 */
export function crumb() {
  const [colour, bump] = canvases('crumb', 2, 512, (contexts, size) => {
    const toastField = field(64, 5, 4, 11);
    const fineField = field(128, 16, 2, 12);
    paintAll(contexts, size, (u, v, out) => {
      const r = Math.hypot(u - 0.5, v - 0.5) * 2;
      const toast = clamp01((toastField(u, v) - 0.3) * 2);
      const fine = fineField(u * 2.5, v * 2.5);
      const rim = clamp01((r - 0.86) * 7);
      // Pale crumb, golden where the griddle toasted it, darker towards the crust.
      const shade = 0.95 + fine * 0.1;
      out[0] = blend(blend(236, 206, toast), 168, rim) * shade;
      out[1] = blend(blend(200, 138, toast), 94, rim) * shade;
      out[2] = blend(blend(136, 62, toast), 40, rim) * shade;
      out[3] = out[4] = out[5] = 150 + (fine - 0.5) * 120;
    });
    // Pores: small irregular holes, shadowed inside, at the same spots in both maps.
    const rnd = random(21);
    const [ctxColour, ctxBump] = contexts;
    for (let i = 0; i < 900; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 0.46;
      const x = (0.5 + Math.cos(a) * d) * size, y = (0.5 + Math.sin(a) * d) * size;
      const w = (0.8 + rnd() * 3) * (size / 512), h = w * (0.4 + rnd() * 0.6);
      const turn = rnd() * Math.PI, tone = rnd();
      for (const [ctx, fill] of [
        [ctxColour, `rgba(${140 + tone * 40},${88 + tone * 30},40,0.4)`],
        [ctxBump, 'rgba(30,30,30,0.9)'],
      ]) {
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, turn, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      }
    }
  });
  return { map: texture(colour, { color: true }), bumpMap: texture(bump) };
}

/**
 * Flame-grilled patty seen from above (planar UV over the disc): coarse ground-beef grain,
 * dark seared edge, broken char-broiler marks and a few glistening fat specks.
 * Returns colour, roughness and bump maps that share the same features.
 */
export function grilledMeat() {
  const [colour, rough, bump] = canvases('meat', 3, 512, (contexts, size) => {
    const grainField = field(128, 16, 2, 31);
    const clumpField = field(64, 7, 3, 32);
    const wobbleField = field(64, 7, 2, 41);
    const brokenField = field(64, 8, 3, 42);
    const widthField = field(64, 12, 2, 43);
    const cos = Math.cos(0.52), sin = Math.sin(0.52); // marks run at ~30°
    paintAll(contexts, size, (u, v, out) => {
      const r = Math.hypot(u - 0.5, v - 0.5) * 2;
      const grain = grainField(u * 4.4, v * 4.4);
      const clumps = clumpField(u * 2, v * 2);
      const sear = clamp01((r - 0.7) * 3.2) * (0.7 + clumps * 0.6);
      // Parallel char marks, wavy, of varying width and broken up.
      const across = u * cos + v * sin + (wobbleField(u, v) - 0.5) * 0.06;
      const stripe = Math.abs(((across * 9) % 1) - 0.5) * 2; // 0 at the centre of a mark
      const width = 0.2 + widthField(u, v) * 0.12;
      const char = clamp01((width - stripe) / 0.1) * clamp01((brokenField(u, v) - 0.3) * 3.5);
      const fat = grain > 0.74 && clumps > 0.5 ? clamp01((grain - 0.74) * 4) : 0;

      const meat = clamp01(clumps * 1.4 - 0.2), shade = 0.72 + grain * 0.5;
      const k = char * 0.92;
      out[0] = blend(blend(blend(92, 122, meat) * shade, 52, sear), 30, k);
      out[1] = blend(blend(blend(50, 70, meat) * shade, 27, sear), 16, k);
      out[2] = blend(blend(blend(30, 42, meat) * shade, 16, sear), 10, k);
      out[0] = blend(out[0], 168, fat); out[1] = blend(out[1], 112, fat); out[2] = blend(out[2], 70, fat);
      out[3] = out[4] = out[5] = 255 * clamp01(0.62 + char * 0.3 - fat * 0.5 + (grain - 0.5) * 0.2);
      out[6] = out[7] = out[8] = 255 * clamp01(0.5 + (grain - 0.5) * 0.9 + (clumps - 0.5) * 0.6 - char * 0.25);
    });
  });
  return { map: texture(colour, { color: true }), roughnessMap: texture(rough), bumpMap: texture(bump) };
}

/** Soft round contact shadow, used as an alphaMap (white = opaque). */
export const contactShadow = () =>
  texture(
    canvases('contact-shadow', 1, 128, ([ctx], size) => {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, '#fff');
      g.addColorStop(0.45, '#aaa');
      g.addColorStop(0.75, '#333');
      g.addColorStop(1, '#000');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    })[0],
  );
