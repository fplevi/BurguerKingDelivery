// Recipes of the code-generated textures (ADR 0001: no downloaded images).
//
// No Three.js and no DOM here: each recipe paints 2D canvases made by `paint`, so the same
// code runs in the texture workers (OffscreenCanvas) and, without workers, on the page.
import { random, fbm } from './noise.js';

/** Radius of the patty faces' disc in its texture atlas (0.5 = the texture's edge); layer-models.js maps to it. */
export const MEAT_FACE_UV = 0.4;

const fields = new Map();

/**
 * Tileable fractal noise precomputed on a res × res grid, read back with bilinear filtering.
 * Evaluating fbm for every texture pixel is too slow on a phone; a small periodic field
 * sampled at any scale (it wraps seamlessly) is nearly free.
 */
function field(res, cycles, octaves, seed) {
  const key = `${res}:${cycles}:${octaves}:${seed}`;
  if (!fields.has(key)) {
    const data = new Float32Array(res * res);
    for (let y = 0; y < res; y++)
      for (let x = 0; x < res; x++)
        data[y * res + x] = fbm((x / res) * cycles, (y / res) * cycles, 0, { octaves, seed, period: cycles });
    fields.set(key, data);
  }
  const data = fields.get(key);
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

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const blend = (a, b, t) => a + (b - a) * t;

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
 * Each recipe: how many same-sized canvases (`count`, side `size`) and how to paint them.
 * The order of the canvases is the order textures.js wraps them in.
 */
export const recipes = {
  /** Fine tileable grain for the bun crust bump: tiny pores and dimples. Repeats over the bun. */
  'crust-bump': {
    count: 1,
    size: 256,
    draw([ctx], size) {
      const fine = field(128, 16, 3, 3);
      paintAll([ctx], size, (u, v, out) => {
        out[0] = out[1] = out[2] = 128 + (fine(u, v) - 0.5) * 200;
      });
    },
  },

  /**
   * Cut face of the bottom bun (miolo), seen from above when the burger is opened:
   * lightly toasted golden crumb with open pores, darker toasted rim. Planar UV over the disc.
   * Colour, bump.
   */
  crumb: {
    count: 2,
    size: 512,
    draw(contexts, size) {
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
    },
  },

  /**
   * Flame-grilled patty, an atlas (ticket 14): both faces map to the middle disc (radius
   * MEAT_FACE_UV), the side to the ring around it, from the top edge (inner) to the bottom
   * edge (outer). Faces: coarse ground-beef grain with crumbs, seared towards the edge,
   * broken char-broiler marks and glistening fat specks. Side: a toasted-brown crust, darker
   * on its lumps and paler in the recesses (never black), toasted bands along both edges and
   * the marks of both faces turning over them. Colour, roughness and bump maps share the same features.
   */
  meat: {
    count: 3,
    size: 512,
    draw(contexts, size) {
      const F = MEAT_FACE_UV;
      const grainField = field(128, 16, 2, 31);
      const crumbField = field(128, 40, 2, 33);
      const clumpField = field(64, 7, 3, 32);
      const wobbleField = field(64, 7, 2, 41);
      const brokenField = field(64, 8, 3, 42);
      const widthField = field(64, 12, 2, 43);
      const crustField = field(64, 10, 3, 44);
      const cos = Math.cos(0.52), sin = Math.sin(0.52); // marks run at ~30°
      /** Char of the marks at a face point (0..1), `phase` shifting them for the other face. */
      const marks = (u, v, phase = 0) => {
        const across = u * cos + v * sin + (wobbleField(u, v) - 0.5) * 0.06 + phase;
        const stripe = Math.abs(((across * 9.8) % 1) - 0.5) * 2; // 0 at the centre of a mark
        const width = 0.2 + widthField(u, v) * 0.12;
        return clamp01((width - stripe) / 0.1) * clamp01((brokenField(u + phase, v) - 0.3) * 3.5);
      };
      paintAll(contexts, size, (u, v, out) => {
        const du = u - 0.5, dv = v - 0.5, ru = Math.hypot(du, dv);
        const grain = grainField(u * 4.4, v * 4.4);
        if (ru > F) {
          // Side: d = 0 at the top edge, 1 at the bottom edge.
          const d = clamp01((ru - F) / (0.5 - F));
          const crust = crustField(u * 3, v * 3);
          const dark = clamp01((crust - 0.55) * 5), pale = clamp01((0.45 - crust) * 5);
          // The marks of each face, read where this column meets it, fade a little way down.
          const rim = F / (ru || 1);
          const char = Math.max(
            marks(0.5 + du * rim, 0.5 + dv * rim) * clamp01((0.5 - d) * 4),
            marks(0.5 + du * rim, 0.5 + dv * rim, 0.37) * clamp01((d - 0.5) * 4),
          );
          // Toasted, irregular bands along both edges, where the grill touched.
          const band = Math.max(clamp01((0.22 - d) * 6), clamp01((d - 0.78) * 6)) * clamp01(0.4 + crust);
          const sear = Math.max(char, band * 0.8);
          const shade = 0.85 + grain * 0.3;
          out[0] = blend(blend(blend(85, 45, dark), 120, pale) * shade, 45, sear);
          out[1] = blend(blend(blend(48, 25, dark), 75, pale) * shade, 25, sear);
          out[2] = blend(blend(blend(28, 15, dark), 45, pale) * shade, 15, sear);
          out[3] = out[4] = out[5] = 255 * clamp01(0.72 + (grain - 0.5) * 0.3 - dark * 0.15);
          out[6] = out[7] = out[8] = 255 * clamp01(0.5 + (crust - 0.5) * 1.4 + (grain - 0.5) * 0.6 - char * 0.2);
          return;
        }
        const r = (ru / F) * 0.87; // as the faces' radius was before the atlas
        const clumps = clumpField(u * 2, v * 2);
        const crumbs = crumbField(u, v);
        const sear = clamp01((r - 0.7) * 3.2) * (0.7 + clumps * 0.6);
        const char = marks(u, v);
        const fat = grain > 0.74 && clumps > 0.5 ? clamp01((grain - 0.74) * 4) : 0;
        const gloss = clamp01((crumbs - 0.72) * 6) * (1 - char);

        const meat = clamp01(clumps * 1.4 - 0.2), shade = 0.64 + grain * 0.5 + (crumbs - 0.5) * 0.3;
        const k = char * 0.92;
        out[0] = blend(blend(blend(80, 108, meat) * shade, 48, sear), 30, k);
        out[1] = blend(blend(blend(43, 61, meat) * shade, 25, sear), 16, k);
        out[2] = blend(blend(blend(26, 37, meat) * shade, 15, sear), 10, k);
        out[0] = blend(out[0], 168, fat); out[1] = blend(out[1], 112, fat); out[2] = blend(out[2], 70, fat);
        out[3] = out[4] = out[5] = 255 * clamp01(0.62 + char * 0.3 - fat * 0.5 - gloss * 0.4 + (grain - 0.5) * 0.2);
        out[6] = out[7] = out[8] = 255 * clamp01(0.5 + (grain - 0.5) * 1.1 + (crumbs - 0.5) * 0.6 + (clumps - 0.5) * 0.6 - char * 0.25);
      });
    },
  },

  /**
   * Fried onion bits from above (planar UV over the disc), for the cebola crispy: a light,
   * near-neutral crumbly ground (the model's vertex colours give the golden-brown tone)
   * covered in short curled strands, bright where crisp, dark in the gaps between them.
   * Colour and bump share the strands.
   */
  'fried-onion': {
    count: 2,
    size: 256,
    draw([c, b], size) {
      const coarse = field(64, 8, 3, 111);
      const fine = field(64, 24, 2, 112);
      paintAll([c, b], size, (u, v, out) => {
        const g = coarse(u, v), f = fine(u, v);
        const shade = 0.72 + g * 0.3 + (f - 0.5) * 0.25;
        out[0] = 236 * shade; out[1] = 206 * shade; out[2] = 166 * shade;
        out[3] = out[4] = out[5] = 70 + g * 60 + (f - 0.5) * 80;
      });
      const rnd = random(113);
      for (let i = 0; i < 520; i++) {
        const x = rnd() * size, y = rnd() * size;
        const radius = (3 + rnd() * 7) * (size / 256), a0 = rnd() * Math.PI * 2, span = 0.8 + rnd() * 2.2;
        const width = (1.2 + rnd() * 1.8) * (size / 256);
        const tone = rnd();
        for (const [ctx, stroke, extra] of [
          [c, `rgba(${tone < 0.3 ? '96,58,28' : tone < 0.75 ? '250,226,186' : '255,240,210'},0.85)`, 0],
          [b, tone < 0.3 ? 'rgba(40,40,40,0.8)' : 'rgba(235,235,235,0.9)', 0.6],
        ]) {
          ctx.beginPath();
          ctx.arc(x, y, radius, a0, a0 + span);
          ctx.strokeStyle = stroke;
          ctx.lineWidth = width + extra;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }
    },
  },

  /**
   * Breading of the onion rings (Rodeio Duplo): coarse fried breadcrumbs, golden orange, darker
   * where they fried longer, with paler crumb tips catching the light and dark gaps between
   * them. Tiles both ways (u along the ring, v around its section). Colour, bump.
   */
  breading: {
    count: 2,
    size: 256,
    draw(contexts, size) {
      const toastField = field(64, 4, 3, 131);
      const crumbField = field(128, 20, 2, 132);
      paintAll(contexts, size, (u, v, out) => {
        const toast = clamp01((toastField(u, v) - 0.35) * 2.2);
        // The grit is the crumb field again, twice as fine (a whole multiple, so it still tiles).
        const crumb = crumbField(u, v), grit = crumbField(u * 2 + 0.37, v * 2 + 0.61);
        // Crumbs: the highs of the crumb field, separated by darker gaps.
        const tip = clamp01((crumb - 0.5) * 4);
        const gap = clamp01((0.42 - crumb) * 5);
        const shade = (0.9 + tip * 0.22 - gap * 0.3) * (0.94 + grit * 0.12);
        out[0] = blend(244, 196, toast) * shade;
        out[1] = blend(160, 104, toast) * shade;
        out[2] = blend(58, 32, toast) * shade;
        out[3] = out[4] = out[5] = 120 + tip * 90 - gap * 80 + (grit - 0.5) * 60;
      });
      // Loose crumbs on top: small irregular flakes, pale or dark, the same in both maps; drawn
      // again across the edges so the texture tiles without a seam.
      const rnd = random(134);
      const [colour, bump] = contexts;
      for (let i = 0; i < 450; i++) {
        const x = rnd() * size, y = rnd() * size;
        const rx = (1 + rnd() * 3.2) * (size / 256), ry = rx * (0.45 + rnd() * 0.55), turn = rnd() * Math.PI;
        const dark = rnd() < 0.15;
        const fill = dark ? `rgba(120,58,18,0.55)` : `rgba(${246 + rnd() * 9},${178 + rnd() * 34},${78 + rnd() * 30},0.7)`;
        for (const dx of [-size, 0, size])
          for (const dy of [-size, 0, size]) {
            if (x + dx < -8 || x + dx > size + 8 || y + dy < -8 || y + dy > size + 8) continue;
            blot(colour, x + dx, y + dy, rx, ry, turn, fill);
            blot(bump, x + dx, y + dy, rx, ry, turn, dark ? 'rgba(40,40,40,0.6)' : 'rgba(250,250,250,0.75)');
          }
      }
    },
  },

  /**
   * Bacon strip, flat (ticket 02 of the Stacker Duplo Bacon): u runs along the strip (tiles, so
   * each strip reads its own stretch), v across it. Pale fat along one edge and in a thin streak,
   * red-brown lean with fibres along the strip, crinkles across it; fried unevenly, darker in
   * patches and charred along the edges. Colour, bump and roughness share the same features
   * (fat raised and glossier, char matte).
   */
  bacon: {
    count: 3,
    size: 256,
    draw(contexts, size) {
      const wobbleField = field(64, 6, 2, 121);
      const fibreField = field(128, 24, 2, 122);
      const toastField = field(64, 8, 3, 123);
      const streakField = field(64, 5, 2, 124);
      const crinkleField = field(64, 10, 2, 125);
      const CHAR = [70, 26, 12];
      /** 1 at `centre`, fading to 0 `width` away. */
      const band = (v, centre, width) => clamp01(1 - Math.abs(v - centre) / width);
      paintAll(contexts, size, (u, v, out) => {
        // The fat streaks wander across the strip as it goes.
        const w = v + (wobbleField(u, v * 0.3) - 0.5) * 0.16;
        const fat = Math.max(
          clamp01(band(w, 0.16, 0.16) * 2.2 - 0.4),
          clamp01(band(w, 0.62, 0.07) * 2.2 - 0.6) * clamp01((streakField(u, v) - 0.3) * 3),
        );
        const fibre = fibreField(u * 0.5, v * 4);
        const toast = toastField(u, v);
        // Crisp, charred edges (unevenly) and dark fried patches.
        const edge = Math.max(clamp01((0.08 - v) * 14), clamp01((v - 0.9) * 10)) * (0.6 + toast * 0.6);
        const fried = clamp01((toast - 0.52) * 3);
        const char = clamp01(Math.max(edge, fried * 0.75));
        const shade = 0.82 + fibre * 0.36;
        const lean = [blend(172, 116, toast) * shade, blend(50, 32, toast) * shade, blend(28, 16, toast) * shade];
        const pale = [blend(238, 214, toast), blend(196, 150, toast), blend(150, 96, toast)];
        for (let c = 0; c < 3; c++) out[c] = blend(blend(lean[c], pale[c], fat), CHAR[c], char * (1 - fat * 0.4));
        const crinkle = Math.sin((u + (crinkleField(u, v) - 0.5) * 0.08) * Math.PI * 2 * 26);
        out[3] = out[4] = out[5] = 128 + fat * 50 + (fibre - 0.5) * 70 + crinkle * 30 - char * 30;
        out[6] = out[7] = out[8] = 255 * clamp01(0.55 - fat * 0.25 + char * 0.35 + (fibre - 0.5) * 0.15);
      });
    },
  },

  /** Soft round contact shadow, used as an alphaMap (white = opaque). */
  'contact-shadow': {
    count: 1,
    size: 128,
    draw([ctx], size) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, '#fff');
      g.addColorStop(0.45, '#aaa');
      g.addColorStop(0.75, '#333');
      g.addColorStop(1, '#000');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    },
  },

  /**
   * Tomato slice seen from above (planar UV over the disc): thin skin, red wall, four
   * locules of glossy gel with seeds, pale core and septa. Colour, bump and roughness.
   */
  tomato: {
    count: 3,
    size: 512,
    draw([c, b, r], size) {
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
    },
  },

  /**
   * Crinkle-cut pickle slice from above: dark green skin, translucent yellow-green flesh,
   * a ring of pale seeds and a lighter core. Colour and bump (the crinkle ridges).
   */
  pickle: {
    count: 2,
    size: 256,
    draw([c, b], size) {
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
    },
  },

  /**
   * Lettuce leaf from above (planar UV): pale ribs running out from the centre and branching,
   * deeper green towards the frilly edge, mottled. Colour and bump (raised veins).
   */
  lettuce: {
    count: 2,
    size: 512,
    draw([c, b], size) {
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
    },
  },
};

/**
 * Paints one recipe on fresh canvases from `makeCanvas(size)` (OffscreenCanvas in a worker,
 * any 2D-capable canvas on the page) and returns them.
 */
export function paint(key, makeCanvas) {
  const { count, size, draw } = recipes[key];
  const canvases = Array.from({ length: count }, () => makeCanvas(size));
  draw(canvases.map((c) => c.getContext('2d')), size);
  return canvases;
}
