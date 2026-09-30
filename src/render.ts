// Build-time HTML renderers. Called from vite.config.ts; nothing here ships to the browser.
import { existsSync, readFileSync } from 'node:fs';
import { covers } from './covers';
import { islands } from './islands';
import { person, about, stats, cases, experience, more, education, type CaseStudy } from './content';
import { journeyHTML, type Shot, type StageLike } from './panels/journey-html';
import { journey } from './journey';
import type { Island } from './universe/types';
import { esc, svg, icons, brand, brandSvg, metricStrip, list, paras, scopeBadge, contextText, ISLAND_SHOT, type PanelShot } from './panels/html';

/** Shikhar fills in dates/location later. UI placeholder, not a claim. */
export const FINAL_YEAR_LINE = 'IIT Hyderabad · class of 2027';

const ext = `${svg(icons.external)}<span class="sr-only"> (opens in a new tab)</span>`;

/** Icon-only contact row: each is a real link (click/tap opens it); the label shows on hover and focus. */
const socialIcons = (cls = 'social') => {
  const items = [
    { href: `mailto:${person.email}`, label: `Email ${person.email}`, tip: 'Email', icon: brandSvg(brand.gmail), ext: false },
    ...(person.phone ? [{ href: `tel:${person.phone}`, label: `Call ${person.phoneDisplay}`, tip: person.phoneDisplay, icon: svg(icons.phone), ext: false }] : []),
    { href: person.linkedin, label: 'LinkedIn', tip: 'LinkedIn', icon: brandSvg(brand.linkedin), ext: true },
    { href: person.github, label: 'GitHub', tip: 'GitHub', icon: brandSvg(brand.github), ext: true },
  ];
  return `<ul class="${cls}">${items.map((i) =>
    `<li><a class="social-link" href="${esc(i.href)}" data-tip="${esc(i.tip)}" aria-label="${esc(i.label)}${i.ext ? ' (opens in a new tab)' : ''}"${i.ext ? ' rel="noopener" target="_blank"' : ''}>${i.icon}</a></li>`).join('')}</ul>`;
};

const contactLinks = (cls = 'links') => `
  <ul class="${cls}">
    <li><a class="btn" href="${person.resume}" download>${svg(icons.download)}Resume (PDF)</a></li>
    <li><a class="btn" href="mailto:${person.email}">${brandSvg(brand.gmail)}<span>${person.email}</span></a></li>${person.phone ? `\n    <li><a class="btn" href="tel:${person.phone}">${svg(icons.phone)}<span>${person.phoneDisplay}</span></a></li>` : ''}
    <li><a class="btn" href="${person.linkedin}" rel="noopener" target="_blank">${brandSvg(brand.linkedin)}LinkedIn${ext}</a></li>
    <li><a class="btn" href="${person.github}" rel="noopener" target="_blank">${brandSvg(brand.github)}GitHub${ext}</a></li>
  </ul>`;

