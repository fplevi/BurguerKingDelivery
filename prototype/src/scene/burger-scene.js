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
//   scene.snapshot(id, { width, height })        // PNG data URL of one Camada alone, or null
//   scene.drag(id, clientX, clientY)             // the Camada follows the pointer, over the page
//   scene.release()                              // ends the drag; back to its place (or wherever show() says)
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
  Box3,
  Vector2,
  Vector3,
  Plane,
  Raycaster,
  Euler,
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
// A dragged Camada is held up facing the viewer (a thin disc would otherwise be seen
// edge-on), leaning a little to the side it is carried, and slightly smaller because it is
// lifted towards the camera.
const HOLD_TILT = 0.5; // radians
const HOLD_SCALE = 0.85;

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
    targets[id] = { x: 0, y: open ? slot : stacked, z: 0, scale: present ? 1 : 0 };
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
    layers[id] = { object, x: 0, y: 0, z: 0, scale: 1, outline: outline(object) };
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

  let size = { width: 0, height: 0 }; // stage, CSS px: the camera frames the burger in it
  let view = { width: 0, height: 0, left: 0, top: 0 }; // canvas, CSS px, relative to the stage
  let overlay = false; // while dragging, the canvas covers the viewport (the Camada can reach the Bandeja)
  let dragging = null; // { id, grab } while a Camada follows the pointer
  let lastView = { open: false, removed: [] };
  let animation = null;
  let frameRequest = 0;
  let currentAreas = {};
  let shown = '';

  function place() {
    for (const id of ids) {
      const { object, x, y, z, scale } = layers[id];
      object.position.set(x, y, z);
      object.scale.setScalar(Math.max(scale, 0.0001));
      object.visible = scale > 0.01;
      if (dragging?.id === id) object.rotation.copy(dragging.pose);
      else object.rotation.set(0, 0, 0);
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
        const x = ((corner.x + 1) / 2) * view.width + view.left;
        const y = ((1 - corner.y) / 2) * view.height + view.top;
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      rects.push({ id, left, top, right, bottom, centre: (top + bottom) / 2 });
    }
    // A dragged Camada keeps its whole area; it no longer sits between its neighbours.
    const held = rects.findIndex((rect) => rect.id === dragging?.id);
    const loose = held >= 0 ? rects.splice(held, 1)[0] : null;
    // Neighbouring Camadas overlap on screen; split the overlap halfway between centres
    // so each DOM button gets its own hit area (rects are bottom -> top).
    const areas = {};
    rects.forEach((rect, i) => {
      const below = rects[i - 1], above = rects[i + 1];
      const top = above ? Math.max(rect.top, (rect.centre + above.centre) / 2) : rect.top;
      const bottom = below ? Math.min(rect.bottom, (rect.centre + below.centre) / 2) : rect.bottom;
      areas[rect.id] = { left: rect.left, top, width: rect.right - rect.left, height: Math.max(bottom - top, 1) };
    });
    if (loose) areas[loose.id] = { left: loose.left, top: loose.top, width: loose.right - loose.left, height: loose.bottom - loose.top };
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
        if (dragging?.id === id) continue; // the pointer owns it
        const from = animation.from[id], to = animation.to[id];
        for (const key of ['x', 'y', 'z', 'scale']) layers[id][key] = from[key] + (to[key] - from[key]) * k;
      }
      if (t === 1) {
        animation.done();
        animation = null;
        if (!dragging) setOverlay(false);
        draw();
        return;
      }
    }
    draw();
    if (animation) frameRequest = requestAnimationFrame(tick);
  }

  const requestDraw = () => {
    if (!frameRequest) frameRequest = requestAnimationFrame(tick);
  };

  /** Sizes the canvas: the stage, or the whole viewport while dragging (same framing). */
  function resize() {
    const { width, height } = size;
    if (!width || !height) return;
    frame(width, height);
    if (overlay) {
      const rect = stage.getBoundingClientRect();
      view = { width: innerWidth, height: innerHeight, left: -rect.left, top: -rect.top };
      Object.assign(canvas.style, { width: view.width + 'px', height: view.height + 'px' });
      // The stage's frustum, extended to the viewport around it.
      camera.setViewOffset(width, height, -rect.left, -rect.top, view.width, view.height);
    } else {
      view = { width, height, left: 0, top: 0 };
      Object.assign(canvas.style, { width: '', height: '' });
      camera.clearViewOffset();
    }
    renderer.setSize(view.width, view.height, false);
  }

  function setOverlay(on) {
    if (on === overlay) return;
    overlay = on;
    canvas.classList.toggle('burger-canvas--overlay', on);
    resize();
  }

  const observer = new ResizeObserver(() => {
    const width = stage.clientWidth, height = stage.clientHeight;
    if (width === size.width && height === size.height) return;
    size = { width, height };
    resize();
    draw();
  });
  observer.observe(stage);

  /** Starts the transition of every Camada to `to`; resolves when drawn. */
  function animateTo(to) {
    animation?.done();
    animation = null;
    if (reducedMotion()) {
      for (const id of ids) if (dragging?.id !== id) Object.assign(layers[id], to[id]);
      if (!dragging) setOverlay(false);
      draw();
      return Promise.resolve();
    }
    const from = Object.fromEntries(ids.map((id) => [id, (({ x, y, z, scale }) => ({ x, y, z, scale }))(layers[id])]));
    let done;
    const finished = new Promise((resolve) => (done = resolve));
    animation = { start: performance.now(), from, to, finished, done };
    requestDraw();
    return finished;
  }

  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const plane = new Plane();
  const hit = new Vector3();
  /** Point under the pointer on the plane facing the camera through `through`. */
  function underPointer(clientX, clientY, through) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new Vector3()).negate(), through);
    return raycaster.ray.intersectPlane(plane, hit);
  }

  return {
    /** Resolves once the transition has been drawn (or was superseded by another show). */
    show(displayed, { animate = true } = {}) {
      const key = JSON.stringify([displayed.open, [...displayed.removed].sort()]);
      if (key === shown) return animation ? animation.finished : Promise.resolve();
      shown = key;
      lastView = displayed;
      const to = layout(displayed);
      if (!animate) {
        animation?.done();
        animation = null;
        for (const id of ids) Object.assign(layers[id], to[id]);
        draw();
        return Promise.resolve();
      }
      return animateTo(to);
    },
    /**
     * Moves a Camada with the pointer (client px), lifted towards the camera. The first call
     * grows the canvas over the viewport so the Camada can be carried over the Bandeja.
     */
    drag(id, clientX, clientY) {
      if (!size.width || !size.height) return;
      const layer = layers[id];
      if (dragging?.id !== id) {
        setOverlay(true);
        const centre = new Vector3(layer.x, layer.y + layerModels[id].height / 2, layer.z);
        const at = underPointer(clientX, clientY, centre);
        if (!at) return;
        dragging = { id, grab: centre.clone().sub(at), depth: centre, pose: new Euler() };
      }
      const at = underPointer(clientX, clientY, dragging.depth);
      if (!at) return;
      // Held pose, pivoting on the Camada's centre so the grabbed point stays under the pointer.
      const target = at.add(dragging.grab).addScaledVector(camera.getWorldDirection(new Vector3()), -0.35);
      dragging.pose.set(HOLD_TILT, 0, MathUtils.clamp(-target.x * 0.06, -0.15, 0.15));
      layer.scale = HOLD_SCALE;
      const offset = new Vector3(0, layerModels[id].height / 2, 0).multiplyScalar(HOLD_SCALE).applyEuler(dragging.pose);
      layer.x = target.x - offset.x;
      layer.y = target.y - offset.y;
      layer.z = target.z - offset.z;
      requestDraw();
    },
    /** Ends a drag: the Camada glides back to where the displayed state puts it. */
    release() {
      if (!dragging) return Promise.resolve();
      dragging = null;
      return animateTo(layout(lastView));
    },
    areas: () => currentAreas,
    /**
     * Image of one Camada on its own (even if removed), same light and camera elevation,
     * transparent background: for the Bandeja. Rendered into a corner of this stage's canvas
     * and copied out in the same task, so nothing flickers and no extra WebGL context is used.
     * Returns null while the stage has no size (e.g. hidden).
     */
    snapshot(id, { width = 120, height = 72 } = {}) {
      if (!size.width || !size.height) return null;
      const buffer = renderer.getDrawingBufferSize(new Vector2());
      const ratio = renderer.getPixelRatio();
      // Image pixels: 2x the CSS size for sharpness, shrunk if the canvas is smaller.
      const fit = Math.min(1, buffer.x / (width * 2), buffer.y / (height * 2));
      const pw = Math.floor(width * 2 * fit), ph = Math.floor(height * 2 * fit);
      if (pw < 8 || ph < 8) return null;

      place();
      const { object } = layers[id];
      for (const other of ids) layers[other].object.visible = other === id;
      ground.visible = contact.visible = false;
      object.position.set(0, 0, 0);
      object.rotation.set(0, 0, 0);
      object.scale.setScalar(1);
      object.visible = true;

      // Frame the Camada's width (it is much wider than tall), with a small margin.
      const box = new Box3().setFromObject(object);
      const radius = Math.max(box.max.x, -box.min.x, box.max.z, -box.min.z);
      const centre = (box.min.y + box.max.y) / 2;
      const shot = camera.clone();
      shot.clearViewOffset();
      shot.aspect = pw / ph;
      const elevation = MathUtils.degToRad(CAMERA_ELEVATION);
      const halfFovX = Math.atan(Math.tan(MathUtils.degToRad(FOV / 2)) * shot.aspect);
      const distance = (radius * 1.08) / Math.tan(halfFovX) + radius;
      shot.position.set(0, centre + distance * Math.sin(elevation), distance * Math.cos(elevation));
      shot.lookAt(0, centre, 0);
      shot.updateProjectionMatrix();

      renderer.setViewport(0, 0, pw / ratio, ph / ratio);
      renderer.setScissor(0, 0, pw / ratio, ph / ratio);
      renderer.setScissorTest(true);
      renderer.render(scene, shot);
      const image = document.createElement('canvas');
      image.width = pw;
      image.height = ph;
      image.getContext('2d').drawImage(canvas, 0, buffer.y - ph, pw, ph, 0, 0, pw, ph);

      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, view.width, view.height);
      ground.visible = contact.visible = true;
      draw();
      return image.toDataURL('image/png');
    },
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
