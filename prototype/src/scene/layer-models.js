// Procedural 3D model of each Camada, keyed by model name (each Receita in ../ingredients.js
// names the model of its Camadas; two Camadas may share one).
//
// Contract for every entry:
//   height: thickness of the Camada in scene units (burger radius ≈ 1, i.e. ~6 cm),
//           used to stack the layers when assembled;
//   build(camada): returns a new Object3D whose bottom sits at y = 0 and top at y = height,
//            centred on the y axis. Meshes should cast and receive shadows. `camada` is the
//            Receita's Camada, for a model that varies by Camada (the two cheddars).
//
// Every Camada is modelled procedurally: lathed profiles and polar sheets roughened with
// noise, vertex colours, and textures drawn by code (./textures.js). The Base (tickets
// 04/05) set the look; the others follow the same light and finish (tickets 06/07).
import {
  Group,
  Mesh,
  InstancedMesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  SphereGeometry,
  IcosahedronGeometry,
  TorusGeometry,
  LatheGeometry,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Vector2,
  Vector3,
  Quaternion,
  Matrix4,
  Euler,
  Color,
  SRGBColorSpace,
} from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { fbm, random, crustBump, crumb, grilledMeat, tomatoSlice, pickleSlice, lettuceLeaf, friedOnion } from './textures.js';

function mesh(geometry, mat, y = 0) {
  const m = new Mesh(geometry, mat);
  m.position.y = y;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------------------------------
// Realistic Base

const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};
const mixColor = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

/** Quarter arc of `count` points from angle a0 to a1 (radians) around (cx, cy). */
const arc = (cx, cy, radius, a0, a1, count) =>
  Array.from({ length: count }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / (count - 1);
    return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius];
  });

/**
 * Revolves a profile ([r, y] pairs, bottom centre -> top centre) into a mesh geometry.
 * `shape(x, y, z, j)` returns the displaced vertex (j = profile index); `paint(x, y, z, j)`
 * returns an sRGB colour [0..255] for vertex colours; `uv(x, y, z)` overrides the UVs.
 * Normals are recomputed after displacement and welded across the seam.
 */
function revolve(profile, { segments = 96, shape, paint, uv } = {}) {
  const points = profile.map(([r, y]) => new Vector2(Math.max(r, 0), y));
  const geometry = new LatheGeometry(points, segments);
  const position = geometry.attributes.position;
  const uvs = geometry.attributes.uv;
  const count = position.count;
  const colors = paint ? new Float32Array(count * 3) : null;
  const color = new Color();
  for (let i = 0; i < count; i++) {
    const j = i % points.length;
    let x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    if (shape) [x, y, z] = shape(x, y, z, j);
    position.setXYZ(i, x, y, z);
    if (uv) uvs.setXY(i, ...uv(x, y, z));
    if (colors) {
      const [r, g, b] = paint(x, y, z, j);
      color.setRGB(r / 255, g / 255, b / 255, SRGBColorSpace);
      colors.set([color.r, color.g, color.b], i * 3);
    }
  }
  if (colors) geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  // Weld normals: first and last meridian share positions; poles point straight up/down.
  const normal = geometry.attributes.normal;
  const last = segments * points.length;
  for (let j = 0; j < points.length; j++) {
    const a = j, b = last + j;
    const n = new Vector3(normal.getX(a) + normal.getX(b), normal.getY(a) + normal.getY(b), normal.getZ(a) + normal.getZ(b)).normalize();
    normal.setXYZ(a, n.x, n.y, n.z);
    normal.setXYZ(b, n.x, n.y, n.z);
  }
  for (const j of [0, points.length - 1]) {
    if (points[j].x > 1e-6) continue;
    const up = j === 0 ? -1 : 1;
    for (let s = 0; s <= segments; s++) normal.setXYZ(s * points.length + j, 0, up, 0);
  }
  return geometry;
}

const BUN_RADIUS = 1;

// Pão superior: flattened dome (superellipse) with a slight lip at the cut, glazed crust,
// toasted darker on top, paler near the cut, and sesame seeds on the upper dome.
const TOP_HEIGHT = 0.46;
const TOP_LIP = 0.05; // the dome starts above a rounded lip
const DOME = 2.5; // superellipse exponent: > 2 flattens the top and steepens the sides

/** Dome surface height at a radius fraction (0 centre .. 1 rim), before noise. */
const domeY = (f) => {
  const cos = Math.min(Math.max(f, 0), 1) ** (DOME / 2);
  return TOP_LIP + (TOP_HEIGHT - TOP_LIP) * Math.sin(Math.acos(cos)) ** (2 / DOME);
};
/** Lumps on the dome (vertical, by position) and around the rim (radial, by angle). */
const domeBump = (x, z) =>
  0.016 * (fbm(x * 2.2 + 5, z * 2.2, 0, { octaves: 3, seed: 7 }) - 0.5) * 2 +
  0.005 * (fbm(x * 9, z * 9 + 3, 0, { octaves: 2, seed: 6 }) - 0.5) * 2; // small dimples in the crust
