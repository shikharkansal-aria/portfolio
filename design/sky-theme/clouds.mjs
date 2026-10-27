// Original cloud banks, rendered as a lit height field (no stock art, nothing copied).
// Run: node design/sky-theme/clouds.mjs   -> public/img/clouds-a.webp and clouds-b.webp
// Each cloud is a union of spheres. Height gives alpha at the edge and a surface normal inside,
// so tops catch warm light and undersides fall to lavender, like the reference sky.
import sharp from 'sharp';

const W = 2400;

function render(seed, file, o) {
  const H = o.H ?? 720, K = o.k ?? 1;
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const puffs = [];
  const base = H * 0.78;
  for (const c of o.clusters) {
    const n = Math.round(c.w / 26);
    for (let k = 0; k < n; k++) {
      const t = rnd();
      const dome = Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
      const r = (46 + rnd() * 80 * (0.45 + dome)) * K;
      const x = c.x + (t - 0.5) * c.w;
      const y = base - dome * c.h * (0.35 + 0.65 * rnd()) + r * 0.25;
      puffs.push([x, y, r]);
    }
  }
  // Body along the baseline so the bank reads as one mass.
  for (let x = -100; x < W + 100; x += 90) puffs.push([x + rnd() * 40, base + 30 * K + rnd() * 30 * K, (120 + rnd() * 80) * K]);

  const h = new Float32Array(W * H);
  const P = 3;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let i = 0; i < puffs.length; i++) {
        const [cx, cy, r] = puffs[i];
        const dx = x - cx, dy = y - cy;
        if (dx > r || dx < -r || dy > r || dy < -r) continue;
        const d2 = r * r - dx * dx - dy * dy;
        if (d2 > 0) acc += Math.sqrt(d2) ** P;
      }
      h[y * W + x] = Math.cbrt(acc);
    }
  }
  // Soft value noise for crinkled edges.
  const noise = (x, y, f, sd) => {
    const gx = x * f, gy = y * f, ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
    const hsh = (a, b) => { let n = (a * 374761393 + b * 668265263 + sd * 1442695041) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967295; };
    const sm = (t) => t * t * (3 - 2 * t);
    const a = hsh(ix, iy), b = hsh(ix + 1, iy), c = hsh(ix, iy + 1), d = hsh(ix + 1, iy + 1);
    return a + (b - a) * sm(fx) + (c - a) * sm(fy) + (a - b - c + d) * sm(fx) * sm(fy);
  };
  const L = [-0.38, -0.72, 0.58];
  const ll = Math.hypot(...L); L[0] /= ll; L[1] /= ll; L[2] /= ll;
  const out = Buffer.alloc(W * H * 4);
  const mix = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const n1 = noise(x, y, 1 / 38, 3) * 7 + noise(x, y, 1 / 14, 8) * 3;
      const hh = h[i] + (n1 - 5) * sstep(0, 22, h[i]);
      let alpha = sstep(0, 16, hh);
      if (alpha <= 0.004) continue;
      const hx = (h[i + 1] - h[i - 1]) * 0.5, hy = (h[i + W] - h[i - W]) * 0.5;
      const bump = noise(x, y, 1 / 9, 21) - 0.5, bump2 = noise(x, y, 1 / 23, 5) - 0.5;
      let nx = -hx * 0.9 + bump * 0.55 + bump2 * 0.4, ny = -hy * 0.9 + noise(x, y, 1 / 9, 33) * 0.0 + (bump2 - bump) * 0.45, nz = 1;
      const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      const diff = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      const lit = Math.pow(diff, 0.85);
      const yt = y / H;
      // shadow -> lit, with the warm pink cast stronger toward the lower half.
      const sh = [mix(172, 205, yt), mix(158, 160, yt), mix(226, 232, yt)];
      const hi = [255, mix(250, 226, yt), mix(244, 236, yt)];
      const rim = Math.pow(1 - nz, 1.6) * 0.22 * diff;
      let r = mix(sh[0], hi[0], lit), g = mix(sh[1], hi[1], lit), b = mix(sh[2], hi[2], lit);
      r += rim * 40; g += rim * 8;
      // fade the base of the bank so it melts into the sky gradient below it
      alpha *= 1 - sstep(H * 0.84, H * 0.99, y);
      const o4 = i * 4;
      out[o4] = Math.min(255, r); out[o4 + 1] = Math.min(255, g); out[o4 + 2] = Math.min(255, b); out[o4 + 3] = Math.round(alpha * 255);
    }
  }
  return sharp(out, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 84, alphaQuality: 90 }).toFile(file);
}

await render(11, 'public/img/clouds-a.webp', { clusters: [
  { x: 260, w: 700, h: 300 }, { x: 980, w: 620, h: 190 }, { x: 1560, w: 520, h: 330 }, { x: 2160, w: 720, h: 260 },
] });
await render(29, 'public/img/clouds-b.webp', { clusters: [
  { x: 120, w: 560, h: 200 }, { x: 760, w: 760, h: 330 }, { x: 1500, w: 600, h: 170 }, { x: 2060, w: 640, h: 300 },
] });
await render(47, 'public/img/clouds-strip.webp', { H: 380, k: 0.55, clusters: [
  { x: 200, w: 520, h: 110 }, { x: 760, w: 480, h: 80 }, { x: 1300, w: 560, h: 130 }, { x: 1900, w: 520, h: 95 }, { x: 2300, w: 400, h: 110 },
] });
console.log('clouds done');
