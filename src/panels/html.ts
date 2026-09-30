// Pure HTML builders shared by the build-time renderer (src/render.ts) and the browser panel code.
// No Node imports here: this file ships to the browser.
import type { Island } from '../universe/types';
import type { CaseStudy, Metric } from '../content';
import { covers } from '../covers';

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Inline SVG icons (Lucide-style strokes).
export const svg = (d: string, cls = 'ico') =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const icons = {
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  download: '<path d="M12 15V3M7 10l5 5 5-5M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  play: '<path d="M7 4v16l13-8Z"/>',
  pause: '<path d="M8 4v16M16 4v16"/>',
  replay: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  prev: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};

// The signature element: verified before → after as a mono strip.
export function metricStrip(m: Metric, size: 'sm' | 'lg' | 'xl' = 'lg') {
  return `<p class="metric metric-${size}">
    <span class="sr-only">${esc(m.label)}: from ${esc(m.before)} to ${esc(m.after)}</span>
    <span class="m-before" aria-hidden="true">${esc(m.before)}</span>
    <span class="m-bar" aria-hidden="true"><i></i></span>
    <span class="m-after" aria-hidden="true">${esc(m.after)}</span>
  </p>`;
}

export const list = (items: string[]) => items.map((t) => `<li>${esc(t)}</li>`).join('');
export const paras = (items: string[]) => items.map((t) => `<p>${esc(t)}</p>`).join('');

export const scopeLabel: Record<Island['scope'], string> = {
  work: 'Work',
  personal: 'Personal project',
  competition: 'Competition',
};
export const scopeBadge = (s: Island['scope']) => `<span class="badge badge-${s}">${scopeLabel[s]}</span>`;
/** Context line without a leading "Personal project ·" that would repeat the badge. */
export const contextText = (i: Island) => i.context.replace(/^Personal (project|tools?|tooling)\s*·\s*/i, '');

/** Long case study body (Problem → what I did → result → learned), used in the island panel. */
export function caseBody(c: CaseStudy, headingTag: 'h3' | 'h4' = 'h4') {
  const h = (t: string) => `<${headingTag}>${t}</${headingTag}>`;
  return `
    <div class="case-grid">
      <div class="case-side">
        ${h('Problem')}${paras(c.problem)}
        ${c.image ? `<figure><img src="${c.image.src}" alt="${esc(c.image.alt)}" width="${c.image.w}" height="${c.image.h}" loading="lazy" decoding="async"><figcaption>${esc(c.image.caption)}</figcaption></figure>` : ''}
      </div>
      <div class="case-main">
        ${h('What I did')}<ul class="did">${list(c.did)}</ul>
        ${h('Result')}${paras(c.result)}
        ${h('What I learned')}<p>${esc(c.learned)}</p>
      </div>
    </div>`;
}

/** A real screenshot for an island's panel (from the journey manifest), when one exists. */
export interface PanelShot { src: string; w: number; h: number; alt: string }
/** Island → journey image key. Agent Builder has no screenshot, so it keeps its SVG cover. */
export const ISLAND_SHOT: Record<string, string> = { aria: 'aria-app', hisaab: 'hisaab-phones', outage: 'nuplay-landing', 'job-hunt': 'ats-tracker' };

const cover = (i: Island, shot?: PanelShot) => {
  if (shot) return `<figure class="panel-shot"><img src="${shot.src}" width="${shot.w}" height="${shot.h}" alt="${esc(shot.alt)}" decoding="async"></figure>`;
  const art = i.caseId ? covers[i.caseId] : undefined;
  return art ? `<div class="cover">${art}</div>` : '';
};

