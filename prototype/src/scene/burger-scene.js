// Burger scene: the only module that knows Three.js.
//
// One WebGL context per stage (hero, Ver ingredientes). Same camera (~15° above),
// same soft light from the upper left, transparent background, contact shadows in the scene.
// The page reads layer areas to position its invisible DOM buttons; the scene only draws.
//
//   const scene = createBurgerScene(stageEl, { recipe, fit: 'assembled' | 'open', onAreas });  // recipe: a Receita
//   if (!scene) -> no WebGL: keep the SVG fallback.
//   await scene.show({ open, removed }, { animate })  // animated unless animate:false or reduced motion
//   scene.areas()                                // { [id]: { left, top, width, height } } in stage px
//   scene.snapshot(id, { width, height })        // PNG data URL of one Camada alone, or null
//   scene.drag(id, clientX, clientY)             // the Camada follows the pointer, over the page
//   scene.release()                              // ends the drag; back to its place (or wherever show() says)
//   scene.tilt(x, y)                             // lean towards x, y in [-1, 1]; (0, 0) recentres
//   scene.enter()                                // Entrada, from the next frame drawn; scene.settle() ends it
//   await scene.exit()                           // Saída
//   scene.dispose()
import {
  WebGLRenderer,
  Scene,
  Group,
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
import { layerModels } from './layer-models.js';
import { contactShadow, texturesReady } from './textures.js';

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
// Tilt (ticket 10): at most 10°, eased; turning around the vertical axis shows the sides,
// pitching shows more or less of the top, with a roll so the turn reads on round shapes.
const TILT = { pitch: 10, yaw: 10, roll: 8 }; // degrees at |x| or |y| = 1
const TILT_EASE = 0.12; // seconds to cover ~63% of the way to the target
// Entrada (ticket 15): the present Camadas fall from above the frame, bottom to top, one every
// `stagger` ms; each falls for 70% of `fall` ms, accelerating, and bounces back up a little
// (a share of its drop) in the rest. Saída: the whole burger sinks, shrinks a little and fades.
const ENTRANCE = { fall: 420, stagger: 55, land: 0.7, bounce: 0.035 };
const EXIT = { duration: 250, sink: 0.6, shrink: 0.15 };

const sum = (list) => list.reduce((a, b) => a + b, 0);
/** A promise and the function that resolves it. */
function deferred() {
  let done;
  const finished = new Promise((resolve) => (done = resolve));
  return { finished, done };
}

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut = (t) => 1 - (1 - t) ** 3;

/** Share of its drop still above a falling Camada, `t` in [0, 1] of its own fall: 1 -> 0, a hop, 0. */
function dropLeft(t) {
  const { land, bounce } = ENTRANCE;
  if (t < land) return 1 - (t / land) ** 2;
  const u = (t - land) / (1 - land);
  return bounce * Math.sin(Math.PI * u) * (1 - u * 0.4);
}

/** Resting y of each Camada (ids, bottom to top, with their heights) and whether it is shown, for a displayed state. */
function layout(ids, heights, { open, removed }) {
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

export function createBurgerScene(stage, { recipe, fit = 'assembled', onAreas = () => {}, tiltScale = 1 } = {}) {
  if (!recipe?.layers) throw new TypeError('createBurgerScene: options.recipe (a Receita, with its layers) is required');
  // Camadas by id; a repeated ingredient (two meats) has two ids sharing one model.
  const ids = recipe.layers.map((l) => l.id);
  const models = Object.fromEntries(recipe.layers.map((l) => [l.id, layerModels[l.model]]));
  const heights = ids.map((id) => models[id].height);
  const ASSEMBLED_HEIGHT = sum(heights);
  const OPEN_HEIGHT = ASSEMBLED_HEIGHT + OPEN_GAP * (ids.length - 1);

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
  const CONTACT_SHADOW = 0.55;
  const contact = new Mesh(
    new PlaneGeometry(2.7, 2.7),
    new MeshBasicMaterial({ color: '#2a1206', alphaMap: contactShadow(), transparent: true, opacity: CONTACT_SHADOW, depthWrite: false }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0.08, 0.001, -0.04); // nudged away from the light
  scene.add(contact);

  // The burger leans around its middle: pivot (rotated) > burger (offset back down) > Camadas.
  const pivot = new Group();
  const burger = new Group();
  pivot.add(burger);
  scene.add(pivot);
  const layers = {};
  for (const [index, id] of ids.entries()) {
    // The scene moves, scales and turns a holder; the model keeps its own transforms
    // (e.g. the cheese slice is turned 45°). A model may vary by Camada (two cheddars), and a
    // Camada may turn its model (`turn`, radians), so a repeated one doesn't look identical.
    const object = new Group();
    const model = models[id].build(recipe.layers[index]);
    model.rotation.y += recipe.layers[index].turn ?? 0;
    object.add(model);
    burger.add(object);
    layers[id] = { object, x: 0, y: 0, z: 0, scale: 1, outline: outline(object) };
  }

  // Frame the camera once per stage, for the tallest arrangement it shows.
  const framedHeight = fit === 'open' ? OPEN_HEIGHT : ASSEMBLED_HEIGHT;
  pivot.position.y = framedHeight / 2;
  burger.position.y = -framedHeight / 2;
  function frame(width, height) {
    camera.aspect = width / height;
    const elevation = MathUtils.degToRad(CAMERA_ELEVATION);
    const halfFov = MathUtils.degToRad(FOV / 2);
    const halfHeight = (framedHeight / 2) * Math.cos(elevation) + RADIUS * Math.sin(elevation);
    // --zoom on the stage (CSS) brings the camera closer, eating into the 1.3 margin (Ver ingredientes on desktop).
    const zoom = parseFloat(getComputedStyle(stage).getPropertyValue('--zoom')) || 1;
    const distance = (Math.max(halfHeight / Math.tan(halfFov), RADIUS / (Math.tan(halfFov) * camera.aspect)) * 1.3) / zoom;
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
  const tiltTarget = { x: 0, y: 0 };
  const tiltNow = { x: 0, y: 0 };
  let lastTick = 0;
  let animation = null;
  let frameRequest = 0;
  let currentAreas = {};
  let shown = '';
  let drawn = false;
  // Entrada or Saída running: { kind: 'entrance' | 'exit', start (set on the first frame drawn), duration, apply(ms), done }.
  let effect = null;
  const entering = () => effect?.kind === 'entrance';
  // Share of each shadow drawn. In the Entrada, the contact shadow comes in with the bottom bun
  // and the cast one with the last Camada (Camadas still in the air would cast it far to the side).
  const shadow = { contact: 1, ground: 1 };

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
    // (A top bun still falling in the Entrada is not an opened burger.)
    const openness = entering() ? 0 : MathUtils.clamp((top.y - stackedTop) / (OPEN_GAP * (ids.length - 1)), 0, 1);
    ground.material.opacity = GROUND_SHADOW * (1 - openness) * shadow.ground;
    contact.material.opacity = CONTACT_SHADOW * shadow.contact;
  }

  function runEffect(kind, duration, apply) {
    effect?.done();
    const { finished, done } = deferred();
    effect = { kind, start: null, duration, apply, done };
    requestDraw();
    return finished;
  }

  /** Read by the tests that wait for the hero to be still, and by the budget measurements. */
  const markEnd = (kind) => performance.mark(`burger-scene:${kind}-end:${fit}`);

  function endEffect() {
    const { done, kind } = effect;
    effect = null;
    markEnd(kind);
    done();
  }

  /**
   * Puts the Camadas where the running effect has them at `now`, and asks for the next frame;
   * ends it when its time is up. Only called while the stage draws: a hidden stage holds the
   * effect, without spinning frames, until it is shown.
   */
  function stepEffect(now) {
    if (!effect) return;
    effect.start ??= now;
    const ms = Math.min(now - effect.start, effect.duration);
    effect.apply(ms);
    if (ms < effect.duration) return requestDraw();
    endEffect();
  }

  /** Undoes the Saída: the burger in place, full size, opaque, with its shadows. */
  function restorePose() {
    burger.position.y = -framedHeight / 2;
    pivot.scale.setScalar(1);
    canvas.style.opacity = '';
    Object.assign(shadow, { contact: 1, ground: 1 });
  }

  function lean() {
    const k = tiltScale * (Math.PI / 180);
    pivot.rotation.set(tiltNow.y * TILT.pitch * k, tiltNow.x * TILT.yaw * k, -tiltNow.x * TILT.roll * k);
  }
  const tilting = () => Math.abs(tiltTarget.x - tiltNow.x) > 0.001 || Math.abs(tiltTarget.y - tiltNow.y) > 0.001;

  const corner = new Vector3();
  function measure() {
    scene.updateMatrixWorld();
    const rects = [];
    for (const id of ids) {
      const { object, outline } = layers[id];
      if (!object.visible) continue;
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
    // Each DOM button reaches halfway to its neighbours' centres (rects are bottom -> top):
    // overlapping Camadas split the overlap, and thin ones (sauces, cheese) also take the
    // empty space around them, so they stay big enough to tap.
    const areas = {};
    rects.forEach((rect, i) => {
      const below = rects[i - 1], above = rects[i + 1];
      const top = above ? (rect.centre + above.centre) / 2 : rect.top;
      const bottom = below ? (rect.centre + below.centre) / 2 : rect.bottom;
      areas[rect.id] = { left: rect.left, top, width: rect.right - rect.left, height: Math.max(bottom - top, 1) };
    });
    if (loose) areas[loose.id] = { left: loose.left, top: loose.top, width: loose.right - loose.left, height: loose.bottom - loose.top };
    return areas;
  }

  function draw() {
    if (!size.width || !size.height || !compiled) return;
    stepEffect(performance.now());
    place();
    renderer.render(scene, camera);
    if (!drawn) {
      drawn = true;
      // Budget (ticket 11): time to the first frame, read by tests/orcamento.spec.js.
      performance.mark(`burger-scene:first-frame:${fit}`);
    }
    currentAreas = measure();
    onAreas(currentAreas);
  }

  function tick(now) {
    frameRequest = 0;
    const dt = Math.min((now - (lastTick || now)) / 1000, 1); // exponential easing is stable at any step
    lastTick = now;
    if (tilting()) {
      const k = 1 - Math.exp(-dt / TILT_EASE);
      tiltNow.x += (tiltTarget.x - tiltNow.x) * k;
      tiltNow.y += (tiltTarget.y - tiltNow.y) * k;
      if (!tilting()) Object.assign(tiltNow, tiltTarget);
      lean();
    }
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
        if (tilting()) requestDraw();
        return;
      }
    }
    draw();
    if (animation || tilting()) requestDraw();
    if (!frameRequest) lastTick = 0;
  }

  function requestDraw() {
    if (!frameRequest) frameRequest = requestAnimationFrame(tick);
  }

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
      camera.clearViewOffset();
    }
    renderer.setSize(view.width, view.height, false);
  }

  function setOverlay(on) {
    if (on === overlay) return;
    overlay = on;
    canvas.classList.toggle('burger-canvas--overlay', on);
    if (!on) {
      // Back to the stylesheet's size (the stage). Layout must run before resize() shrinks the
      // drawing buffer: when the canvas's own size (width/height attributes) and its CSS box
      // (fixed, viewport px -> absolute, 100%) change in the same layout pass, Chrome keeps the
      // old viewport-sized box until something relays the stage out (the burger was drawn
      // huge over the Bandeja after a drop there, ticket 04 review).
      Object.assign(canvas.style, { width: '', height: '' });
      void canvas.offsetWidth;
    }
    resize();
  }

  // Budget (ticket 11): linking the shaders on first use blocked the page for seconds;
  // compiled in parallel (KHR_parallel_shader_compile where available), off the main thread,
  // while the workers paint the textures. The first frame waits for both.
  let compiled = false;
  Promise.all([renderer.compileAsync(scene, camera), texturesReady]).then(() => {
    compiled = true;
    // A hidden stage (Ver ingredientes before opening) still draws once, tiny, so the
    // shadow programs are ready too and the first frame on opening doesn't stall.
    if (!size.width) {
      renderer.setSize(1, 1, false);
      renderer.render(scene, camera);
    }
    performance.mark(`burger-scene:ready:${fit}`);
    draw();
  });

  const observer = new ResizeObserver(() => {
    const width = stage.clientWidth, height = stage.clientHeight;
    if (width === size.width && height === size.height) return;
    size = { width, height };
    // A hidden stage can't draw the Saída: it is over (the Entrada waits to be seen).
    if ((!width || !height) && effect?.kind === 'exit') endEffect();
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
    const { finished, done } = deferred();
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
      const to = layout(ids, heights, displayed);
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
        // Straighten up first: a held Camada is placed in the burger's own (untilted) space.
        Object.assign(tiltTarget, { x: 0, y: 0 });
        Object.assign(tiltNow, tiltTarget);
        lean();
        scene.updateMatrixWorld();
        setOverlay(true);
        const centre = burger.localToWorld(new Vector3(layer.x, layer.y + models[id].height / 2, layer.z));
        const at = underPointer(clientX, clientY, centre);
        if (!at) return;
        dragging = { id, grab: centre.clone().sub(at), depth: centre, pose: new Euler() };
      }
      const at = underPointer(clientX, clientY, dragging.depth);
      if (!at) return;
      // Held pose, pivoting on the Camada's centre so the grabbed point stays under the pointer.
      const target = burger.worldToLocal(at.add(dragging.grab).addScaledVector(camera.getWorldDirection(new Vector3()), -0.35));
      dragging.pose.set(HOLD_TILT, 0, MathUtils.clamp(-target.x * 0.06, -0.15, 0.15));
      layer.scale = HOLD_SCALE;
      const offset = new Vector3(0, models[id].height / 2, 0).multiplyScalar(HOLD_SCALE).applyEuler(dragging.pose);
      layer.x = target.x - offset.x;
      layer.y = target.y - offset.y;
      layer.z = target.z - offset.z;
      requestDraw();
    },
    /**
     * Leans the burger towards (x, y), each in [-1, 1] (x right, y down on screen), easing
     * there; (0, 0) recentres. Ignored with reduced motion and while a Camada is dragged.
     */
    tilt(x, y) {
      if (reducedMotion() || dragging || entering()) return;
      tiltTarget.x = MathUtils.clamp(x, -1, 1);
      tiltTarget.y = MathUtils.clamp(y, -1, 1);
      if (tilting()) requestDraw();
    },
    /** Ends a drag: the Camada glides back to where the displayed state puts it. */
    release() {
      if (!dragging) return Promise.resolve();
      dragging = null;
      return animateTo(layout(ids, heights, lastView));
    },
    areas: () => currentAreas,
    /**
     * Entrada: the Camadas shown fall into place, bottom to top, from the next frame drawn (the
     * first one, on a new scene; or once a hidden stage is shown). The contact shadow comes in
     * with the bottom bun, the cast one with the last Camada. None with reduced motion.
     */
    enter() {
      restorePose();
      if (reducedMotion()) {
        effect?.done();
        effect = null;
        draw();
        markEnd('entrance');
        return;
      }
      // Straight, so nothing leans while falling; tilt() waits for the end.
      Object.assign(tiltTarget, { x: 0, y: 0 });
      Object.assign(tiltNow, tiltTarget);
      lean();
      const present = ids.filter((id) => !lastView.removed.includes(id));
      const height = framedHeight * 1.6 + 1; // from above the frame
      const { fall, stagger } = ENTRANCE;
      runEffect('entrance', fall + stagger * (present.length - 1), (ms) => {
        const rest = layout(ids, heights, lastView);
        present.forEach((id, i) => {
          const left = dropLeft(MathUtils.clamp((ms - i * stagger) / fall, 0, 1));
          layers[id].y = rest[id].y + height * left;
          const landed = 1 - Math.min(left, 1);
          if (i === 0) shadow.contact = landed ** 2; // seen only once the bun is in the frame
          if (i === present.length - 1) shadow.ground = landed ** 2;
        });
      });
    },
    /** Ends a started Entrada at once: the burger assembled, where show() puts it. */
    settle() {
      if (!entering() || effect.start === null) return;
      effect.start = -Infinity;
      draw();
    },
    /**
     * Saída: the whole burger sinks a little and fades out; resolves when it is gone (at once
     * with reduced motion, before the first frame or with the stage hidden). The burger stays
     * gone until enter().
     */
    exit() {
      if (reducedMotion() || !drawn || !size.width || !size.height) {
        markEnd('exit');
        return Promise.resolve();
      }
      const base = -framedHeight / 2;
      return runEffect('exit', EXIT.duration, (ms) => {
        const k = (ms / EXIT.duration) ** 2;
        burger.position.y = base - EXIT.sink * k;
        pivot.scale.setScalar(1 - EXIT.shrink * k);
        canvas.style.opacity = String(1 - k);
      });
    },
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
      pivot.rotation.set(0, 0, 0);
      scene.updateMatrixWorld();
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
      lean();
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
      // Free the context now (switching products builds new scenes; browsers cap live contexts).
      context.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    },
  };
}