const rimScale = (x, z) => {
  const a = Math.atan2(z, x);
  return 1 + 0.012 * (fbm(Math.cos(a) * 2 + 3, Math.sin(a) * 2, 0, { octaves: 2, seed: 8 }) - 0.5) * 2;
};

function topBun() {
  const R = BUN_RADIUS;
  const profile = [
    ...[0, 0.3, 0.6, 0.85].map((f) => [f * 0.95 * R, 0]),
    ...arc(R - TOP_LIP, TOP_LIP, TOP_LIP, -Math.PI / 2, 0, 6),
  ];
  for (let i = 1; i <= 28; i++) {
    const t = (i / 28) * (Math.PI / 2);
    profile.push([R * Math.cos(t) ** (2 / DOME), TOP_LIP + (TOP_HEIGHT - TOP_LIP) * Math.sin(t) ** (2 / DOME)]);
  }
  const geometry = revolve(profile, {
    shape: (x, y, z) => {
      const s = rimScale(x, z);
      const rise = smoothstep(TOP_LIP, TOP_LIP + 0.15, y);
      return [x * s, y + domeBump(x, z) * rise, z * s];
    },
    paint: (x, y, z) => {
      if (y < 0.004) return [214, 166, 104]; // cut face: toasted crumb
      const h = (y - TOP_LIP) / (TOP_HEIGHT - TOP_LIP);
      // Uneven browning: broad patches (the oven is never even) plus fine speckle.
      const patches = fbm(x * 1.6 + 11, z * 1.6, y * 2, { octaves: 3, seed: 9 });
      const speckle = fbm(x * 8, z * 8 + 4, y * 8, { octaves: 2, seed: 10 });
      let c = mixColor([226, 176, 108], [190, 118, 58], smoothstep(-0.05, 0.3, h)); // pale band at the cut
      c = mixColor(c, [152, 86, 38], smoothstep(0.35, 1, h) * 0.8); // toasted crown
      c = mixColor(c, [118, 64, 28], smoothstep(0.5, 0.75, patches) * (0.4 + 0.6 * smoothstep(0.1, 0.6, h)));
      c = mixColor(c, [232, 186, 120], smoothstep(0.55, 0.3, patches) * (1 - smoothstep(0.2, 0.7, h)) * 0.5);
      return c.map((v) => v * (0.9 + speckle * 0.2));
    },
  });
  const crust = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.7,
    clearcoat: 0.3, // thin egg-wash glaze: a soft sheen, not a lacquer
    clearcoatRoughness: 0.6,
    bumpMap: crustBump(),
    bumpScale: 1.1,
  });
  crust.bumpMap.repeat.set(6, 3);
  const group = new Group();
  group.add(mesh(geometry, crust));
  group.add(sesame(R));
  return group;
}

/** Sesame seeds scattered on the upper dome, lying on the crust. */
function sesame(R) {
  const count = 150;
  const rnd = random(2024);
  const seed = new SphereGeometry(1, 10, 6);
  const mat = new MeshStandardMaterial({ color: '#f1dcaa', roughness: 0.5 });
  const seeds = new InstancedMesh(seed, mat, count);
  seeds.receiveShadow = true;
  const up = new Vector3(0, 1, 0), normal = new Vector3(), q = new Quaternion(), spin = new Quaternion();
  const m = new Matrix4(), scale = new Vector3(), at = new Vector3();
  const tint = new Color();
  for (let i = 0; i < count; i++) {
    // Golden-angle spiral with jitter, denser towards the top like a real bun.
    const f = Math.min(Math.sqrt((i + 0.5) / count) * 0.84 + (rnd() - 0.5) * 0.05, 0.86);
    const a = i * 2.39996 + (rnd() - 0.5) * 0.6;
    let x = Math.cos(a) * f * R, z = Math.sin(a) * f * R;
    const y = domeY(f) + domeBump(x, z);
    const s = rimScale(x, z);
    x *= s; z *= s;
    // Surface normal from the dome slope.
    const e = 0.01;
    const slope = (domeY(f + e) - domeY(f - e)) / (2 * e * R);
    normal.set(-slope * Math.cos(a), 1, -slope * Math.sin(a)).normalize();
    q.setFromUnitVectors(up, normal);
    spin.setFromAxisAngle(up, rnd() * Math.PI);
    q.multiply(spin);
    const size = 0.85 + rnd() * 0.3;
    scale.set(0.028 * size, 0.008, 0.016 * size);
    at.set(x, y + 0.003, z).addScaledVector(normal, 0.002);
    seeds.setMatrixAt(i, m.compose(at, q, scale));
    seeds.setColorAt(i, tint.set('#f1dcaa').offsetHSL(0, 0, (rnd() - 0.6) * 0.12));
  }
  return seeds;
}

