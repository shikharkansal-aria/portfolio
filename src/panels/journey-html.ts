// Build-time renderer for the resume journey (src/journey.ts + public/img/journey/manifest.json).
// Types are deliberately loose so the content writer's Stage type stays assignable.
// Each feature gets its own layout (see LAYOUT) so the page doesn't read as one repeated template.
import { esc, svg, icons } from './html';

export interface Shot { key: string; file: string; file800?: string; w: number; h: number; alt: string }
export interface StageLike {
  id: string;
  kind: 'intro' | 'chapter' | 'feature' | 'compact' | 'skills' | 'section' | string;
  period?: string;
  title?: string;
  org?: string;
  role?: string;
  lead?: string;
  points?: readonly string[];
  numbers?: readonly { value: string; label: string; todoConfirm?: true }[];
  visuals?: readonly { key: string; caption?: string }[];
  link?: string | { href?: string; label?: string; id?: string };
  todo?: unknown;
  groups?: readonly { name: string; items: readonly (string | { label: string; stage?: string })[] }[];
}
type Vis = { key: string; caption?: string; shot: Shot };

const src = (f: string) => (f.startsWith('/') || f.startsWith('http') ? f : `/img/journey/${f}`);

/** Journey stages whose story is also a walkthrough stop (island id), where the ids differ. */
const STAGE_TO_ISLAND: Record<string, string> = { 'nuplay-electronics': 'outage' };

/** Per-project layout and how its numbers are set. Unlisted features use 'showcase' + 'grid'. */
type Layout = 'band' | 'report' | 'browser' | 'document' | 'phones' | 'poster' | 'numbers' | 'showcase';
type NumStyle = 'grid' | 'inline' | 'table' | 'big';
const LAYOUT: Record<string, [Layout, NumStyle]> = {
  aria: ['band', 'inline'],
  'ey-cafta': ['report', 'table'],
  'nuplay-electronics': ['browser', 'grid'],
  finanalyse: ['document', 'big'],
  hisaab: ['phones', 'grid'],
  'ecell-head': ['poster', 'grid'],
  'agent-builder': ['numbers', 'inline'],
};

/** Screens of real web UIs get the browser chrome; charts, decks, documents, photos and logos don't. */
const WEB_UI = /^(aria-app|aria-scene|aria-mission-control|nuplay-|ey-forecaster$|ats-tracker)/;

/** Actions for a stage: "See how it works" (opens the island panel) and/or the stage's own link. */
function linkHTML(s: StageLike, islandIds: Set<string>) {
  const out: string[] = [];
  const island = STAGE_TO_ISLAND[s.id] ?? (islandIds.has(s.id) ? s.id : undefined);
  if (island) out.push(`<button class="j-open js-only" type="button" data-island="${esc(island)}">See how it works${svg(icons.arrow)}</button>`);
  const l = s.link;
  const href = !l ? undefined : typeof l === 'string' ? l : l.href;
  if (href) {
    const label = typeof l === 'string' ? 'Open' : l!.label ?? 'Open';
    const ext = /^https?:/.test(href);
    out.push(`<a class="j-open" href="${esc(href)}"${ext ? ' rel="noopener" target="_blank"' : ''}>${esc(label)}${svg(ext ? icons.external : icons.arrow)}${ext ? '<span class="sr-only"> (opens in a new tab)</span>' : ''}</a>`);
  }
  return out.length ? `<p class="j-actions">${out.join('')}</p>` : '';
}

/** Skills arrive as "Group: a, b, c" lines; each group links to the stages where that work happened. */
const SKILL_EVIDENCE: Record<string, [string, string][]> = {
  Product: [['nurix', 'Nurix AI'], ['agent-builder', 'Agent Builder'], ['hisaab', 'Hisaab']],
  Finance: [['ey-cafta', 'EY CAFTA'], ['finanalyse', 'FinAnalyse']],
  AI: [['agent-builder', 'Agent Builder'], ['nuplay-electronics', 'NuPlay Electronics'], ['aria', 'Aria']],
  People: [['ecell-head', 'E-Cell'], ['nurix', 'Nurix AI']],
};

