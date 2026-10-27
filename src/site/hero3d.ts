// Home hero scene: a projector on a pedestal throws a bent glass screen that cycles through the work.
// Loaded lazily after first paint (see main.ts). Everything here is original geometry; the only images
// are Shikhar's own Bitmoji, the Hisaab icon and his own case-study screenshots.
import {
  ACESFilmicToneMapping, AdditiveBlending, BufferGeometry, CanvasTexture, Color, CylinderGeometry, DirectionalLight,
  DoubleSide, Float32BufferAttribute, Group, HemisphereLight, LineBasicMaterial, LineLoop, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PMREMGenerator, Raycaster, Scene, ShaderMaterial, SRGBColorSpace, Vector2,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const SCREEN_W = 5.2;
const SCREEN_H = 3.1;
const BEND_R = 3.4; // radius of the bend: z = x^2 / 2R, so the side edges come toward the viewer
const bendZ = (x: number) => (x * x) / (2 * BEND_R);

type Frame = { href: string; label: string; cta: string; draw: (c: CanvasRenderingContext2D, w: number, h: number) => void };

const SERIF = '"DM Serif Display", Georgia, serif';
const SANS = '"Inter Variable", Inter, system-ui, sans-serif';

const load = (src: string) =>
  new Promise<HTMLImageElement>((res) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => res(i);
    i.src = src;
  });

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

/** The browser window every frame lives in: soft white card, three dots, a content area. */
function windowChrome(c: CanvasRenderingContext2D, w: number, h: number) {
  const g = c.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#f4f2ff');
  g.addColorStop(1, '#efe8fb');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(255,255,255,0.8)';
  rr(c, 28, 24, w - 56, 44, 16);
  c.fill();
  ['#ff6b6b', '#ffc24b', '#4ad37a'].forEach((col, i) => {
    c.fillStyle = col;
    c.beginPath();
    c.arc(56 + i * 26, 46, 8, 0, Math.PI * 2);
    c.fill();
  });
  return { x: 28, y: 84, w: w - 56, h: h - 84 - 28 };
}

function chip(c: CanvasRenderingContext2D, text: string, x: number, y: number, fill = '#3a3de0', color = '#ffffff') {
  c.font = `600 26px ${SANS}`;
  const tw = c.measureText(text).width;
  c.fillStyle = fill;
  rr(c, x, y, tw + 40, 48, 24);
  c.fill();
  c.fillStyle = color;
  c.textBaseline = 'middle';
  c.fillText(text, x + 20, y + 25);
  return tw + 40;
}

function cover(c: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, r: number) {
  if (!img.naturalWidth) return;
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / s, sh = h / s;
  c.save();
  rr(c, x, y, w, h, r);
  c.clip();
  c.drawImage(img, 0, 0, sw, sh, x, y, w, h);
  c.restore();
}

