// Builds public/img/journey/hisaab-phones(.webp|-800.webp) from the app's own screens pack (made-up month, no real data).
// Run: node design/sky-theme/hisaab-phones.mjs <path to screens-pack folder>
import sharp from 'sharp';
const pack = process.argv[2];
const shots = ['dark/02-home-dark.png', 'light/02-home.png', 'light/03-payments.png', 'light/05-insights.png', 'light/07-score.png'];
const W = 1600, H = 700, sw = 268, sh = Math.round((sw * 2340) / 1080), bez = 10, pw = sw + bez * 2, ph = sh + bez * 2, gap = 30;
const x0 = Math.round((W - (5 * pw + 4 * gap)) / 2), y0 = 52;
const mask = (w, h, r) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="#fff"/></svg>`);
const layers = [];
for (let i = 0; i < shots.length; i++) {
  const x = x0 + i * (pw + gap);
  const scr = await sharp(`${pack}/${shots[i]}`).extract({ left: 0, top: 0, width: 1080, height: 2340 }).resize(sw, sh).composite([{ input: mask(sw, sh, 34), blend: 'dest-in' }]).png().toBuffer();
  const body = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><rect width="${pw}" height="${ph}" rx="46" fill="#14131f"/><rect x="${pw / 2 - 22}" y="${bez + 8}" width="44" height="12" rx="6" fill="#14131f"/></svg>`);
  const shadow = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw + 80}" height="${ph + 80}"><defs><filter id="b"><feGaussianBlur stdDeviation="16"/></filter></defs><rect x="40" y="56" width="${pw}" height="${ph}" rx="46" fill="rgba(60,40,160,0.28)" filter="url(#b)"/></svg>`);
  layers.push({ input: shadow, left: x - 40, top: y0 - 40 }, { input: body, left: x, top: y0 }, { input: scr, left: x + bez, top: y0 + bez }, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><rect x="${pw / 2 - 22}" y="${bez + 8}" width="44" height="12" rx="6" fill="#14131f"/></svg>`), left: x, top: y0 });
}
const base = sharp({ create: { width: W, height: H, channels: 3, background: '#eceaf8' } }).composite(layers);
const full = await base.png().toBuffer();
await sharp(full).webp({ quality: 86 }).toFile('public/img/journey/hisaab-phones.webp');
await sharp(full).resize(800).webp({ quality: 84 }).toFile('public/img/journey/hisaab-phones-800.webp');
console.log('done', W, H);
