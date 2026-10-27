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
