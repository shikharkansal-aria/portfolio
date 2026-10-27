// Shared page frame: <head>, navigation, footer and small HTML helpers. Runs at build time only.
import { person, type Shot } from './data.ts';

export const SITE = 'https://shikhar-kansal.vercel.app';

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export type NavKey = 'home' | 'work' | 'journey' | 'about' | 'recruiter' | 'none';

const NAV: { key: NavKey; href: string; label: string }[] = [
  { key: 'work', href: '/work/', label: 'Work' },
  { key: 'journey', href: '/journey/', label: 'Journey' },
  { key: 'about', href: '/about/', label: 'About' },
  { key: 'recruiter', href: '/recruiter/', label: '30 seconds' },
];

export const mailto = () => `mailto:${person.email}?subject=${encodeURIComponent('Hello Shikhar')}`;

export function head(o: { title: string; description: string; path: string; nav?: NavKey }) {
  const url = SITE + o.path;
  const t = esc(o.title);
  const d = esc(o.description);
  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light" />
    <meta name="theme-color" content="#1d4be0" />
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Shikhar Kansal" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Shikhar Kansal, product and growth" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${SITE}/og.png" />
    <script>document.documentElement.classList.add('js');document.documentElement.dataset.page='${o.nav ?? 'none'}'</script>`;
}

export function nav(active: NavKey) {
  const links = NAV.map(
    (n) => `<li><a href="${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${n.label}</a></li>`,
  ).join('');
  const resume = `<li><a href="${person.resume}">Resume</a></li>`;
  return `
  <a class="skip" href="#main">Skip to content</a>
  <header class="bar">
    <div class="wrap bar-in">
      <a class="mark" href="/"${active === 'home' ? ' aria-current="page"' : ''}>Shikhar Kansal</a>
      <nav aria-label="Main">
        <ul class="nav-links">${links}${resume}</ul>
      </nav>
      <a class="btn btn-accent btn-sm bar-cta" href="${mailto()}">Email me</a>
      <details class="menu">
        <summary>Menu</summary>
        <ul>${links}${resume}<li><a href="${mailto()}">Email me</a></li></ul>
      </details>
    </div>
  </header>`;
}

export function footer() {
  return `
  <footer class="foot" aria-labelledby="foot-h">
    <div class="foot-photo">
      <img src="/img/photo-cutout.webp" width="336" height="1035" alt="Shikhar Kansal in a black polo, smiling" loading="lazy" decoding="async" />
    </div>
    <div class="foot-side">
      <h2 id="foot-h" class="foot-mark">Shikhar Kansal</h2>
      <ul class="foot-menu">
        <li><a href="/work/">Work</a></li>
        <li><a href="/journey/">Journey</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="${person.resume}">Resume</a></li>
        <li><a href="/recruiter/">30-second version</a></li>
      </ul>
      <div class="foot-blocks">
        <p><a href="${mailto()}">${esc(person.email)}</a><br /><a href="tel:${person.phone}">${esc(person.phoneDisplay)}</a></p>
        <p><a href="${person.linkedin}" rel="noopener">LinkedIn</a><br /><a href="${person.github}" rel="noopener">GitHub</a></p>
      </div>
      <p class="foot-legal">© 2026 Shikhar Kansal · IIT Hyderabad</p>
    </div>
  </footer>`;
}

/** Responsive screenshot. The -800 files exist next to every full-size image. */
export function shot(s: Shot, o: { sizes?: string; eager?: boolean; caption?: boolean; cls?: string } = {}) {
  const base = `/img/journey/${s.key}`;
  const sizes = o.sizes ?? '(max-width: 820px) 100vw, 60vw';
  const img = `<img${o.cls ? ` class="${o.cls}"` : ''} src="${base}-800.webp" srcset="${base}-800.webp 800w, ${base}.webp ${s.w}w" sizes="${sizes}" width="${s.w}" height="${s.h}" alt="${esc(s.alt)}"${o.eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async" />`;
  return o.caption === false ? img : `<figure class="shot">${img}<figcaption>${esc(s.caption)}</figcaption></figure>`;
}

export const ext = (href: string, label: string) =>
  `<a class="link-ext" href="${href}" rel="noopener" target="_blank">${esc(label)}<span class="sr-only"> (opens in a new tab)</span> ↗</a>`;

export const page = (o: { title: string; description: string; path: string; nav: NavKey; body: string }) => ({
  head: head(o),
  body: `${nav(o.nav)}<main id="main" tabindex="-1">${o.body}</main>${footer()}`,
});