const statRow = () =>
  `<dl class="stats">${stats.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${s.value}</dd></div>`).join('')}</dl>`;

const experienceBody = () =>
  `<div class="cols exp">` +
  experience
    .map((e) => `<article class="job"><h3>${esc(e.role)} · ${esc(e.org)}</h3><p class="kicker">${esc(e.dates)}</p><ul>${list(e.points)}</ul></article>`)
    .join('') +
  `<article class="job"><h3>Education</h3><p>${esc(education.degree)}, ${esc(education.school)} · ${education.year}</p></article></div>`;

const moreBody = () => `<div class="cols">${more.map((m) => `<article class="job"><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></article>`).join('')}</div>`;

const avatarImg = (cls: string, eager = false, sizes = '(max-width: 820px) 120px, 320px') =>
  `<img class="${cls}" src="/img/avatar-cutout.webp" srcset="/img/avatar-cutout-560.webp 201w, /img/avatar-cutout.webp 484w" sizes="${sizes}" alt="Shikhar’s 3D avatar: glasses, beard, peach polo, grey joggers and white sneakers" width="484" height="1350" decoding="async"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`;

/** Hero photo: a cut-out of Shikhar's own photo (the 3D guide stays the walkthrough host). */
const heroPhoto = () =>
  `<img class="hero-avatar hero-photo" src="/img/photo-cutout.webp" srcset="/img/photo-cutout-200.webp 200w, /img/photo-cutout.webp 336w" sizes="(max-width: 820px) 40vw, 32vh" alt="Shikhar Kansal in a black polo and navy trousers, smiling" width="336" height="1035" decoding="async" fetchpriority="high">`;

// ---------- Landing (index.html) ----------

/** One card per stop for the flat walkthrough (phones, reduced motion, no WebGL). */
function stopCard(i: Island, n: number) {
  return `<article class="stop" data-stop="${i.id}"${n === 0 ? '' : ' hidden'} aria-labelledby="stop-t-${i.id}">
    <p class="kicker">${scopeBadge(i.scope)} <span>${esc(contextText(i))}</span></p>
    <h3 class="stop-title" id="stop-t-${i.id}">${esc(i.title)}</h3>
    ${i.metric ? metricStrip(i.metric) : ''}
    <p class="stop-tagline">${esc(i.tagline)}</p>
    <p>${esc(i.what)}</p>
    <p class="stop-actions"><button class="btn btn-accent btn-big" type="button" data-open-stop>Open project${svg(icons.arrow)}</button></p>
  </article>`;
}

function walkthroughOverlay() {
  const n = islands.length;
  return `
  <div class="uv" id="universe" role="dialog" aria-modal="true" aria-labelledby="uv-t" hidden>
    <div class="uv-top">
      <h2 id="uv-t" class="uv-title" data-uv-title tabindex="-1">Walkthrough</h2>
      <div class="uv-actions frost">
        <button class="btn" type="button" data-uv-exit>${svg(icons.x)}Exit</button>
        <button class="btn" type="button" data-overview>Overview</button>
        <a class="btn" href="/recruiter/">Recruiter view</a>
      </div>
    </div>
    <div class="uv-stage" data-stage hidden>
      <div class="uv-canvas" data-canvas></div>
      <p class="uv-status frost" data-status role="status">Loading the studio…</p>
      <div class="name-tags" data-tags aria-hidden="true">${islands.map((i) => `<div class="name-tag" data-tag="${i.id}" hidden>${esc(i.title)}</div>`).join('')}</div>
      <button class="hint" type="button" data-hint hidden>
        <span class="hint-ring" aria-hidden="true"></span>
        <span class="hint-text">Click here to see how it works</span>
      </button>
    </div>
    <div class="flat" data-flat role="region" aria-label="Current stop" tabindex="0" hidden>
      <div class="flat-inner">
        <div class="flat-guide">${avatarImg('flat-avatar')}</div>
        <div class="flat-stops">${islands.map(stopCard).join('')}</div>
      </div>
    </div>
    <nav class="uv-bar frost" aria-label="Walkthrough controls">
      <button class="btn btn-big" type="button" data-prev-stop>${svg(icons.prev)}<span>Previous</span></button>
      <div class="stops-wrap">
        <button class="btn btn-big stops-btn" type="button" data-stops-toggle aria-expanded="false" aria-controls="stops-list">
          <span class="stops-count"><b data-stop-n>1</b> / ${n}</span><span class="stops-name" data-stop-name>${esc(islands[0].title)}</span>
          <span class="sr-only">: show all stops</span>
        </button>
        <ol class="stops-list frost" id="stops-list" hidden>${islands
          .map((i, k) => `<li><button type="button" class="stop-link" data-go="${i.id}"><span class="stop-link-n">${k + 1}</span>${esc(i.title)}</button></li>`)
          .join('')}</ol>
      </div>
      <button class="btn btn-big btn-primary" type="button" data-next-stop><span>Next<span class="next-word"> stop</span></span>${svg(icons.next)}</button>
      <button class="btn btn-big btn-accent bar-open" type="button" data-open-stop>Open project</button>
    </nav>
  </div>`;
}

// Journey data: src/journey.ts (content team) + public/img/journey/manifest.json (capture team).
const shotMap = (): Map<string, Shot> => {
  const f = new URL('../public/img/journey/manifest.json', import.meta.url);
  const list: Shot[] = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : [];
  return new Map(list.map((x) => [x.key, x]));
};
const stages = journey as unknown as StageLike[];

/** Island id → real screenshot (for island panels and recruiter cards). */
function islandShots(): Record<string, PanelShot> {
  const m = shotMap(), out: Record<string, PanelShot> = {};
  for (const [id, key] of Object.entries(ISLAND_SHOT)) {
    const s = m.get(key);
    if (s) out[id] = { src: s.file800 ?? s.file, w: s.w, h: s.h, alt: s.alt };
  }
  return out;
}

export function renderDesktop() {
  const intro = stages.find((s) => s.kind === 'intro');
  const introText = intro?.lead ?? about[0];
  const years = stages.map((s) => s.period).filter(Boolean) as string[];
  const span = (() => {
    const ys = years.join(' ').match(/20\d\d/g) ?? [];
    return ys.length ? `${Math.min(...ys.map(Number))} → ${Math.max(...ys.map(Number))}` : '';
  })();
  return `
  <a class="skip" href="#journey">Skip to the journey</a>
  <header class="topbar">
    <a class="brand" href="/">Shikhar Kansal</a>
    <nav class="topbar-nav" aria-label="Site">
      <a class="nav-link" href="#journey">Journey</a>
      <a class="nav-link" href="${person.resume}" download>Resume</a>
      <a class="btn" href="/recruiter/">Recruiter view</a>
    </nav>
  </header>
  <main id="main">
    <section class="hero" aria-labelledby="hero-h">
      <div class="hero-copy">
        <p class="hero-eyebrow">${esc(person.sub)}</p>
        <h1 id="hero-h" class="hero-name"><span>Shikhar</span> <span>Kansal</span></h1>
        <p class="hero-intro">${esc(introText)}</p>
        <div class="hero-cta">
          <button class="btn btn-primary btn-big js-only" type="button" data-enter>Start the walkthrough${svg(icons.arrow)}</button>
          <a class="btn btn-big btn-quiet" href="/recruiter/">Recruiter view</a>
        </div>
        <div class="hero-links">
          <a class="hero-resume" href="${person.resume}" download>Resume (PDF)</a>
          ${socialIcons()}
        </div>
      </div>
      <div class="hero-figure">
        <span class="hero-field" aria-hidden="true"></span>
        ${heroPhoto()}
      </div>
      <p class="hero-scroll" aria-hidden="true"><span>Scroll the journey</span><span class="hero-span">${esc(span)}</span></p>
    </section>
    ${intro?.points?.length ? `<section class="about-strip" aria-label="About me">${intro.points.map((t, k) => `<p><span class="about-n">0${k + 1}</span>${esc(t)}</p>`).join('')}</section>` : ''}
    <section class="journey" id="journey" aria-labelledby="journey-h" tabindex="-1">
      <div class="j-intro">
        <h2 id="journey-h">The journey</h2>
        <p>${esc(person.seeking ? `What I worked on, in order. Looking for ${person.seeking}.` : 'What I worked on, in order.')}</p>
      </div>
      ${journeyHTML(stages, shotMap(), new Set(islands.map((i) => i.id)))}
    </section>
    <section class="closing" aria-labelledby="close-h">
      <div class="close-main">
        <h2 id="close-h">Let’s talk</h2>
        <p>I’m looking for ${esc(person.seeking)}. Email is the fastest way to reach me.</p>
        <p class="close-actions">
          <a class="btn btn-primary btn-big close-mail" href="mailto:${person.email}">${svg(icons.mail)}Email me</a>
          <a class="btn btn-big btn-quiet" href="${person.resume}" download>${svg(icons.download)}Resume (PDF)</a>
        </p>
        <p class="close-mailtext"><a href="mailto:${person.email}">${person.email}</a></p>
      </div>
      <div class="close-walk">
        <img class="close-guide" src="/img/avatar-cutout-560.webp" alt="" width="201" height="560" loading="lazy" decoding="async">
        <div class="close-walk-text">
          <h3>Or walk it in 3D</h3>
          <p>A guide walks you through ${islands.length} projects, one stop each. Open any stop to see how it works.</p>
          <button class="btn btn-big js-only" type="button" data-enter>Start the walkthrough${svg(icons.arrow)}</button>
          <a class="nojs-only" href="/recruiter/">Read the one-page Recruiter view</a>
        </div>
      </div>
    </section>
  </main>
  <footer class="foot">
    <p class="foot-name">${esc(person.name)}</p>
    ${socialIcons('social social-foot')}
    <p><a href="/recruiter/">Recruiter view</a></p>
  </footer>
  ${walkthroughOverlay()}
  <div class="panel-layer" data-panel-layer hidden>
    <section class="panel" role="dialog" aria-modal="true" aria-labelledby="panel-t" data-panel tabindex="-1"></section>
  </div>
  <script type="application/json" id="panel-shots">${JSON.stringify(islandShots()).replace(/</g, '\\u003c')}</script>`;
}

// ---------- Recruiter view (recruiter/index.html) ----------

// The hero clip is optional: it renders only once scripts/hero-video.sh has produced public/video/hero.mp4.
const hasHeroVideo = () => existsSync(new URL('../public/video/hero.mp4', import.meta.url));

function caseDetails(c: CaseStudy) {
  return `<details><summary>Problem, decisions and what I learned</summary>
    <h4>Problem</h4>${paras(c.problem)}
    <h4>What I did</h4><ul>${list(c.did)}</ul>
    <h4>Result</h4>${paras(c.result)}
    <h4>What I learned</h4><p>${esc(c.learned)}</p>
  </details>`;
}

function recruiterCase(c: CaseStudy, size: 'flagship' | 'second' | 'row') {
  const nums = islands.find((i) => i.caseId === c.id)?.numbers ?? c.facts;
  const facts = `<dl class="facts">${nums.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>`;
  if (size === 'row') {
    return `<article class="r-case r-row" id="rc-${c.id}">
      <div class="r-row-head">
        <h3>${esc(c.title)}</h3>
        ${metricStrip(c.metric, 'sm')}
      </div>
      <p class="kicker">${esc(c.context)}</p>
      <p>${esc(c.summary)}</p>
      ${caseDetails(c)}
    </article>`;
  }
  return `<article class="r-case r-${size}" id="rc-${c.id}">
    ${(() => {
      const sh = islandShots()[c.id];
      return sh
        ? `<figure class="r-shot"><img src="${sh.src}" width="${sh.w}" height="${sh.h}" alt="${esc(sh.alt)}" loading="lazy" decoding="async"></figure>`
        : `<div class="cover">${covers[c.id] ?? ''}</div>`;
    })()}
    <div class="r-case-text">
      ${size === 'flagship' ? '<p class="r-flag">Flagship</p>' : ''}
      <h3>${esc(c.title)}</h3>
      <p class="kicker">${esc(c.context)}</p>
      ${metricStrip(c.metric)}
      <p class="metric-label">${esc(c.metric.label)}</p>
      <p>${esc(c.summary)}</p>
      ${size === 'flagship' ? facts : ''}
      ${caseDetails(c)}
    </div>
  </article>`;
}

export function renderRecruiter() {
  const hero = hasHeroVideo();
  const c = (id: string) => cases.find((x) => x.id === id)!;
  const tools = islands.filter((i) => i.tier === 'small' || i.tier === 'moon');
  return `
  ${hero ? `<div class="r-hero" data-hero style="--poster: url(/video/hero-poster.webp)">
    <video class="r-hero-video" muted playsinline preload="none" aria-hidden="true" tabindex="-1" data-mp4="/video/hero.mp4"></video>
    <div class="r-hero-inner">` : ''}
  <header class="r-head">
    <p class="kicker"><a href="/">← Back to the main site</a></p>
    <h1>${esc(person.name)}</h1>
    <p class="lede">${esc(person.positioning)}</p>
    <p class="kicker">${esc(person.sub)} · Looking for ${esc(person.seeking)}</p>
    ${contactLinks()}
    ${statRow()}
  </header>
  ${hero ? '</div></div>' : ''}
  <main>
    <section aria-labelledby="cs"><h2 id="cs">Case studies</h2>
      <div class="r-cases">
        ${recruiterCase(c('agent-builder'), 'flagship')}
        ${recruiterCase(c('outage'), 'second')}
        <div class="r-rows">
          ${recruiterCase(c('hisaab'), 'row')}
          ${recruiterCase(c('aria'), 'row')}
        </div>
      </div>
    </section>
    <section aria-labelledby="tl"><h2 id="tl">Tools I built</h2>
      <ul class="r-tools">${tools.map((i) => `<li><b>${esc(i.title)}</b><span>${esc(i.tagline)}</span></li>`).join('')}</ul>
    </section>
    <section aria-labelledby="xp"><h2 id="xp">Experience</h2>${experienceBody()}</section>
    <section aria-labelledby="mw"><h2 id="mw">More work</h2>${moreBody()}</section>
  </main>
  <footer class="r-foot"><p>${esc(person.name)} · <a href="mailto:${person.email}">${person.email}</a></p></footer>`;
}
