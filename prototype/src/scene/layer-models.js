// Procedural 3D model of each Camada, keyed by ingredient id (see ../ingredients.js).
//
// Contract for every entry:
//   height: thickness of the Camada in scene units (burger radius ≈ 1, i.e. ~6 cm),
//           used to stack the layers when assembled;
//   build(): returns a new Object3D whose bottom sits at y = 0 and top at y = height,
//            centred on the y axis. Meshes should cast and receive shadows.
//
// The Base (pão inferior, carne, pão superior) is modelled realistically (ticket 04):
// lathed profiles roughened with noise, vertex-coloured crust, code-generated textures
// (./textures.js). The other Camadas are still simple coloured shapes until tickets 06/07.
import {
  Group,
  Mesh,
  InstancedMesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  TorusGeometry,
  LatheGeometry,
  BufferAttribute,
  Vector2,
  Vector3,
  Quaternion,
  Matrix4,
  Color,
  SRGBColorSpace,
} from 'three';
import { fbm, random, crustBump, crumb, grilledMeat } from './textures.js';

const material = (color, roughness = 0.7) => new MeshStandardMaterial({ color, roughness });

function mesh(geometry, mat, y = 0) {
  const m = new Mesh(geometry, mat);
  m.position.y = y;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** A flat disc of the given radius and thickness, resting on y = 0. */
const disc = (radius, height, color, roughness) =>
  mesh(new CylinderGeometry(radius, radius, height, 48), material(color, roughness), height / 2);

/** Several round slices spread on a ring, e.g. pickles or tomato. */
function slices({ count, ring, radius, height, color, roughness, offset = 0 }) {
  const group = new Group();
  const mat = material(color, roughness);
  const geometry = new CylinderGeometry(radius, radius, height, 32);
  for (let i = 0; i < count; i++) {
    const angle = offset + (i / count) * Math.PI * 2;
    const slice = mesh(geometry, mat, height / 2);
    slice.position.x = Math.cos(angle) * ring;
    slice.position.z = Math.sin(angle) * ring;
    group.add(slice);
  }
  return group;
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

export const layerModels = {
  bottom: {
    height: BOTTOM_HEIGHT,
    build: bottomBun,
  },
  meat: {
    height: MEAT_HEIGHT,
    build: patty,
  },
  cheese: {
    height: 0.03,
    build: () => {
      const slice = mesh(new BoxGeometry(1.6, 0.03, 1.6), material('#f6b417', 0.5), 0.015);
      slice.rotation.y = Math.PI / 4;
      return slice;
    },
  },
  pickles: {
    height: 0.04,
    build: () => slices({ count: 4, ring: 0.5, radius: 0.24, height: 0.04, color: '#6f8f2a', offset: 0.4 }),
  },
  ketchup: {
    height: 0.025,
    build: () => disc(0.82, 0.025, '#b3120d', 0.3),
  },
  onion: {
    height: 0.04,
    build: () => {
      const group = new Group();
      const mat = material('#f1e6d6', 0.6);
      for (const [x, z, r] of [[-0.35, -0.2, 0.28], [0.3, 0.25, 0.24], [0.2, -0.45, 0.2], [-0.25, 0.45, 0.22]]) {
        const ring = mesh(new TorusGeometry(r, 0.02, 8, 32), mat, 0.02);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, 0.02, z);
        group.add(ring);
      }
      return group;
    },
  },
  tomato: {
    height: 0.08,
    build: () => slices({ count: 3, ring: 0.45, radius: 0.42, height: 0.08, color: '#d8331f', roughness: 0.45 }),
  },
  lettuce: {
    height: 0.08,
    build: () => mesh(new CylinderGeometry(1.08, 1.02, 0.08, 24), material('#6fae32', 0.6), 0.04),
  },
  mayo: {
    height: 0.025,
    build: () => disc(0.84, 0.025, '#f4ead0', 0.35),
  },
  top: {
    height: TOP_HEIGHT,
    build: topBun,
  },
};