// Pão inferior: low heel with rounded edges; the cut face shows the toasted crumb (miolo).
const BOTTOM_HEIGHT = 0.28;

function bottomBun() {
  const R = BUN_RADIUS;
  const H = BOTTOM_HEIGHT;
  const rim = 0.05;
  const profile = [
    ...[0, 0.4, 0.75].map((f) => [f * (R - 0.09), 0]),
    ...arc(R - 0.09, 0.09, 0.09, -Math.PI / 2, 0, 7),
    [R * 1.004, H * 0.55],
    ...arc(R - rim, H - rim, rim, 0, Math.PI / 2, 6),
  ];
  const crustGeometry = revolve(profile, {
    shape: (x, y, z) => {
      // Slightly uneven side wall, as the dough rose unevenly.
      const a = Math.atan2(z, x);
      const wall = 0.012 * (fbm(Math.cos(a) * 3, Math.sin(a) * 3, y * 6, { octaves: 2, seed: 15 }) - 0.5) * 2;
      const s = rimScale(x + 2, z) + wall * smoothstep(0.03, 0.12, y);
      return [x * s, y, z * s];
    },
    paint: (x, y, z) => {
      const patches = fbm(x * 1.8, z * 1.8 + 7, y * 3, { octaves: 3, seed: 13 });
      const speckle = fbm(x * 8 + 2, z * 8, y * 10, { octaves: 2, seed: 16 });
      let c = mixColor([112, 60, 26], [176, 108, 54], smoothstep(0.02, 0.12, y)); // darker underside
      c = mixColor(c, [216, 162, 96], smoothstep(H * 0.55, H, y)); // paler towards the cut
      c = mixColor(c, [128, 72, 32], smoothstep(0.52, 0.75, patches) * 0.7);
      return c.map((v) => v * (0.9 + speckle * 0.2));
    },
  });
  const crust = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.78,
    clearcoat: 0.1,
    clearcoatRoughness: 0.7,
    bumpMap: crustBump(),
    bumpScale: 1.1,
  });
  crust.bumpMap.repeat.set(6, 2);

  // Cut face: a gently domed disc of crumb, planar-mapped.
  const capProfile = [];
  for (let i = 0; i <= 10; i++) {
    const f = 1 - i / 10;
    capProfile.push([f * (R - rim + 0.004), H - 0.004 + 0.012 * (1 - f * f)]);
  }
  const capGeometry = revolve(capProfile, {
    shape: (x, y, z) => {
      const s = rimScale(x + 2, z);
      const f = Math.hypot(x, z) / R;
      const lumps = 0.008 * (fbm(x * 6, z * 6, 0, { octaves: 3, seed: 14 }) - 0.5) * 2 * (1 - f * f);
      return [x * s, y + lumps, z * s];
    },
    uv: (x, y, z) => [x / (2 * R) + 0.5, z / (2 * R) + 0.5],
  });
  const { map, bumpMap } = crumb();
  const crumbMaterial = new MeshStandardMaterial({ map, bumpMap, bumpScale: 2.5, roughness: 0.9 });

  const group = new Group();
  group.add(mesh(crustGeometry, crust));
  group.add(mesh(capGeometry, crumbMaterial));
  return group;
}

// Carne: flame-grilled patty, irregular edge, seared rim, char marks on top and bottom.
const MEAT_HEIGHT = 0.19;
const MEAT_RADIUS = 1.05;

function patty() {
  const R = MEAT_RADIUS;
  const H = MEAT_HEIGHT;
  const edge = 0.07;
  const rings = [0, 0.15, 0.3, 0.45, 0.6, 0.72, 0.82, 0.88];
  const profile = [
    ...rings.map((f) => [f * (R - edge), 0]),
    ...arc(R - edge, edge, edge, -Math.PI / 2, 0, 6),
    [R * 1.01, H * 0.5],
    ...arc(R - edge, H - edge, edge, 0, Math.PI / 2, 6),
    ...[...rings].reverse().map((f) => [f * (R - edge), H]),
  ];
  const geometry = revolve(profile, {
    segments: 128,
    shape: (x, y, z) => {
      const a = Math.atan2(z, x);
      const r = Math.hypot(x, z) / R;
      // Ragged, crumbly edge: coarse wobble plus fine bites, stronger at mid-height.
      const coarse = fbm(Math.cos(a) * 2.5 + 1, Math.sin(a) * 2.5, y * 3, { octaves: 3, seed: 51 }) - 0.5;
      const fine = fbm(Math.cos(a) * 14, Math.sin(a) * 14, y * 18, { octaves: 2, seed: 52 }) - 0.5;
      const s = 1 + smoothstep(0.55, 0.95, r) * (coarse * 0.09 + fine * 0.05);
      // Lumpy faces, slightly domed (the patty shrinks at the edge while grilling).
      const lumps = (fbm(x * 5, z * 5, 0, { octaves: 3, seed: 53 }) - 0.5) * 0.03;
      const dome = 0.012 * (1 - r * r);
      const top = y > H / 2;
      const dy = top ? lumps + dome : -lumps * 0.5 - dome * 0.3;
      return [x * s, y + dy * (r < 0.98 ? 1 : 0.3), z * s];
    },
    uv: (x, y, z) => [x / (2.3 * R) + 0.5, z / (2.3 * R) + 0.5],
  });
  const { map, roughnessMap, bumpMap } = grilledMeat();
  const meat = new MeshStandardMaterial({ map, roughnessMap, bumpMap, bumpScale: 3, roughness: 1 });
  // Lift so the lowest lumps rest on y = 0.
  return mesh(geometry, meat, 0.006);
}

