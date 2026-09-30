// Landing behaviour. The page is fully rendered at build time; this adds island panels (lazy),
// the 3D studio walkthrough (lazy, never on the flat path) and the flat 2D walkthrough.
import './styles/site.css';
import './styles/panel.css';
import type { UniverseAPI } from './universe/types';

const $ = <T extends Element>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
// Below 768px the walkthrough is the flat stepper; tablets and up get the 3D studio.
const phone = matchMedia('(max-width: 767px)');
const docked = matchMedia('(min-width: 1024px)');
const params = new URLSearchParams(location.search);

const uv = $<HTMLElement>('#universe')!;
const stage = $<HTMLElement>('[data-stage]', uv)!;
const canvasHost = $<HTMLElement>('[data-canvas]', uv)!;
const status = $<HTMLElement>('[data-status]', uv)!;
const flat = $<HTMLElement>('[data-flat]', uv)!;
const uvTitle = $<HTMLElement>('[data-uv-title]', uv)!;
const hint = $<HTMLButtonElement>('[data-hint]', uv)!;
const overviewBtn = $<HTMLButtonElement>('[data-overview]', uv)!;
const prevBtn = $<HTMLButtonElement>('[data-prev-stop]', uv)!;
const nextBtn = $<HTMLButtonElement>('[data-next-stop]', uv)!;
const stopsBtn = $<HTMLButtonElement>('[data-stops-toggle]', uv)!;
const stopsList = $<HTMLElement>('#stops-list', uv)!;
const stopN = $<HTMLElement>('[data-stop-n]', uv)!;
const stopName = $<HTMLElement>('[data-stop-name]', uv)!;
const layer = $<HTMLElement>('[data-panel-layer]')!;
const openStopBtn = $<HTMLButtonElement>('.bar-open', uv)!;
const tags = $$<HTMLElement>('[data-tag]', uv);
const tagW = new Map<HTMLElement, [number, number]>();
const panel = $<HTMLElement>('[data-panel]')!;

// Stop order = island order, read from the pre-rendered stop list (no data import needed).
const stops = $$<HTMLButtonElement>('[data-go]', stopsList).map((b) => ({ id: b.dataset.go!, title: b.textContent!.replace(/^\d+/, '').trim() }));

// ---------- Modal layering: only the top layer is interactive ----------
let uvOpen = false;
let panelOpen = false;
let flatMode = false;
// Over the 3D studio on wide screens the panel docks right and is non-modal: the walkthrough controls stay usable.
const isDocked = () => panelOpen && uvOpen && !flatMode && docked.matches;
function syncLayers() {
  const dock = isDocked();
  const live = dock ? [uv, layer] : panelOpen ? [layer] : uvOpen ? [uv] : null;
  [...document.body.children].forEach((el) => {
    if (el instanceof HTMLElement && el.tagName !== 'SCRIPT') el.inert = !!live && !live.includes(el);
  });
  panel.setAttribute('aria-modal', String(!dock));
  const root = document.documentElement.classList;
  root.toggle('locked', !!live);
  root.toggle('uv-3d', uvOpen && !flatMode);
  root.toggle('panel-open', panelOpen);
  root.toggle('panel-docked', dock);
  // Tell the scene (unitless, on its container) and the control bar (px, on the overlay) how much of the
  // right side the docked panel covers, so both can centre in the free area on the left.
  const px = dock ? Math.round(panel.getBoundingClientRect().width + 32) : 0;
  canvasHost.style.setProperty('--universe-panel-px', `${px}`);
  uv.style.setProperty('--panel-w', `${px}px`);
  openStopBtn.textContent = dock ? 'Close project' : 'Open project';
}

// ---------- Island panel ----------
let panelOpener: HTMLElement | null = null;
let panelCleanup: (() => void) | null = null;
let panelMod: Promise<typeof import('./panels/panel')> | null = null;
const loadPanel = () => (panelMod ??= import('./panels/panel'));