function buildFrames(imgs: { hisaab: HTMLImageElement }): Frame[] {
  const f: Pick<Frame, 'href' | 'draw'>[] = [
    {
      href: '/work/',
      draw(c, w, h) {
        const a = windowChrome(c, w, h);
        c.fillStyle = '#ffffff';
        c.shadowColor = 'rgba(80,60,190,0.18)';
        c.shadowBlur = 36;
        c.shadowOffsetY = 12;
        rr(c, a.x + 24, a.y + 18, a.w * 0.62, a.h - 44, 28);
        c.fill();
        c.shadowColor = 'transparent';
        c.fillStyle = '#16143a';
        c.textBaseline = 'alphabetic';
        c.font = `400 78px ${SERIF}`;
        c.fillText('Hello there,', a.x + 64, a.y + 140);
        c.fillText('visitor 👋', a.x + 64, a.y + 232);
        c.font = `400 28px ${SANS}`;
        c.fillStyle = '#56565b';
        c.fillText('Product and growth. Six case studies,', a.x + 66, a.y + 300);
        c.fillText('each with a number I measured.', a.x + 66, a.y + 336);
        const labels = ['Agent Builder', 'NuPlay', 'Hisaab', 'Aria', 'EY CAFTA'];
        labels.forEach((t, i) => {
          const x = a.x + a.w * 0.62 + 58;
          const y = a.y + 40 + i * 74;
          c.fillStyle = i === 2 ? '#3a3de0' : 'rgba(255,255,255,0.85)';
          rr(c, x, y, a.w * 0.38 - 62, 56, 18);
          c.fill();
          c.fillStyle = i === 2 ? '#ffffff' : '#16143a';
          c.font = `600 24px ${SANS}`;
          c.textBaseline = 'middle';
          c.fillText(t, x + 22, y + 29);
        });
      },
    },
    {
      href: '/work/agent-builder/',
      draw(c, w, h) {
        const a = windowChrome(c, w, h);
        chip(c, 'Agent Builder · Nurix AI', a.x + 24, a.y + 24, '#16143a');
        c.textBaseline = 'alphabetic';
        c.font = `400 70px ${SERIF}`;
        c.fillStyle = '#7a7a86';
        const t1 = '5 days by hand';
        c.fillText(t1, a.x + 40, a.y + 190);
        const m = c.measureText(t1).width;
        c.fillRect(a.x + 40, a.y + 190 - 24, m, 5);
        c.fillStyle = '#3a3de0';
        c.font = `400 140px ${SERIF}`;
        c.fillText('30 minutes', a.x + 36, a.y + 340);
        c.fillStyle = '#16143a';
        c.font = `500 30px ${SANS}`;
        c.fillText('to set up AI voice agents for one new client', a.x + 40, a.y + 400);
      },
    },
    {
      href: '/work/hisaab/',
      draw(c, w, h) {
        const a = windowChrome(c, w, h);
        chip(c, 'Now building: Hisaab', a.x + 24, a.y + 22, '#3a3de0');
        const items: [string, string][] = [['26', 'students surveyed before any code'], ['390', 'automated tests passing'], ['4', 'agents in the Round 3 build'], ['₹2', 'one-time unlock, no subscription']];
        const cw = (a.w - 24 * 2 - 20) / 2, ch = (a.h - 96 - 20) / 2;
        items.forEach(([n, t], i) => {
          const x = a.x + 24 + (i % 2) * (cw + 20), y = a.y + 90 + Math.floor(i / 2) * (ch + 20);
          c.fillStyle = '#ffffff';
          c.shadowColor = 'rgba(80,60,190,0.16)';
          c.shadowBlur = 24;
          c.shadowOffsetY = 8;
          rr(c, x, y, cw, ch, 24);
          c.fill();
          c.shadowColor = 'transparent';
          c.textBaseline = 'alphabetic';
          c.fillStyle = '#3a3de0';
          c.font = `400 112px ${SERIF}`;
          c.fillText(n, x + 32, y + ch * 0.58);
          c.fillStyle = '#16143a';
          c.font = `500 28px ${SANS}`;
          c.fillText(t, x + 34, y + ch - 34);
        });
      },
    },
    {
      href: '/work/hisaab/',
      draw(c, w, h) {
        const a = windowChrome(c, w, h);
        c.fillStyle = '#eceaf8';
        rr(c, a.x + 12, a.y + 8, a.w - 24, a.h - 16, 22);
        c.fill();
        const k = Math.min((a.w - 24) / imgs.hisaab.naturalWidth, (a.h - 16) / imgs.hisaab.naturalHeight);
        const iw = imgs.hisaab.naturalWidth * k, ih = imgs.hisaab.naturalHeight * k;
        c.save();
        rr(c, a.x + 12, a.y + 8, a.w - 24, a.h - 16, 22);
        c.clip();
        c.drawImage(imgs.hisaab, a.x + 12 + (a.w - 24 - iw) / 2, a.y + 8 + (a.h - 16 - ih) / 2, iw, ih);
        c.restore();
        chip(c, 'Now building: Hisaab', a.x + 36, a.y + a.h - 76, '#3a3de0');
      },
    },
    {
      href: '/work/agent-builder/',
      draw(c, w, h) {
        const a = windowChrome(c, w, h);
        c.textBaseline = 'alphabetic';
        c.fillStyle = '#3a3de0';
        c.font = `400 250px ${SERIF}`;
        c.fillText('53', a.x + 40, a.y + 290);
        c.fillStyle = '#16143a';
        c.font = `600 34px ${SANS}`;
        c.fillText('voice and chat bots delivered', a.x + 400, a.y + 170);
        c.fillText('into client demos at Nurix AI,', a.x + 400, a.y + 216);
        c.fillStyle = '#56565b';
        c.font = `400 28px ${SANS}`;
        c.fillText('for 27 companies across 18 industries', a.x + 400, a.y + 270);
        c.fillText('and 7 languages.', a.x + 400, a.y + 308);
      },
    },
  ];
  // Hisaab leads (the thing being built now), then Agent Builder, the 53 bots, and the greeting last.
  const meta: [string, string][] = [['Hello', ''], ['Agent Builder', 'Read the case study'], ['Hisaab numbers', 'Read the Hisaab story'], ['Hisaab app', 'Read the Hisaab story'], ['53 bots', 'Read the case study']];
  const all: Frame[] = f.map((fr, i) => ({ ...fr, label: meta[i][0], cta: meta[i][1] }));
  return [all[3], all[2], all[1], all[4], all[0]];
}

