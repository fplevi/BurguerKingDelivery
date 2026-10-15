// Code-generated textures for the Camadas (ADR 0001: no downloaded images).
//
// The recipes (texture-recipes.js) are painted once per page, in workers, while the page
// builds the geometry and compiles the shaders (budget, ticket 11). Each texture function
// returns at once: its canvases are filled when the worker is done, and `texturesReady`
// tells the scene when it can draw. Without workers, everything is painted here instead.
// Every build() wraps the shared canvases in its own CanvasTexture, so every stage (one
// WebGL context each) uploads its own copy.
import { CanvasTexture, SRGBColorSpace, RepeatWrapping } from 'three';
import { recipes, paint } from './texture-recipes.js';

export { random, noise, fbm } from './noise.js';

const keys = Object.keys(recipes);
const canvases = {}; // key -> the canvases the textures read
const textures = new Map(); // canvas -> CanvasTextures wrapping it, re-uploaded once painted

for (const key of keys) {
  const { count, size } = recipes[key];
  canvases[key] = Array.from({ length: count }, () => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    return c;
  });
}

function fill(key, sources) {
  canvases[key].forEach((c, i) => {
    c.getContext('2d').drawImage(sources[i], 0, 0);
    sources[i].close?.();
    for (const t of textures.get(c) ?? []) t.needsUpdate = true;
  });
}

const paintHere = (key) => fill(key, paint(key, (size) => Object.assign(document.createElement('canvas'), { width: size, height: size })));

/** Resolves once every recipe has been painted into its canvases. */
export const texturesReady = new Promise((resolve) => {
  const pending = new Set(keys);
  const done = (key) => {
    pending.delete(key);
    if (!pending.size) resolve();
  };
  // Two workers, about the same work each (the 512 px, multi-map recipes are the heavy ones).
  const shares = [
    ['meat', 'lettuce', 'pickle', 'contact-shadow'],
    ['crumb', 'tomato', 'crust-bump', 'fried-onion', 'bacon', 'breading'],
  ];
  try {
    if (typeof OffscreenCanvas === 'undefined') throw new Error('no OffscreenCanvas');
    for (const share of shares) {
      const worker = new Worker(new URL('./texture-worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data: { key, bitmaps } }) => {
        fill(key, bitmaps);
        done(key);
        if (share.every((k) => !pending.has(k))) worker.terminate();
      };
      // A worker that fails: its remaining recipes are painted here.
      worker.onerror = () => {
        worker.terminate();
        for (const key of share) if (pending.has(key)) (paintHere(key), done(key));
      };
      worker.postMessage({ keys: share });
    }
  } catch {
    for (const key of keys) if (pending.has(key)) (paintHere(key), done(key));
  }
});

function texture(source, { color = false } = {}) {
  const t = new CanvasTexture(source);
  if (color) t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  if (!textures.has(source)) textures.set(source, new Set());
  textures.get(source).add(t);
  t.addEventListener('dispose', () => textures.get(source).delete(t));
  return t;
}

/** Fine tileable grain for the bun crust bump. Repeats over the bun. */
export function crustBump() {
  const t = texture(canvases['crust-bump'][0]);
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** Cut face of the bottom bun (miolo): colour and bump. */
export function crumb() {
  const [colour, bump] = canvases.crumb;
  return { map: texture(colour, { color: true }), bumpMap: texture(bump) };
}

/** Flame-grilled patty seen from above: colour, roughness and bump. */
export function grilledMeat() {
  const [colour, rough, bump] = canvases.meat;
  return { map: texture(colour, { color: true }), roughnessMap: texture(rough), bumpMap: texture(bump) };
}

/** Soft round contact shadow, used as an alphaMap (white = opaque). */
export const contactShadow = () => texture(canvases['contact-shadow'][0]);

/** Tomato slice seen from above: colour, bump and roughness. */
export function tomatoSlice() {
  const [colour, bump, rough] = canvases.tomato;
  return { map: texture(colour, { color: true }), bumpMap: texture(bump), roughnessMap: texture(rough) };
}

/** Crinkle-cut pickle slice from above: colour and bump. */
export function pickleSlice() {
  const [colour, bump] = canvases.pickle;
  return { map: texture(colour, { color: true }), bumpMap: texture(bump) };
}

/** Lettuce leaf from above: colour and bump. */
export function lettuceLeaf() {
  const [colour, bump] = canvases.lettuce;
  return { map: texture(colour, { color: true }), bumpMap: texture(bump) };
}

/** Fried onion bits from above (cebola crispy): colour and bump. */
export function friedOnion() {
  const [colour, bump] = canvases['fried-onion'];
  return { map: texture(colour, { color: true }), bumpMap: texture(bump) };
}

/** Bacon strip, flat (u along the strip, tiling): colour, bump and roughness. */
export function baconStrip() {
  const [colour, bump, rough] = canvases.bacon;
  const maps = { map: texture(colour, { color: true }), bumpMap: texture(bump), roughnessMap: texture(rough) };
  for (const t of Object.values(maps)) t.wrapS = RepeatWrapping;
  return maps;
}

/** Breaded onion ring crust (u along the ring, v around its section, tiling): colour and bump. */
export function breading() {
  const [colour, bump] = canvases.breading;
  const maps = { map: texture(colour, { color: true }), bumpMap: texture(bump) };
  for (const t of Object.values(maps)) t.wrapS = t.wrapT = RepeatWrapping;
  return maps;
}
