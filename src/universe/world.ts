// The studio: gradient floor that fades into the backdrop, stepping-stone path, one pastel plinth + prop per station.
import {
  BoxGeometry, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color, ConeGeometry, CylinderGeometry, DoubleSide,
  Group, IcosahedronGeometry, InstancedMesh, Material, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  Object3D, OctahedronGeometry, PlaneGeometry, RingGeometry, ShadowMaterial, SphereGeometry, SRGBColorSpace,
  TorusGeometry, Vector3,
} from 'three';
import type { Island, Tier } from './types';
import type { Theme } from './theme';
import { ORDER, PLINTH, START, STATION_POS, extraPos } from './layout';
import { buildScreen, type Screen } from './screens';

export interface Station {
  id: string;
  tier: Tier;
  index: number;
  center: Vector3;     // on the floor
  radius: number;
  height: number;
  stand: Vector3;      // where the guide stops
  hint: Vector3;       // world point above the station for "click here" bubbles
  u: number;           // arc-length position of `stand` on the path (0..1)
  root: Group;
  topMat: MeshStandardMaterial;
  pick: Object3D[];
  screen: Screen;
}

export interface World {
  group: Group;
  stations: Station[];
  byId: Map<string, Station>;
  curve: CatmullRomCurve3;
  length: number;
  startU: number;
  bounds: { center: Vector3; radius: number };
  setHighlight(id: string | null): void;
  setHover(id: string | null): void;
  /** The station whose screen turns to face the camera (guide standing there), or null. */
  setFocus(id: string | null): void;
  update(t: number, dt: number, reduced: boolean, camPos: Vector3, camLook: Vector3): void;
  textures: CanvasTexture[];
}

function canvasTex(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d')!, size);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}
const css = (c: Color, a = 1) => {
  const { r, g, b } = c.getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace);
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;
};


