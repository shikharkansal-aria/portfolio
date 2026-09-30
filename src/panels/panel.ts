// Island panel content. Loaded on first open (dynamic import) so the landing ships no panel data.
import { islands } from '../islands';
import { cases } from '../content';
import { islandPanel, type PanelShot } from './html';
import { initPlayer } from './player';

// Screenshots for panels, embedded by render.ts as JSON (island id → image).
let shotsCache: Record<string, PanelShot> | null = null;
function panelShots(): Record<string, PanelShot> {
  if (!shotsCache) {
    try { shotsCache = JSON.parse(document.getElementById('panel-shots')?.textContent || '{}'); } catch { shotsCache = {}; }
  }
  return shotsCache!;
}

export const hasIsland = (id: string) => islands.some((i) => i.id === id);
export const islandTitle = (id: string) => islands.find((i) => i.id === id)?.title ?? id;

/** Fills the dialog with one island. Returns a cleanup that stops timers. */
export function fillPanel(el: HTMLElement, id: string, reduceMotion: boolean): (() => void) | null {
  const island = islands.find((i) => i.id === id);
  if (!island) return null;
  const cs = island.caseId ? cases.find((c) => c.id === island.caseId) : undefined;
  el.innerHTML = islandPanel(island, cs, panelShots()[id]);
  el.scrollTop = 0;
  el.classList.toggle('panel-has-cover', !!el.querySelector('.cover'));

  const long = el.querySelector<HTMLButtonElement>('[data-long]');
  long?.addEventListener('click', () => {
    const body = el.querySelector<HTMLElement>('#cs-body')!;
    const open = body.hidden;
    body.hidden = !open;
    long.setAttribute('aria-expanded', String(open));
    long.firstChild!.textContent = open ? 'Hide the full case study' : 'Read the full case study';
    if (open) body.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  return initPlayer(el, reduceMotion);
}
