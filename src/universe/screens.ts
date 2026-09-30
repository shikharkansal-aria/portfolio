// Floating UI screens: at each station a thin rounded slab shows a real screenshot of the project,
// slowly turning and bobbing, with a soft glow below. It turns to face the camera while the guide is there.
import {
  CanvasTexture, Color, DoubleSide, ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PlaneGeometry, Shape, ShapeGeometry, SRGBColorSpace, Texture, TextureLoader, TorusGeometry, Vector3,
} from 'three';
import type { Island, Tier } from './types';
import type { Theme } from './theme';

/**
 * Station id → screenshot. `journey` is a key in public/img/journey/ (we load `<key>-800.webp`, then `<key>.webp`);
 * `fallback` is any other image path. With neither, the screen shows a clean title card built from the island data.
 * Edit this table when new captures land.
 */
export const SCREEN_IMAGE: Record<string, { journey?: string; fallback?: string }> = {
  'agent-builder': { journey: 'agent-builder' },
  outage: { journey: 'nuplay-landing' },
  hisaab: { journey: 'hisaab-phones' },
  aria: { journey: 'aria-mission-control', fallback: '/img/aria-mission-control.webp' },
  dragonfire: { journey: 'dragonfire', fallback: '/img/dragon-icon.webp' },
  'job-hunt': { journey: 'ats-tracker' },
  'ai-router': { journey: 'ai-router' },
  'claude-tools': { journey: 'claude-tools' },
  mailbox: { journey: 'mailbox' },
};

const HEIGHT: Record<Tier, number> = { flagship: 1.55, second: 1.3, mid: 1.12, small: 0.92, moon: 0.92 };
const LIFT = 0.32;    // gap between plinth top and the screen's lower edge
const DEPTH = 0.035;