export function buildWorld(theme: Theme, islands: Island[]): World {
  const group = new Group();
  const textures: CanvasTexture[] = [];
  const animators: ((t: number) => void)[] = [];

  // ---- floor: white centre → light grey edge; the scene fog blends it into the backdrop ----
  const floorTex = canvasTex(512, (g, s) => {
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, css(theme.surface));
    grad.addColorStop(0.55, css(theme.surface.clone().lerp(theme.floorEdge, 0.5)));
    grad.addColorStop(1, css(theme.floorEdge));
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
  });
  textures.push(floorTex);
  const floor = new Mesh(new PlaneGeometry(90, 90), new MeshBasicMaterial({ map: floorTex }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -12);
  group.add(floor);
  const shadowFloor = new Mesh(new PlaneGeometry(90, 90), new ShadowMaterial({ color: theme.ink, opacity: 0.13 }));
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.position.set(0, 0.002, -12);
  shadowFloor.receiveShadow = true;
  group.add(shadowFloor);

  const blobTex = canvasTex(128, (g, s) => {
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, css(theme.ink, 0.2));
    grad.addColorStop(0.6, css(theme.ink, 0.07));
    grad.addColorStop(1, css(theme.ink, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
  });
  textures.push(blobTex);
  const blobMat = new MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
  const blobGeo = new PlaneGeometry(1, 1);

  // ---- materials ----
  const std = (color: Color, rough = 0.75, extra: Partial<ConstructorParameters<typeof MeshStandardMaterial>[0]> = {}) =>
    new MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
  const M = {
    white: std(theme.surface, 0.8),
    line: std(theme.line, 0.9),
    slate: std(theme.slate, 0.55),
    accent: std(theme.accent, 0.45),
    sky: std(theme.skyDeep, 0.6),
    peach: std(theme.peach, 0.7),
    peachDeep: std(theme.peachDeep, 0.65),
    lilac: std(theme.lilac.clone().lerp(theme.accent, 0.12), 0.7),
    mint: std(theme.mint.clone().lerp(new Color('#2f9e6e'), 0.12), 0.7),
    stone: std(theme.line.clone().lerp(theme.surface, 0.25), 0.9),
  };
  const glow = (c: Color) => new MeshBasicMaterial({ color: c.clone() });

  // ---- station order + positions ----
  const byTier = new Map(islands.map((i) => [i.id, i]));
  const ordered: Island[] = [];
  for (const id of ORDER) { const i = byTier.get(id); if (i) ordered.push(i); }
  for (const i of islands) if (!ORDER.includes(i.id)) ordered.push(i);

  const stations: Station[] = [];
  let extra = 0;
  ordered.forEach((isl, index) => {
    const [x, z] = STATION_POS[isl.id] ?? extraPos(extra++);
    const { r, h } = PLINTH[isl.tier];
    const center = new Vector3(x, 0, z);
    // stand in front of the plinth (camera side), nudged towards the centre line
    const side = x > 0.3 ? -1 : 1;
    const toStand = new Vector3(side * 0.6, 0, 1).normalize();
    const stand = center.clone().addScaledVector(toStand, r + 0.6);
    const root = new Group();
    root.position.copy(center);
    group.add(root);
    const topColor = isl.tier === 'flagship' ? M.sky : [M.lilac, M.mint, M.sky, M.white][index % 4];
    const topMat = (topColor as MeshStandardMaterial).clone();
    const pick: Object3D[] = [];
    // plinth: white drum, rounded lip, pastel top
    const body = new Mesh(new CylinderGeometry(r, r * 1.03, h, 64), M.white);
    body.position.y = h / 2;
    const lip = new Mesh(new TorusGeometry(r - 0.035, 0.035, 8, 64), M.white);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = h;
    const top = new Mesh(new CylinderGeometry(r * 0.93, r * 0.93, 0.04, 64), topMat);
    top.position.y = h + 0.02;
    for (const m of [body, lip, top]) { m.castShadow = true; m.receiveShadow = true; root.add(m); pick.push(m); }
    const blob = new Mesh(blobGeo, blobMat);
    blob.rotation.x = -Math.PI / 2;
    blob.scale.setScalar(r * 3);
    blob.position.y = 0.004;
    root.add(blob);
    // floating UI screen showing the project, turned towards the visitor side at rest
    const screen = buildScreen(theme, isl, h + 0.04, Math.atan2(stand.x - center.x, stand.z - center.z), index * 0.9);
    root.add(screen.group);
    pick.push(...screen.meshes);
    const hint = center.clone().add(new Vector3(0, screen.top + 0.35, 0));
    for (const o of pick) o.userData.stationId = isl.id;
    stations.push({ id: isl.id, tier: isl.tier, index, center, radius: r, height: h, stand, hint, u: 0, root, topMat, pick, screen });
  });

  // ---- path through the stand points, stepping stones along it ----
  const pts = [new Vector3(START[0], 0, START[1]), ...stations.map((s) => s.stand)];
  const curve = new CatmullRomCurve3(pts, false, 'centripetal', 0.5);
  const DIV = 60;
  const lengths = curve.getLengths((pts.length - 1) * DIV);
  const length = lengths[lengths.length - 1];
  stations.forEach((s, i) => { s.u = lengths[(i + 1) * DIV] / length; });
  const startU = 0;
  {
    const spacing = 0.78;
    const n = Math.floor(length / spacing);
    const mats: Matrix4[] = [];
    const p = new Vector3();
    const tmp = new Object3D();
    for (let i = 1; i < n; i++) {
      curve.getPointAt(i / n, p);
      if (stations.some((s) => p.distanceTo(s.center) < s.radius + 0.35)) continue;
      tmp.position.set(p.x, 0.012, p.z);
      tmp.rotation.set(0, i * 1.7, 0);
      const sc = 0.85 + ((i * 37) % 10) / 40;
      tmp.scale.set(sc, 1, sc * 0.82);
      tmp.updateMatrix();
      mats.push(tmp.matrix.clone());
    }
    const stones = new InstancedMesh(new CylinderGeometry(0.26, 0.28, 0.024, 20), M.stone, mats.length);
    mats.forEach((m, i) => stones.setMatrixAt(i, m));
    stones.receiveShadow = true;
    group.add(stones);
  }

  // ---- "you can click here" ring on the highlighted station ----
  const ringMat = new MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.5, side: DoubleSide, depthWrite: false });
  const ring = new Mesh(new RingGeometry(1, 1.07, 72), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  group.add(ring);
  let highlighted: Station | null = null;
  let hovered: string | null = null;
  let focusId: string | null = null;
  let loadTick = 1;

  // ---- bounds for the overview ----
  const center = new Vector3();
  for (const s of stations) center.add(s.center);
  center.divideScalar(Math.max(1, stations.length));
  let radius = 4;
  for (const s of [...stations.map((x) => x.center), pts[0]]) radius = Math.max(radius, s.distanceTo(center) + 1.6);

  return {
    group, stations, curve, length, startU, textures,
    byId: new Map(stations.map((s) => [s.id, s])),
    bounds: { center, radius },
    setHighlight(id) {
      highlighted = stations.find((s) => s.id === id) ?? null;
      ring.visible = !!highlighted;
      if (highlighted) {
        ring.position.set(highlighted.center.x, 0.006, highlighted.center.z);
        ring.scale.setScalar(highlighted.radius + 0.28);
      }
    },
    setHover(id) {
      hovered = id;
      for (const s of stations) s.topMat.emissive.copy(theme.accent).multiplyScalar(s.id === hovered ? 0.18 : 0);
    },
    setFocus(id) { focusId = id; },
    update(t, dt, reduced, camPos, camLook) {
      if (!reduced) for (const a of animators) a(t);
      // lazy-load screenshots for stations near what the camera is looking at
      if ((loadTick += dt) > 0.4) {
        loadTick = 0;
        for (const s of stations) if (s.center.distanceTo(camLook) < 26) s.screen.load();
      }
      for (const s of stations) {
        // a neighbour's screen right in front of the lens would block the shot: hide it until the camera moves on
        s.screen.group.visible = s.id === focusId || s.center.distanceTo(camPos) > 6;
        s.screen.update(t, dt, reduced, camPos, s.id === focusId);
      }
      if (highlighted) {
        const p = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.4);
        ringMat.opacity = 0.25 + 0.4 * p;
        ring.scale.setScalar(highlighted.radius + 0.26 + (reduced ? 0 : p * 0.08));
      }
    },
  };
}
