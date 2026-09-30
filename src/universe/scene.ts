// The 3D studio walkthrough. Entry point for the lazy chunk; three.js is only imported inside src/universe/.
//   const { mountUniverse } = await import('./universe/scene');
//   const api = await mountUniverse(el, islands);   // throws if WebGL is unavailable → use the flat walkthrough
// Events go out on `window` (see UniverseEvents in ./types): station:arrive, station:hover, station:click, universe:ready.
import {
  BufferGeometry, CanvasTexture, Color, DirectionalLight, Fog, HemisphereLight, Material, Mesh, MeshBasicMaterial, PCFShadowMap,
  PerspectiveCamera, PlaneGeometry, Raycaster, Scene, SRGBColorSpace, Texture, Vector2, Vector3, WebGLRenderer,
} from 'three';
import type { GuideAction, Island, UniverseAPI } from './types';
import { readTheme } from './theme';
import { buildWorld, type Station } from './world';
import { loadGuide, type GuideOptions } from './avatar';
import { buildDecor } from './decor';

const UP = new Vector3(0, 1, 0);
const WALK_SPEED = 1.5;        // m/s, natural
const MAX_WALK_S = 7;          // long walks speed up so no walk takes longer than this
const emit = (name: string, detail: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }));
const damp = (k: number, dt: number) => 1 - Math.exp(-k * dt);
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

type Mode = { kind: 'station'; st: Station | null } | { kind: 'follow' } | { kind: 'overview' };

