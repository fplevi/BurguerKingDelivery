// Burger scene: the only module that knows Three.js.
//
// One WebGL context per stage (hero, Alterar ingredientes). Same camera (~15° above),
// same soft light from the upper left, transparent background, contact shadows in the scene.
// The page reads layer areas to position its invisible DOM buttons; the scene only draws.
//
//   const scene = createBurgerScene(stageEl, { fit: 'assembled' | 'open', onAreas });
//   if (!scene) -> no WebGL: keep the SVG fallback.
//   await scene.show({ open, removed }, { animate })  // animated unless animate:false or reduced motion
//   scene.areas()                                // { [id]: { left, top, width, height } } in stage px
//   scene.dispose()
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  PlaneGeometry,
  ShadowMaterial,
  MeshBasicMaterial,
  Vector3,
  PCFShadowMap,
  PMREMGenerator,
  NeutralToneMapping,
  MathUtils,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ingredients } from '../ingredients.js';
import { layerModels } from './layer-models.js';
import { contactShadow } from './textures.js';

const CAMERA_ELEVATION = 15; // degrees above the horizon
const FOV = 30;
const OPEN_GAP = 0.3; // vertical gap between opened Camadas, scene units
const DURATION = 650; // ms
const RADIUS = 1.1; // widest Camada (lettuce), used to frame the camera

const ids = ingredients.map((i) => i.id);
const heights = ids.map((id) => layerModels[id].height);
const sum = (list) => list.reduce((a, b) => a + b, 0);
const ASSEMBLED_HEIGHT = sum(heights);
const OPEN_HEIGHT = ASSEMBLED_HEIGHT + OPEN_GAP * (ids.length - 1);

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut = (t) => 1 - (1 - t) ** 3;

/** Resting y of each Camada and whether it is shown, for a displayed state. */
function layout({ open, removed }) {
  const targets = {};
  let stacked = 0;
  ids.forEach((id, index) => {
    const present = !removed.includes(id);
    const slot = sum(heights.slice(0, index)) + OPEN_GAP * index;
    targets[id] = { y: open ? slot : stacked, scale: present ? 1 : 0 };
    if (present) stacked += heights[index];
  });
  return targets;
}

/**
 * Points sampled from a Camada's meshes (object space, flat xyz), projected every frame
 * to get its area on screen. Tighter than a bounding box: a dome's box corners stick out
 * above the crown.
 */
function outline(object, max = 400) {
  const points = [];
  const v = new Vector3();
  object.updateMatrixWorld(true);
  const inverse = object.matrixWorld.clone().invert();
  object.traverse((child) => {
    if (!child.isMesh || child.isInstancedMesh) return;
    const position = child.geometry.attributes.position;
    const step = Math.max(1, Math.floor(position.count / max));
    for (let i = 0; i < position.count; i += step) {
      v.fromBufferAttribute(position, i).applyMatrix4(child.matrixWorld).applyMatrix4(inverse);
      points.push(v.x, v.y, v.z);
    }
  });
  return points;
}

function createContext(canvas) {
  try {
    return canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
  } catch {
    return null;
  }
}