export interface Screen {
  group: Group;
  meshes: Mesh[];                 // for picking
  /** Local y of the screen's top edge (relative to the station root). */
  top: number;
  /** Load the image (idempotent). */
  load(): void;
  update(t: number, dt: number, reduced: boolean, camPos: Vector3, focused: boolean): void;
  dispose(): void;
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function rounded(w: number, h: number, r: number): Shape {
  const s = new Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Title card used until a real screenshot exists. */
function titleCard(theme: Theme, isl: Island): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 800; c.height = 500;
  const g = c.getContext('2d')!;
  const hex = (col: Color) => `#${col.getHexString()}`;
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 800, 500);
  g.fillStyle = hex(theme.bg); g.fillRect(0, 0, 800, 56);
  [theme.line, theme.line, theme.line].forEach((col, i) => { g.fillStyle = hex(col.clone().lerp(theme.muted, 0.35)); g.beginPath(); g.arc(34 + i * 26, 28, 8, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = hex(theme.accent); g.fillRect(56, 110, 64, 8);
  g.fillStyle = hex(theme.ink);
  g.font = '700 56px system-ui, -apple-system, Segoe UI, sans-serif';
  g.fillText(isl.title.slice(0, 22), 56, 190);
  g.fillStyle = hex(theme.muted);
  g.font = '400 30px system-ui, -apple-system, Segoe UI, sans-serif';
  const words = (isl.tagline || '').split(/\s+/);
  let line = '', y = 250;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > 680 && line) { g.fillText(line, 56, y); line = w; y += 42; if (y > 420) break; } else line = test;
  }
  if (y <= 420) g.fillText(line, 56, y);
  if (isl.metric) {
    g.fillStyle = hex(theme.accent);
    g.font = '600 30px ui-monospace, SFMono-Regular, Menlo, monospace';
    g.fillText(`${isl.metric.before} → ${isl.metric.after}`, 56, 460);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

const loader = new TextureLoader();
const tryLoad = (url: string) => new Promise<Texture>((res, rej) => loader.load(url, res, undefined, rej));

export function buildScreen(theme: Theme, isl: Island, plinthTop: number, frontYaw: number, phase: number): Screen {
  const H = HEIGHT[isl.tier];
  const group = new Group();
  const pivot = new Group();                   // bobs and turns
  const baseY = plinthTop + LIFT + H / 2;
  pivot.position.y = baseY;
  group.add(pivot);

  const slabMat = new MeshStandardMaterial({ color: theme.surface, roughness: 0.35, metalness: 0, transparent: true, opacity: 0.9 });
  const imgMat = new MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
  const backMat = new MeshBasicMaterial({ color: theme.sky.clone().lerp(theme.surface, 0.4), transparent: true, opacity: 0.55, side: DoubleSide });
  const slab = new Mesh(undefined, slabMat);
  const img = new Mesh(undefined, imgMat);
  const back = new Mesh(undefined, backMat);
  slab.castShadow = true;
  pivot.add(slab, img, back);

  let W = 0;
  const shape = (aspect: number) => {
    const w = Math.min(H * aspect, H * 1.9);
    if (Math.abs(w - W) < 1e-3) return;
    W = w;
    const r = Math.min(w, H) * 0.07;
    slab.geometry?.dispose(); img.geometry?.dispose(); back.geometry?.dispose();
    const eg = new ExtrudeGeometry(rounded(w, H, r), { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 6 });
    eg.translate(0, 0, -DEPTH / 2);
    slab.geometry = eg;
    const inset = 0.028;
    const sg = new ShapeGeometry(rounded(w - inset * 2, H - inset * 2, Math.max(0.01, r - inset)), 8);
    const pos = sg.getAttribute('position'), uv = sg.getAttribute('uv');
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + (w - inset * 2) / 2) / (w - inset * 2), (pos.getY(i) + (H - inset * 2) / 2) / (H - inset * 2));
    uv.needsUpdate = true;
    img.geometry = sg;
    img.position.z = DEPTH / 2 + 0.011;
    const bg = sg.clone();
    back.geometry = bg;
    back.position.z = -DEPTH / 2 - 0.011;
    back.rotation.y = Math.PI;
  };
  shape(16 / 10);

  // soft glow on the plinth top + a thin ring under the screen
  const glowC = document.createElement('canvas');
  glowC.width = glowC.height = 128;
  {
    const g = glowC.getContext('2d')!;
    const a = theme.accent.clone().lerp(theme.sky, 0.3);
    const rgb = `${Math.round(a.r * 255)},${Math.round(a.g * 255)},${Math.round(a.b * 255)}`;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, `rgba(${rgb},0.4)`); grad.addColorStop(0.5, `rgba(${rgb},0.16)`); grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  }
  const glowTex = new CanvasTexture(glowC);
  const glow = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false }));
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = plinthTop + 0.006;
  glow.scale.setScalar(H * 1.8);
  const ring = new Mesh(new TorusGeometry(H * 0.42, 0.012, 6, 64), new MeshBasicMaterial({ color: theme.accent.clone().lerp(theme.sky, 0.45) }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = plinthTop + LIFT * 0.45;
  group.add(glow, ring);

  let yaw = frontYaw;
  let loaded = false;
  let tex: Texture | null = null;
  const setTex = (t: Texture) => {
    tex?.dispose();
    tex = t;
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    imgMat.map = t;
    imgMat.needsUpdate = true;
    const im = t.image as { width?: number; height?: number } | undefined;
    if (im?.width && im?.height) shape(im.width / im.height);
  };
  setTex(titleCard(theme, isl)); // visible straight away, replaced when the screenshot arrives

  return {
    group,
    meshes: [slab, img, back],
    top: plinthTop + LIFT + H,
    load() {
      if (loaded) return;
      loaded = true;
      const src = SCREEN_IMAGE[isl.id] ?? {};
      const urls = [
        ...(src.journey ? [`/img/journey/${src.journey}-800.webp`, `/img/journey/${src.journey}.webp`] : []),
        ...(src.fallback ? [src.fallback] : []),
      ];
      (async () => {
        for (const u of urls) {
          try { setTex(await tryLoad(u)); return; } catch { /* try the next one */ }
        }
      })();
    },
    update(t, dt, reduced, camPos, focused) {
      const wp = group.getWorldPosition(new Vector3());
      const toCam = Math.atan2(camPos.x - wp.x, camPos.z - wp.z);
      if (reduced) {
        yaw = focused ? toCam : frontYaw;
        pivot.position.y = baseY;
      } else {
        if (focused) yaw += wrap(toCam - yaw) * (1 - Math.exp(-dt * 4));
        else yaw += dt * 0.35;
        pivot.position.y = baseY + Math.sin(t * 1.1 + phase) * 0.05;
      }
      pivot.rotation.y = yaw;
      ring.rotation.z = reduced ? 0 : t * 0.4;
    },
    dispose() { tex?.dispose(); glowTex.dispose(); },
  };
}