function numbersHTML(s: StageLike, style: NumStyle = 'grid') {
  const ns = s.numbers ?? [];
  if (!ns.length) return '';
  const flag = (n: { todoConfirm?: true }) => (n.todoConfirm ? ' data-todo-confirm' : '');
  if (style === 'inline') {
    return `<ul class="j-inline">${ns.map((n) => `<li${flag(n)}><b>${esc(n.value)}</b> ${esc(n.label)}</li>`).join('')}</ul>`;
  }
  if (style === 'table') {
    return `<table class="j-table"><tbody>${ns.map((n) => `<tr${flag(n)}><th scope="row">${esc(n.label)}</th><td>${esc(n.value)}</td></tr>`).join('')}</tbody></table>`;
  }
  if (style === 'big') {
    const [first, ...rest] = ns;
    return `<div class="j-big"><p class="j-big-n"${flag(first)}><b>${esc(first.value)}</b><span>${esc(first.label)}</span></p>${
      rest.length ? `<ul class="j-inline">${rest.map((n) => `<li${flag(n)}><b>${esc(n.value)}</b> ${esc(n.label)}</li>`).join('')}</ul>` : ''
    }</div>`;
  }
  return `<dl class="j-nums n${Math.min(ns.length, 6)}">${ns.map((n) => `<div${flag(n)}><dt>${esc(n.label)}</dt><dd>${esc(n.value)}</dd></div>`).join('')}</dl>`;
}