async function openPanel(id: string, opener: HTMLElement | null) {
  const m = await loadPanel();
  if (!m.hasIsland(id)) return;
  panelCleanup?.();
  panelCleanup = m.fillPanel(panel, id, reduceMotion.matches);
  const already = panelOpen;
  if (!panelOpen) panelOpener = opener ?? (document.activeElement as HTMLElement | null);
  panelOpen = true;
  layer.hidden = false;
  closeStops();
  syncLayers();
  history.replaceState(null, '', `${location.search}#${id}`);
  // When the docked panel just swaps to the next stop, leave focus on the control that was pressed.
  if (!(already && isDocked() && uv.contains(document.activeElement))) $<HTMLElement>('#panel-t', panel)?.focus({ preventScroll: true });
  api?.playAction('talk');
}

function closePanel() {
  if (!panelOpen) return;
  panelCleanup?.();
  panelCleanup = null;
  panelOpen = false;
  layer.hidden = true;
  syncLayers();
  history.replaceState(null, '', location.pathname + location.search);
  const back = panelOpener;
  panelOpener = null;
  if (back && document.contains(back) && !back.closest('[hidden]')) back.focus({ preventScroll: true });
  else (uvOpen ? $<HTMLElement>('[data-next-stop]', uv) : $<HTMLElement>('[data-enter]'))?.focus();
  api?.playAction('idle');
}

layer.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if ((t === layer && !isDocked()) || t.closest('[data-panel-close]')) closePanel();
});

// ---------- Walkthrough ----------
let api: UniverseAPI | null = null;
let at = 0;               // current stop index
let arrived: string | null = null; // station the guide is standing at (hint visible)
let enterOpener: HTMLElement | null = null;
let mountToken = 0;
let raf = 0;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
const wantsFlat = () => params.get('v') === 'flat' || phone.matches || reduceMotion.matches || !hasWebGL();

function paintStop() {
  const s = stops[at];
  stopN.textContent = String(at + 1);
  stopName.textContent = s.title;
  prevBtn.disabled = at === 0;
  nextBtn.disabled = at === stops.length - 1;
  $$<HTMLElement>('[data-go]', stopsList).forEach((b, k) => {
    if (k === at) b.setAttribute('aria-current', 'step');
    else b.removeAttribute('aria-current');
  });
  $$<HTMLElement>('[data-stop]', flat).forEach((c) => { c.hidden = c.dataset.stop !== s.id; });
  // Keep focus usable if the pressed button just became disabled.
  const a = document.activeElement;
  if (a instanceof HTMLButtonElement && a.disabled) (a === prevBtn ? nextBtn : prevBtn).focus();
}

function goTo(k: number) {
  at = Math.max(0, Math.min(stops.length - 1, k));
  paintStop();
  if (api) {
    arrived = null;
    hint.hidden = true;
    api.walkTo(stops[at].id).catch(() => { /* a newer walk replaced this one */ });
  }
  if (isDocked()) openPanel(stops[at].id, null);
}