export async function startHero(host: HTMLElement, opts: { reduce: boolean }) {
  const canvas = host.querySelector<HTMLCanvasElement>('canvas');
  if (!canvas) return;
  const gl = new WebGLRenderer({ canvas, antialias: devicePixelRatio < 2, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: location.search.includes('poster') });
  gl.setClearColor(0x000000, 0);
  gl.toneMapping = ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.05;
  gl.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(gl);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environmentIntensity = 0.9;
  const camera = new PerspectiveCamera(30, 1, 0.1, 80);
  scene.add(new HemisphereLight(0xdfe6ff, 0xf0b9d8, 0.9));
  const sun = new DirectionalLight(0xfff0e6, 2.1);
  sun.position.set(-4, 7, 6);
  scene.add(sun);

  const stage = new Group();
  scene.add(stage);

  // Pedestal
  const white = new MeshStandardMaterial({ color: 0xf7f4ff, roughness: 0.55, metalness: 0 });
  const ped = new Mesh(new RoundedBoxGeometry(8.4, 3, 3.6, 6, 0.28), white);
  ped.position.set(0, -1.55 - 1.5, 0);
  stage.add(ped);

  // Projector
  const lav = new MeshPhysicalMaterial({ color: 0xa597f0, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 });
  const proj = new Group();
  proj.position.set(0, -1.55, 0);
  const body = new Mesh(new RoundedBoxGeometry(3.1, 0.6, 1.6, 6, 0.24), lav);
  body.position.y = 0.3;
  proj.add(body);
  const top = new Mesh(new CylinderGeometry(0.62, 0.7, 0.07, 48), new MeshBasicMaterial({ color: 0xcdf7ff }));
  top.position.set(0, 0.63, 0);
  top.scale.z = 0.6;
  proj.add(top);
  const strip = new Mesh(new RoundedBoxGeometry(1.05, 0.09, 0.05, 3, 0.02), new MeshBasicMaterial({ color: 0x66f2ff }));
  strip.position.set(-0.3, 0.26, 0.82);
  proj.add(strip);
  const knob = new Mesh(new CylinderGeometry(0.2, 0.2, 0.1, 32), new MeshPhysicalMaterial({ color: 0xffa98a, roughness: 0.35, clearcoat: 0.6 }));
  knob.rotation.x = Math.PI / 2;
  knob.position.set(1.02, 0.3, 0.82);
  proj.add(knob);
  stage.add(proj);

  // Light cone: narrow at the projector, wide at the screen; additive so it glows against the sky.
  const coneMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vUv; uniform float uTime;
      void main(){
        float fall = pow(1.0 - vUv.y, 1.5);
        float streak = 0.82 + 0.18 * sin(vUv.x * 80.0 + uTime * 0.6);
        gl_FragColor = vec4(vec3(0.62, 0.9, 1.0), fall * 0.34 * streak);
      }`,
  });
  const cone = new Mesh(new CylinderGeometry(2.45, 0.55, 2.1, 64, 1, true), coneMat);
  cone.position.set(0, -1.55 + 0.66 + 1.05, 0);
  cone.scale.z = 0.32;
  stage.add(cone);

  // The bent screen: glass + content, both bent with the same curve.
  const bend = (geo: PlaneGeometry, dz: number) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, bendZ(p.getX(i)) + dz);
    geo.computeVertexNormals();
    return geo;
  };
  const screen = new Group();
  screen.position.set(0, 1.25, -0.25);
  const tex = document.createElement('canvas');
  tex.width = 1250;
  tex.height = 746;
  const ctx = tex.getContext('2d')!;
  const map = new CanvasTexture(tex);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  const content = new Mesh(bend(new PlaneGeometry(SCREEN_W - 0.3, SCREEN_H - 0.3, 56, 1), -0.05), new MeshBasicMaterial({ map, toneMapped: false, transparent: true, opacity: 1 }));
  screen.add(content);
  const glass = new Mesh(
    bend(new PlaneGeometry(SCREEN_W, SCREEN_H, 56, 1), 0.02),
    new MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, side: DoubleSide, depthWrite: false, envMapIntensity: 1.6 }),
  );
  screen.add(glass);
  // Edge line following the bend
  const pts: number[] = [];
  const steps = 48;
  const hw = SCREEN_W / 2, hh = SCREEN_H / 2;
  for (let i = 0; i <= steps; i++) { const x = -hw + (SCREEN_W * i) / steps; pts.push(x, hh, bendZ(x) + 0.03); }
  for (let i = 0; i <= steps; i++) { const x = hw - (SCREEN_W * i) / steps; pts.push(x, -hh, bendZ(x) + 0.03); }
  const lg = new BufferGeometry();
  lg.setAttribute('position', new Float32BufferAttribute(pts, 3));
  screen.add(new LineLoop(lg, new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })));
  // Purple corner knobs, turned to follow the surface
  const knobMat = new MeshPhysicalMaterial({ color: 0x8e72f2, roughness: 0.3, clearcoat: 0.8, emissive: new Color(0x3b2a9c), emissiveIntensity: 0.35 });
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const k = new Mesh(new RoundedBoxGeometry(0.42, 0.42, 0.22, 4, 0.1), knobMat);
    const x = sx * hw;
    k.position.set(x, sy * hh, bendZ(x) + 0.08);
    k.rotation.y = -Math.atan(x / BEND_R);
    screen.add(k);
  }
  stage.add(screen);

  // Props: Bitmoji on the left, Hisaab icon on the right
  const [avatar, logo, hisaab] = await Promise.all([
    load('/img/avatar-cutout.webp'),
    load('/img/hisaab-logo.svg'),
    load('/img/journey/hisaab-phones-800.webp'),
  ]);
  const avTex = new CanvasTexture(avatar);
  avTex.colorSpace = SRGBColorSpace;
  const av = new Mesh(new PlaneGeometry(2.4 * (avatar.naturalWidth / avatar.naturalHeight || 0.358), 2.4), new MeshBasicMaterial({ map: avTex, transparent: true, alphaTest: 0.02, toneMapped: false }));
  av.position.set(-3.05, -1.55 + 1.2, 0.5);
  stage.add(av);

  const shadowC = document.createElement('canvas');
  shadowC.width = shadowC.height = 128;
  const sctx = shadowC.getContext('2d')!;
  const rg = sctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  rg.addColorStop(0, 'rgba(70,50,150,0.38)');
  rg.addColorStop(1, 'rgba(70,50,150,0)');
  sctx.fillStyle = rg;
  sctx.fillRect(0, 0, 128, 128);
  const shadowTex = new CanvasTexture(shadowC);
  const contact = (x: number, z: number, w: number) => {
    const m = new Mesh(new PlaneGeometry(w, w * 0.45), new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, -1.545, z);
    stage.add(m);
  };
  contact(-3.05, 0.5, 1.7);
  contact(2.95, 0.5, 1.6);

  const icon = document.createElement('canvas');
  icon.width = icon.height = 256;
  const ictx = icon.getContext('2d')!;
  ictx.fillStyle = '#ffffff';
  ictx.fillRect(0, 0, 256, 256);
  if (logo.naturalWidth) ictx.drawImage(logo, 28, 28, 200, 200);
  const iconTex = new CanvasTexture(icon);
  iconTex.colorSpace = SRGBColorSpace;
  const cubeMats = [0, 1, 2, 3, 4, 5].map((i) => new MeshStandardMaterial({ color: i === 4 ? 0xffffff : 0xece6ff, map: i === 4 ? iconTex : null, roughness: 0.4 }));
  const cube = new Mesh(new RoundedBoxGeometry(1, 1, 1, 6, 0.2), cubeMats);
  cube.position.set(2.95, -1.55 + 0.62, 0.5);
  cube.rotation.set(0.1, -0.5, 0);
  stage.add(cube);
  // "Now building: Hisaab" tag on the pedestal face, so the cube reads as the thing to click.
  const lab = document.createElement('canvas');
  lab.width = 720;
  lab.height = 150;
  const lc = lab.getContext('2d')!;
  lc.fillStyle = '#16143a';
  lc.beginPath();
  lc.roundRect(0, 10, 720, 130, 65);
  lc.fill();
  lc.fillStyle = '#ffffff';
  lc.font = `600 52px ${SANS}`;
  lc.textAlign = 'center';
  lc.textBaseline = 'middle';
  lc.fillText('Now building: Hisaab ›', 360, 76);
  const labTex = new CanvasTexture(lab);
  labTex.colorSpace = SRGBColorSpace;
  const labelMesh = new Mesh(new PlaneGeometry(2.0, 2.0 * (150 / 720)), new MeshBasicMaterial({ map: labTex, transparent: true, toneMapped: false, depthWrite: false }));
  labelMesh.position.set(2.55, -1.85, 1.86);
  stage.add(labelMesh);

  // Screen content
  const frames = buildFrames({ hisaab });
  await document.fonts.load(`400 40px "DM Serif Display"`).catch(() => {});
  await document.fonts.load(`600 24px "Inter Variable"`).catch(() => {});
  let cur = 0;
  let nxt = -1;
  let tStart = 0;
  const off = document.createElement('canvas');
  off.width = tex.width;
  off.height = tex.height;
  const octx = off.getContext('2d')!;
  const drawFrame = (c: CanvasRenderingContext2D, i: number) => {
    const fr = frames[i];
    fr.draw(c, tex.width, tex.height);
    if (fr.cta) {
      c.font = `600 26px ${SANS}`;
      const tw = c.measureText(`${fr.cta} ›`).width + 40;
      chip(c, `${fr.cta} ›`, tex.width - 40 - tw, tex.height - 104, '#16143a');
    }
  };
  const paint = (p: number) => {
    ctx.clearRect(0, 0, tex.width, tex.height);
    drawFrame(ctx, cur);
    if (nxt >= 0) {
      octx.clearRect(0, 0, off.width, off.height);
      drawFrame(octx, nxt);
      // Pure crossfade, held back at both ends so the two frames' text never sits half-visible for long.
      const e = Math.min(1, Math.max(0, (p - 0.2) / 0.6));
      ctx.save();
      ctx.globalAlpha = e * e * (3 - 2 * e);
      ctx.drawImage(off, 0, 0);
      ctx.restore();
    }
    map.needsUpdate = true;
  };
  paint(0);

  // Sizing: fit the whole scene into the host at any aspect ratio.
  const fit = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    gl.setPixelRatio(Math.min(devicePixelRatio, matchMedia('(pointer: coarse)').matches ? 1.5 : 2));
    gl.setSize(w, h, false);
    camera.aspect = w / h;
    labelMesh.visible = camera.aspect >= 1.2; // on a narrow scene the tag would run off the edge; the screen frame carries the same label
    const t = Math.tan((camera.fov * Math.PI) / 360);
    const needH = 6.0 / 2 / t;
    const needW = (camera.aspect < 1.2 ? 7.4 : 9.0) / 2 / (t * camera.aspect);
    camera.position.set(0, 0.55, Math.max(needH, needW));
    camera.lookAt(0, 0.35, 0);
    camera.updateProjectionMatrix();
    draw();
  };

  // Interaction
  let on = !opts.reduce;
  let tx = 0, ty = 0, cx = 0, cy = 0, visible = true, raf = 0, lastSwap = performance.now();
  const ray = new Raycaster();
  const ndc = new Vector2();
  const setPointer = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    tx = ndc.x;
    ty = ndc.y;
  };
  const hero = host.closest<HTMLElement>('.hero') ?? host;
  hero.addEventListener('pointermove', (e) => { if (on) { setPointer(e); loop(); } });
  hero.addEventListener('pointerleave', () => { tx = ty = 0; if (on) loop(); });
  // What is under the pointer: the Hisaab cube (and its tag), the screen, or nothing.
  type Hit = 'cube' | 'screen' | null;
  let hover: Hit = null;
  let cubeS = 1, spin = 0;
  const pick = (e: PointerEvent | MouseEvent): Hit => {
    const r = host.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(ndc, camera);
    if (ray.intersectObjects([cube, labelMesh]).length) return 'cube';
    if (ray.intersectObject(glass).length) return 'screen';
    return null;
  };
  host.addEventListener('pointermove', (e) => {
    const h = pick(e);
    if (hover === 'screen' && h !== 'screen') lastSwap = performance.now();
    hover = h;
    host.style.cursor = h ? 'pointer' : '';
    loop();
  });
  host.addEventListener('pointerleave', () => {
    if (hover === 'screen') lastSwap = performance.now();
    hover = null;
    host.style.cursor = '';
  });
  let swiped = false;
  host.addEventListener('click', (e) => {
    if (swiped) return;
    const h = pick(e);
    if (h === 'cube') location.href = '/work/hisaab/';
    else if (h === 'screen') location.href = frames[cur].href;
  });

  // Dots under the scene: pick what the screen shows. Real buttons, so keyboards and screen readers get them too.
  const dots = document.createElement('div');
  dots.className = 'hero-dots';
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', 'Choose what the screen shows');
  const arrow = (dir: number, label: string) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `arrow ${dir < 0 ? 'prev' : 'next'}`;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', () => step(dir));
    return b;
  };
  dots.append(arrow(-1, 'Previous'));
  frames.forEach((f, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = f.label;
    b.setAttribute('aria-label', f.label);
    b.setAttribute('aria-pressed', String(i === 0));
    b.addEventListener('click', () => goTo(i));
    dots.append(b);
  });
  dots.append(arrow(1, 'Next'));
  host.append(dots);
  const markDots = (active: number) => [...dots.querySelectorAll('button:not(.arrow)')].forEach((b, i) => b.setAttribute('aria-pressed', String(i === active)));
  function goTo(i: number) {
    if (nxt >= 0) { cur = nxt; nxt = -1; }
    if (i === cur) return;
    nxt = i;
    tStart = performance.now();
    lastSwap = tStart;
    markDots(i);
    loop();
  }
  const step = (dir: number) => goTo((((nxt >= 0 ? nxt : cur) + dir) % frames.length + frames.length) % frames.length);

  // Swipe (touch, pen or a mouse drag) and sideways wheel or trackpad scroll change the frame, like the arrows.
  let down: { x: number; y: number } | null = null;
  host.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; swiped = false; });
  host.addEventListener('pointerup', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    down = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = true; step(dx < 0 ? 1 : -1); }
  });
  host.addEventListener('pointercancel', () => { down = null; });
  let wheelAt = 0;
  host.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 14) {
      e.preventDefault();
      const now = performance.now();
      if (now - wheelAt > 650) { wheelAt = now; step(e.deltaX > 0 ? 1 : -1); }
    }
  }, { passive: false });

  function draw(now = performance.now()) {
    const time = now / 1000;
    coneMat.uniforms.uTime.value = on ? time : 0;
    // ease toward the pointer
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    stage.rotation.y = cx * 0.2;
    stage.rotation.x = -cy * 0.07;
    const bob = on ? Math.sin(time * 1.2) * 0.05 : 0;
    screen.position.y = 1.25 + bob;
    const hot = hover === 'cube';
    cubeS += ((hot ? 1.16 : 1) - cubeS) * 0.14;
    if (hot) spin += 0.045;
    else spin += (Math.round(spin / (Math.PI * 2)) * Math.PI * 2 - spin) * 0.12;
    cube.scale.setScalar(cubeS);
    labelMesh.scale.setScalar(1 + (cubeS - 1) * 0.5);
    cube.position.y = -1.55 + 0.62 * cubeS + (on ? Math.sin(time * 1.5 + 1) * 0.06 : 0);
    cube.rotation.y = -0.5 + (on ? Math.sin(time * 0.7) * 0.25 : 0) + spin;
    // cycle the screen
    const holding = hover === 'screen' || dots.matches(':focus-within');
    if (on && nxt < 0 && !holding && now - lastSwap > 5200) {
      nxt = (cur + 1) % frames.length;
      tStart = now;
      markDots(nxt);
    }
    if (nxt >= 0) {
      const p = Math.min(1, (now - tStart) / 420);
      paint(p);
      if (p >= 1) { cur = nxt; nxt = -1; lastSwap = now; paint(0); }
    }
    gl.render(scene, camera);
  }
  function loop() {
    if (raf || !visible || document.hidden) return;
    const tick = (now: number) => {
      draw(now);
      const settling = Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002;
      const popping = Math.abs(cubeS - (hover === 'cube' ? 1.16 : 1)) > 0.003 || Math.abs(spin) > 0.01;
      raf = on || settling || popping || nxt >= 0 ? requestAnimationFrame(tick) : 0;
    };
    raf = requestAnimationFrame(tick);
  }
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  // iOS can drop the WebGL context when the tab is backgrounded: bring the poster back instead of a blank hero.
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); hero.classList.remove('is-ready'); });
  canvas.addEventListener('webglcontextrestored', () => { paint(0); fit(); hero.classList.add('is-ready'); loop(); });
  new ResizeObserver(fit).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? loop() : stop(); }).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : loop()));

  // The "Interactive mode" switch in the hero nav
  const sw = hero.querySelector<HTMLButtonElement>('[data-mode]');
  const setMode = (v: boolean) => {
    on = v;
    sw?.setAttribute('aria-checked', String(v));
    if (sw) sw.querySelector('.sw-state')!.textContent = v ? 'ON' : 'OFF';
    if (!v) { tx = ty = 0; }
    hero.classList.toggle('still', !v);
    stop();
    lastSwap = performance.now();
    loop();
    if (!v) setTimeout(() => { stop(); draw(); }, 900);
  };
  sw?.addEventListener('click', () => setMode(sw.getAttribute('aria-checked') !== 'true'));
  sw?.setAttribute('aria-checked', String(on));
  if (sw) sw.querySelector('.sw-state')!.textContent = on ? 'ON' : 'OFF';

  fit();
  draw();
  host.dataset.ready = '1';
  hero.classList.add('is-ready');
  loop();
  // used by the poster capture during development (?poster=1 keeps the buffer readable)
  if (location.search.includes('poster')) (window as unknown as { __hero: unknown }).__hero = { gl, draw };
  return { gl, draw };
}
