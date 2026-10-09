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

/** Ellipse helper for the 2D slice drawings (centre, radii, turn, fill). */
function blot(ctx, x, y, rx, ry, turn, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), turn, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Multiplies a canvas by fine noise, so flat fills read as organic surfaces. */
function grain(ctx, size, f, amount, seed) {
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const k = 1 + (f((x / size) * 3, (y / size) * 3) - 0.5) * amount;
      const i = (y * size + x) * 4;
      data[i] *= k; data[i + 1] *= k; data[i + 2] *= k;
    }
  ctx.putImageData(image, 0, 0);
}

/**
 * Tomato slice seen from above (planar UV over the disc): thin skin, red wall, four
 * locules of glossy gel with seeds, pale core and septa. Colour, bump and roughness.
 */
export function tomatoSlice() {
  const [colour, bump, rough] = canvases('tomato', 3, 512, ([c, b, r], size) => {
    const mid = size / 2, R = size / 2;
    const rnd = random(77);
    const locules = Array.from({ length: 4 }, (_, i) => ({ a: (i / 4) * Math.PI * 2 + (rnd() - 0.5) * 0.3, span: 1.05 + rnd() * 0.25 }));
    const draw = (ctx, { skin, wall, gel, core, septa, seed }) => {
      ctx.fillStyle = skin; ctx.fillRect(0, 0, size, size);
      blot(ctx, mid, mid, R * 0.955, R * 0.955, 0, wall);
      for (const { a, span } of locules) {
        ctx.beginPath();
        ctx.arc(mid, mid, R * 0.74, a - span / 2, a + span / 2);
        ctx.arc(mid, mid, R * 0.2, a + span / 2 - 0.15, a - span / 2 + 0.15, true);
        ctx.closePath();
        ctx.fillStyle = gel(a);
        ctx.fill();
      }
      blot(ctx, mid, mid, R * 0.2, R * 0.2, 0, core);
      ctx.strokeStyle = septa; ctx.lineWidth = R * 0.03;
      for (const { a, span } of locules) {
        ctx.beginPath();
        ctx.moveTo(mid + Math.cos(a + span / 2 + 0.2) * R * 0.18, mid + Math.sin(a + span / 2 + 0.2) * R * 0.18);
        ctx.lineTo(mid + Math.cos(a + span / 2 + 0.2) * R * 0.76, mid + Math.sin(a + span / 2 + 0.2) * R * 0.76);
        ctx.stroke();
      }
      const seeds = random(78);
      for (const { a, span } of locules)
        for (let i = 0; i < 9; i++) {
          const t = a + (seeds() - 0.5) * span * 0.8, d = R * (0.3 + seeds() * 0.36);
          blot(ctx, mid + Math.cos(t) * d, mid + Math.sin(t) * d, R * 0.035, R * 0.022, t + 1.4 + (seeds() - 0.5), seed);
        }
    };
    const glossy = (a) => {
      const g = c.createRadialGradient(mid, mid, R * 0.2, mid, mid, R * 0.74);
      g.addColorStop(0, '#f39a55'); g.addColorStop(0.6, '#ee6a36'); g.addColorStop(1, '#e24a28');
      return g;
    };
    draw(c, { skin: '#a8160c', wall: '#d9301b', gel: glossy, core: '#f0866a', septa: '#ec7a5e', seed: '#f2dfa0' });
    grain(c, size, field(64, 8, 3, 79), 0.25);
    draw(b, { skin: '#c0c0c0', wall: '#c8c8c8', gel: () => '#6a6a6a', core: '#b0b0b0', septa: '#c8c8c8', seed: '#e0e0e0' });
    draw(r, { skin: '#808080', wall: '#909090', gel: () => '#202020', core: '#707070', septa: '#808080', seed: '#606060' });
  });
  return { map: texture(colour, { color: true }), bumpMap: texture(bump), roughnessMap: texture(rough) };
}