// ---------------------------------------------------------------------------------------
// Fillings (tickets 06/07)
//
// Standard materials (no clearcoat or sheen): the opened burger covers many pixels and the
// physical shader made frames several times slower; low roughness plus the environment
// reflections keep the wet look. Pieces of a Camada are baked into one mesh (single()).

/**
 * A sheet over polar coordinates: `edge(a)` is the outline radius at angle a, `lift(r, a, f)`
 * the height at radius r (f = r / edge, 0 centre .. 1 rim). Planar UVs over `uvRadius`.
 */
function polarSheet({ rings = 20, segments = 120, edge, lift, uvRadius }) {
  const positions = [], uvs = [], indices = [];
  for (let i = 0; i <= rings; i++) {
    const f = i / rings;
    for (let j = 0; j <= segments; j++) {
      const a = (j / segments) * Math.PI * 2;
      const r = edge(a) * f;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      positions.push(x, lift(r, a, f), z);
      uvs.push(x / (2 * uvRadius) + 0.5, z / (2 * uvRadius) + 0.5);
    }
  }
  const row = segments + 1;
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < segments; j++) {
      const a = i * row + j, b = a + row;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Bakes the pieces of a Camada (meshes sharing one material) into a single mesh: one draw
 * call instead of one per slice or ring, in the colour pass and again in the shadow pass.
 */
function single(group) {
  group.updateMatrixWorld(true);
  const pieces = [];
  group.traverse((child) => {
    if (child.isMesh) pieces.push(child.geometry.clone().applyMatrix4(child.matrixWorld));
  });
  const material = group.children[0].material;
  return mesh(mergeGeometries(pieces), material);
}

/** A disc-shaped slice (rounded edge) of a given radius and thickness, planar-mapped. */
function slice(radius, thickness, { shape, segments = 64 } = {}) {
  const e = thickness / 2;
  const profile = [
    ...[0, 0.5, 0.85].map((f) => [f * (radius - e), 0]),
    ...arc(radius - e, e, e, -Math.PI / 2, Math.PI / 2, 7),
    ...[0.85, 0.5, 0].map((f) => [f * (radius - e), thickness]),
  ];
  return revolve(profile, { segments, shape, uv: (x, y, z) => [x / (2 * radius) + 0.5, z / (2 * radius) + 0.5] });
}

// Queijo: a slice of processed cheese, turned 45°, melted over the patty: flat in the middle,
// its rounded corners sagging over the edge, slightly rippled. Satin.
const CHEESE_HEIGHT = 0.03;
function cheese() {
  const size = 0.82, n = 56;
  const positions = [], indices = [];
  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= n; j++) {
      // Square grid mapped to a rounded square (superellipse), so the corners are soft.
      const u = (i / n) * 2 - 1, v = (j / n) * 2 - 1;
      const a = Math.atan2(v, u), square = Math.max(Math.abs(u), Math.abs(v));
      const c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
      const round = (c ** 6 + s ** 6) ** (-1 / 6) / (1 / Math.max(c, s));
      let x = u * size * round, z = v * size * round;
      [x, z] = [(x - z) * Math.SQRT1_2, (x + z) * Math.SQRT1_2]; // turned 45°
      const r = Math.hypot(x, z);
      // Sags past the patty's edge (radius ~1); ripples where it melted.
      const over = Math.max(r - 0.9, 0);
      const ripple = 0.006 * (fbm(x * 4, z * 4, 0, { octaves: 2, seed: 71 }) - 0.5) * 2;
      const y = CHEESE_HEIGHT - over * over * 1.6 - over * 0.12 + ripple * (square > 0.2 ? 1 : 0.3);
      positions.push(x, y, z);
    }
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const a = i * (n + 1) + j, b = a + n + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mat = new MeshStandardMaterial({
    color: '#f7b512', // yellower than the orange page, so it doesn't melt into the background
    roughness: 0.45,
    side: DoubleSide,
  });
  return mesh(geometry, mat);
}