/** `opts` is for the dev harness only (e.g. testing a VRM that isn't Shikhar's); the site calls mountUniverse(el, islands). */
export async function mountUniverse(container: HTMLElement, islands: Island[], opts: GuideOptions = {}): Promise<UniverseAPI> {
  // ---- WebGL first: a clear error lets the interface fall back ----
  const canvas = document.createElement('canvas');
  let gl: WebGL2RenderingContext | null = null;
  try { gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch { gl = null; }
  if (!gl) throw new Error('Universe: WebGL2 is not available in this browser.');
  let renderer: WebGLRenderer;
  try { renderer = new WebGLRenderer({ canvas, context: gl, antialias: true }); } catch (e) {
    throw new Error(`Universe: could not start WebGL (${(e as Error).message}).`);
  }
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;';
  canvas.setAttribute('aria-hidden', 'true'); // the interface provides the accessible stop list
  container.appendChild(canvas);

  // loop state (declared early; callbacks below use it)
  let raf = 0;
  let inView = true;
  let disposed = false;
  let lastT = performance.now();
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches;

  // ---- scene ----
  const theme = readTheme();
  const scene = new Scene();
  scene.background = theme.bg.clone();
  const fog = new Fog(theme.bg.clone(), 22, 58);
  scene.fog = fog;
  const camera = new PerspectiveCamera(35, 1, 0.1, 200);

  const hemi = new HemisphereLight(new Color('#ffffff'), theme.floorEdge.clone(), 1.9);
  const key = new DirectionalLight(new Color('#ffffff'), 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  const sc = key.shadow.camera;
  sc.left = -11; sc.right = 11; sc.top = 11; sc.bottom = -11; sc.near = 1; sc.far = 40;
  const fill = new DirectionalLight(theme.sky.clone(), 0.6);
  fill.position.set(6, 4, 8);
  scene.add(hemi, key, key.target, fill);

  const world = buildWorld(theme, islands);
  scene.add(world.group);
  const { stations, byId, curve } = world;
  const decor = buildDecor(theme, world, islands);
  scene.add(decor.group);

  // ---- guide ----
  const guide = await loadGuide(theme, opts);
  if (disposed) throw new Error('Universe: disposed while loading.');
  guide.setReduced(reduced);
  scene.add(guide.root);
  const blobMat = new MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.9 });
  {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(22,24,29,0.22)');
    grad.addColorStop(1, 'rgba(22,24,29,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const t = new CanvasTexture(c);
    blobMat.map = t;
  }
  const guideBlob = new Mesh(new PlaneGeometry(0.9, 0.9), blobMat);
  guideBlob.rotation.x = -Math.PI / 2;
  guideBlob.position.y = 0.006;
  scene.add(guideBlob);

  // guide state along the path
  let u = world.startU;                 // arc position 0..1
  let yaw = 0;                          // facing (0 = +z, towards the default camera side)
  let yawTarget = 0;
  let at: Station | null = null;        // station the guide is standing at
  let arrivedOnce = false;
  let walk: { to: Station; speed: number; pending: (() => void)[] } | null = null;
  const pos = new Vector3();
  curve.getPointAt(u, pos);

  // ---- camera state ----
  let mode: Mode = { kind: 'station', st: stations[0] ?? null };
  const camPos = new Vector3();
  const camLook = new Vector3();
  let yawOff = 0, pitchOff = 0, zoom = 1;
  let firstFrame = true;
  let shiftPx = 0;
  const tmp = new Vector3(), tmp2 = new Vector3();

  /** 3/4 framing: guide at `p` in front of station `st` (or alone), seen from the visitor side. */
  function stationShot(p: Vector3, st: Station | null, outPos: Vector3, outLook: Vector3) {
    const r = st?.radius ?? 1;
    const c = st?.center ?? p.clone().add(new Vector3(0, 0, -2));
    const d = tmp.subVectors(p, c).setY(0);
    if (d.lengthSq() < 1e-4) d.set(0, 0, 1);
    // swing round to the side so the guide (left) and the station (right) separate on screen
    d.normalize().applyAxisAngle(UP, 0.85);
    outLook.copy(p).lerp(c, 0.55).setY(0.8 + r * 0.3);
    // far enough that guide + plinth fit the free width (left of any docked panel), with margin
    const W = Math.max(1, container.clientWidth);
    const freeFrac = Math.max(0.25, (W - panelPx) / W);
    const hTan = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
    const fit = ((2 * r + 2.2) * 1.2) / (2 * hTan * freeFrac);
    const dist = Math.max(5.6 + r * 2.1, fit);
    outPos.copy(outLook).addScaledVector(d, dist).add(tmp2.set(0, 2.0 + r * 0.6, 0));
  }
  function followShot(outPos: Vector3, outLook: Vector3) {
    const fwd = tmp.set(Math.sin(yaw), 0, Math.cos(yaw));
    const back = tmp2.copy(fwd).negate().applyAxisAngle(UP, 0.5);
    outPos.copy(pos).addScaledVector(back, 5.6 * narrowFactor()).add(new Vector3(0, 2.6, 0));
    outLook.copy(pos).addScaledVector(fwd, 1.4).setY(1.0);
  }
  function overviewShot(outPos: Vector3, outLook: Vector3) {
    const { center, radius } = world.bounds;
    const vHalf = (camera.fov * Math.PI) / 360;
    const aspect = freeAspect();
    const hHalf = Math.atan(Math.tan(vHalf) * aspect);
    // wide screens see the path side-on (it runs left→right); tall screens look down its length
    const wide = aspect >= 1;
    const half = wide ? radius * 0.56 : radius * 0.44;
    const dist = half / Math.tan(Math.min(vHalf, hHalf)) + 2;
    // aim a little past the path's centre line so it sits mid-frame instead of in the top half
    outLook.copy(center).add(wide ? new Vector3(-3, 0, 1.5) : new Vector3(0, 0, -2.5)).setY(0);
    const dir = wide ? new Vector3(1, 1.1, 0.12) : new Vector3(0.2, 1.6, 1);
    outPos.copy(center).add(dir.normalize().multiplyScalar(dist));
  }

  // ---- free area (the interface can reserve a right-hand panel) ----
  // Optional CSS var on the container: --universe-panel-px (any CSS length, e.g. calc(min(760px, 56vw) + 24px)).
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:0;width:var(--universe-panel-px, 0px);';
  container.appendChild(probe);
  let panelPx = 0;
  const readPanel = () => {
    // accepts a bare number of px ("600") or any CSS length ("calc(min(760px, 56vw) + 24px)")
    const raw = getComputedStyle(container).getPropertyValue('--universe-panel-px').trim();
    const px = /^-?[\d.]+(px)?$/.test(raw) ? parseFloat(raw) : raw ? probe.getBoundingClientRect().width : 0;
    panelPx = Math.min(container.clientWidth * 0.8, Math.max(0, px || 0));
  };
  let panelTick = 0;
  // the interface sets the variable inline on the container: re-read the moment it changes
  const mo = new MutationObserver(() => { readPanel(); wake(); });
  mo.observe(container, { attributes: true, attributeFilter: ['style', 'class'] });
  const freeAspect = () => Math.max(0.3, (container.clientWidth - panelPx) / Math.max(1, container.clientHeight));
  const narrowFactor = () => Math.pow(Math.max(1, 1.2 / freeAspect()), 0.6);

  // ---- walking ----
  function faceCamera() {
    yawTarget = Math.atan2(camPosTarget().x - pos.x, camPosTarget().z - pos.z);
  }
  const _cp = new Vector3(), _cl = new Vector3();
  function camPosTarget() { desiredShot(_cp, _cl); return _cp; }

  function arrive(st: Station) {
    const w = walk;
    walk = null;
    at = st;
    u = st.u;
    curve.getPointAt(u, pos);
    guide.setWalking(false);
    mode = { kind: 'station', st };
    world.setHighlight(st.id);
    world.setFocus(st.id);
    faceCamera();
    if (reduced) { yaw = yawTarget; guide.play('idle'); }
    else guide.play(arrivedOnce ? 'point' : 'wave');
    arrivedOnce = true;
    emit('station:arrive', { id: st.id });
    w?.pending.forEach((r) => r());
    wake();
  }

  function walkTo(id: string): Promise<void> {
    const st = byId.get(id);
    if (!st || disposed) return Promise.resolve();
    if (walk && walk.to === st) return new Promise((r) => walk!.pending.push(r));
    const pending = walk?.pending ?? [];
    return new Promise<void>((resolve) => {
      pending.push(resolve);
      yawOff *= 0.5; pitchOff *= 0.5;
      if (reduced || (at === st && !walk)) {
        walk = { to: st, speed: 0, pending };
        arrive(st);
        return;
      }
      const dist = Math.abs(st.u - u) * world.length;
      const speed = Math.max(WALK_SPEED, dist / MAX_WALK_S);
      walk = { to: st, speed, pending };
      at = null;
      world.setFocus(null);
      mode = { kind: 'follow' };
      world.setHighlight(st.id);
      guide.setWalking(true, Math.min(1.9, speed / WALK_SPEED));
      wake();
    });
  }

  function overview() {
    if (disposed) return;
    mode = { kind: 'overview' };
    world.setFocus(null);
    yawOff = 0; pitchOff = 0; zoom = 1;
    wake();
  }

  // ---- input: drag to orbit a little, wheel/pinch zoom, hover + click stations ----
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const pickables = stations.flatMap((s) => s.pick);
  const pointers = new Map<number, { x: number; y: number }>();
  let down: { x: number; y: number; t: number; moved: number } | null = null;
  let pinch = 0;
  let hoverId: string | null = null;

  function pick(cx: number, cy: number): string | null {
    const r = canvas.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    return (hit?.object.userData.stationId as string | undefined) ?? null;
  }
  function setHover(id: string | null) {
    if (id === hoverId) return;
    hoverId = id;
    world.setHover(id);
    canvas.style.cursor = id ? 'pointer' : 'grab';
    emit('station:hover', { id });
    wake();
  }
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
    else { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); down = null; }
    canvas.style.cursor = 'grabbing';
  };
  const onMove = (e: PointerEvent) => {
    const p = pointers.get(e.pointerId);
    if (!p) { if (e.pointerType === 'mouse') setHover(pick(e.clientX, e.clientY)); return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0) zoom = Math.min(1.35, Math.max(0.75, zoom * (pinch / d)));
      pinch = d;
      wake();
      return;
    }
    if (down) down.moved += Math.abs(dx) + Math.abs(dy);
    yawOff = Math.min(0.75, Math.max(-0.75, yawOff - dx * 0.005));
    pitchOff = Math.min(0.35, Math.max(-0.25, pitchOff + dy * 0.004));
    wake();
  };
  const onUp = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (down && pointers.size === 0 && down.moved < 7 && performance.now() - down.t < 600) {
      const id = pick(e.clientX, e.clientY);
      if (id) { emit('station:click', { id }); void walkTo(id); }
    }
    if (!pointers.size) down = null;
    canvas.style.cursor = hoverId ? 'pointer' : 'grab';
  };
  const onLeave = () => { if (!pointers.size) setHover(null); };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    zoom = Math.min(1.35, Math.max(0.75, zoom * Math.exp(e.deltaY * 0.001)));
    wake();
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.style.cursor = 'grab';
  const onMotion = () => { reduced = motionQuery.matches; guide.setReduced(reduced); wake(); };
  motionQuery.addEventListener('change', onMotion);

  // ---- sizing ----
  function resize() {
    const w = Math.max(1, container.clientWidth), h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    readPanel();
    wake();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // ---- per-frame ----
  let clock = 0;
  const wantPos = new Vector3(), wantLook = new Vector3();

  function desiredShot(outPos: Vector3, outLook: Vector3) {
    if (mode.kind === 'overview') overviewShot(outPos, outLook);
    else if (mode.kind === 'follow') followShot(outPos, outLook);
    else stationShot(pos, mode.st, outPos, outLook);
  }

  function update(dt: number) {
    clock += dt;
    if (panelTick++ % 6 === 0) readPanel();
    // walking along the path
    if (walk) {
      const dir = Math.sign(walk.to.u - u);
      const du = (walk.speed * dt) / world.length;
      const next = u + dir * du;
      if (dir === 0 || (dir > 0 ? next >= walk.to.u : next <= walk.to.u)) {
        arrive(walk.to);
      } else {
        u = next;
        curve.getPointAt(u, pos);
        const t = curve.getTangentAt(u, tmp).multiplyScalar(dir || 1);
        yawTarget = Math.atan2(t.x, t.z);
      }
    }
    // turn smoothly
    const dy = wrapAngle(yawTarget - yaw);
    yaw = reduced ? yawTarget : yaw + dy * damp(walk ? 8 : 5, dt);
    guide.root.position.copy(pos);
    guide.root.rotation.y = yaw;
    guideBlob.position.set(pos.x, 0.006, pos.z);
    guide.update(dt);
    world.update(clock, dt, reduced, camera.position, camLook);
    decor.update(clock, dt, reduced);
    // shadow camera follows the guide
    key.position.set(pos.x - 5, 12, pos.z + 7);
    key.target.position.set(pos.x, 0, pos.z - 2);

    // camera
    desiredShot(wantPos, wantLook);
    if (Math.abs(yawOff) + Math.abs(pitchOff) > 1e-4 || zoom !== 1) {
      const off = tmp.subVectors(wantPos, wantLook);
      off.applyAxisAngle(UP, yawOff);
      const right = tmp2.crossVectors(off, UP).normalize();
      off.applyAxisAngle(right, -pitchOff).multiplyScalar(zoom);
      wantPos.copy(wantLook).add(off);
      if (wantPos.y < 0.5) wantPos.y = 0.5;
    }
    if (walk) { yawOff *= 1 - damp(1.5, dt); pitchOff *= 1 - damp(1.5, dt); }
    if (firstFrame || reduced) { camPos.copy(wantPos); camLook.copy(wantLook); firstFrame = false; }
    else { camPos.lerp(wantPos, damp(2.6, dt)); camLook.lerp(wantLook, damp(3.4, dt)); }
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    const fd = camPos.distanceTo(camLook);
    fog.near = fd * 1.1 + 8;
    fog.far = fd * 2.6 + 36;
    // keep the framed subject centred in the area left of a docked panel
    const wantShift = panelPx / 2;
    shiftPx = reduced ? wantShift : shiftPx + (wantShift - shiftPx) * damp(6, dt);
    const dpr = renderer.getPixelRatio();
    const W = renderer.domElement.width, H = renderer.domElement.height;
    if (Math.abs(shiftPx) > 0.5) camera.setViewOffset(W, H, shiftPx * dpr, 0, W, H);
    else if (camera.view?.enabled) camera.clearViewOffset();
    camera.updateMatrixWorld();
  }

  function frame(now: number) {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    update(dt);
    renderer.render(scene, camera);
    if (running()) raf = requestAnimationFrame(frame);
  }
  function running() { return !disposed && inView && document.visibilityState === 'visible'; }
  function wake() { if (!raf && running()) { lastT = performance.now(); raf = requestAnimationFrame(frame); } }
  const onVis = () => wake();
  document.addEventListener('visibilitychange', onVis);
  const io = new IntersectionObserver((en) => { inView = en.some((x) => x.isIntersecting); wake(); });
  io.observe(container);

  // initial pose: guide at the start, facing the camera, Agent Builder behind him
  update(0);
  faceCamera();
  yaw = yawTarget;
  update(0);
  renderer.render(scene, camera);
  setTimeout(() => { if (!disposed) emit('universe:ready', {}); }, 0);
  wake();

  // ---- API ----
  const proj = new Vector3();
  function anchor(id: string): { x: number; y: number } | null {
    const st = byId.get(id);
    if (!st || disposed) return null;
    proj.copy(st.hint).project(camera);
    if (proj.z > 1 || proj.z < -1 || Math.abs(proj.x) > 1.05 || Math.abs(proj.y) > 1.05) return null;
    return { x: ((proj.x + 1) / 2) * container.clientWidth, y: ((1 - proj.y) / 2) * container.clientHeight };
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    mo.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    motionQuery.removeEventListener('change', onMotion);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
    canvas.removeEventListener('pointerleave', onLeave);
    canvas.removeEventListener('wheel', onWheel);
    guide.dispose();
    const geos = new Set<BufferGeometry>(), mats = new Set<Material>(), texs = new Set<Texture>([...world.textures, ...decor.textures]);
    scene.traverse((o) => {
      const m = o as Mesh;
      if (m.geometry) geos.add(m.geometry);
      const mm = m.material as Material | Material[] | undefined;
      if (mm) (Array.isArray(mm) ? mm : [mm]).forEach((x) => {
        mats.add(x);
        for (const v of Object.values(x)) if (v instanceof Texture) texs.add(v);
      });
    });
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    texs.forEach((t) => t.dispose());
    for (const st of stations) st.screen.dispose();
    key.shadow.map?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    probe.remove();
    walk?.pending.forEach((r) => r());
    walk = null;
    if (hoverId) emit('station:hover', { id: null });
  }

  return {
    walkTo,
    overview,
    playAction: (a: GuideAction) => { if (!disposed && !walk) guide.play(reduced && a !== 'talk' ? 'idle' : a); wake(); },
    anchor,
    dispose,
  };
}