export function createBurgerScene(stage, { fit = 'assembled', onAreas = () => {} } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'burger-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const context = createContext(canvas);
  if (!context) return null;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  stage.prepend(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);

  // Soft studio reflections for the glazed crust and the fat on the meat.
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  pmrem.dispose();
  scene.environment = environment;
  scene.environmentIntensity = 0.35;

  scene.add(new HemisphereLight('#fff6e8', '#7a4a2a', 1.1));
  const sun = new DirectionalLight('#fff3df', 2.6);
  sun.position.set(-2.5, 6, 3); // upper left, slightly in front
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 5, bottom: -3, near: 0.5, far: 15 });
  sun.shadow.radius = 4;
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  // Cast shadow on the ground, only while assembled: opened Camadas float, and their
  // shadows would land far to the side. The soft contact blob stays under the burger.
  const GROUND_SHADOW = 0.28;
  const ground = new Mesh(new PlaneGeometry(8, 8), new ShadowMaterial({ opacity: GROUND_SHADOW }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.001;
  ground.receiveShadow = true;
  scene.add(ground);
  const contact = new Mesh(
    new PlaneGeometry(2.7, 2.7),
    new MeshBasicMaterial({ color: '#2a1206', alphaMap: contactShadow(), transparent: true, opacity: 0.55, depthWrite: false }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0.08, 0.001, -0.04); // nudged away from the light
  scene.add(contact);

  const layers = {};
  for (const id of ids) {
    const object = layerModels[id].build();
    scene.add(object);
    layers[id] = { object, y: 0, scale: 1, outline: outline(object) };
  }

  // Frame the camera once per stage, for the tallest arrangement it shows.
  const framedHeight = fit === 'open' ? OPEN_HEIGHT : ASSEMBLED_HEIGHT;
  function frame(width, height) {
    camera.aspect = width / height;
    const elevation = MathUtils.degToRad(CAMERA_ELEVATION);
    const halfFov = MathUtils.degToRad(FOV / 2);
    const halfHeight = (framedHeight / 2) * Math.cos(elevation) + RADIUS * Math.sin(elevation);
    const distance = Math.max(halfHeight / Math.tan(halfFov), RADIUS / (Math.tan(halfFov) * camera.aspect)) * 1.3;
    const target = new Vector3(0, framedHeight / 2, 0);
    camera.position.set(0, target.y + distance * Math.sin(elevation), distance * Math.cos(elevation));
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }

  let size = { width: 0, height: 0 };
  let animation = null;
  let frameRequest = 0;
  let currentAreas = {};
  let shown = '';

  function place() {
    for (const id of ids) {
      const { object, y, scale } = layers[id];
      object.position.y = y;
      object.scale.setScalar(Math.max(scale, 0.0001));
      object.visible = scale > 0.01;
    }
    // 0 assembled .. 1 opened, read from the top bun's lift above its stacked height.
    const top = layers[ids.at(-1)];
    const stackedTop = sum(ids.slice(0, -1).map((id, i) => (layers[id].scale > 0.5 ? heights[i] : 0)));
    const openness = MathUtils.clamp((top.y - stackedTop) / (OPEN_GAP * (ids.length - 1)), 0, 1);
    ground.material.opacity = GROUND_SHADOW * (1 - openness);
  }

  const corner = new Vector3();
  function measure() {
    const rects = [];
    for (const id of ids) {
      const { object, outline } = layers[id];
      if (!object.visible) continue;
      object.updateMatrixWorld();
      let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
      for (let i = 0; i < outline.length; i += 3) {
        corner.set(outline[i], outline[i + 1], outline[i + 2]).applyMatrix4(object.matrixWorld);
        corner.project(camera);
        const x = ((corner.x + 1) / 2) * size.width;
        const y = ((1 - corner.y) / 2) * size.height;
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      rects.push({ id, left, top, right, bottom, centre: (top + bottom) / 2 });
    }
    // Neighbouring Camadas overlap on screen; split the overlap halfway between centres
    // so each DOM button gets its own hit area (rects are bottom -> top).
    const areas = {};
    rects.forEach((rect, i) => {
      const below = rects[i - 1], above = rects[i + 1];
      const top = above ? Math.max(rect.top, (rect.centre + above.centre) / 2) : rect.top;
      const bottom = below ? Math.min(rect.bottom, (rect.centre + below.centre) / 2) : rect.bottom;
      areas[rect.id] = { left: rect.left, top, width: rect.right - rect.left, height: Math.max(bottom - top, 1) };
    });
    return areas;
  }

  function draw() {
    if (!size.width || !size.height) return;
    place();
    renderer.render(scene, camera);
    currentAreas = measure();
    onAreas(currentAreas);
  }

  function tick(now) {
    frameRequest = 0;
    if (animation) {
      const t = Math.min(Math.max((now - animation.start) / DURATION, 0), 1);
      const k = easeOut(t);
      for (const id of ids) {
        const from = animation.from[id], to = animation.to[id];
        layers[id].y = from.y + (to.y - from.y) * k;
        layers[id].scale = from.scale + (to.scale - from.scale) * k;
      }
      if (t === 1) {
        draw();
        animation.done();
        animation = null;
        return;
      }
    }
    draw();
    if (animation) frameRequest = requestAnimationFrame(tick);
  }

  const requestDraw = () => {
    if (!frameRequest) frameRequest = requestAnimationFrame(tick);
  };

  const observer = new ResizeObserver(() => {
    const width = stage.clientWidth, height = stage.clientHeight;
    if (width === size.width && height === size.height) return;
    size = { width, height };
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    frame(width, height);
    draw();
  });
  observer.observe(stage);

  return {
    /** Resolves once the transition has been drawn (or was superseded by another show). */
    show(view, { animate = true } = {}) {
      const key = JSON.stringify([view.open, [...view.removed].sort()]);
      if (key === shown) return animation ? animation.finished : Promise.resolve();
      shown = key;
      animation?.done();
      animation = null;
      const to = layout(view);
      if (!animate || reducedMotion()) {
        for (const id of ids) Object.assign(layers[id], to[id]);
        draw();
        return Promise.resolve();
      }
      const from = Object.fromEntries(ids.map((id) => [id, { y: layers[id].y, scale: layers[id].scale }]));
      let done;
      const finished = new Promise((resolve) => (done = resolve));
      animation = { start: performance.now(), from, to, finished, done };
      requestDraw();
      return finished;
    },
    areas: () => currentAreas,
    dispose() {
      cancelAnimationFrame(frameRequest);
      observer.disconnect();
      scene.traverse((object) => {
        object.geometry?.dispose();
        object.material?.dispose();
      });
      renderer.dispose();
      canvas.remove();
    },
  };
}