const pointsHTML = (s: StageLike, cls = 'j-points') =>
  s.points?.length ? `<ul class="${cls}">${s.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : '';

/** Compact rows show 3 bullets; the rest sit behind a native disclosure. */
function compactPoints(s: StageLike) {
  const ps = s.points ?? [];
  if (!ps.length) return '';
  const head = ps.slice(0, 3), more = ps.slice(3);
  return `<ul class="cp-points">${head.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>${
    more.length ? `<details class="cp-more"><summary>${more.length} more</summary><ul class="cp-points">${more.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></details>` : ''
  }`;
}

const metaHTML = (s: StageLike) => {
  const bits = [s.org, s.role].filter(Boolean) as string[];
  return bits.length ? `<p class="j-meta">${bits.map(esc).join(' · ')}</p>` : '';
};

function imgTag(shot: Shot, cls: string, sizes: string, alt: string = shot.alt, eager = false) {
  const s800 = src(shot.file800 ?? shot.file), full = src(shot.file);
  const srcset = s800 !== full ? ` srcset="${s800} 800w, ${full} ${shot.w}w"` : '';
  return `<img class="${cls}" src="${s800}"${srcset} sizes="${sizes}" width="${shot.w}" height="${shot.h}" alt="${esc(alt)}"${eager ? '' : ' loading="lazy"'} decoding="async">`;
}

/** One framed figure. Browser chrome only for real web UIs. */
function fig(v: Vis, cls: string, sizes: string, caption = true) {
  const web = WEB_UI.test(v.key);
  return `<figure class="jf ${cls}${web ? ' is-web' : ''}">
    <div class="jf-frame">${web ? '<span class="j-chrome" aria-hidden="true"><i></i><i></i><i></i></span>' : ''}${imgTag(v.shot, 'jf-img', sizes)}</div>
    ${caption && v.caption ? `<figcaption class="j-cap">${esc(v.caption)}</figcaption>` : ''}
  </figure>`;
}

/** A decorative secondary screen in its own clipped box, drifting with scroll. */
const peek = (v: Vis, cls: string) =>
  `<div class="peek ${cls}" aria-hidden="true" data-parallax>${imgTag(v.shot, 'peek-img', '30vw', '')}</div>`;

function textBlock(s: StageLike, islandIds: Set<string>, style: NumStyle, opts: { nums?: boolean; points?: boolean } = {}) {
  return `<div class="j-text">
    ${metaHTML(s)}
    <h3 class="j-title">${esc(s.title ?? '')}</h3>
    ${s.lead ? `<p class="j-lead">${esc(s.lead)}</p>` : ''}
    ${opts.nums === false ? '' : numbersHTML(s, style)}
    ${opts.points === false ? '' : pointsHTML(s)}
    ${linkHTML(s, islandIds)}
  </div>`;
}

function featureBody(s: StageLike, vis: Vis[], islandIds: Set<string>, layout: Layout, style: NumStyle, flip: boolean) {
  const [a, b, c, d] = vis;
  switch (layout) {
    case 'band': // Aria: full-bleed dark band, contact sheet + Mission Control mosaic, pink accent.
      return `<div class="band-text">${textBlock(s, islandIds, style)}</div>
        <div class="band-mosaic">
          ${b ? fig(b, 'band-main', '(max-width: 820px) 92vw, 44vw') : ''}
          ${c ? fig(c, 'band-side', '(max-width: 820px) 92vw, 26vw') : ''}
          ${a ? fig(a, 'band-side', '(max-width: 820px) 92vw, 26vw') : ''}
        </div>`;
    case 'report': // EY CAFTA: laid out like a report spread, figures numbered.
      return `<header class="rp-head">${metaHTML(s)}<h3 class="j-title">${esc(s.title ?? '')}</h3>${s.lead ? `<p class="j-lead">${esc(s.lead)}</p>` : ''}</header>
        <div class="rp-spread">
          ${a ? `<div class="rp-fig">${fig(a, '', '(max-width: 820px) 92vw, 36vw')}</div>` : ''}
          ${b ? `<div class="rp-fig">${fig(b, '', '(max-width: 820px) 92vw, 36vw')}</div>` : ''}
        </div>
        <div class="rp-row">
          <div class="rp-table">${numbersHTML(s, style)}${pointsHTML(s)}${linkHTML(s, islandIds)}</div>
          <div class="rp-stack">${c ? fig(c, '', '(max-width: 820px) 92vw, 34vw') : ''}${d ? fig(d, '', '(max-width: 820px) 92vw, 34vw') : ''}</div>
        </div>`;
    case 'browser': // NuPlay: one large browser window, the next screen peeking out, blurred.
      return `<div class="br-top">${textBlock(s, islandIds, style, { points: false })}</div>
        <div class="br-stage">${b ? peek(b, 'peek-blur') : ''}${a ? fig(a, 'br-main', '(max-width: 820px) 92vw, 64vw') : ''}</div>
        ${pointsHTML(s, 'j-points br-points')}`;
    case 'document': // FinAnalyse: tall document crop with the audit beside it.
      return `<div class="doc-stage">${a ? fig(a, 'doc-main', '(max-width: 820px) 92vw, 30vw') : ''}${b ? fig(b, 'doc-side', '(max-width: 820px) 60vw, 20vw') : ''}</div>
        ${textBlock(s, islandIds, style)}`;
    case 'phones': // Hisaab: the phone row large and unframed, the case slides as a small pair.
      return `${a ? `<figure class="ph-row">${imgTag(a.shot, 'ph-img', '(max-width: 820px) 92vw, 70vw')}${a.caption ? `<figcaption class="j-cap">${esc(a.caption)}</figcaption>` : ''}</figure>` : ''}
        <div class="ph-cols">
          ${textBlock(s, islandIds, style, { nums: false, points: false })}
          <div class="ph-right">${numbersHTML(s, style)}${pointsHTML(s)}</div>
        </div>
        ${b || c ? `<div class="ph-slides">${b ? fig(b, '', '(max-width: 820px) 92vw, 32vw') : ''}${c ? fig(c, '', '(max-width: 820px) 92vw, 32vw') : ''}</div>` : ''}`;
    case 'poster': // E-MERGE: poster-like image with a big title beside it, logo strip underneath (no peek).
      return `<div class="po-top">${a ? fig(a, 'po-main', '(max-width: 820px) 92vw, 40vw') : ''}${textBlock(s, islandIds, style, { points: false })}</div>
        ${pointsHTML(s, 'j-points po-points')}
        ${b ? fig(b, 'po-logos', '(max-width: 820px) 92vw, 70vw') : ''}`;
    case 'numbers': // No screenshots: the numbers are the picture.
      return `${textBlock(s, islandIds, style, { nums: false })}<div class="j-bignums">${numbersHTML(s, 'grid')}</div>`;
    default: {
      // Showcase: main screen + optional peek (never for logo strips or documents).
      const peekOk = b && b.shot.h / b.shot.w > 0.35 && b.shot.h / b.shot.w < 1.15;
      return `<div class="sc-media${flip ? ' is-flip' : ''}">${peekOk ? peek(b, 'peek-side') : ''}${a ? fig(a, 'sc-main', '(max-width: 820px) 92vw, 55vw') : ''}</div>
        ${textBlock(s, islandIds, style)}`;
    }
  }
}

/** Small single image for compact rows and chapter openers (no big showcase). */
function thumbHTML(s: StageLike, shots: Map<string, Shot>) {
  const v = (s.visuals ?? []).find((x) => shots.has(x.key));
  if (!v) return '';
  const shot = shots.get(v.key)!;
  return `<figure class="cp-fig">${imgTag(shot, 'cp-img', '(max-width: 820px) 92vw, 22vw')}${v.caption ? `<figcaption class="j-cap">${esc(v.caption)}</figcaption>` : ''}</figure>`;
}

function skillsHTML(s: StageLike) {
  return `<div class="skills">${(s.points ?? [])
    .map((line) => {
      const i = line.indexOf(':');
      const name = i > 0 ? line.slice(0, i).trim() : '';
      const [first, ...rest] = (i > 0 ? line.slice(i + 1) : line).trim().split(/\.\s+/);
      const items = first.replace(/\.$/, '').split(/,\s*/).filter(Boolean);
      const note = rest.join('. ').replace(/\.$/, '');
      const ev = SKILL_EVIDENCE[name] ?? [];
      return `<section class="skill-group" aria-label="${esc(name || 'Skills')}">
        ${name ? `<h4>${esc(name)}</h4>` : ''}
        <ul>${items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>
        ${note ? `<p class="skill-note">${esc(note)}</p>` : ''}
        ${ev.length ? `<p class="skill-ev"><span>Used in</span> ${ev.map(([id, label]) => `<a href="#st-${id}">${esc(label)}</a>`).join('<span aria-hidden="true"> · </span>')}</p>` : ''}
      </section>`;
    })
    .join('')}</div>`;
}

export function journeyHTML(stages: readonly StageLike[], shots: Map<string, Shot>, islandIds: Set<string>) {
  let showcases = 0;
  const items = stages
    .filter((s) => s.kind !== 'intro')
    .map((s) => {
      const when = s.period ? `<p class="st-when"><span>${esc(s.period)}</span></p>` : '<p class="st-when" aria-hidden="true"></p>';
      if (s.kind === 'section') {
        return `<li class="st st-section" role="presentation" data-reveal>
          <div class="st-section-label"><span>${esc(s.title ?? '')}</span></div>
        </li>`;
      }
      if (s.kind === 'chapter') {
        // Chapter openers show the year large, with the full period under it.
        const year = s.period?.match(/20\d\d/)?.[0];
        const chWhen = s.period
          ? `<p class="st-when">${year ? `<span class="st-year">${year}</span>` : ''}<span class="st-period">${esc(s.period)}</span></p>`
          : when;
        return `<li class="st st-chapter" id="st-${esc(s.id)}" data-reveal>
          ${chWhen}
          <div class="st-body">
            ${metaHTML(s)}
            <h3 class="chap-title">${esc(s.title ?? '')}</h3>
            ${s.lead ? `<p class="chap-lead">${esc(s.lead)}</p>` : ''}
            ${numbersHTML(s, 'grid')}
            ${pointsHTML(s, 'chap-points')}
            ${thumbHTML(s, shots)}
          </div>
        </li>`;
      }
      if (s.kind === 'feature') {
        const vis: Vis[] = (s.visuals ?? []).flatMap((v) => (shots.has(v.key) ? [{ ...v, shot: shots.get(v.key)! }] : []));
        let [layout, style] = LAYOUT[s.id] ?? (['showcase', 'grid'] as [Layout, NumStyle]);
        if (!vis.length) layout = 'numbers';
        const flip = layout === 'showcase' && showcases++ % 2 === 1;
        return `<li class="st st-feature lay-${layout}" id="st-${esc(s.id)}" data-reveal>
          ${when}
          <div class="st-body">${featureBody(s, vis, islandIds, layout, style, flip)}</div>
        </li>`;
      }
      if (s.kind === 'skills') {
        return `<li class="st st-skills" id="st-${esc(s.id)}" data-reveal>
          ${when}
          <div class="st-body"><h3 class="j-title">${esc(s.title ?? 'Skills')}</h3>${s.lead ? `<p class="j-lead">${esc(s.lead)}</p>` : ''}${skillsHTML(s)}</div>
        </li>`;
      }
      // compact (default)
      return `<li class="st st-compact" id="st-${esc(s.id)}" data-reveal>
        ${when}
        <div class="st-body">
          <div class="cp-head">${metaHTML(s)}<h3 class="cp-title">${esc(s.title ?? '')}</h3>${thumbHTML(s, shots)}</div>
          <div class="cp-text">${s.lead ? `<p>${esc(s.lead)}</p>` : ''}${compactPoints(s)}${numbersHTML(s, 'grid')}${linkHTML(s, islandIds)}</div>
        </div>
      </li>`;
    })
    .join('');
  return `<div class="j-track">
    <div class="spine-rail" aria-hidden="true"><img class="spine-guide" src="/img/avatar-cutout-560.webp" alt="" width="201" height="560" loading="lazy" decoding="async"></div>
    <ol class="j-list">${items}</ol>
  </div>`;
}