// Picles: four crinkle-cut slices, dark skin, seeds, ridged faces, wet sheen.
const PICKLE_HEIGHT = 0.04;
function pickles() {
  const { map, bumpMap } = pickleSlice();
  const mat = new MeshStandardMaterial({ map, bumpMap, bumpScale: 1.5, roughness: 0.35 });
  const group = new Group();
  const rnd = random(93);
  for (const [x, z] of [[0.42, 0.2], [-0.35, 0.32], [-0.18, -0.42], [0.3, -0.36]]) {
    const radius = 0.21 + rnd() * 0.03;
    const geometry = slice(radius, 0.032, {
      shape: (px, py, pz) => {
        const a = Math.atan2(pz, px);
        const crinkle = 1 + 0.035 * Math.sin(a * 16); // wavy cut edge
        const ridge = 0.003 * Math.sin((px / radius) * Math.PI * 9); // ridged faces
        return [px * crinkle, py + (py > 0.016 ? ridge : -ridge), pz * crinkle];
      },
    });
    const piece = mesh(geometry, mat);
    piece.position.set(x, 0.002, z);
    piece.rotation.set((rnd() - 0.5) * 0.12, rnd() * Math.PI, (rnd() - 0.5) * 0.12);
    group.add(piece);
  }
  return single(group);
}

// Cebola: loose raw onion rings, some broken, translucent white with a faint yellow-green
// inner edge, lying in two or three clusters.
const ONION_HEIGHT = 0.04;
function onion() {
  const group = new Group();
  const mat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.3 });
  const rnd = random(55);
  const clusters = [[-0.3, -0.15], [0.32, 0.22], [0.12, -0.42], [-0.22, 0.42]];
  const colour = new Color();
  for (const [cx, cz] of clusters) {
    const rings = 2 + Math.floor(rnd() * 2);
    for (let k = 0; k < rings; k++) {
      const radius = 0.13 + k * 0.075 + rnd() * 0.02;
      const arcLength = rnd() < 0.3 ? Math.PI * (1.2 + rnd() * 0.6) : Math.PI * 2; // some broken
      const geometry = new TorusGeometry(radius, 0.022, 8, 48, arcLength);
      geometry.scale(1, 1, 0.75); // flatter than round: a cut ring
      const position = geometry.attributes.position;
      const colors = new Float32Array(position.count * 3);
      for (let i = 0; i < position.count; i++) {
        const inner = Math.hypot(position.getX(i), position.getY(i)) < radius;
        colour.set(inner ? '#e9ecc8' : '#f6f1e6');
        colors.set([colour.r, colour.g, colour.b], i * 3);
      }
      geometry.setAttribute('color', new BufferAttribute(colors, 3));
      const ring = mesh(geometry, mat);
      ring.rotation.set(Math.PI / 2 + (rnd() - 0.5) * 0.15, (rnd() - 0.5) * 0.15, rnd() * Math.PI * 2);
      ring.position.set(cx + (rnd() - 0.5) * 0.05, 0.018, cz + (rnd() - 0.5) * 0.05);
      group.add(ring);
    }
  }
  return single(group);
}