/**
 * Crinkle-cut pickle slice from above: dark green skin, translucent yellow-green flesh,
 * a ring of pale seeds and a lighter core. Colour and bump (the crinkle ridges).
 */
export function pickleSlice() {
  const [colour, bump] = canvases('pickle', 2, 256, ([c, b], size) => {
    const mid = size / 2, R = size / 2;
    const rnd = random(91);
    const skin = c.createRadialGradient(mid, mid, R * 0.82, mid, mid, R);
    skin.addColorStop(0, '#5f7a1e'); skin.addColorStop(1, '#2f4710');
    c.fillStyle = skin; c.fillRect(0, 0, size, size);
    const flesh = c.createRadialGradient(mid, mid, 0, mid, mid, R * 0.86);
    flesh.addColorStop(0, '#d2d47e'); flesh.addColorStop(0.55, '#b4b955'); flesh.addColorStop(1, '#8c9a33');
    blot(c, mid, mid, R * 0.86, R * 0.86, 0, flesh);
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + (rnd() - 0.5) * 0.3, d = R * (0.36 + rnd() * 0.12);
      blot(c, mid + Math.cos(a) * d, mid + Math.sin(a) * d, R * 0.09, R * 0.045, a, 'rgba(236,232,170,0.85)');
    }
    grain(c, size, field(64, 8, 3, 92), 0.3);
    // Bump: parallel crinkle ridges, faded at the skin.
    const image = b.createImageData(size, size);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const g = 128 + Math.sin((x / size) * Math.PI * 2 * 9) * 90;
        const i = (y * size + x) * 4;
        image.data[i] = image.data[i + 1] = image.data[i + 2] = g;
        image.data[i + 3] = 255;
      }
    b.putImageData(image, 0, 0);
  });
  return { map: texture(colour, { color: true }), bumpMap: texture(bump) };
}

/**
 * Lettuce leaf from above (planar UV): pale ribs running out from the centre and branching,
 * deeper green towards the frilly edge, mottled. Colour and bump (raised veins).
 */
export function lettuceLeaf() {
  const [colour, bump] = canvases('lettuce', 2, 512, ([c, b], size) => {
    const mid = size / 2, R = size / 2;
    const base = c.createRadialGradient(mid, mid, 0, mid, mid, R);
    base.addColorStop(0, '#c9df7e'); base.addColorStop(0.45, '#8cc246'); base.addColorStop(1, '#3f8a22');
    c.fillStyle = base; c.fillRect(0, 0, size, size);
    b.fillStyle = '#808080'; b.fillRect(0, 0, size, size);
    // Same seed for both maps, so the raised veins sit under the pale ones.
    const vein = (ctx, rnd, x, y, a, length, width, colour, depth) => {
      ctx.strokeStyle = colour; ctx.lineCap = 'round';
      let px = x, py = y;
      for (let s = 0; s < 12; s++) {
        a += (rnd() - 0.5) * 0.18;
        const nx = px + (Math.cos(a) * length) / 12, ny = py + (Math.sin(a) * length) / 12;
        ctx.lineWidth = width * (1 - s / 14);
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny); ctx.stroke();
        if (depth < 2 && s % 3 === 2) vein(ctx, rnd, nx, ny, a + (rnd() < 0.5 ? -0.8 : 0.8), length * 0.35, width * 0.45, colour, depth + 1);
        px = nx; py = ny;
      }
    };
    for (const [ctx, col] of [[c, 'rgba(222,236,168,0.4)'], [b, 'rgba(225,225,225,0.8)']]) {
      const rnd = random(61);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + (rnd() - 0.5) * 0.4;
        vein(ctx, rnd, mid + Math.cos(a) * R * 0.06, mid + Math.sin(a) * R * 0.06, a, R * 0.92, R * 0.035, col, 0);
      }
    }
    grain(c, size, field(64, 6, 4, 62), 0.35);
  });
  return { map: texture(colour, { color: true }), bumpMap: texture(bump) };
}