// The hint bubble follows the station's anchor every frame while the guide stands there.
// One rAF loop places the "Click here" bubble (at the station the guide stands at) and, in the overview
// or while walking, the frosted name tags of on-screen stations. Tags that would overlap are skipped.
function trackHint() {
  raf = 0;
  if (!api || !uvOpen) return;
  const free = !panelOpen && stopsList.hidden;
  const p = arrived && free ? api.anchor(arrived) : null;
  if (p) {
    hint.hidden = false;
    hint.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px)`;
  } else hint.hidden = true;

  const showTags = free && !p;
  const W = stage.clientWidth, H = stage.clientHeight;
  // Toolbar buttons count as occupied, so tags never slide under them.
  const sr = stage.getBoundingClientRect();
  const placed: [number, number, number, number][] = showTags
    ? $$<HTMLElement>('.uv-top > *', uv).map((el) => {
        const r = el.getBoundingClientRect();
        return [r.left - sr.left, r.top - sr.top, r.right - sr.left, r.bottom - sr.top];
      })
    : [];
  for (const tag of tags) {
    const a = showTags ? api.anchor(tag.dataset.tag!) : null;
    if (!a || a.x < 0 || a.y < 60 || a.x > W || a.y > H - 110) { tag.hidden = true; continue; }
    if (tag.hidden) tag.hidden = false;
    let size = tagW.get(tag);
    if (!size) { size = [tag.offsetWidth, tag.offsetHeight]; tagW.set(tag, size); }
    const [w, h] = size;
    const box: [number, number, number, number] = [a.x - w / 2, a.y - h - 6, a.x + w / 2, a.y - 6];
    if (box[0] < 4 || box[2] > W - 4 || box[1] < 4 || placed.some((b) => box[0] < b[2] + 6 && box[2] + 6 > b[0] && box[1] < b[3] + 4 && box[3] + 4 > b[1])) { tag.hidden = true; continue; }
    placed.push(box);
    tag.style.transform = `translate(${Math.round(box[0])}px, ${Math.round(box[1])}px)`;
  }
  raf = requestAnimationFrame(trackHint);
}

function showFlat(note?: string) {
  flatMode = true;
  stage.hidden = true;
  flat.hidden = false;
  overviewBtn.hidden = true;
  uv.classList.add('uv-flat');
  status.hidden = true;
  if (note) uvTitle.textContent = `Walkthrough · ${note}`;
  syncLayers();
}

async function enterUniverse(opener: HTMLElement | null) {
  if (uvOpen) return;
  enterOpener = opener;
  uvOpen = true;
  at = 0;
  arrived = null;
  uv.hidden = false;
  uvTitle.textContent = 'Walkthrough';
  paintStop();
  if (wantsFlat()) {
    showFlat();
    uvTitle.focus({ preventScroll: true });
    return;
  }
  flatMode = false;
  uv.classList.remove('uv-flat');
  flat.hidden = true;
  stage.hidden = false;
  overviewBtn.hidden = false;
  hint.hidden = true;
  status.hidden = false;
  status.textContent = 'Loading the studio…';
  syncLayers();
  // Tab order starts at the title: Exit, Overview, Recruiter view, then the stop controls.
  uvTitle.focus({ preventScroll: true });
  const token = ++mountToken;
  const ready = new Promise<void>((res) => addEventListener('universe:ready', () => res(), { once: true }));
  try {
    const { mountUniverse } = await import('./universe/scene');
    if (token !== mountToken || !uvOpen) return;
    const { islands } = await import('./islands');
    const mounted = await mountUniverse(canvasHost, islands);
    if (token !== mountToken || !uvOpen) { mounted.dispose(); return; }
    api = mounted;
    await Promise.race([ready, new Promise((r) => setTimeout(r, 4000))]);
    if (token !== mountToken || !uvOpen) return;
    status.hidden = true;
    if (!raf) raf = requestAnimationFrame(trackHint);
    api.playAction('wave');
    setTimeout(() => { if (api && token === mountToken && arrived === null) goTo(at); }, 1400);
  } catch (err) {
    if (token !== mountToken || !uvOpen) return;
    console.warn('Walkthrough 3D failed to load, showing the flat version.', err);
    api = null;
    showFlat('3D didn’t load');
  }
}

function exitUniverse() {
  if (!uvOpen) return;
  mountToken++;
  cancelAnimationFrame(raf);
  raf = 0;
  api?.dispose();
  api = null;
  arrived = null;
  hint.hidden = true;
  tags.forEach((t) => { t.hidden = true; });
  canvasHost.replaceChildren();
  closeStops();
  uvOpen = false;
  flatMode = false;
  uv.hidden = true;
  syncLayers();
  const back = enterOpener && document.contains(enterOpener) ? enterOpener : $<HTMLElement>('[data-enter]');
  back?.focus({ preventScroll: true });
  if (params.get('v') === 'flat') history.replaceState(null, '', location.pathname);
}

// ---------- Stops popover ----------
function closeStops(returnFocus = false) {
  if (stopsList.hidden) return;
  stopsList.hidden = true;
  stopsBtn.setAttribute('aria-expanded', 'false');
  if (returnFocus) stopsBtn.focus();
}
function toggleStops() {
  const open = stopsList.hidden;
  stopsList.hidden = !open;
  stopsBtn.setAttribute('aria-expanded', String(open));
  if (open) $<HTMLElement>('[aria-current="step"]', stopsList)?.focus();
}

// ---------- Scene events ----------
addEventListener('station:arrive', ((e: CustomEvent<{ id: string }>) => {
  if (!uvOpen || !api) return;
  arrived = e.detail.id;
  const k = stops.findIndex((s) => s.id === e.detail.id);
  if (k >= 0 && k !== at) { at = k; paintStop(); }
}) as EventListener);
addEventListener('station:click', ((e: CustomEvent<{ id: string }>) => {
  if (!uvOpen || !api || (panelOpen && !isDocked())) return;
  const k = stops.findIndex((s) => s.id === e.detail.id);
  if (k >= 0) goTo(k);
}) as EventListener);
addEventListener('universe:ready', () => { if (uvOpen && api) status.hidden = true; });

// ---------- Clicks ----------
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const enter = t.closest<HTMLElement>('[data-enter]');
  if (enter) { enterUniverse(enter); return; }
  if (t.closest('[data-uv-exit]')) { exitUniverse(); return; }
  if (t.closest('[data-overview]')) { arrived = null; hint.hidden = true; api?.overview(); return; }
  if (t.closest('[data-prev-stop]')) { goTo(at - 1); return; }
  if (t.closest('[data-next-stop]')) { goTo(at + 1); return; }
  if (t.closest('[data-stops-toggle]')) { toggleStops(); return; }
  const tag = t.closest<HTMLElement>('[data-tag]');
  if (tag) { goTo(stops.findIndex((s) => s.id === tag.dataset.tag)); return; }
  const go = t.closest<HTMLElement>('[data-go]');
  if (go) { closeStops(true); goTo(stops.findIndex((s) => s.id === go.dataset.go)); return; }
  if (t.closest('[data-open-stop]') && isDocked()) { closePanel(); return; }
  const openStop = t.closest<HTMLElement>('[data-open-stop], [data-hint]');
  if (openStop) { openPanel(stops[at].id, openStop.matches('[data-hint]') ? openStopBtn : openStop); return; }
  const isle = t.closest<HTMLElement>('[data-island]');
  if (isle) { openPanel(isle.dataset.island!, isle); return; }
  // Click outside the stops popover closes it.
  if (!stopsList.hidden && !t.closest('.stops-wrap')) closeStops();
});

// Warm the panel chunk when someone shows intent.
document.addEventListener('pointerover', (e) => {
  if ((e.target as HTMLElement).closest?.('[data-island], [data-enter], [data-open-stop]')) loadPanel();
}, { passive: true });

// ---------- Keys: Esc = popover → panel → exit; arrows step through stops ----------
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!stopsList.hidden) { e.preventDefault(); closeStops(true); return; }
    if (panelOpen) { e.preventDefault(); closePanel(); return; }
    if (uvOpen) { e.preventDefault(); exitUniverse(); }
    return;
  }
  if (uvOpen && !panelOpen && stopsList.hidden && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    goTo(at + (e.key === 'ArrowRight' ? 1 : -1));
  }
});

// Keep focus inside the open dialog (inert covers the rest; this handles Tab wrapping).
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const roots = isDocked() ? [uv, panel] : panelOpen ? [panel] : uvOpen ? [uv] : [];
  if (!roots.length) return;
  const root = { contains: (n: Node | null) => roots.some((r) => r.contains(n)) };
  const items = roots.flatMap((r) => $$<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), summary', r))
    .filter((el) => !el.closest('[hidden]') && el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  const active = document.activeElement as HTMLElement | null;
  if (e.shiftKey && (active === first || !root.contains(active) || active === uvTitle)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (active === last || !root.contains(active))) { e.preventDefault(); first.focus(); }
});

addEventListener('resize', () => { if (panelOpen) syncLayers(); }, { passive: true });

// ---------- Journey: scroll reveals, secondary-image parallax, visual swapping ----------
const reveals = $$<HTMLElement>('[data-reveal]');
if (reduceMotion.matches || !('IntersectionObserver' in window)) reveals.forEach((el) => el.classList.add('in'));
else {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  reveals.forEach((el) => io.observe(el));

  // Parallax only for secondary images on screen; one rAF per scroll frame.
  const layers = $$<HTMLElement>('[data-parallax]');
  const visible = new Set<HTMLElement>();
  const pio = new IntersectionObserver((entries) => {
    for (const en of entries) (en.isIntersecting ? visible.add(en.target as HTMLElement) : visible.delete(en.target as HTMLElement));
  });
  layers.forEach((el) => pio.observe(el));
  let ticking = false;
  const paintParallax = () => {
    ticking = false;
    const vh = innerHeight;
    visible.forEach((el) => {
      const r = el.parentElement!.getBoundingClientRect();
      const t = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around the viewport centre
      el.style.transform = `translate3d(0, ${Math.round(t * -48)}px, 0)`;
    });
  };
  addEventListener('scroll', () => { if (!ticking && visible.size) { ticking = true; requestAnimationFrame(paintParallax); } }, { passive: true });
}

// The avatar on the timeline spine: marks the stage under the reading line, hops when it changes,
// and leans in the scroll direction. Static under reduced motion.
{
  const guide = $<HTMLElement>('.spine-guide');
  const stagesEls = $$<HTMLElement>('.j-list > .st');
  if (guide && stagesEls.length && 'IntersectionObserver' in window) {
    let active: Element | null = null;
    const aio = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting || en.target === active) continue;
        active?.classList.remove('is-active');
        active = en.target;
        active.classList.add('is-active');
        if (!reduceMotion.matches) {
          guide.classList.remove('hop');
          void guide.offsetWidth; // restart the animation
          guide.classList.add('hop');
        }
      }
    }, { rootMargin: '-42% 0px -56% 0px' });
    stagesEls.forEach((el) => aio.observe(el));
    if (!reduceMotion.matches) {
      let lastY = scrollY, idle = 0;
      addEventListener('scroll', () => {
        const y = scrollY;
        if (Math.abs(y - lastY) < 2) return;
        guide.classList.toggle('lean-down', y > lastY);
        guide.classList.toggle('lean-up', y < lastY);
        lastY = y;
        clearTimeout(idle);
        idle = window.setTimeout(() => guide.classList.remove('lean-down', 'lean-up'), 160);
      }, { passive: true });
    }
  }
}

// Hover or click a thumbnail to swap the main screen of that stage.
function swapVisual(btn: HTMLButtonElement) {
  const fig = btn.closest<HTMLElement>('[data-media]');
  const img = fig?.querySelector<HTMLImageElement>('.j-shot');
  if (!fig || !img || btn.getAttribute('aria-pressed') === 'true') return;
  img.removeAttribute('srcset');
  img.src = btn.dataset.src!;
  img.width = Number(btn.dataset.w);
  img.height = Number(btn.dataset.h);
  img.alt = btn.dataset.alt ?? '';
  const cap = fig.querySelector('.j-cap');
  if (cap) cap.textContent = btn.dataset.caption ?? '';
  fig.querySelectorAll('.j-thumb').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-swap]');
  if (b) swapVisual(b);
});
document.addEventListener('pointerover', (e) => {
  const b = (e.target as HTMLElement).closest?.<HTMLButtonElement>('[data-swap]');
  if (b && matchMedia('(hover: hover)').matches) swapVisual(b);
}, { passive: true });

// ---------- Initial state ----------
const initial = decodeURIComponent(location.hash.slice(1));
if (params.get('v') === 'flat') enterUniverse(null);
if (initial && /^[a-z0-9-]+$/.test(initial)) {
  loadPanel().then((m) => { if (m.hasIsland(initial)) openPanel(initial, null); });
}