// Cheddar (Cheddar Duplo): creamy melted cheddar sauce, more orange and more liquid than the
// Whopper's slice. A glossy sheet over the patty that rolls over its edge and runs down the
// side in long rounded drips. One grid around the burger: rings over the top, then a curtain
// hanging from the rim, whose length by angle is the drips' outline. The outline is lumpy,
// not round, and overhangs the patty more in some places than others. Each Camada (cheddar1,
// cheddar2) gets its own outline and drips, from a seed fixed by its id.
const CHEDDAR_HEIGHT = 0.035;
const CHEDDAR_ROLL = 0.05; // drop over which the sauce rolls out over the patty's rounded edge
function cheddar(camada = {}) {
  const seed = [...(camada.id ?? 'cheddar')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7);
  const rnd = random(seed);
  const count = 8;
  const drips = Array.from({ length: count }, (_, k) => ({
    a: ((k + 0.15 + rnd() * 0.7) / count) * Math.PI * 2,
    width: 0.07 + rnd() * 0.08, // half-width, radians (~1-2 cm at the patty's edge)
    length: 0.06 + rnd() ** 1.3 * 0.12,
  }));
  /** Hang below the rim and outward bulge (the drip's bead) at angle a. */
  const run = (a) => {
    let hang = 0.022, bead = 0;
    for (const d of drips) {
      const t = Math.atan2(Math.sin(a - d.a), Math.cos(a - d.a)) / d.width;
      if (Math.abs(t) >= 1) continue;
      const k = 1 - t * t;
      hang = Math.max(hang, 0.022 + d.length * Math.sqrt(k)); // rounded tip
      bead = Math.max(bead, 0.016 * k);
    }
    return { hang, bead };
  };
  // Uneven outline: broad bulges and recesses (where the sauce spread further or less),
  // with smaller wobbles on top; how far it rolls out over the patty also varies by angle.
  const wave = (a, k, octaves, s) => (fbm(Math.cos(a) * k + seed, Math.sin(a) * k, s, { octaves, seed: 72 + s }) - 0.5) * 2;
  const rim = (a) => 1 + 0.09 * wave(a, 1.3, 3, 0) + 0.05 * wave(a, 2.7, 2, 7) + 0.03 * wave(a, 5, 2, 3);
  const spread = (a) => smoothstep(-0.45, 0.45, wave(a, 1.8, 2, 5));

  const segments = 192, top = 16, curtain = 18;
  const positions = [], colours = [], indices = [];
  const colour = new Color();
  for (let i = 0; i <= top + curtain; i++)
    for (let j = 0; j <= segments; j++) {
      const a = (j / segments) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      const edge = rim(a);
      let r, y, drop = 0;
      if (i <= top) {
        // The sheet: nearly flat, pooled ripples, sloping just before the rim.
        const f = i / top;
        r = edge * f;
        const ripple = 0.007 * (fbm(c * r * 4 + seed, s * r * 4, 0, { octaves: 2, seed: 73 }) - 0.5) * 2;
        y = CHEDDAR_HEIGHT + ripple * (1 - f) - 0.012 * smoothstep(0.75, 1, f);
      } else {
        // The curtain: rolls outward over the edge, then hangs straight.
        const { hang, bead } = run(a);
        drop = ((i - top) / curtain) * hang;
        const out = (0.015 + 0.13 * spread(a) + bead) * Math.sin(Math.min(drop / CHEDDAR_ROLL, 1) * (Math.PI / 2));
        // Thinning to a rounded bead at the tip.
        r = edge + out + bead * 0.6 * smoothstep(hang * 0.6, hang, drop);
        y = CHEDDAR_HEIGHT - 0.012 - drop;
      }
      positions.push(c * r, y, s * r);
      // Deeper orange where it runs thick, slightly yellower thin over the top; mottled.
      const mottle = fbm(c * r * 6 + seed, s * r * 6, y * 6, { octaves: 2, seed: 74 });
      const thick = smoothstep(0, 0.1, drop);
      colour.setRGB(
        (250 - thick * 20) / 255,
        (172 - thick * 62 + (mottle - 0.5) * 22) / 255,
        0,
        SRGBColorSpace,
      );
      colours.push(colour.r, colour.g, colour.b);
    }
  const row = segments + 1;
  for (let i = 0; i < top + curtain; i++)
    for (let j = 0; j < segments; j++) {
      const a = i * row + j, b = a + row;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colours), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  // A faint orange glow stands in for the light the sauce scatters inside (it would read
  // pale and flat otherwise against the orange page).
  const mat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.55, envMapIntensity: 0.35, emissive: '#3a1600', side: DoubleSide });
  return mesh(geometry, mat);
}