function player(i: Island) {
  if (i.beats?.length) {
    const n = i.beats.length;
    return `
    <section class="pp pp-beats" aria-labelledby="pp-h" data-beats>
      <h3 id="pp-h">What happened</h3>
      <ol class="beats">${i.beats
        .map(
          (b, k) => `<li class="beat" data-step="${k}"${k === 0 ? '' : ' hidden'}>
            <p class="beat-when">${b.when ? esc(b.when) + ' · ' : ''}${k + 1} of ${n}</p>
            <p class="beat-title">${esc(b.title)}</p>
            <p>${esc(b.detail)}</p>
          </li>`,
        )
        .join('')}</ol>
      <div class="pp-controls">
        <button class="btn" type="button" data-prev disabled>${svg(icons.prev)}Previous</button>
        <p class="pp-count" aria-live="polite"><span data-count>1</span> / ${n}</p>
        <button class="btn btn-primary" type="button" data-next${n < 2 ? ' disabled' : ''}>Next${svg(icons.next)}</button>
      </div>
    </section>`;
  }
  if (!i.pipeline?.length) return '';
  return `
    <section class="pp" aria-labelledby="pp-h" data-pipeline>
      <div class="pp-head">
        <h3 id="pp-h">How it works</h3>
        <div class="pp-controls">
          <button class="btn btn-primary" type="button" data-run>${svg(icons.play)}<span>Run</span></button>
          <button class="btn" type="button" data-replay hidden>${svg(icons.replay)}Replay</button>
        </div>
      </div>
      <ol class="steps">${i.pipeline
        .map(
          (s, k) => `<li class="step" data-step="${k}">
            <span class="step-n" aria-hidden="true">${k + 1}</span>
            <span class="step-body"><b>${esc(s.label)}</b><span class="step-detail">${esc(s.detail)}</span></span>
          </li>`,
        )
        .join('')}</ol>
      <p class="sr-only" aria-live="polite" data-announce></p>
    </section>`;
}

function decisions(i: Island) {
  if (!i.decisions.length) return '';
  return `
    <section aria-labelledby="dc-h">
      <h3 id="dc-h">What I used, what I turned down</h3>
      <ul class="decisions">${i.decisions
        .map(
          (d) => `<li class="decision">
            <p class="dc-row"><span class="dc-tag dc-used">Used</span><b>${esc(d.choice)}</b></p>
            ${d.rejected ? `<p class="dc-row"><span class="dc-tag dc-rej">Rejected</span><s>${esc(d.rejected)}</s></p>` : ''}
            <p class="dc-why">${esc(d.why)}</p>
          </li>`,
        )
        .join('')}</ul>
    </section>`;
}

/** Full island panel body. `cs` is the long case study, when the island links one. */
export function islandPanel(i: Island, cs?: CaseStudy, shot?: PanelShot) {
  const titleId = `panel-t`;
  return `
  <header class="panel-head">
    <div class="panel-titles">
      <p class="kicker">${scopeBadge(i.scope)} <span>${esc(contextText(i))}</span></p>
      <h2 id="${titleId}" tabindex="-1">${esc(i.title)}</h2>
    </div>
    <button class="icon-btn" type="button" data-panel-close aria-label="Close ${esc(i.title)}">${svg(icons.x)}</button>
  </header>
  <div class="panel-body">
    <div class="panel-col panel-col-a">
      ${cover(i, shot)}
      ${i.metric ? `${metricStrip(i.metric)}<p class="metric-label">${esc(i.metric.label)}</p>` : ''}
      <p class="panel-what">${esc(i.what)}</p>
      ${i.numbers.length ? `<dl class="facts">${i.numbers.map((n) => `<div><dt>${esc(n.label)}</dt><dd>${esc(n.value)}</dd></div>`).join('')}</dl>` : ''}
      <section aria-labelledby="st-h"><h3 id="st-h">Stack</h3><ul class="tags">${i.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></section>
      <section aria-labelledby="rn-h"><h3 id="rn-h">How it runs</h3><p>${esc(i.runs)}</p></section>
    </div>
    <div class="panel-col panel-col-b">
      ${player(i)}
      ${decisions(i)}
      ${i.myPart ? `<section aria-labelledby="mp-h"><h3 id="mp-h">My part</h3><p>${esc(i.myPart)}</p></section>` : ''}
      ${i.learned ? `<section aria-labelledby="ln-h"><h3 id="ln-h">What I learned</h3><p>${esc(i.learned)}</p></section>` : ''}
      ${
        cs
          ? `<section class="long" aria-labelledby="cs-h">
          <h3 id="cs-h">Full case study</h3>
          <button class="btn" type="button" data-long aria-expanded="false" aria-controls="cs-body">Read the full case study${svg(icons.next)}</button>
          <div id="cs-body" class="cs-body" hidden>${caseBody(cs)}</div>
        </section>`
          : ''
      }
    </div>
  </div>`;
}
