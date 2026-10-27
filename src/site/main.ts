import './site.css';

const $$ = <T extends Element>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Staggered entrances. Content is only hidden while JS runs and motion is allowed (see site.css).
const reveals = $$<HTMLElement>('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .forEach((e, i) => {
          (e.target as HTMLElement).style.setProperty('--d', `${i * 80}ms`);
          e.target.classList.add('in');
          io.unobserve(e.target);
        });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
}

// Phone menu: close after choosing a link or pressing Escape.
const menu = document.querySelector<HTMLDetailsElement>('.menu');
menu?.addEventListener('click', (e) => {
  if ((e.target as Element).closest('a')) menu.open = false;
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu?.open) {
    menu.open = false;
    menu.querySelector('summary')?.focus();
  }
});

// Home journey: the pinned year follows whichever step crosses the middle of the screen.
const pin = document.querySelector<HTMLElement>('.story-pin');
if (pin && 'IntersectionObserver' in window) {
  const year = pin.querySelector<HTMLElement>('[data-year-display]')!;
  const chapter = pin.querySelector<HTMLElement>('[data-chapter-display]')!;
  let current = year.textContent;
  const set = (y: string, c: string) => {
    if (y === current) return;
    current = y;
    if (reduce) {
      year.textContent = y;
      chapter.textContent = c;
      return;
    }
    pin.classList.add('swap');
    setTimeout(() => {
      year.textContent = y;
      chapter.textContent = c;
      pin.classList.remove('swap');
    }, 200);
  };
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          set(el.dataset.year!, el.dataset.chapter!);
        }
      }),
    { rootMargin: '-45% 0px -45% 0px' },
  );
  $$<HTMLElement>('.story-step').forEach((s) => io.observe(s));
}

// Home skills: one row open at a time; its picture shows on the left.
const skillRows = $$<HTMLLIElement>('.skill-row');
if (skillRows.length) {
  const imgs = $$<HTMLImageElement>('[data-skill-img]');
  const open = (i: number) => {
    skillRows.forEach((row, k) => {
      const on = k === i;
      row.classList.toggle('on', on);
      row.querySelector('button')!.setAttribute('aria-expanded', String(on));
      row.querySelector<HTMLElement>('.skill-more')!.hidden = !on;
    });
    imgs.forEach((img, k) => img.classList.toggle('on', k === i));
  };
  skillRows.forEach((row, i) => {
    const btn = row.querySelector('button')!;
    btn.addEventListener('click', () => open(i));
    btn.addEventListener('mouseenter', () => {
      if (matchMedia('(hover: hover)').matches) open(i);
    });
  });
}

// Journey page: show one year or all, kept in the URL.
const chooser = document.querySelector<HTMLElement>('.chooser');
if (chooser) {
  const buttons = $$<HTMLButtonElement>('button', chooser);
  const years = $$<HTMLElement>('.jyear');
  const show = (y: string) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.year === y)));
    years.forEach((s) => {
      s.hidden = y !== 'all' && s.dataset.year !== y;
      if (!s.hidden) $$<HTMLElement>('.reveal', s).forEach((el) => el.classList.add('in'));
    });
  };
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      const y = b.dataset.year!;
      show(y);
      const url = new URL(location.href);
      if (y === 'all') url.searchParams.delete('year');
      else url.searchParams.set('year', y);
      history.replaceState(null, '', url);
    }),
  );
  const fromUrl = new URLSearchParams(location.search).get('year');
  if (fromUrl && years.some((s) => s.dataset.year === fromUrl)) show(fromUrl);
}

// Bar: transparent over the sky at the very top, frosted glass as soon as the page moves, so scrolled content never runs under bare text.
const bar = document.querySelector<HTMLElement>('.bar');
const heroEl = document.querySelector<HTMLElement>('.hero');
if (bar) {
  const setBar = () => bar.classList.toggle('solid', scrollY > 24);
  addEventListener('scroll', setBar, { passive: true });
  setBar();
}

// Home hero: the 3D scene loads after first paint so the poster image and the text are what the page is first judged on.
const heroCanvas = document.querySelector<HTMLElement>('.hero-canvas');
if (reduce) {
  const sw0 = heroEl?.querySelector('[data-mode]');
  sw0?.setAttribute('aria-checked', 'false');
  const st = sw0?.querySelector('.sw-state');
  if (st) st.textContent = 'OFF';
  heroEl?.classList.add('still');
}
if (heroCanvas) {
  const go = () =>
    import('./hero3d.ts')
      .then((m) => m.startHero(heroCanvas, { reduce }))
      .catch(() => heroEl?.classList.add('no-gl'));
  const idle = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  if (document.readyState === 'complete') idle ? idle(go, { timeout: 1500 }) : setTimeout(go, 200);
  else addEventListener('load', () => (idle ? idle(go, { timeout: 1500 }) : setTimeout(go, 200)), { once: true });
}

// Cards lean toward the pointer, a few degrees, on devices that hover.
if (!reduce && matchMedia('(hover: hover)').matches) {
  $$<HTMLElement>('.tile-half, .jentry, .glance, .building-figs div, .quick li').forEach((el) => {
    el.classList.add('tilt');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 6}deg`);
      el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 6}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

// The big tiles bend with scroll: their top and bottom edges lean toward you, like the curved screen in the hero.
const bends = $$<HTMLElement>('.bend');
if (bends.length && !reduce) {
  let queued = false;
  const update = () => {
    queued = false;
    const vh = innerHeight;
    bends.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh * 0.75)));
      el.style.setProperty('--bend', `${(d * 4.5).toFixed(2)}deg`);
    });
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}