// Cebola crispy (Cheddar Duplo): a loose heap of fried onion crumbs and short curled
// strands under the top bun, golden to dark brown. No continuous body: the heap is only
// pieces, stacked in a few loose tiers, so the silhouette is ragged, light shows through
// the gaps and some bits spill over the rim onto the cheddar. A small dark disc well
// inside the rim stands in for the shadow at the bottom of the heap (and keeps the Camada
// solid to the eye from above). Pieces are indexed low-poly solids drawn flat-shaded,
// sharing one material (texture x vertex colour), baked into one mesh.
const CRISPY_ONION_HEIGHT = 0.12;
function crispyOnion() {
  const { map, bumpMap } = friedOnion();
  const mat = new MeshStandardMaterial({ map, bumpMap, bumpScale: 2, vertexColors: true, roughness: 0.62, flatShading: true });
  const rnd = random(77);
  const edge = (a) => 0.98 + 0.07 * (fbm(Math.cos(a) * 3 + 1, Math.sin(a) * 3, 0, { octaves: 3, seed: 101 }) - 0.5) * 2;
  // Top of the heap at a radius fraction: domed, lumpy, thinning out towards the rim.
  const lump = (x, z) => fbm(x * 4 + 3, z * 4, 0, { octaves: 2, seed: 102 });
  const top = (x, z, f) => (0.05 + 0.04 * (1 - f * f) + 0.03 * (lump(x, z) - 0.5)) * smoothstep(1.08, 0.7, f);

  // Index-only templates (shared corners): a crumb is a jagged icosahedron, a strand a thin
  // curled tube; both are re-shaped per piece.
  const crumbBase = mergeVertices(new IcosahedronGeometry(1, 0).deleteAttribute('normal').deleteAttribute('uv'));
  const strandBase = new TorusGeometry(1, 0.22, 3, 4, 1).deleteAttribute('normal').deleteAttribute('uv');
  const shades = ['#c98a3a', '#dca04a', '#a8642a', '#eab866', '#b87430', '#8a4c1c', '#d49444', '#9a5622'].map((h) => new Color(h));
  const pieces = [];
  const matrix = new Matrix4(), q = new Quaternion(), turn = new Euler(), at = new Vector3(), size = new Vector3();
  const colour = new Color();
  /** Places one piece, with planar UVs and one colour, darker the deeper it sits. */
  const place = (base, y, x, z, depth, jag) => {
    const geometry = base.clone();
    const p = geometry.attributes.position;
    if (jag) for (let i = 0; i < p.count; i++) {
      const s = 0.6 + rnd() * 0.75; // every corner pushed in or out: a broken, crumbly bit
      p.setXYZ(i, p.getX(i) * s, p.getY(i) * s, p.getZ(i) * s);
    }
    matrix.compose(at.set(x, y, z), q.setFromEuler(turn), size);
    geometry.applyMatrix4(matrix);
    colour.copy(shades[Math.floor(rnd() * shades.length)]).multiplyScalar((0.82 + rnd() * 0.32) * (1 - 0.45 * depth));
    const uv = new Float32Array(p.count * 2), colours = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      uv[i * 2] = p.getX(i) / 2 + 0.5;
      uv[i * 2 + 1] = p.getZ(i) / 2 + 0.5;
      colours.set([colour.r, colour.g, colour.b], i * 3);
    }
    geometry.setAttribute('uv', new BufferAttribute(uv, 2));
    geometry.setAttribute('color', new BufferAttribute(colours, 3));
    pieces.push(geometry);
  };

  // Shadow at the bottom of the heap, hidden under the pieces.
  const floor = polarSheet({ rings: 4, segments: 40, uvRadius: 1, edge: (a) => edge(a) * 0.8, lift: () => 0.012 }).deleteAttribute('normal');
  const index = floor.index.array;
  for (let i = 0; i < index.length; i += 3) [index[i + 1], index[i + 2]] = [index[i + 2], index[i + 1]];
  floor.setAttribute('color', new BufferAttribute(new Float32Array(floor.attributes.position.count * 3).map((_, i) => [0.09, 0.04, 0.015][i % 3]), 3));
  pieces.push(floor);

  for (let k = 0; k < 3800; k++) {
    const a = rnd() * Math.PI * 2;
    const rim = edge(a);
    // Uniform over the disc; one in eight lands past the rim and slumps down onto the cheddar.
    const spill = rnd() < 0.12;
    const f = spill ? 0.93 + rnd() * 0.12 : Math.sqrt(rnd()) * 0.97;
    const x = Math.cos(a) * rim * f, z = Math.sin(a) * rim * f;
    const height = Math.max(top(x, z, f), 0.012);
    // Anywhere from the bottom of the heap to its top (more of them near the top).
    const t = spill ? rnd() * 0.4 : Math.sqrt(rnd());
    const y = 0.008 + (height - 0.008) * t;
    const strand = rnd() < 0.4;
    turn.set((rnd() - 0.5) * (strand ? 1.6 : Math.PI), rnd() * Math.PI * 2, (rnd() - 0.5) * (strand ? 1.6 : Math.PI));
    if (strand) {
      const radius = 0.02 + rnd() * 0.028;
      size.set(radius, radius * (0.45 + rnd() * 0.3), radius);
    } else {
      const s = 0.013 + rnd() ** 2 * 0.024;
      size.set(s * (0.8 + rnd() * 0.6), s * (0.35 + rnd() * 0.3), s * (0.8 + rnd() * 0.6));
    }
    place(strand ? strandBase : crumbBase, Math.min(y, CRISPY_ONION_HEIGHT - 0.015), x, z, 1 - t, !strand);
  }
  const geometry = mergeGeometries(pieces);
  geometry.computeVertexNormals();
  return mesh(geometry, mat);
}

// Tomate: three slices with skin, red wall, gel-filled locules with seeds; wet and glossy.
const TOMATO_HEIGHT = 0.08;
function tomato() {
  const { map, bumpMap, roughnessMap } = tomatoSlice();
  const mat = new MeshStandardMaterial({ map, bumpMap, bumpScale: 2, roughnessMap, roughness: 0.7 });
  const group = new Group();
  const rnd = random(66);
  for (const [x, z] of [[0.36, 0.12], [-0.3, 0.3], [-0.06, -0.4]]) {
    const radius = 0.4 + rnd() * 0.04;
    const geometry = slice(radius, 0.065, {
      shape: (px, py, pz) => {
        const a = Math.atan2(pz, px);
        const s = 1 + 0.025 * (fbm(Math.cos(a) * 2 + x, Math.sin(a) * 2, 0, { octaves: 2, seed: 67 }) - 0.5) * 2;
        return [px * s, py, pz * s];
      },
    });
    const piece = mesh(geometry, mat);
    piece.position.set(x, 0.006, z);
    piece.rotation.set((rnd() - 0.5) * 0.1, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.1);
    group.add(piece);
  }
  return single(group);
}

