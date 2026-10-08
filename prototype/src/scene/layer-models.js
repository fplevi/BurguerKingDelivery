// Procedural 3D model of each Camada, keyed by ingredient id (see ../ingredients.js).
//
// Contract for every entry:
//   height: thickness of the Camada in scene units (burger radius ≈ 1, i.e. ~6 cm),
//           used to stack the layers when assembled;
//   build(): returns a new Object3D whose bottom sits at y = 0 and top at y = height,
//            centred on the y axis. Meshes should cast and receive shadows.
//
// Ticket 03 uses simple coloured shapes. Tickets 04/06/07 replace `build` (and `height`)
// with realistic models and code-generated textures; the scene and the page don't change.
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  TorusGeometry,
} from 'three';

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

export const layerModels = {
  bottom: {
    height: 0.3,
    build: () => mesh(new CylinderGeometry(1, 0.94, 0.3, 48), material('#d98a3d', 0.8), 0.15),
  },
  meat: {
    height: 0.2,
    build: () => disc(1.04, 0.2, '#5a2a14', 0.9),
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
    height: 0.5,
    build: () => {
      const dome = mesh(new SphereGeometry(1.02, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), material('#d9822f', 0.55));
      dome.scale.y = 0.5 / 1.02;
      return dome;
    },
  },
};
