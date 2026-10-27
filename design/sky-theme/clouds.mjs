import { chromium } from 'playwright';
const out = process.argv[2];
// Deterministic random so the clouds are reproducible.
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
function bank(W, H, n, baseY, spread, rMin, rMax) {
  let c = '';
  for (let i = 0; i < n; i++) {
    const x = rnd() * W, r = rMin + rnd() * (rMax - rMin);
    const y = baseY - Math.pow(rnd(), 1.6) * spread * (0.5 + 0.5 * Math.sin((x / W) * Math.PI * 2.3 + 1.2) ** 2);
    c += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}"/>`;
  }
  return c;
}
const W = 2400, H = 900;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="820">
    <stop offset="0" stop-color="#fffaf6"/><stop offset="0.45" stop-color="#ffe3ee"/><stop offset="1" stop-color="#e9a6d0"/>
  </linearGradient>
  <linearGradient id="g2" gradientUnits="userSpaceOnUse" x1="0" y1="380" x2="0" y2="900">
    <stop offset="0" stop-color="#fff1f6"/><stop offset="1" stop-color="#d9a3e0"/>
  </linearGradient>
  <filter id="f" x="-10%" y="-30%" width="120%" height="160%">
    <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="5" seed="3" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="90" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="3.5" result="b"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="9" result="n2"/>
    <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0.86  0 0 0 0 0.62  0 0 0 0 0.84  0 0 0 -1.6 1.05" result="shade"/>
    <feComposite in="shade" in2="b" operator="in" result="s2"/>
    <feBlend in="s2" in2="b" mode="multiply"/>
  </filter>
  <filter id="f2"><feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="4" seed="5" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="120" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="9"/></filter>
</defs>
<g fill="url(#g2)" filter="url(#f2)" opacity="0.85">${bank(W, H, 70, 760, 260, 70, 170)}<rect x="-100" y="760" width="${W + 200}" height="300"/></g>
<g fill="url(#g)" filter="url(#f)">${bank(W, H, 120, 700, 360, 40, 130)}<rect x="-100" y="690" width="${W + 200}" height="400"/></g>
</svg>`;
// Run: node design/sky-theme/clouds.mjs <out-dir>  (needs Playwright with Chromium)
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
await p.setContent(`<body style="margin:0;background:transparent">${svg}</body>`);
await p.screenshot({ path: out + '/clouds.png', omitBackground: true });
await p.setContent(`<body style="margin:0;background:linear-gradient(#1d4be0,#5a7cf0 45%,#c7a6ef 75%,#f3b8d6)">${svg}</body>`);
await p.screenshot({ path: out + '/clouds-preview.png' });
await b.close();
