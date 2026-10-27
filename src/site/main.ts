import './site.css';
import { ledger } from './data.ts';

const $$ = <T extends Element>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

// Staggered entrances. Content is only hidden while JS runs and motion is allowed (see site.css).
const reveals = $$<HTMLElement>('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      const shown = entries.filter((e) => e.isIntersecting);
      shown.forEach((e, i) => {
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

// Home ledger: pick a line to see it to scale.
const detail = document.querySelector<HTMLElement>('.ledger-detail');
if (detail) {
  const picks = $$<HTMLButtonElement>('.pick');
  const set = (f: string) => detail.querySelector<HTMLElement>(`[data-f="${f}"]`)!;
  const bars = detail.querySelector<HTMLElement>('.bars')!;
  const nowBar = detail.querySelector<HTMLElement>('.now-bar')!;
  picks.forEach((btn) =>
    btn.addEventListener('click', () => {
      const row = ledger[Number(btn.dataset.row)];
      picks.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      bars.hidden = row.ratio == null;
      set('before').textContent = row.before;
      set('after').textContent = row.after;
      set('note').textContent = row.note;
      (set('link') as HTMLAnchorElement).href = `/work/${row.id}/`;
      if (row.ratio != null) nowBar.style.setProperty('--r', String(Math.max(row.ratio, 0.012)));
    }),
  );
}

// Journey: show one year or all.
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
