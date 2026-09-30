// Ambient life for the studio: pale colour zones, rolling hills, low-poly trees/bushes/rocks (instanced),
// drifting clouds with soft shadows, floating light motes, pennant flags at each stop, faint horizon landmarks.
// All procedural, all in the light palette.
import {
  BufferGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry, DodecahedronGeometry, DoubleSide,
  Float32BufferAttribute, Group, IcosahedronGeometry, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  Object3D, PlaneGeometry, Points, PointsMaterial, SphereGeometry, SRGBColorSpace, TorusGeometry, Vector3,
} from 'three';
import type { Island } from './types';
import type { Theme } from './theme';
import type { World } from './world';

export interface Decor { group: Group; textures: CanvasTexture[]; update(t: number, dt: number, reduced: boolean): void }

function softDisc(color: Color, alpha: number): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const { r, g: gg, b } = color.getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace);
  const rgb = `${Math.round(r * 255)},${Math.round(gg * 255)},${Math.round(b * 255)}`;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(${rgb},${alpha})`);
  grad.addColorStop(0.6, `rgba(${rgb},${alpha * 0.55})`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function buildDecor(theme: Theme, world: World, islands: Island[]): Decor {
  const group = new Group();
  const textures: CanvasTexture[] = [];
  const animators: ((t: number, dt: number) => void)[] = [];
  let seed = 20260930;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const std = (c: Color, rough = 0.85) => new MeshStandardMaterial({ color: c, roughness: rough, metalness: 0, flatShading: true });
  const scopeOf = new Map(islands.map((i) => [i.id, i.scope]));

  // ---- colour zones under each station (work = sky, personal = mint, competition = lilac) ----
  const zoneTex = {
    work: softDisc(theme.sky.clone().lerp(theme.accent, 0.08), 0.75),
    personal: softDisc(theme.mint, 0.8),
    competition: softDisc(theme.lilac, 0.8),
  };
  textures.push(...Object.values(zoneTex));
  const zoneGeo = new PlaneGeometry(1, 1);
  for (const s of world.stations) {
    const scope = scopeOf.get(s.id) ?? 'personal';
    const m = new Mesh(zoneGeo, new MeshBasicMaterial({ map: zoneTex[scope], transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(s.center.x, 0.003, s.center.z);
    m.scale.setScalar(s.radius * 6.5);
    m.renderOrder = -1;
    group.add(m);
  }

  // keep-out test: stations, the path, the start
  const pathPts = world.curve.getSpacedPoints(120);
  // sight lines from each stop's camera position (see stationShot in scene.ts) must stay open
  const UPV = new Vector3(0, 1, 0);
  const sight: Vector3[] = [];
  for (const s of world.stations) {
    const d = new Vector3().subVectors(s.stand, s.center).setY(0).normalize().applyAxisAngle(UPV, 0.85);
    for (let k = 1.5; k <= 16; k += 1.2) sight.push(s.center.clone().lerp(s.stand, 0.55).addScaledVector(d, k));
  }
  const clear = (x: number, z: number, pad: number) => {
    for (const s of world.stations) if (Math.hypot(x - s.center.x, z - s.center.z) < s.radius + pad) return false;
    for (const q of sight) if (Math.hypot(x - q.x, z - q.z) < 2.2) return false;
    for (const p of pathPts) if (Math.hypot(x - p.x, z - p.z) < pad * 0.8 + 0.6) return false;
    return true;
  };
  const { center, radius } = world.bounds;
  const scatter = (n: number, pad: number, spread: number) => {
    const out: [number, number][] = [];
    for (let tries = 0; out.length < n && tries < n * 40; tries++) {
      const x = center.x + (rnd() * 2 - 1) * (spread * 0.55);
      const z = center.z + (rnd() * 2 - 1) * spread;
      if (clear(x, z, pad)) out.push([x, z]);
    }
    return out;
  };

  // ---- rolling hills on the edges (big flattened domes) ----
  const hillMat = std(theme.surface.clone().lerp(theme.floorEdge, 0.6), 1);
  const hillGeo = new SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < 8; i++) {
    const h = new Mesh(hillGeo, hillMat);
    const r = 5 + rnd() * 6;
    h.scale.set(r, 0.5 + rnd() * 0.7, r * (0.7 + rnd() * 0.5));
    // only on the far side of the path (away from the default cameras) and beyond its far end
    if (i < 5) h.position.set(center.x - (radius * 0.6 + 8 + rnd() * 10), 0, center.z + (i / 4 - 0.5) * radius * 2);
    else h.position.set(center.x + (i - 6) * 12, 0, center.z - radius - 9 - rnd() * 6);
    h.receiveShadow = true;
    group.add(h);
  }

  // ---- trees, bushes, rocks (instanced) ----
  const tmp = new Object3D();
  const foliageCols = [theme.mint.clone().lerp(new Color('#7cc9a4'), 0.35), theme.sky.clone().lerp(theme.accent, 0.18), theme.lilac.clone().lerp(new Color('#8a7de0'), 0.25), theme.mint];
  const trees = scatter(26, 1.6, radius * 1.05);
  const trunks = new InstancedMesh(new CylinderGeometry(0.05, 0.08, 1, 6), std(new Color('#D9DEE6')), trees.length);
  const crowns = new InstancedMesh(new IcosahedronGeometry(0.62, 0), std(new Color('#ffffff'), 0.9), trees.length);
  const cones = new InstancedMesh(new ConeGeometry(0.5, 1.3, 7), std(new Color('#ffffff'), 0.9), trees.length);
  let nc = 0, nk = 0;
  trees.forEach(([x, z], i) => {
    const s = 0.75 + rnd() * 0.7;
    tmp.position.set(x, 0.5 * s, z); tmp.rotation.set(0, 0, 0); tmp.scale.set(s, s, s); tmp.updateMatrix();
    trunks.setMatrixAt(i, tmp.matrix);
    const col = foliageCols[Math.floor(rnd() * foliageCols.length)];
    tmp.rotation.set(0, rnd() * 6, 0);
    if (rnd() < 0.55) {
      tmp.position.set(x, (1.05 + 0.1) * s, z); tmp.scale.set(s, s * 1.05, s); tmp.updateMatrix();
      crowns.setMatrixAt(nc, tmp.matrix); crowns.setColorAt(nc++, col);
    } else {
      tmp.position.set(x, 1.25 * s, z); tmp.scale.set(s, s, s); tmp.updateMatrix();
      cones.setMatrixAt(nk, tmp.matrix); cones.setColorAt(nk++, col);
    }
  });
  crowns.count = nc; cones.count = nk;
  for (const m of [trunks, crowns, cones]) { m.castShadow = true; group.add(m); }

  const bushSpots = scatter(32, 1.0, radius * 0.9);
  const bushes = new InstancedMesh(new IcosahedronGeometry(0.32, 0), std(new Color('#ffffff'), 0.9), bushSpots.length);
  bushSpots.forEach(([x, z], i) => {
    const s = 0.6 + rnd() * 0.8;
    tmp.position.set(x, 0.18 * s, z); tmp.rotation.set(0, rnd() * 6, 0); tmp.scale.set(s * 1.2, s * 0.8, s); tmp.updateMatrix();
    bushes.setMatrixAt(i, tmp.matrix);
    bushes.setColorAt(i, foliageCols[i % foliageCols.length].clone().lerp(theme.surface, 0.25));
  });
  bushes.castShadow = true;
  group.add(bushes);

  const rockSpots = scatter(22, 0.9, radius);
  const rocks = new InstancedMesh(new DodecahedronGeometry(0.25, 0), std(new Color('#E3E7EE')), rockSpots.length);
  rockSpots.forEach(([x, z], i) => {
    const s = 0.5 + rnd() * 0.9;
    tmp.position.set(x, 0.1 * s, z); tmp.rotation.set(rnd(), rnd() * 6, rnd()); tmp.scale.set(s, s * 0.6, s * 0.9); tmp.updateMatrix();
    rocks.setMatrixAt(i, tmp.matrix);
  });
  rocks.castShadow = true;
  group.add(rocks);

  // ---- pennant flags beside each stop (sway) ----
  const poleMat = std(new Color('#D5DBE5'), 0.6);
  const poleGeo = new CylinderGeometry(0.025, 0.03, 1.5, 8);
  const flagGeo = new BufferGeometry();
  flagGeo.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0.55, -0.14, 0, 0, -0.28, 0], 3));
  flagGeo.computeVertexNormals();
  const flagMats = [theme.accent.clone().lerp(theme.sky, 0.35), theme.lilac.clone().lerp(new Color('#7c6bd9'), 0.45), theme.mint.clone().lerp(new Color('#2f9e6e'), 0.45)]
    .map((c) => new MeshStandardMaterial({ color: c, roughness: 0.8, side: DoubleSide }));
  const flags: Mesh[] = [];
  world.stations.forEach((s, i) => {
    const side = new Vector3().subVectors(s.stand, s.center).setY(0).normalize().applyAxisAngle(new Vector3(0, 1, 0), 2.3); // behind the plinth, out of the arrival shot
    const p = s.center.clone().addScaledVector(side, s.radius + 0.9);
    const pole = new Mesh(poleGeo, poleMat);
    pole.position.set(p.x, 0.75, p.z);
    pole.castShadow = true;
    const flag = new Mesh(flagGeo, flagMats[i % flagMats.length]);
    flag.position.set(p.x, 1.48, p.z);
    flag.castShadow = true;
    flag.userData.phase = i * 1.3;
    const knob = new Mesh(new SphereGeometry(0.045, 10, 8), poleMat);
    knob.position.set(p.x, 1.52, p.z);
    group.add(pole, flag, knob);
    flags.push(flag);
  });
  animators.push((t) => { for (const f of flags) f.rotation.y = 0.5 + Math.sin(t * 1.4 + f.userData.phase) * 0.35; });

  // ---- clouds (soft white puffs) with faint moving shadows ----
  const cloudMat = new MeshStandardMaterial({ color: '#ffffff', roughness: 1, flatShading: true, transparent: true, opacity: 0.92 });
  const puffGeo = new IcosahedronGeometry(1, 1);
  const shadowTex = softDisc(theme.ink, 0.07);
  textures.push(shadowTex);
  const shadowMat = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const clouds: { g: Group; sh: Mesh; speed: number; span: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const g = new Group();
    const n = 3 + Math.floor(rnd() * 3);
    for (let k = 0; k < n; k++) {
      const puff = new Mesh(puffGeo, cloudMat);
      const s = 0.7 + rnd() * 0.8;
      puff.scale.set(s * 1.3, s * 0.8, s);
      puff.position.set((k - n / 2) * 0.9, rnd() * 0.3, (rnd() - 0.5) * 0.8);
      g.add(puff);
    }
    g.position.set(center.x + (rnd() * 2 - 1) * radius, 8 + rnd() * 3, center.z + (rnd() * 2 - 1) * radius);
    const sh = new Mesh(zoneGeo, shadowMat);
    sh.rotation.x = -Math.PI / 2;
    sh.scale.set(n * 1.6, n * 1.1, 1);
    sh.position.y = 0.005;
    group.add(g, sh);
    clouds.push({ g, sh, speed: 0.25 + rnd() * 0.25, span: radius * 1.3 });
  }
  animators.push((_t, dt) => {
    for (const c of clouds) {
      c.g.position.x += c.speed * dt;
      if (c.g.position.x > center.x + c.span) c.g.position.x = center.x - c.span;
    }
  });
  const syncShadows = () => { for (const c of clouds) c.sh.position.set(c.g.position.x + 1.5, 0.005, c.g.position.z + 1); };

  // ---- floating light motes ----
  const N = 160;
  const mp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) mp.set([center.x + (rnd() * 2 - 1) * radius * 0.7, 0.3 + rnd() * 4, center.z + (rnd() * 2 - 1) * radius], i * 3);
  const moteGeo = new BufferGeometry();
  moteGeo.setAttribute('position', new Float32BufferAttribute(mp, 3));
  const moteTex = softDisc(new Color('#ffffff'), 1);
  textures.push(moteTex);
  const motes = new Points(moteGeo, new PointsMaterial({ size: 0.14, map: moteTex, color: theme.sky.clone().lerp(theme.accent, 0.25), transparent: true, opacity: 0.7, depthWrite: false }));
  group.add(motes);
  animators.push((t, dt) => {
    const a = moteGeo.getAttribute('position') as Float32BufferAttribute;
    for (let i = 0; i < N; i++) {
      let y = a.getY(i) + dt * (0.12 + (i % 5) * 0.03);
      if (y > 4.5) y = 0.3;
      a.setY(i, y);
      a.setX(i, a.getX(i) + Math.sin(t * 0.6 + i) * dt * 0.08);
    }
    a.needsUpdate = true;
  });

  // ---- faint landmarks on the horizon (fog softens them) ----
  const markMat = std(theme.surface.clone().lerp(theme.sky, 0.35), 1);
  const marks: [BufferGeometry, number, number, number, number][] = [
    [new CylinderGeometry(1.2, 1.6, 9, 8), -24, -50, 4.5, 0],
    [new ConeGeometry(3.5, 7, 6), 22, -44, 3.5, 0],
    [new TorusGeometry(2.4, 0.4, 8, 24, Math.PI), -6, -58, 0, 0],
    [new CylinderGeometry(0.8, 0.8, 12, 8), 30, -20, 6, 0],
    [new IcosahedronGeometry(3, 0), -30, -12, 2.5, 0],
  ];
  for (const [geo, x, z, y] of marks) {
    const m = new Mesh(geo, markMat);
    m.position.set(center.x + x, y, center.z + z);
    group.add(m);
  }

  syncShadows();
  return {
    group, textures,
    update(t, dt, reduced) {
      if (reduced) return;
      for (const a of animators) a(t, dt);
      syncShadows();
    },
  };
}