// Alface: two overlapping ruffled leaves, wider than the bun, veined, edges waving up and
// down more and more towards the rim.
const LETTUCE_HEIGHT = 0.1;
function lettuce() {
  const { map, bumpMap } = lettuceLeaf();
  const mat = new MeshStandardMaterial({ map, bumpMap, bumpScale: 2, roughness: 0.5, side: DoubleSide });
  const group = new Group();
  for (const [seed, turn, reach] of [[1, 0, 1.12], [2, 2.1, 1.04]]) {
    const geometry = polarSheet({
      rings: 22,
      segments: 160,
      uvRadius: 1.25,
      edge: (a) => reach * (0.9 + 0.1 * fbm(Math.cos(a) * 3 + seed, Math.sin(a) * 3, 0, { octaves: 3, seed: 81 + seed })),
      lift: (r, a, f) => {
        // Uneven frills: the wave's phase and depth wander around the rim.
        const wander = fbm(Math.cos(a) * 2.5 + seed, Math.sin(a) * 2.5, seed, { octaves: 3, seed: 83 });
        const depth = 0.5 + fbm(Math.cos(a) * 4, Math.sin(a) * 4 + seed, 0, { octaves: 2, seed: 85 });
        const frill = Math.sin(a * 13 + wander * 14);
        return 0.035 + f ** 2.4 * 0.05 * depth * frill - f ** 3 * 0.03 + 0.014 * (fbm(r * 4 + seed, a, 0, { octaves: 2, seed: 84 }) - 0.5);
      },
    });
    const leaf = mesh(geometry, mat);
    leaf.rotation.y = turn;
    leaf.position.y = (seed - 1) * 0.015;
    group.add(leaf);
  }
  return single(group);
}

// Ketchup and maionese: thin irregular puddles with a rounded bead edge and a wet gloss,
// told apart by colour, sheen and shape (ketchup in lobed dollops, mayo spread thinner).
const SAUCE_HEIGHT = 0.03;
function puddle({ seed, reach, lobes, bead }) {
  return polarSheet({
    rings: 14,
    segments: 120,
    uvRadius: 1,
    edge: (a) => reach * (0.62 + 0.38 * fbm(Math.cos(a) * lobes + seed, Math.sin(a) * lobes, 0, { octaves: 3, seed })),
    lift: (r, a, f) => bead * Math.sqrt(Math.max(1 - f ** 6, 0)) * (0.85 + 0.3 * fbm(r * 5, a, seed, { octaves: 2, seed: seed + 1 })),
  });
}
/** Puddles ([x, z, reach]) of one sauce, sharing a glossy material. */
function sauce({ colour, roughness, seed, lobes, bead, puddles }) {
  const mat = new MeshStandardMaterial({ color: colour, roughness, side: DoubleSide });
  const group = new Group();
  puddles.forEach(([x, z, reach], i) => {
    const piece = mesh(puddle({ seed: seed + i * 7, reach, lobes, bead }), mat);
    piece.position.set(x, 0, z);
    group.add(piece);
  });
  return single(group);
}

export const layerModels = {
  bottom: {
    height: BOTTOM_HEIGHT,
    build: bottomBun,
  },
  meat: {
    height: MEAT_HEIGHT + 0.02, // the lumps and the slight dome rise above the nominal thickness
    build: patty,
  },
  cheese: { height: CHEESE_HEIGHT, build: cheese },
  cheddar: { height: CHEDDAR_HEIGHT, build: cheddar },
  pickles: { height: PICKLE_HEIGHT, build: pickles },
  ketchup: {
    height: SAUCE_HEIGHT,
    // Dollops squeezed in a few spots.
    build: () =>
      sauce({
        colour: '#c0180c',
        roughness: 0.2,
        seed: 21,
        lobes: 2.2,
        bead: SAUCE_HEIGHT,
        puddles: [[0.3, 0.15, 0.36], [-0.32, 0.2, 0.3], [0.02, -0.34, 0.33], [-0.05, 0.42, 0.22]],
      }),
  },
  onion: { height: ONION_HEIGHT, build: onion },
  crispyOnion: { height: CRISPY_ONION_HEIGHT, build: crispyOnion },
  tomato: { height: TOMATO_HEIGHT, build: tomato },
  lettuce: { height: LETTUCE_HEIGHT, build: lettuce },
  mayo: {
    height: SAUCE_HEIGHT,
    // Spread thinner and wider, under the top bun.
    build: () =>
      sauce({
        colour: '#f6eccb',
        roughness: 0.32,
        seed: 31,
        lobes: 1.6,
        bead: SAUCE_HEIGHT * 0.7,
        puddles: [[0.12, 0.05, 0.62], [-0.38, -0.25, 0.3]],
      }),
  },
  top: {
    height: TOP_HEIGHT,
    build: topBun,
  },
};
